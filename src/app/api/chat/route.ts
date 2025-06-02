import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Enhanced rate limit data structure with backoff support
interface RateLimitData {
  count: number;                  // Current request count in the window
  resetTime: number;              // When the current window resets
  backoffLevel: number;           // Current backoff level (0 = no backoff)
  blockedUntil?: number;          // If blocked, when the block expires
  lastViolation?: number;         // Last time this IP violated rate limits
  totalViolations: number;        // Total number of violations
}

// Simple in-memory rate limiter (for production, use Redis or similar)
const rateLimitMap = new Map<string, RateLimitData>();

// Configuration for rate limiting and abuse prevention
const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 15,        // Max 10 requests per minute per IP
  maxRequestsPerHour: 120,          // Max 50 requests per hour per IP
  maxMessageLength: 256,           // Max 256 characters per message
  maxConversationLength: 30,       // Max 30 messages in conversation history
  maxTokensPerRequest: 128,        // Max tokens per response
  
  // Exponential backoff configuration
  initialBlockDuration: 60 * 1000,     // Start with 1 minute block
  maxBlockDuration: 60 * 60 * 1000,    // Max 1 hour block
  backoffMultiplier: 2,                // Double the duration each time
  backoffResetTime: 60 * 60 * 1000,    // Reset backoff after 1 hour of good behavior
};

// Get client IP address
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

// Calculate block duration based on backoff level
function calculateBlockDuration(backoffLevel: number): number {
  const duration = RATE_LIMIT_CONFIG.initialBlockDuration * 
    Math.pow(RATE_LIMIT_CONFIG.backoffMultiplier, backoffLevel);
  
  // Cap at maximum block duration
  return Math.min(duration, RATE_LIMIT_CONFIG.maxBlockDuration);
}

// Check rate limits with exponential backoff
function checkRateLimit(ip: string): { 
  allowed: boolean; 
  retryAfter?: number;
  blockDuration?: number;
  backoffLevel?: number;
} {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  // Clean up old entries to prevent memory bloat
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      // Remove entries that haven't been active for over 2 hours
      if (value.resetTime < now - 2 * 60 * 60 * 1000 && !value.blockedUntil) {
        rateLimitMap.delete(key);
      }
    }
  }

  // Initialize new user
  if (!userLimit) {
    rateLimitMap.set(ip, { 
      count: 1, 
      resetTime: now + 60 * 1000,
      backoffLevel: 0,
      totalViolations: 0
    });
    return { allowed: true };
  }

  // Check if user is currently blocked
  if (userLimit.blockedUntil && userLimit.blockedUntil > now) {
    const retryAfter = Math.ceil((userLimit.blockedUntil - now) / 1000);
    const blockDuration = calculateBlockDuration(userLimit.backoffLevel);
    
    return { 
      allowed: false, 
      retryAfter,
      blockDuration: Math.ceil(blockDuration / 1000), // Convert to seconds
      backoffLevel: userLimit.backoffLevel
    };
  }

  // Check if backoff should be reset (1 hour of good behavior)
  if (userLimit.lastViolation && 
      now - userLimit.lastViolation > RATE_LIMIT_CONFIG.backoffResetTime) {
    userLimit.backoffLevel = 0;
    userLimit.totalViolations = 0;
  }

  // Reset count if window expired
  if (userLimit.resetTime < now) {
    userLimit.count = 1;
    userLimit.resetTime = now + 60 * 1000;
    return { allowed: true };
  }

  // Check if rate limit exceeded
  if (userLimit.count >= RATE_LIMIT_CONFIG.maxRequestsPerMinute) {
    // Apply exponential backoff
    const blockDuration = calculateBlockDuration(userLimit.backoffLevel);
    
    userLimit.blockedUntil = now + blockDuration;
    userLimit.lastViolation = now;
    userLimit.backoffLevel++;
    userLimit.totalViolations++;
    
    const retryAfter = Math.ceil(blockDuration / 1000);
    
    console.log(`Rate limit violation for IP ${ip}: backoff level ${userLimit.backoffLevel}, blocked for ${retryAfter}s`);
    
    return { 
      allowed: false, 
      retryAfter,
      blockDuration: retryAfter,
      backoffLevel: userLimit.backoffLevel
    };
  }

  // Increment count for allowed request
  userLimit.count++;
  return { allowed: true };
}

// Validate and sanitize messages
function validateMessages(messages: Message[]): { valid: boolean; error?: string } {
  if (!messages || !Array.isArray(messages)) {
    return { valid: false, error: 'wow, you managed to break the most basic requirement. congrats.' };
  }

  if (messages.length === 0) {
    return { valid: false, error: 'an empty array? really? that\'s your move?' };
  }

  for (const message of messages) {
    if (!message.role || !message.content) {
      return { valid: false, error: 'missing role or content. did you skip json 101?' };
    }

    if (typeof message.content !== 'string') {
      return { valid: false, error: 'content must be a string. shocking, i know.' };
    }

    // Skip length validation for system messages (they're controlled by us, not users)
    if (message.role !== 'system' && message.content.length > RATE_LIMIT_CONFIG.maxMessageLength) {
      return { 
        valid: false, 
        error: `it's way too long. ${RATE_LIMIT_CONFIG.maxMessageLength} chars max bro. what do you trying to send me? a book?` 
      };
    }

    if (!['user', 'assistant', 'system'].includes(message.role)) {
      return { valid: false, error: 'invalid role. it\'s user, assistant, or system. not that hard.' };
    }
  }

  return { valid: true };
}

// Check content safety using OpenAI moderation
async function checkContentSafety(messages: Message[]): Promise<{ safe: boolean; reason?: string; warningMessage?: string }> {
  try {
    // Only check user messages (not system or assistant messages)
    const userMessages = messages.filter(msg => msg.role === 'user');
    
    if (userMessages.length === 0) {
      return { safe: true };
    }

    // Only check the most recent user message to avoid false positives from context
    const contentToCheck = userMessages[userMessages.length - 1].content;

    // Call OpenAI moderation API with latest model
    const moderation = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: contentToCheck,
    });

    const results = moderation.results[0];
    
    // If content is not flagged, it's safe
    if (!results.flagged) {
      return { safe: true };
    }

    // Define which categories should BLOCK vs just WARN
    const blockingCategories = new Set([
      'sexual/minors',
      'self-harm/intent',
      'self-harm/instructions',
      'hate/threatening',
      'harassment/threatening',
      'illicit/violent',
      'illicit',  // illegal activities should also block
    ]);

    // Define custom messages for each category
    const categoryMessages: { [key: string]: string } = {
      'sexual/minors': "absolutely not. get help and get out.",
      'harassment/threatening': "threats? how original. maybe try therapy instead.",
      'hate/threatening': "threatening hate speech? touch grass immediately.",
      'illicit': "illegal stuff? wrong site, wrong chatbot. move along.",
      'illicit/violent': "illegal and violent? edgy. now leave.",
      'self-harm': "hey, not cool. seriously, talk to someone who isn't made of code.",
      'self-harm/intent': "stop. call a real human. 988 if you're in the us.",
      'self-harm/instructions': "nope. not happening. find better questions.",
    };
    
    // Get all flagged categories
    const flaggedCategories = Object.entries(results.categories)
      .filter(([, flagged]) => flagged)
      .map(([category]) => category);

    // Check if any BLOCKING categories are flagged
    const shouldBlock = flaggedCategories.some(cat => blockingCategories.has(cat));

    // Priority order for selecting which message to show (most severe first)
    const priorityOrder = [
      'sexual/minors',
      'self-harm/intent',
      'self-harm/instructions',
      'hate/threatening',
      'harassment/threatening',
      'illicit/violent',
      'illicit',
      'self-harm',
    ];

    // Find the highest priority flagged category
    const primaryCategory = priorityOrder.find(cat => flaggedCategories.includes(cat)) || flaggedCategories[0];
    const warningMessage = categoryMessages[primaryCategory] || 
      "whatever that was, it's not happening. try being less... that.";
    
    // Only block if it's a blocking category, otherwise allow with warning
    return {
      safe: !shouldBlock,  // Only unsafe if it's a blocking category
      reason: `Content violates policies: ${flaggedCategories.join(', ')}`,
      warningMessage
    };
  } catch (error) {
    // If moderation check fails, log the error but don't block the request
    // This ensures the chat still works if the moderation API is down
    console.error('Moderation API error:', error);
    return { safe: true }; // Fail open to avoid breaking the chat
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check rate limits
    const clientIp = getClientIp(req);
    const rateLimitCheck = checkRateLimit(clientIp);
    
    if (!rateLimitCheck.allowed) {
      const blockDuration = rateLimitCheck.blockDuration || 60;
      const backoffLevel = rateLimitCheck.backoffLevel || 1;
      
      return NextResponse.json(
        { 
          error: `Rate limit exceeded: ${blockDuration}s block, violation #${backoffLevel}`,
          message: `wow, calm down. you're blocked for ${blockDuration} seconds. ` +
                   `keep this up and it'll be ${Math.min(blockDuration * 2, 3600)} next time. have fun.`,
          retryAfter: rateLimitCheck.retryAfter,
          blockDuration: blockDuration,
          backoffLevel: backoffLevel,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitCheck.retryAfter || 60),
            'X-RateLimit-Limit': String(RATE_LIMIT_CONFIG.maxRequestsPerMinute),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Block-Duration': String(blockDuration),
            'X-RateLimit-Backoff-Level': String(backoffLevel),
          }
        }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { messages } = body;

    // Validate messages
    const validation = validateMessages(messages);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Check content safety with OpenAI moderation
    const safetyCheck = await checkContentSafety(messages);
    if (!safetyCheck.safe) {
      console.log(`Content policy warning for IP ${clientIp}: ${safetyCheck.reason}`);
      
      // Return only a warning message - don't call OpenAI
      const encoder = new TextEncoder();
      const warningStream = new ReadableStream({
        async start(controller) {
          const warningMessage = safetyCheck.warningMessage || "whatever that was, it's not happening. try being less... that.";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: warningMessage })}\n\n`));
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        },
      });

      return new Response(warningStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-RateLimit-Limit': String(RATE_LIMIT_CONFIG.maxRequestsPerMinute),
          'X-RateLimit-Remaining': String(RATE_LIMIT_CONFIG.maxRequestsPerMinute - (rateLimitMap.get(clientIp)?.count || 1)),
        },
      });
    }

    // Don't add a duplicate system message - the frontend already provides one
    // Just ensure we don't exceed the conversation length
    const finalMessages = messages.slice(-RATE_LIMIT_CONFIG.maxConversationLength);

    // Create OpenAI stream with safety limits
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: finalMessages,
      temperature: 0.7,
      max_tokens: RATE_LIMIT_CONFIG.maxTokensPerRequest,
      stream: true,
      // Additional safety settings
      user: clientIp, // Track usage per IP in OpenAI dashboard
    });

    // Create a TransformStream to handle the streaming
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              // Send the content as a Server-Sent Event
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          
          // Send a final message to indicate completion
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-RateLimit-Limit': String(RATE_LIMIT_CONFIG.maxRequestsPerMinute),
        'X-RateLimit-Remaining': String(RATE_LIMIT_CONFIG.maxRequestsPerMinute - (rateLimitMap.get(clientIp)?.count || 1)),
      },
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Don't expose internal errors to users
    return NextResponse.json(
      { error: 'something broke. probably your fault.' },
      { status: 500 }
    );
  }
} 
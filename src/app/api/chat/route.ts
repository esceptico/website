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

// Simple in-memory rate limiter (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Configuration for rate limiting and abuse prevention
const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 10,        // Max 10 requests per minute per IP
  maxRequestsPerHour: 50,          // Max 50 requests per hour per IP
  maxMessageLength: 1000,          // Max 1000 characters per message
  maxConversationLength: 30,       // Max 30 messages in conversation history
  maxTokensPerRequest: 128,        // Max tokens per response
  blockDuration: 60 * 60 * 1000,   // Block for 1 hour if limits exceeded
};

// Get client IP address
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

// Check rate limits
function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  // Clean up old entries
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!userLimit) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60 * 1000 });
    return { allowed: true };
  }

  if (userLimit.resetTime < now) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60 * 1000 });
    return { allowed: true };
  }

  if (userLimit.count >= RATE_LIMIT_CONFIG.maxRequestsPerMinute) {
    return { 
      allowed: false, 
      retryAfter: Math.ceil((userLimit.resetTime - now) / 1000) 
    };
  }

  userLimit.count++;
  return { allowed: true };
}

// Validate and sanitize messages
function validateMessages(messages: any[]): { valid: boolean; error?: string } {
  if (!messages || !Array.isArray(messages)) {
    return { valid: false, error: 'wow, you managed to break the most basic requirement. congrats.' };
  }

  if (messages.length === 0) {
    return { valid: false, error: 'an empty array? really? that\'s your move?' };
  }

  if (messages.length > RATE_LIMIT_CONFIG.maxConversationLength) {
    return { 
      valid: false, 
      error: `oh look, someone can\'t count. max ${RATE_LIMIT_CONFIG.maxConversationLength} messages, genius.` 
    };
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
        error: `your message is way too long. ${RATE_LIMIT_CONFIG.maxMessageLength} characters max. learn to be concise.` 
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

    // Define custom messages for each category
    const categoryMessages: { [key: string]: string } = {
      'sexual': "oh wow, real classy. this isn't that kind of site, genius.",
      'sexual/minors': "absolutely not. get help and get out.",
      'harassment': "cute, trying to be mean? i do it better. try again when you're less boring.",
      'harassment/threatening': "threats? how original. maybe try therapy instead.",
      'hate': "hate speech? yawn. find a new personality.",
      'hate/threatening': "threatening hate speech? touch grass immediately.",
      'illicit': "illegal stuff? wrong site, wrong chatbot. move along.",
      'illicit/violent': "illegal and violent? edgy. now leave.",
      'self-harm': "hey, not cool. seriously, talk to someone who isn't made of code.",
      'self-harm/intent': "stop. call a real human. 988 if you're in the us.",
      'self-harm/instructions': "nope. not happening. find better questions.",
      'violence': "violence? boring. timur's projects are more interesting than your edge.",
      'violence/graphic': "graphic violence? what is this, a horror movie audition? next."
    };
    
    // Get all flagged categories
    const flaggedCategories = Object.entries(results.categories)
      .filter(([_, flagged]) => flagged)
      .map(([category]) => category);

    // Priority order for selecting which message to show (most severe first)
    const priorityOrder = [
      'sexual/minors',
      'self-harm/intent',
      'self-harm/instructions',
      'hate/threatening',
      'harassment/threatening',
      'illicit/violent',
      'violence/graphic',
      'self-harm',
      'hate',
      'harassment',
      'violence',
      'illicit',
      'sexual'
    ];

    // Find the highest priority flagged category
    const primaryCategory = priorityOrder.find(cat => flaggedCategories.includes(cat)) || flaggedCategories[0];
    const warningMessage = categoryMessages[primaryCategory] || 
      "whatever that was, it's not happening. try being less... that.";
    
    return {
      safe: false,
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
      return NextResponse.json(
        { 
          error: 'slow down there, speed racer. you\'re sending too many messages.',
          retryAfter: rateLimitCheck.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimitCheck.retryAfter || 60),
            'X-RateLimit-Limit': String(RATE_LIMIT_CONFIG.maxRequestsPerMinute),
            'X-RateLimit-Remaining': '0',
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
// Simple stubbed chat worker - no transformers or external dependencies

// Predefined responses based on keywords
const stubbedResponses: Record<string, string> = {
  technologies: "I work with Next.js, React, TypeScript, Node.js, and modern web technologies. I'm passionate about creating performant and user-friendly applications!",
  projects: "I've worked on various projects including portfolio websites, real-time applications, and open-source contributions. Each project taught me something new!",
  coffee: "Tea all the way! 🍵 While I respect coffee enthusiasts, there's something calming about a good cup of tea while coding.",
  tea: "Ah, a fellow tea lover! 🍵 Nothing beats a warm cup of tea during a coding session. Green tea in the morning, chamomile in the evening!",
  language: "TypeScript is my go-to! The type safety and developer experience it provides is unmatched. Though I enjoy exploring other languages too!",
  default: "That's an interesting question! As an AI assistant representing this developer, I'm here to help you learn more about their skills and experience.",
  hello: "Hello! 👋 I'm the AI assistant for this portfolio. Feel free to ask me about the developer's skills, projects, or preferences!",
  help: "I can tell you about the developer's technical skills, projects they've worked on, their preferred technologies, and even their beverage preferences! What would you like to know?"
};

// Simple keyword matching function
function getResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for keywords and return appropriate response
  if (lowerMessage.includes('technolog') || lowerMessage.includes('stack') || lowerMessage.includes('skill')) {
    return stubbedResponses.technologies;
  }
  if (lowerMessage.includes('project') || lowerMessage.includes('work')) {
    return stubbedResponses.projects;
  }
  if (lowerMessage.includes('coffee')) {
    return stubbedResponses.coffee;
  }
  if (lowerMessage.includes('tea')) {
    return stubbedResponses.tea;
  }
  if (lowerMessage.includes('language') || lowerMessage.includes('favorite')) {
    return stubbedResponses.language;
  }
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return stubbedResponses.hello;
  }
  if (lowerMessage.includes('help') || lowerMessage.includes('what can')) {
    return stubbedResponses.help;
  }
  
  return stubbedResponses.default;
}

// Send ready message immediately when worker starts
self.postMessage({
  type: 'progress',
  data: { status: 'ready' }
});

// Listen for messages from the main thread
self.addEventListener('message', async (event: MessageEvent) => {
  const { type, messages } = event.data;

  if (type === 'generate') {
    try {

      // Get the last user message
      const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
      const userContent = lastUserMessage?.content || '';

      // Simulate thinking delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get stubbed response
      const response = getResponse(userContent);

      // Send the response
      self.postMessage({
        type: 'complete',
        data: [{
          generated_text: [
            ...messages,
            {
              role: 'assistant',
              content: response
            }
          ]
        }]
      });
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

export {}; 
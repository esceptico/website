// Personal Content Configuration
// This file consolidates all personal content in one place

// Social Links
export const socialLinks = {
  github: 'https://github.com/esceptico',
  linkedin: 'https://linkedin.com/in/esceptico',
  twitter: 'https://x.com/postimortem',
  instagram: 'https://instagram.com/timurmurmur',
  cal: 'https://cal.com/timganiev/30min?overlayCalendar=true',
  email: 'mailto:ganiev.tmr@gmail.com'
} as const;

// Hacker Text Items
export const hackerTextItems = [
  'timur ganiev',
  'tim',
] as const;

// Time-based greetings
export const getTimeBasedGreeting = (): string => {
  const currentHour = new Date().getHours();
  
  const timeRanges = [
    { min: 0, max: 4, greeting: 'good night' },
    { min: 5, max: 11, greeting: 'good morning' },
    { min: 12, max: 16, greeting: 'good afternoon' },
    { min: 17, max: 21, greeting: 'good evening' },
    { min: 22, max: 23, greeting: 'good night' }
  ] as const;
  
  const matchingRange = timeRanges.find(
    range => currentHour >= range.min && currentHour <= range.max
  );
  
  return matchingRange?.greeting ?? 'hello';
};


// About Text
export const aboutMarkdown = `Research Engineer at [Dex](https://joindex.com) -- working on agentic memory, context engineering, and continuous learning. Previously ML Engineer at Adgentic and Senior ML Engineer at Replika, where I worked on post-training, safety alignment, and conversation systems for production LLMs. Here's my [CV](/Timur_Ganiev_CV.pdf).

Also into mechanistic interpretability and alignment -- using interp to check if alignment techniques actually work internally, not just behaviorally.

I keep a [log](/log) of ML notes and annotated implementations.

Outside of work, I play guitar and take photos of random stuff.` as const;

// 404 Error Messages
export const errorMessages = [
  "page not found",
  "gradient has vanished",
  "model failed to converge",
  "attention weights are NaN",
  "out of GPU memory",
  "tokenizer exception: unknown token",
  "loss exploded to infinity",
  "tensor shape mismatch",
  "embedding dimension error"
] as const;

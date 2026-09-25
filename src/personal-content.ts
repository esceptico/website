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

export const channels = [
  { label: 'github', href: socialLinks.github },
  { label: 'linkedin', href: socialLinks.linkedin },
  { label: 'x', href: socialLinks.twitter },
  { label: 'ig', href: socialLinks.instagram },
  { label: 'cal', href: socialLinks.cal },
  { label: 'mail', href: socialLinks.email, external: false },
] as const;

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
export const aboutMarkdown = `i work on agent memory and context engineering. before that: [dex](https://joindex.com) at thirdlayer, agents at adgentic, post-training and safety at replika. here's my [cv](/Timur_Ganiev_CV.pdf).

now i'm building [arden](https://fromarden.com), a personal assistant for your mac.

also into mech interp and alignment. i keep a [log](/log) of ml notes.

outside work i play guitar and take photos.` as const;

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

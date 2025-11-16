// Personal Content Configuration
// This file consolidates all personal content in one place

// Social Links
export const socialLinks = {
  github: 'https://github.com/esceptico',
  linkedin: 'https://linkedin.com/in/esceptico',
  twitter: 'https://x.com/postimortem',
  instagram: 'https://instagram.com/timurmurmur',
  email: 'mailto:ganiev.tmr@gmail.com'
} as const;

// Hacker Text Items
export const hackerTextItems = [
  'postmortem',
  'timur ganiev',
  'tim',
  'timur'
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
export const aboutText = {
  mainDescription: `Machine Learning Engineer specializing in post-training and safety alignment for production LLM systems. I build preference learning pipelines, train safety classifiers, and optimize low-latency inference. Previously led alignment work at Replika, shipping models trained on user feedback at scale. Currently working on building the next-generation of conversational AI.`,
  additionalInfo: `Outside of work, I'm into photography – shooting city scenes, people, and everything that catches my eye.`
} as const;

// Experience Data
interface Role {
  title: string;
  period: string;
  summary: string;
}

interface ExperienceEntry {
  company: string;
  roles: Role[];
}

export const experiences: ExperienceEntry[] = [
  {
    company: 'Replika',
    roles: [
      {
        title: 'Lead Machine Learning Engineer',
        period: 'Oct 2022 - Present',
        summary: 'Leading ML projects for conversational AI. Shipped new features end-to-end, integrated VLMs, and helped scale LLM infrastructure for production. Maintained high-load LLM services, focused on safety and user preference alignment. Fine-tuned models on real user feedback. Developed tools for synthetic data, evaluation, and training.'
      }
    ]
  },
  {
    company: 'Embedika',
    roles: [
      {
        title: 'Machine Learning Engineer',
        period: 'Feb 2022 - Sep 2022',
        summary: 'Built active learning and toxic content detection pipelines. Launched spell-checking and multi-modal ML services.'
      }
    ]
  },
  {
    company: 'Sber',
    roles: [
      {
        title: 'Machine Learning Engineer',
        period: 'Jan 2020 - Feb 2022',
        summary: 'Worked on documents processing. Led a small team to deliver ML solutions from scratch. Focused on model optimization (distillation, quantization) and improved deployment processes with CI/CD.'
      }
    ]
  },
  {
    company: 'Advance.Careers',
    roles: [
      {
        title: 'Data Scientist',
        period: 'Aug 2018 - Jul 2019',
        summary: 'Built resume/job parsing and matching systems, boosting CV upload and match rates. Developed custom text vectorizers for better recommendations.'
      }
    ]
  }
];

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

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

// About Text
export const aboutText = {
  mainDescription: `As a Machine Learning Engineer, I focus on developing and deploying machine learning models that tackle real-world challenges. My expertise includes natural language processing, computer vision, and predictive analytics. I am committed to creating impactful solutions and advancing the field of AI.`,
  additionalInfo: `Beyond my professional endeavors, I am an avid explorer of new technologies and a contributor to open-source projects. I also enjoy [mention a hobby or interest if you like, e.g., "hiking in nature", "playing the piano", "competitive programming"].`
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
        title: 'Lead ML Engineer',
        period: 'Oct 2022 - Present',
        summary: 'Leading safety alignment for high-load LLM services and implementing continuous monitoring systems.'
      }
    ]
  },
  {
    company: 'Embedika',
    roles: [
      {
        title: 'ML Engineer',
        period: 'Feb 2022 - Sep 2022',
        summary: 'Built toxic content classifier (94% F1-Score) and deployed spellchecking services with BERT.'
      }
    ]
  },
  {
    company: 'Sberbank',
    roles: [
      {
        title: 'ML Engineer',
        period: 'May 2021 - Feb 2022',
        summary: 'Led 4-person team, optimized models with 80% inference time reduction, established CI/CD pipelines.'
      },
      {
        title: 'Data Scientist',
        period: 'Jan 2020 - May 2021',
        summary: 'Developed text classification models (93% F1-Score) using adversarial training and advanced NLP techniques.'
      }
    ]
  },
  {
    company: 'Advance.Careers',
    roles: [
      {
        title: 'Data Scientist',
        period: 'Aug 2018 - Jul 2019',
        summary: 'Built resume parsing and job matching systems, improving platform efficiency and user experience.'
      }
    ]
  }
];

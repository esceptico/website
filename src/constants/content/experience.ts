interface Experience {
  title: string;
  company: string;
  period: string;
  achievements: string[];
}

interface Skills {
  core: string[];
  technologies: string[];
}

export const mleExperiences: Experience[] = [
  {
    title: 'Machine Learning Engineer (NLP)',
    company: 'Replika',
    period: 'Oct 2022 - Present',
    achievements: [
      'Ensure scalability and reliability of high-load LLM-based services',
      'Lead safety alignment to ensure models operate within desired parameters',
      'Work on user alignment data mining and model training',
      'Implement safety benchmarks for continuous monitoring and improvement'
    ]
  },
  {
    title: 'Machine Learning Engineer (NLP)',
    company: 'Embedika',
    period: 'Feb 2022 - Sep 2022',
    achievements: [
      'Completed an active learning service on multi-modal data',
      'Introduced toxic classifier service achieving 94% F1-Score',
      'Implemented and deployed spellchecking service using BERT and PyTorch Lightning'
    ]
  },
  {
    title: 'Machine Learning Engineer',
    company: 'Sberbank',
    period: 'May 2021 - Feb 2022',
    achievements: [
      'Led a team of 4 engineers and onboarded 3 new hires',
      'Optimized models through distillation and ONNX, reducing inference time by 80%',
      'Reduced NER models development time by 50% with custom Transformers pipeline',
      'Designed model showcase system reducing time to production by 15-20%',
      'Established CI/CD pipelines for automatic testing and deployment'
    ]
  },
  {
    title: 'Data Scientist',
    company: 'Sberbank',
    period: 'Jan 2020 - May 2021',
    achievements: [
      'Developed multi-target text classification model achieving 93% F1-Score',
      'Enhanced model robustness by 4% using Integrated Gradients and adversarial training',
      'Improved NER model performance by 5% through advanced token vectorization'
    ]
  },
  {
    title: 'Data Scientist',
    company: 'Advance.Careers',
    period: 'Aug 2018 - Jul 2019',
    achievements: [
      'Built resume and job posting parsing systems improving CV upload rate by 10%',
      'Enhanced job matching score by 10% using Smooth Inverse Frequency vectorization',
      'Reduced time to apply by 8% through system optimizations'
    ]
  }
];

export const mleSkills: Skills = {
  core: [
    'LLM Development',
    'NLP & Text Processing',
    'Model Optimization',
    'Safety Alignment'
  ],
  technologies: [
    'PyTorch',
    'Transformers',
    'ONNX',
    'Python'
  ]
};
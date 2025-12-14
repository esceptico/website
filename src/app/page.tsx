import { AboutPage } from '@/components/content/AboutPage';

// JSON-LD structured data for the main page
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Timur Ganiev',
  url: 'https://timganiev.com',
  jobTitle: 'Machine Learning Engineer',
  description: 'Machine Learning Engineer specializing in post-training and safety alignment for production LLM systems.',
  sameAs: [
    'https://github.com/Esceptico',
    'https://linkedin.com/in/timur-ganiev',
    'https://twitter.com/postimortem',
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutPage />
    </>
  );
}

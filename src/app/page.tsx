import type { Metadata } from 'next';
import { AboutPage } from '@/components/content/AboutPage';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': 'https://timganiev.com/feed.xml',
    },
  },
};

// JSON-LD structured data for the main page
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Timur Ganiev',
  url: 'https://timganiev.com',
  jobTitle: 'Research Engineer',
  description: 'Research Engineer working on agent memory, context engineering, and reliable long-running systems.',
  sameAs: [
    'https://github.com/esceptico',
    'https://linkedin.com/in/esceptico',
    'https://x.com/postimortem',
    'https://instagram.com/timurmurmur',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    url: 'https://cal.com/timganiev/30min?overlayCalendar=true',
    contactType: 'scheduling',
  },
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

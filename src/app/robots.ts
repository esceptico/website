import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/tools/',  // Internal tools, not for indexing
      ],
    },
    sitemap: 'https://timganiev.com/sitemap.xml',
  };
}

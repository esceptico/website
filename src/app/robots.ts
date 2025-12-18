import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/about/',
        '/blog/',
        '/portfolio/',
        '/projects/',
        '/docs/',
      ],
    },
    sitemap: 'https://timganiev.com/sitemap.xml',
  };
}

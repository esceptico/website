import { getAllPosts } from '@/lib/blog';

export async function GET() {
  const posts = getAllPosts();
  const baseUrl = 'https://timganiev.com';

  const rssItems = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/log/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/log/${post.slug}</guid>
      ${post.date ? `<pubDate>${new Date(post.date).toUTCString()}</pubDate>` : ''}
      ${post.summary ? `<description><![CDATA[${post.summary}]]></description>` : ''}
    </item>`
    )
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Timur Ganiev - Log</title>
    <link>${baseUrl}/log</link>
    <description>Technical deep dives and annotated implementations</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}


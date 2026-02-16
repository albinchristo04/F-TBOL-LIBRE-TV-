import type { APIRoute } from 'astro';

export function GET() {
  const siteUrl = 'https://futbollibre.velcuri.io';

  const robotsTxt = `User-agent: *
Allow: /

# Disallow admin areas
Disallow: /admin/
Disallow: /api/

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml

# Crawl-delay (optional, adjust as needed)
Crawl-delay: 1
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

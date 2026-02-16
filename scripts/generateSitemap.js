import fs from 'fs/promises';
import path from 'path';
import { fetchMatches } from './fetchMatches.js';

async function generateSitemap() {
  const siteUrl = 'https://futbollibre.velcuri.io';
  const matches = await fetchMatches();

  // Static pages
  const staticPages = [
    '',
    '/partidos-hoy/',
    '/liga-mx-en-vivo/',
    '/champions-league-en-vivo/',
    '/premier-league-en-vivo/',
    '/la-liga-en-vivo/',
    '/serie-a-en-vivo/',
    '/copa-libertadores-en-vivo/',
    '/blog/',
    '/blog/previews/',
    '/blog/recaps/',
    '/como-ver-futbol-sin-registrarse/',
    '/guia-champions-league/',
  ];

  // Build sitemap XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>
';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
';

  // Add static pages
  staticPages.forEach(path => {
    xml += `  <url>
`;
    xml += `    <loc>${siteUrl}${path}</loc>
`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>
`;
    xml += `    <changefreq>daily</changefreq>
`;
    xml += `    <priority>${path === '' ? '1.0' : '0.8'}</priority>
`;
    xml += `  </url>
`;
  });

  // Add dynamic match pages
  matches.forEach(match => {
    xml += `  <url>
`;
    xml += `    <loc>${siteUrl}/${match.slug}/</loc>
`;
    xml += `    <lastmod>${match.updated_at}</lastmod>
`;
    xml += `    <changefreq>daily</changefreq>
`;
    xml += `    <priority>0.9</priority>
`;
    xml += `  </url>
`;
  });

  xml += '</urlset>';

  // Save to public directory
  const publicDir = path.join(process.cwd(), 'public');
  await fs.mkdir(publicDir, { recursive: true });

  await fs.writeFile(
    path.join(publicDir, 'sitemap.xml'),
    xml
  );

  console.log('✓ Sitemap generated successfully');
  console.log(`  Total URLs: ${staticPages.length + matches.length}`);
  console.log(`  Static pages: ${staticPages.length}`);
  console.log(`  Match pages: ${matches.length}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await generateSitemap();
}

export { generateSitemap };

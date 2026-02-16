import axios from 'axios';
import { fetchMatches } from './fetchMatches.js';

const BING_PING_URL = 'https://www.bing.com/ping';

async function pingBingUrls() {
  const siteUrl = process.env.SITE_URL || 'https://futbollibre.velcuri.io';

  try {
    // Prepare URLs to ping
    const urlsToPing = [
      `${siteUrl}/`, // Homepage
      `${siteUrl}/partidos-hoy/`,
      `${siteUrl}/liga-mx-en-vivo/`,
      `${siteUrl}/champions-league-en-vivo/`,
      `${siteUrl}/premier-league-en-vivo/`,
      `${siteUrl}/la-liga-en-vivo/`,
      `${siteUrl}/serie-a-en-vivo/`,
      `${siteUrl}/copa-libertadores-en-vivo/`,
      `${siteUrl}/sitemap.xml`,
    ];

    // Add dynamic match pages
    try {
      const matches = await fetchMatches();
      const matchUrls = matches.slice(0, 50).map(m => 
        `${siteUrl}/${m.slug}/`
      );
      urlsToPing.push(...matchUrls);
    } catch (error) {
      console.warn('Could not fetch match URLs:', error.message);
    }

    console.log(`Pinging ${urlsToPing.length} URLs to Bing...`);

    // Ping each URL
    const results = await Promise.allSettled(
      urlsToPing.map(url =>
        axios.post(BING_PING_URL, {
          siteUrl: siteUrl,
          url: url,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        })
      )
    );

    // Count results
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✓ Ping summary:`);
    console.log(`  Successful: ${successful}`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Total: ${urlsToPing.length}`);

    if (successful > 0) {
      console.log(`
✓ URLs submitted for Bing indexing`);
      console.log(`Check status at: https://www.bing.com/webmaster/home/mysites`);
    }

    return { successful, failed, total: urlsToPing.length };

  } catch (error) {
    console.error('Error pinging Bing:', error.message);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await pingBingUrls();
}

export { pingBingUrls };

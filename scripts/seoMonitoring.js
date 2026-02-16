import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

async function monitorSEO() {
  const apiKey = process.env.BING_WEBMASTER_API_KEY;
  const siteUrl = process.env.SITE_URL || 'https://futbollibre.velcuri.io';
  const keywords = (process.env.BING_RANKING_KEYWORDS || '').split(',').filter(k => k.trim());

  if (!apiKey) {
    console.warn('Warning: BING_WEBMASTER_API_KEY not set for monitoring');
    return;
  }

  try {
    console.log('📊 Starting SEO monitoring...');
    console.log(`Site: ${siteUrl}`);
    console.log(`Tracking ${keywords.length} keywords`);

    // Bing Webmaster Tools API endpoints
    const topPagesUrl = 'https://www.bing.com/webmaster/api.sitemaps.getdata';

    try {
      // Get top pages data
      const response = await axios.get(topPagesUrl, {
        params: {
          apikey: apiKey,
          siteUrl: siteUrl,
          type: 'query',
        },
        timeout: 10000,
      });

      console.log('\n✓ Successfully retrieved Bing Webmaster data');

      // Log top queries
      if (response.data?.d?.TopQueries) {
        console.log('\n🔍 Top Search Queries:');
        response.data.d.TopQueries.slice(0, 10).forEach((query, i) => {
          console.log(`  ${i+1}. "${query.Query}" - ${query.Clicks} clicks, Position: ${query.AvgPosition?.toFixed(1)}`);
        });
      }

      // Log top pages
      if (response.data?.d?.TopPages) {
        console.log('\n📄 Top Pages:');
        response.data.d.TopPages.slice(0, 10).forEach((page, i) => {
          console.log(`  ${i+1}. ${page.Url} - ${page.Clicks} clicks`);
        });
      }

      // Save report
      const report = {
        timestamp: new Date().toISOString(),
        site: siteUrl,
        data: response.data,
      };

      const reportDir = path.join(process.cwd(), '.reports');
      await fs.mkdir(reportDir, { recursive: true });

      await fs.writeFile(
        path.join(reportDir, `seo-report-${new Date().toISOString().split('T')[0]}.json`),
        JSON.stringify(report, null, 2)
      );

      console.log('\n✓ SEO monitoring report saved');

    } catch (error) {
      console.log('Note: Bing Webmaster API data may take time to populate');
      console.log('Check your rankings at: https://www.bing.com/webmaster/home/mysites');
    }

  } catch (error) {
    console.error('Error during SEO monitoring:', error.message);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  monitorSEO()
    .then(() => {
      console.log('SEO monitoring completed successfully');
    })
    .catch(error => {
      console.error('Error in SEO monitoring:', error);
      process.exit(1);
    });
}

export { monitorSEO };

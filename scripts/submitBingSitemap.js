import axios from 'axios';

const BING_SUBMIT_URL = 'https://www.bing.com/webmaster/api.sitemaps.submit';

async function submitSitemapToBing() {
  const apiKey = process.env.BING_WEBMASTER_API_KEY;
  const siteUrl = process.env.SITE_URL || 'https://futbollibre.velcuri.io';

  if (!apiKey) {
    console.error('Error: BING_WEBMASTER_API_KEY not set');
    process.exit(1);
  }

  const sitemapUrl = `${siteUrl}/sitemap.xml`;

  try {
    console.log(`Submitting sitemap to Bing: ${sitemapUrl}`);

    const response = await axios.post(BING_SUBMIT_URL, null, {
      params: {
        apikey: apiKey,
        siteUrl: siteUrl,
        sitemap: sitemapUrl,
      }
    });

    if (response.status === 200 || response.data?.message?.includes('success')) {
      console.log('✓ Sitemap successfully submitted to Bing');
      console.log(`Sitemap URL: ${sitemapUrl}`);
      console.log(`Monitor at: https://www.bing.com/webmaster/home/mysites`);
    } else {
      console.log('Sitemap submission response:', response.data);
    }

  } catch (error) {
    if (error.response?.status === 404) {
      console.warn('⚠ Sitemap not found. Ensure it was generated during build.');
    } else {
      console.error('Error submitting sitemap:', error.message);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  submitSitemapToBing()
    .then(() => {
      console.log('Sitemap submission completed successfully');
    })
    .catch(error => {
      console.error('Error in sitemap submission:', error);
      process.exit(1);
    });
}

export { submitSitemapToBing };

/**
 * Bing Webmaster Tools Integration
 * Functions for submitting sitemaps and pinging URLs to Bing
 */

import axios from 'axios';

const BING_SUBMIT_URL = 'https://www.bing.com/webmaster/api.sitemaps.submit';
const BING_PING_URL = 'https://www.bing.com/ping';

/**
 * Submit sitemap to Bing Webmaster Tools
 */
export async function submitSitemapToBing(
  apiKey: string,
  siteUrl: string,
  sitemapUrl?: string
): Promise<{ success: boolean; message: string }> {
  if (!apiKey) {
    return {
      success: false,
      message: 'BING_WEBMASTER_API_KEY not provided'
    };
  }

  const sitemap = sitemapUrl || `${siteUrl}/sitemap.xml`;

  try {
    console.log(`Submitting sitemap to Bing: ${sitemap}`);

    const response = await axios.post(
      BING_SUBMIT_URL,
      null,
      {
        params: {
          apikey: apiKey,
          siteUrl: siteUrl,
          sitemap: sitemap,
        },
        timeout: 10000,
      }
    );

    if (response.status === 200 || response.data?.message?.includes('success')) {
      return {
        success: true,
        message: 'Sitemap successfully submitted to Bing'
      };
    } else {
      return {
        success: false,
        message: `Unexpected response: ${JSON.stringify(response.data)}`
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return {
        success: false,
        message: 'Sitemap not found. Ensure it was generated during build.'
      };
    }

    return {
      success: false,
      message: `Error submitting sitemap: ${errorMessage}`
    };
  }
}

/**
 * Ping Bing about updated URLs
 */
export async function pingBingUrls(
  apiKey: string,
  siteUrl: string,
  urls: string[]
): Promise<{ successful: number; failed: number; total: number; message: string }> {
  if (!apiKey) {
    return {
      successful: 0,
      failed: urls.length,
      total: urls.length,
      message: 'BING_WEBMASTER_API_KEY not provided'
    };
  }

  try {
    console.log(`Pinging ${urls.length} URLs to Bing...`);

    const results = await Promise.allSettled(
      urls.map(url =>
        axios.post(
          BING_PING_URL,
          {
            siteUrl: siteUrl,
            url: url,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 5000,
          }
        )
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      successful,
      failed,
      total: urls.length,
      message: `Pinged ${successful} URLs successfully, ${failed} failed`
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      successful: 0,
      failed: urls.length,
      total: urls.length,
      message: `Error pinging URLs: ${errorMessage}`
    };
  }
}

/**
 * Get Bing Webmaster Tools API data
 */
export async function getBingWebmasterData(
  apiKey: string,
  siteUrl: string,
  dataType: 'query' | 'page' | 'crawl' = 'query'
): Promise<any> {
  if (!apiKey) {
    throw new Error('BING_WEBMASTER_API_KEY not provided');
  }

  const apiUrl = 'https://www.bing.com/webmaster/api.sitemaps.getdata';

  try {
    const response = await axios.get(apiUrl, {
      params: {
        apikey: apiKey,
        siteUrl: siteUrl,
        type: dataType,
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Error fetching Bing Webmaster data: ${errorMessage}`);
  }
}

/**
 * Get top search queries from Bing Webmaster Tools
 */
export async function getTopQueries(
  apiKey: string,
  siteUrl: string,
  limit = 10
): Promise<Array<{ Query: string; Clicks: number; Impressions: number; AvgPosition: number }>> {
  try {
    const data = await getBingWebmasterData(apiKey, siteUrl, 'query');
    return data?.d?.TopQueries?.slice(0, limit) || [];
  } catch (error) {
    console.error('Error fetching top queries:', error);
    return [];
  }
}

/**
 * Get top pages from Bing Webmaster Tools
 */
export async function getTopPages(
  apiKey: string,
  siteUrl: string,
  limit = 10
): Promise<Array<{ Url: string; Clicks: number; Impressions: number }>> {
  try {
    const data = await getBingWebmasterData(apiKey, siteUrl, 'page');
    return data?.d?.TopPages?.slice(0, limit) || [];
  } catch (error) {
    console.error('Error fetching top pages:', error);
    return [];
  }
}

/**
 * Get crawl statistics from Bing Webmaster Tools
 */
export async function getCrawlStats(
  apiKey: string,
  siteUrl: string
): Promise<any> {
  try {
    const data = await getBingWebmasterData(apiKey, siteUrl, 'crawl');
    return data?.d || null;
  } catch (error) {
    console.error('Error fetching crawl stats:', error);
    return null;
  }
}

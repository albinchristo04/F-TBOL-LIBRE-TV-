import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const MATCHES_JSON_URL = process.env.MATCHES_JSON_URL || 
  'https://raw.githubusercontent.com/albinchristo04/ptv/refs/heads/main/futbollibre.json';

async function fetchMatches() {
  try {
    console.log(`Fetching matches from: ${MATCHES_JSON_URL}`);

    const response = await axios.get(MATCHES_JSON_URL, {
      timeout: 10000,
      headers: {
        'User-Agent': 'FutbolLibreTV/1.0 (+https://futbollibre.velcuri.io)',
      }
    });

    const matches = response.data;

    // Enhance matches with computed fields
    const enhancedMatches = matches.map(match => ({
      ...match,
      // Ensure all required fields
      id: match.id || `${match.team_a}-${match.team_b}-${match.date}`.replace(/\s+/g, '-'),
      slug: `${match.team_a}-vs-${match.team_b}-${match.date}`.toLowerCase().replace(/\s+/g, '-'),
      updated_at: new Date().toISOString(),

      // SEO optimizations
      seo_title: `${match.team_a} vs ${match.team_b}${match.league ? ' - ' + match.league : ''} en vivo`,
      seo_description: `Ver ${match.team_a} vs ${match.team_b} en vivo${match.league ? ' - ' + match.league : ''}. Transmisión en directo sin registrarse.`,

      // Ensure decoded_iframe_url exists
      decoded_iframe_url: match.decoded_iframe_url || match.iframe_url || '',
    }));

    // Sort by date
    enhancedMatches.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Save to file
    const dataDir = path.join(process.cwd(), 'src/data');
    await fs.mkdir(dataDir, { recursive: true });

    await fs.writeFile(
      path.join(dataDir, 'matches.json'),
      JSON.stringify(enhancedMatches, null, 2)
    );

    console.log(`✓ Successfully fetched and saved ${enhancedMatches.length} matches`);

    // Log match count by league
    const leagueCount = {};
    enhancedMatches.forEach(m => {
      leagueCount[m.league || 'Unknown'] = (leagueCount[m.league || 'Unknown'] || 0) + 1;
    });

    console.log('Matches by league:');
    Object.entries(leagueCount).forEach(([league, count]) => {
      console.log(`  ${league}: ${count}`);
    });

    return enhancedMatches;

  } catch (error) {
    console.error('Error fetching matches:', error.message);

    // Fallback to cached matches if available
    try {
      const cachedMatches = await fs.readFile(
        path.join(process.cwd(), 'src/data/matches.json'),
        'utf-8'
      );
      console.log('Using cached matches');
      return JSON.parse(cachedMatches);
    } catch {
      console.error('No cached matches available');
      return [];
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await fetchMatches();
}

export { fetchMatches };

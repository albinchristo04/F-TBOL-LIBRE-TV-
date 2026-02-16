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

    // Handle different response formats
    let matches = response.data;

    // If response is not an array, try to extract matches from common formats
    if (!Array.isArray(matches)) {
      if (matches.data && Array.isArray(matches.data)) {
        matches = matches.data;
      } else if (matches.matches && Array.isArray(matches.matches)) {
        matches = matches.matches;
      } else {
        console.error('Unexpected response format:', typeof matches, Object.keys(matches));
        return [];
      }
    }

    // Enhance matches with computed fields and extract data from attributes
    const enhancedMatches = matches.map(match => {
      // Extract data from attributes if present
      const matchData = match.attributes || match;

      // Parse team names and league from diary_description
      const description = matchData.diary_description || '';
      const teamMatch = description.match(/([^:]*):\s*(.+?)\s+vs\s+(.+)/);
      
      const league = teamMatch ? teamMatch[1].trim() : '';
      const teamA = teamMatch ? teamMatch[2].trim() : '';
      const teamB = teamMatch ? teamMatch[3].trim() : '';

      // Get first embed URL if available
      const embeds = matchData.embeds?.data || [];
      const firstEmbed = embeds[0]?.attributes;
      const decodedIframeUrl = firstEmbed?.decoded_iframe_url || '';

      return {
        ...match,
        // Override with parsed values
        id: match.id || matchData.id,
        team_a: teamA,
        team_b: teamB,
        league: league,
        date: matchData.date_diary,
        time: matchData.diary_hour,
        stadium: matchData.stadium || '',
        decoded_iframe_url: decodedIframeUrl,
        iframe_url: firstEmbed?.embed_iframe || '',
        slug: `${teamA.toLowerCase().replace(/\s+/g, '-')}-vs-${teamB.toLowerCase().replace(/\s+/g, '-')}-${matchData.date_diary}`,
        updated_at: matchData.updatedAt || new Date().toISOString(),
        seo_title: `${teamA} vs ${teamB}${league ? ' - ' + league : ''} en vivo`,
        seo_description: `Ver ${teamA} vs ${teamB} en vivo${league ? ' - ' + league : ''}. Transmisión en directo sin registrarse.`,
      };
    });

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
  fetchMatches()
    .then(() => {
      console.log('Fetch matches completed successfully');
    })
    .catch(error => {
      console.error('Error in fetchMatches:', error);
      process.exit(1);
    });
}

export { fetchMatches };

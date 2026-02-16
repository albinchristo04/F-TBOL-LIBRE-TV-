import axios from 'axios';

export interface Match {
  id: string;
  team_a: string;
  team_b: string;
  league?: string;
  date: string;
  time: string;
  stadium?: string;
  decoded_iframe_url?: string;
  iframe_url?: string;
  slug: string;
  updated_at: string;
  seo_title?: string;
  seo_description?: string;
}

const MATCHES_JSON_URL = process.env.MATCHES_JSON_URL || 
  'https://raw.githubusercontent.com/albinchristo04/ptv/refs/heads/main/futbollibre.json';

let cachedMatches: Match[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours

export async function fetchMatches(forceRefresh = false): Promise<Match[]> {
  const now = Date.now();

  // Return cached matches if available and not expired
  if (!forceRefresh && cachedMatches && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedMatches;
  }

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
        console.error('Unexpected response format:', matches);
        return [];
      }
    }

    // Enhance matches with computed fields and filter out invalid matches
    const enhancedMatches: Match[] = matches
      .filter((match: any) => {
        // Extract data from attributes if present
        const matchData = match.attributes || match;

        // Parse team names from diary_description (format: "League: 
Team A vs Team B")
        const description = matchData.diary_description || '';
        const teamMatch = description.match(/[^:]*:\s*(.+?)\s+vs\s+(.+)/);

        // Validate required fields
        if (!teamMatch || !matchData.date_diary || !matchData.diary_hour) {
          console.error('Invalid match data, skipping:', match);
          return false;
        }

        return true;
      })
      .map((match: any) => {
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
    enhancedMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Update cache
    cachedMatches = enhancedMatches;
    lastFetchTime = now;

    console.log(`✓ Successfully fetched and saved ${enhancedMatches.length} matches`);

    // Log match count by league
    const leagueCount: Record<string, number> = {};
    enhancedMatches.forEach(m => {
      leagueCount[m.league || 'Unknown'] = (leagueCount[m.league || 'Unknown'] || 0) + 1;
    });

    console.log('Matches by league:');
    Object.entries(leagueCount).forEach(([league, count]) => {
      console.log(`  ${league}: ${count}`);
    });

    return enhancedMatches;

  } catch (error) {
    console.error('Error fetching matches:', error instanceof Error ? error.message : 'Unknown error');

    // Return cached matches if available
    if (cachedMatches) {
      console.log('Using cached matches due to fetch error');
      return cachedMatches;
    }

    return [];
  }
}

export async function getMatchById(id: string): Promise<Match | null> {
  const matches = await fetchMatches();
  return matches.find(m => m.id === id) || null;
}

export async function getMatchBySlug(slug: string): Promise<Match | null> {
  const matches = await fetchMatches();
  return matches.find(m => m.slug === slug) || null;
}

export async function getMatchesByLeague(league: string): Promise<Match[]> {
  const matches = await fetchMatches();
  return matches.filter(m => m.league === league);
}

export async function getTodayMatches(): Promise<Match[]> {
  const matches = await fetchMatches();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return matches.filter(m => {
    const matchDate = new Date(m.date);
    matchDate.setHours(0, 0, 0, 0);
    return matchDate.getTime() === today.getTime();
  });
}

export async function getLiveMatches(): Promise<Match[]> {
  const matches = await fetchMatches();
  const now = new Date();

  return matches.filter(m => {
    const matchDate = new Date(m.date + 'T' + m.time);
    const endTime = new Date(matchDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours after start
    return now >= matchDate && now <= endTime;
  });
}

export async function getUpcomingMatches(days = 7): Promise<Match[]> {
  const matches = await fetchMatches();
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return matches.filter(m => {
    const matchDate = new Date(m.date + 'T' + m.time);
    return matchDate >= now && matchDate <= futureDate;
  });
}

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
      if (matches.matches && Array.isArray(matches.matches)) {
        matches = matches.matches;
      } else if (matches.data && Array.isArray(matches.data)) {
        matches = matches.data;
      } else {
        console.error('Unexpected response format:', matches);
        return [];
      }
    }

    // Enhance matches with computed fields and filter out invalid matches
    const enhancedMatches: Match[] = matches
      .filter((match: any) => {
        // Validate required fields
        if (!match.team_a || !match.team_b || !match.date || !match.time) {
          console.error('Invalid match data, skipping:', match);
          return false;
        }
        return true;
      })
      .map((match: any) => ({
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

/**
 * SEO Utilities for Fútbol Libre TV
 * Helper functions for generating SEO-optimized content
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  robots?: string;
  lastModified?: string;
}

/**
 * Generate SEO-optimized title
 * Ensures title is within Bing's recommended 50-60 characters
 */
export function generateTitle(baseTitle: string, suffix = ' | Fútbol Libre TV'): string {
  const maxLength = 60;
  const title = baseTitle + suffix;

  if (title.length <= maxLength) {
    return title;
  }

  // Truncate base title if needed
  const availableLength = maxLength - suffix.length - 3; // -3 for "..."
  return baseTitle.substring(0, availableLength) + '...' + suffix;
}

/**
 * Generate SEO-optimized meta description
 * Ensures description is within Bing's recommended 155-160 characters
 */
export function generateDescription(content: string, maxLength = 160): string {
  if (content.length <= maxLength) {
    return content;
  }

  // Find last complete sentence or word
  const lastPeriod = content.lastIndexOf('.', maxLength - 3);
  if (lastPeriod > 0) {
    return content.substring(0, lastPeriod + 1);
  }

  const lastSpace = content.lastIndexOf(' ', maxLength - 3);
  if (lastSpace > 0) {
    return content.substring(0, lastSpace) + '...';
  }

  return content.substring(0, maxLength - 3) + '...';
}

/**
 * Generate keywords from content
 * Extracts relevant keywords from match/team names and leagues
 */
export function generateKeywords(...items: string[]): string {
  const keywords = new Set<string>();

  items.forEach(item => {
    if (!item) return;

    // Add full term
    keywords.add(item.toLowerCase());

    // Add individual words
    item.split(/[\s-]+/).forEach(word => {
      if (word.length > 2) {
        keywords.add(word.toLowerCase());
      }
    });
  });

  // Add common football keywords
  keywords.add('fútbol');
  keywords.add('en vivo');
  keywords.add('gratis');
  keywords.add('transmisión');
  keywords.add('partido');

  return Array.from(keywords).join(', ');
}

/**
 * Generate canonical URL
 * Ensures URL has trailing slash for Bing consistency
 */
export function generateCanonical(base: string, path: string = ''): string {
  const url = new URL(path, base);

  // Ensure trailing slash
  if (!url.pathname.endsWith('/')) {
    url.pathname += '/';
  }

  return url.toString();
}

/**
 * Generate last modified date string
 */
export function generateLastModified(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Generate robots meta tag content
 */
export function generateRobots(index = true, follow = true): string {
  const directives: string[] = [];

  if (index) directives.push('index');
  else directives.push('noindex');

  if (follow) directives.push('follow');
  else directives.push('nofollow');

  return directives.join(', ');
}

/**
 * Generate Open Graph image URL
 */
export function generateOgImage(path: string, baseUrl: string = 'https://futbollibre.velcuri.io'): string {
  return new URL(path, baseUrl).toString();
}

/**
 * Generate SEO configuration object
 */
export function generateSEOConfig(config: Partial<SEOConfig>): SEOConfig {
  return {
    title: generateTitle(config.title || ''),
    description: generateDescription(config.description || ''),
    keywords: config.keywords,
    canonical: config.canonical,
    ogImage: config.ogImage,
    ogType: config.ogType || 'website',
    robots: config.robots || generateRobots(),
    lastModified: config.lastModified || generateLastModified(),
  };
}

/**
 * Generate structured data for sports event
 */
export function generateSportsEventData(match: any) {
  const startTime = new Date(match.date + 'T' + match.time).toISOString();
  const endTime = new Date(new Date(startTime).getTime() + 120 * 60000).toISOString(); // 2 hours

  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": `${match.team_a} vs ${match.team_b}`,
    "description": `Transmisión en vivo de ${match.team_a} vs ${match.team_b} en ${match.league}`,
    "startDate": startTime,
    "endDate": endTime,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
    "location": {
      "@type": "VirtualLocation",
      "url": `https://futbollibre.velcuri.io/${match.slug}/`
    },
    "organizer": {
      "@type": "Organization",
      "name": match.league || "Fútbol Libre TV"
    },
    "performer": [
      {
        "@type": "SportsTeam",
        "name": match.team_a
      },
      {
        "@type": "SportsTeam",
        "name": match.team_b
      }
    ],
    "offers": {
      "@type": "Offer",
      "url": `https://futbollibre.velcuri.io/${match.slug}/`,
      "price": "0",
      "priceCurrency": "USD"
    }
  };
}

/**
 * Generate structured data for video object
 */
export function generateVideoObjectData(match: any) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": `${match.team_a} vs ${match.team_b} en vivo`,
    "description": `Transmisión en vivo de ${match.team_a} vs ${match.team_b}`,
    "uploadDate": new Date().toISOString(),
    "url": `https://futbollibre.velcuri.io/${match.slug}/`,
    "thumbnailUrl": [
      `https://futbollibre.velcuri.io/og-image.jpg`
    ],
    "duration": "PT120M",
    "embedUrl": match.decoded_iframe_url
  };
}

/**
 * Generate structured data for broadcast event
 */
export function generateBroadcastEventData(match: any) {
  const startTime = new Date(match.date + 'T' + match.time).toISOString();
  const endTime = new Date(new Date(startTime).getTime() + 120 * 60000).toISOString(); // 2 hours

  return {
    "@context": "https://schema.org",
    "@type": "BroadcastEvent",
    "name": `${match.team_a} vs ${match.team_b} - Transmisión en Vivo`,
    "description": `Transmisión en vivo de ${match.team_a} vs ${match.team_b} en ${match.league}`,
    "isLiveBroadcast": true,
    "startDate": startTime,
    "endDate": endTime,
    "publishedOn": {
      "@type": "BroadcastService",
      "name": "Fútbol Libre TV",
      "url": "https://futbollibre.velcuri.io"
    },
    "videoFormat": "HD",
    "broadcastOfEvent": {
      "@type": "SportsEvent",
      "name": `${match.team_a} vs ${match.team_b}`,
      "startDate": startTime,
      "endDate": endTime,
      "homeTeam": {
        "@type": "SportsTeam",
        "name": match.team_a
      },
      "awayTeam": {
        "@type": "SportsTeam",
        "name": match.team_b
      }
    }
  };
}

/**
 * Generate breadcrumb list structured data
 */
export function generateBreadcrumbData(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

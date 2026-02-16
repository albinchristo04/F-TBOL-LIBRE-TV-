/**
 * Schema.org Structured Data Generation
 * Functions for generating various types of structured data for SEO
 */

import type { Match } from './fetchMatches';

/**
 * Generate SportsEvent schema
 */
export function generateSportsEventSchema(match: Match) {
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
 * Generate BroadcastEvent schema
 */
export function generateBroadcastEventSchema(match: Match) {
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
 * Generate VideoObject schema
 */
export function generateVideoObjectSchema(match: Match) {
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
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
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

/**
 * Generate WebSite schema
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Fútbol Libre TV",
    "url": "https://futbollibre.velcuri.io",
    "description": "Ver fútbol en vivo gratis. Liga MX, Champions League, Premier League y más",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://futbollibre.velcuri.io/buscar?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Fútbol Libre TV",
    "url": "https://futbollibre.velcuri.io",
    "logo": "https://futbollibre.velcuri.io/logo.png",
    "description": "Plataforma para ver fútbol en vivo gratis",
    "sameAs": [
      "https://twitter.com/futbollibretv",
      "https://facebook.com/futbollibretv"
    ]
  };
}

/**
 * Generate SportsLeague schema
 */
export function generateSportsLeagueSchema(name: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsLeague",
    "name": name,
    "description": description,
    "url": url
  };
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generate Article schema for blog posts
 */
export function generateArticleSchema(
  title: string,
  description: string,
  url: string,
  imageUrl: string,
  publishDate: string,
  author: string = 'Fútbol Libre TV'
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "url": url,
    "image": imageUrl,
    "datePublished": publishDate,
    "dateModified": publishDate,
    "author": {
      "@type": "Organization",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Fútbol Libre TV",
      "logo": {
        "@type": "ImageObject",
        "url": "https://futbollibre.velcuri.io/logo.png"
      }
    }
  };
}

/**
 * Generate CollectionPage schema for listing pages
 */
export function generateCollectionPageSchema(
  title: string,
  description: string,
  url: string,
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": title,
    "description": description,
    "url": url,
    "hasPart": items.map(item => ({
      "@type": "Thing",
      "name": item.name,
      "url": item.url
    }))
  };
}

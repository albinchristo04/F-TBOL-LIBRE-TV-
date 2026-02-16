/**
 * Content Generation Utilities
 * Helper functions for generating match previews, recaps, and other content
 */

import type { Match } from './fetchMatches';

/**
 * Generate match preview content
 */
export function generateMatchPreview(match: Match): string {
  const preview = `
    <h2>Previa del Partido: ${match.team_a} vs ${match.team_b}</h2>

    <p>
      El partido entre <strong>${match.team_a}</strong> y <strong>${match.team_b}</strong>
      se llevará a cabo el ${new Date(match.date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })} a las ${match.time}.
    </p>

    ${match.league ? `<p>Este encuentro corresponde a la ${match.league}.</p>` : ''}

    <h3>Acerca de ${match.team_a}</h3>
    <p>
      ${match.team_a} llega a este partido buscando sumar tres puntos importantes.
      El equipo ha mostrado un buen rendimiento en los últimos encuentros.
    </p>

    <h3>Acerca de ${match.team_b}</h3>
    <p>
      Por su parte, ${match.team_b} busca mantener su racha positiva y
      conseguir una victoria en esta visita.
    </p>

    <h3>¿Dónde ver el partido?</h3>
    <p>
      Puedes ver ${match.team_a} vs ${match.team_b} en vivo gratis en Fútbol Libre TV.
      No necesitas registrarte ni crear cuenta. Solo selecciona el partido y presiona play.
    </p>
  `;

  return preview.trim();
}

/**
 * Generate match recap content
 */
export function generateMatchRecap(match: Match): string {
  const recap = `
    <h2>Resumen: ${match.team_a} vs ${match.team_b}</h2>

    <p>
      El partido entre <strong>${match.team_a}</strong> y <strong>${match.team_b}</strong>
      se disputó el ${new Date(match.date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}.
    </p>

    ${match.league ? `<p>Este encuentro correspondió a la ${match.league}.</p>` : ''}

    <h3>Lo más destacado</h3>
    <p>
      Un partido emocionante que mantuvo a los espectadores al borde de sus asientos
      durante los 90 minutos. Ambos equipos mostraron un gran nivel en el terreno de juego.
    </p>

    <h3>Próximos partidos</h3>
    <p>
      Ambos equipos continuarán su participación en la ${match.league || 'competición'}
      en los próximos días. No te pierdas los próximos encuentros en Fútbol Libre TV.
    </p>
  `;

  return recap.trim();
}

/**
 * Generate league guide content
 */
export function generateLeagueGuide(leagueName: string): string {
  const guide = `
    <h2>Guía de la ${leagueName}</h2>

    <p>
      La ${leagueName} es una de las competiciones más importantes del fútbol mundial.
      En Fútbol Libre TV puedes ver todos los partidos en vivo gratis.
    </p>

    <h3>¿Qué equipos participan?</h3>
    <p>
      Los mejores equipos del mundo se enfrentan en cada jornada de la ${leagueName},
      ofreciendo partidos de alta calidad y mucha emoción.
    </p>

    <h3>¿Cuándo se juegan los partidos?</h3>
    <p>
      Los partidos de la ${leagueName} se disputan durante toda la temporada,
      con jornadas regulares y fases eliminatorias.
    </p>

    <h3>¿Dónde ver los partidos?</h3>
    <p>
      En Fútbol Libre TV puedes ver todos los partidos de la ${leagueName} en vivo gratis.
      No necesitas registrarte ni crear cuenta. Solo selecciona el partido y presiona play.
    </p>
  `;

  return guide.trim();
}

/**
 * Generate FAQ content
 */
export function generateFAQContent(): Array<{ question: string; answer: string }> {
  return [
    {
      question: '¿Cómo ver fútbol en vivo sin registrarse?',
      answer: 'En Fútbol Libre TV no necesitas crear cuenta ni registrarte. Solo selecciona el partido y presiona play. ¡Es así de simple!'
    },
    {
      question: '¿Puedo ver Liga MX en vivo gratis?',
      answer: 'Sí, transmitimos todos los partidos de Liga MX en vivo sin costo. Accede desde cualquier dispositivo.'
    },
    {
      question: '¿Cómo ver Champions League en vivo?',
      answer: 'Transmitimos todos los partidos de Champions League en directo. Solo busca el partido en nuestro sitio y haz clic para ver.'
    },
    {
      question: '¿Funciona en móvil y smart TV?',
      answer: 'Sí, Fútbol Libre TV funciona en todos los dispositivos: teléfono, tablet, computadora y smart TV.'
    },
    {
      question: '¿Necesito VPN para usar Fútbol Libre TV?',
      answer: 'No, nuestro servicio funciona desde cualquier país. No se requiere VPN.'
    }
  ];
}

/**
 * Generate match-related keywords
 */
export function generateMatchKeywords(match: Match): string {
  const keywords = new Set<string>();

  // Add team names
  keywords.add(`${match.team_a} en vivo`);
  keywords.add(`${match.team_b} en vivo`);
  keywords.add(`${match.team_a} vs ${match.team_b}`);

  // Add league
  if (match.league) {
    keywords.add(match.league);
    keywords.add(`${match.league} en vivo`);
  }

  // Add general keywords
  keywords.add('fútbol en vivo');
  keywords.add('ver partido hoy');
  keywords.add('transmisión en vivo');
  keywords.add('partido online');

  return Array.from(keywords).join(', ');
}

/**
 * Generate page title for match
 */
export function generateMatchTitle(match: Match): string {
  let title = `${match.team_a} vs ${match.team_b} en vivo`;

  if (match.league) {
    title += ` - ${match.league}`;
  }

  return title;
}

/**
 * Generate page description for match
 */
export function generateMatchDescription(match: Match): string {
  let description = `Ver ${match.team_a} vs ${match.team_b} en vivo hoy`;

  if (match.league) {
    description += ` en ${match.league}`;
  }

  description += '. Transmisión en directo sin registrarse.';

  return description;
}

/**
 * Generate slug for match
 */
export function generateMatchSlug(match: Match): string {
  const slug = `${match.team_a}-vs-${match.team_b}-${match.date}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  return slug;
}

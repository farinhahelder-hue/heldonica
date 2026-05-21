/**
 * Skill : Agenda Manager — Heldonica
 * Gestion de l'agenda Google Calendar avec focus sur
 * l'école d'Émilie : École Antoine Chantin, 22 rue Antoine Chantin, 75014 Paris
 */

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

// Données fixes de l'école
const ECOLE_EMILIE = {
  nom: 'École Antoine Chantin',
  adresse: '22 rue Antoine Chantin, 75014 Paris',
  quartier: 'Mouton-Duvernet / Alésia',
  telephone: '+33 1 43 27 89 00',
  horaires: {
    matin: '08h30',
    sortie: '16h30',
    mercredi: '11h30', // sortie le mercredi
  },
};

/**
 * Récupère un access token Google via refresh token
 */
export async function getGoogleAccessToken(clientId, clientSecret, refreshToken) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const data = await response.json();
  return data.access_token;
}

/**
 * Crée un événement dans Google Calendar
 * @param {string} accessToken
 * @param {string} calendarId - ID du calendrier (ex: 'primary')
 * @param {Object} eventData - Données de l'événement
 * @returns {Promise<Object>} Événement créé
 */
export async function createCalendarEvent(accessToken, calendarId = 'primary', eventData) {
  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    }
  );
  return await response.json();
}

/**
 * Ajoute un événement scolaire pour Émilie
 * @param {string} accessToken
 * @param {Object} params - Paramètres de l'événement scolaire
 * @param {string} params.titre - Titre de l'événement (ex: "Sortie scolaire Émilie")
 * @param {string} params.date - Date ISO (ex: "2026-05-15")
 * @param {string} params.heureDebut - Heure de début (ex: "08:30")
 * @param {string} params.heureFin - Heure de fin (ex: "16:30")
 * @param {string} [params.notes] - Notes supplémentaires
 */
export async function addEcolEvent(accessToken, params) {
  const { titre, date, heureDebut, heureFin, notes } = params;

  const event = {
    summary: `🏫 ${titre}`,
    location: ECOLE_EMILIE.adresse,
    description: [
      `École : ${ECOLE_EMILIE.nom}`,
      `Adresse : ${ECOLE_EMILIE.adresse}`,
      `Tél : ${ECOLE_EMILIE.telephone}`,
      notes ? `Notes : ${notes}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    start: {
      dateTime: `${date}T${heureDebut}:00`,
      timeZone: 'Europe/Paris',
    },
    end: {
      dateTime: `${date}T${heureFin}:00`,
      timeZone: 'Europe/Paris',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },  // Rappel 30 min avant
        { method: 'popup', minutes: 1440 }, // Rappel la veille
      ],
    },
    colorId: '5', // Banane (jaune) pour bien repérer les événements scolaires
  };

  return await createCalendarEvent(accessToken, 'primary', event);
}

/**
 * Récupère les événements de la semaine en cours
 * @param {string} accessToken
 * @returns {Promise<Array>}
 */
export async function getWeekEvents(accessToken) {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/primary/events?` +
    `timeMin=${startOfWeek.toISOString()}&timeMax=${endOfWeek.toISOString()}` +
    `&orderBy=startTime&singleEvents=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await response.json();
  return data.items || [];
}

/**
 * Génère un résumé agenda de la journée pour le dashboard Heldonica
 * @param {Array} events - Événements Google Calendar
 * @returns {string}
 */
export function generateAgendaSummary(events) {
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  if (events.length === 0) return `📅 Agenda du ${today} : Rien de prévu — journée libre ! 🌿`;

  let summary = `📅 Agenda — ${today} :\n`;
  events.forEach(e => {
    const start = e.start?.dateTime
      ? new Date(e.start.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : 'Journée entière';
    const isEcole = e.summary?.includes('🏫');
    const icon = isEcole ? '🏫' : '📌';
    summary += `  ${icon} ${start} — ${e.summary}\n`;
  });

  return summary;
}

// Export des données fixes de l'école pour référence
export { ECOLE_EMILIE };

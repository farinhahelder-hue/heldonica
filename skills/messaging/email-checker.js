/**
 * Skill : Email Checker — Heldonica
 * Détecte les emails sans réponse via Gmail API
 * Utilise OAuth2 pour l'authentification
 */

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

/**
 * Récupère un access token Gmail via refresh token (OAuth2)
 */
export async function getGmailAccessToken(clientId, clientSecret, refreshToken) {
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
 * Cherche les emails reçus sans réponse depuis N heures
 * @param {string} accessToken - Gmail OAuth2 access token
 * @param {number} hoursThreshold - Seuil en heures (défaut: 24h)
 * @returns {Promise<Array>} Emails non répondus
 */
export async function getUnansweredEmails(accessToken, hoursThreshold = 24) {
  try {
    // Requête : emails reçus, non brouillons, non envoyés
    const query = `in:inbox is:unread -from:me newer_than:${Math.ceil(hoursThreshold / 24)}d`;
    const response = await fetch(
      `${GMAIL_API_BASE}/messages?q=${encodeURIComponent(query)}&maxResults=20`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const data = await response.json();

    if (!data.messages) return [];

    // Récupère les détails de chaque email
    const emails = await Promise.all(
      data.messages.map(msg => getEmailDetails(accessToken, msg.id))
    );

    return emails.filter(Boolean);
  } catch (error) {
    console.error('[Email Checker] Erreur:', error.message);
    return [];
  }
}

async function getEmailDetails(accessToken, messageId) {
  try {
    const response = await fetch(
      `${GMAIL_API_BASE}/messages/${messageId}?format=metadata&metadataHeaders=From,Subject,Date`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const msg = await response.json();
    const headers = msg.payload?.headers || [];

    const getHeader = name => headers.find(h => h.name === name)?.value || '';

    return {
      platform: 'Email',
      id: messageId,
      from: getHeader('From'),
      subject: getHeader('Subject'),
      date: getHeader('Date'),
      urgency: getUrgencyLevel(getHeader('Date')),
    };
  } catch {
    return null;
  }
}

function getUrgencyLevel(dateStr) {
  const hours = (Date.now() - new Date(dateStr).getTime()) / 3600000;
  if (hours > 48) return 'HIGH';
  if (hours > 24) return 'MEDIUM';
  return 'LOW';
}

export function generateEmailSummary(emails) {
  if (emails.length === 0) return '✅ Email : Boîte de réception à jour !';

  let summary = `📧 Emails — ${emails.length} email(s) en attente :\n`;
  emails.forEach(e => {
    const icon = e.urgency === 'HIGH' ? '🔴' : e.urgency === 'MEDIUM' ? '🟡' : '🟢';
    summary += `  ${icon} De : ${e.from}\n     Sujet : ${e.subject}\n`;
  });
  return summary;
}

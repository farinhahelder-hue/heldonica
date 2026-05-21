/**
 * Skill : Facebook Messages Checker — Heldonica
 * Vérifie les messages Facebook Page non répondus via Meta Graph API
 */

const FB_API_BASE = 'https://graph.facebook.com/v19.0';

/**
 * Récupère les messages Facebook non répondus pour une Page
 * @param {string} accessToken - Page access token
 * @param {string} pageId - Facebook Page ID
 * @returns {Promise<Array>} Liste des messages non répondus
 */
export async function getUnansweredFacebookMessages(accessToken, pageId) {
  try {
    const response = await fetch(
      `${FB_API_BASE}/${pageId}/conversations?fields=messages{message,from,created_time}&access_token=${accessToken}`
    );
    const data = await response.json();

    if (!data.data) throw new Error('Erreur API Facebook: ' + JSON.stringify(data));

    const unanswered = [];

    for (const conversation of data.data) {
      const messages = conversation.messages?.data || [];
      if (messages.length === 0) continue;

      const lastMessage = messages[0];
      const isFromUser = lastMessage.from?.id !== pageId;

      if (isFromUser) {
        unanswered.push({
          platform: 'Facebook',
          conversationId: conversation.id,
          lastMessage: lastMessage.message,
          from: lastMessage.from?.name || 'Inconnu',
          receivedAt: lastMessage.created_time,
          urgency: getUrgencyLevel(lastMessage.created_time),
        });
      }
    }

    return unanswered;
  } catch (error) {
    console.error('[Facebook Checker] Erreur:', error.message);
    return [];
  }
}

function getUrgencyLevel(dateStr) {
  const hours = (Date.now() - new Date(dateStr).getTime()) / 3600000;
  if (hours > 48) return 'HIGH';
  if (hours > 24) return 'MEDIUM';
  return 'LOW';
}

export function generateFacebookSummary(unanswered) {
  if (unanswered.length === 0) return '✅ Facebook : Aucun message en attente.';

  let summary = `📬 Facebook — ${unanswered.length} message(s) non répondu(s) :\n`;
  unanswered.forEach(m => {
    const icon = m.urgency === 'HIGH' ? '🔴' : m.urgency === 'MEDIUM' ? '🟡' : '🟢';
    summary += `  ${icon} ${m.from} — "${m.lastMessage?.substring(0, 60)}..." (reçu le ${new Date(m.receivedAt).toLocaleDateString('fr-FR')})\n`;
  });

  return summary;
}

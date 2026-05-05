/**
 * Skill : Instagram DM Checker — Heldonica
 * Vérifie les messages Instagram non répondus via Meta Graph API
 * Compatible Google AI Edge (Gemini Nano) pour résumé on-device
 */

const INSTAGRAM_API_BASE = 'https://graph.facebook.com/v19.0';

/**
 * Récupère les conversations Instagram avec des messages non répondus
 * @param {string} accessToken - Meta long-lived access token
 * @param {string} instagramAccountId - Instagram Business Account ID
 * @returns {Promise<Array>} Liste des conversations non répondues
 */
export async function getUnansweredInstagramDMs(accessToken, instagramAccountId) {
  try {
    // Récupère toutes les conversations
    const response = await fetch(
      `${INSTAGRAM_API_BASE}/${instagramAccountId}/conversations?fields=messages{message,from,created_time,id}&access_token=${accessToken}`
    );
    const data = await response.json();

    if (!data.data) throw new Error('Erreur API Instagram: ' + JSON.stringify(data));

    const unanswered = [];

    for (const conversation of data.data) {
      const messages = conversation.messages?.data || [];
      if (messages.length === 0) continue;

      // Le dernier message de la conversation
      const lastMessage = messages[0];
      const isFromUser = lastMessage.from?.id !== instagramAccountId;

      // Si le dernier message est d'un utilisateur (pas nous), c'est non répondu
      if (isFromUser) {
        unanswered.push({
          platform: 'Instagram',
          conversationId: conversation.id,
          lastMessage: lastMessage.message,
          from: lastMessage.from?.username || lastMessage.from?.name || 'Inconnu',
          receivedAt: lastMessage.created_time,
          urgency: getUrgencyLevel(lastMessage.created_time),
        });
      }
    }

    return unanswered;
  } catch (error) {
    console.error('[Instagram Checker] Erreur:', error.message);
    return [];
  }
}

/**
 * Calcule le niveau d'urgence selon l'ancienneté du message
 * @param {string} dateStr - Date ISO du message
 * @returns {'HIGH'|'MEDIUM'|'LOW'}
 */
function getUrgencyLevel(dateStr) {
  const hours = (Date.now() - new Date(dateStr).getTime()) / 3600000;
  if (hours > 48) return 'HIGH';
  if (hours > 24) return 'MEDIUM';
  return 'LOW';
}

/**
 * Génère un résumé lisible pour Google AI Edge / Gemini
 * @param {Array} unanswered - Liste des messages non répondus
 * @returns {string} Résumé texte
 */
export function generateInstagramSummary(unanswered) {
  if (unanswered.length === 0) return '✅ Instagram : Aucun DM en attente de réponse.';

  const high = unanswered.filter(m => m.urgency === 'HIGH');
  const medium = unanswered.filter(m => m.urgency === 'MEDIUM');
  const low = unanswered.filter(m => m.urgency === 'LOW');

  let summary = `📩 Instagram — ${unanswered.length} DM(s) non répondu(s) :\n`;
  if (high.length) summary += `  🔴 URGENT (>48h) : ${high.map(m => `@${m.from}`).join(', ')}\n`;
  if (medium.length) summary += `  🟡 À traiter (>24h) : ${medium.map(m => `@${m.from}`).join(', ')}\n`;
  if (low.length) summary += `  🟢 Récents (<24h) : ${low.map(m => `@${m.from}`).join(', ')}\n`;

  return summary;
}

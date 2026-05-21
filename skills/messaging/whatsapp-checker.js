/**
 * Skill : WhatsApp Business Checker — Heldonica
 * Détecte les messages WhatsApp non répondus via WhatsApp Business API (Cloud API)
 */

const WA_API_BASE = 'https://graph.facebook.com/v19.0';

/**
 * NOTE : L'API Cloud WhatsApp Business ne donne pas accès aux messages entrants
 * directement en polling. Il faut configurer un Webhook pour recevoir les messages.
 * Ce fichier contient la logique de traitement des webhooks entrants et le stockage
 * des messages non répondus en mémoire / base de données locale.
 */

// Stockage en mémoire des messages non répondus (à remplacer par Supabase en prod)
let pendingMessages = [];

/**
 * Traite un payload webhook WhatsApp entrant
 * À connecter à un endpoint /api/webhooks/whatsapp
 * @param {Object} webhookPayload - Payload brut du webhook Meta
 */
export function processWhatsAppWebhook(webhookPayload) {
  const entry = webhookPayload?.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;

  if (!value?.messages) return;

  for (const message of value.messages) {
    if (message.type === 'text') {
      const contact = value.contacts?.find(c => c.wa_id === message.from);
      pendingMessages.push({
        platform: 'WhatsApp',
        messageId: message.id,
        from: contact?.profile?.name || message.from,
        phone: message.from,
        text: message.text?.body || '',
        receivedAt: new Date(parseInt(message.timestamp) * 1000).toISOString(),
        answered: false,
        urgency: 'LOW', // sera recalculé à la lecture
      });
    }
  }
}

/**
 * Marque un message comme répondu
 * @param {string} messageId
 */
export function markAsAnswered(messageId) {
  pendingMessages = pendingMessages.filter(m => m.messageId !== messageId);
}

/**
 * Récupère les messages en attente avec urgence recalculée
 * @returns {Array}
 */
export function getUnansweredWhatsAppMessages() {
  return pendingMessages
    .filter(m => !m.answered)
    .map(m => ({
      ...m,
      urgency: getUrgencyLevel(m.receivedAt),
    }))
    .sort((a, b) => new Date(a.receivedAt) - new Date(b.receivedAt));
}

function getUrgencyLevel(dateStr) {
  const hours = (Date.now() - new Date(dateStr).getTime()) / 3600000;
  if (hours > 48) return 'HIGH';
  if (hours > 24) return 'MEDIUM';
  return 'LOW';
}

export function generateWhatsAppSummary(messages) {
  if (messages.length === 0) return '✅ WhatsApp : Aucun message en attente.';

  let summary = `💬 WhatsApp — ${messages.length} message(s) non répondu(s) :\n`;
  messages.forEach(m => {
    const icon = m.urgency === 'HIGH' ? '🔴' : m.urgency === 'MEDIUM' ? '🟡' : '🟢';
    summary += `  ${icon} ${m.from} (${m.phone}) : "${m.text.substring(0, 60)}"\n`;
  });
  return summary;
}

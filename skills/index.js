/**
 * Heldonica Daily Assistant — Point d'entrée principal
 * Google AI Edge / Gemini Nano Skills Orchestrator
 *
 * Lance un résumé quotidien de toutes les tâches en attente :
 * Instagram DMs, Facebook Messages, Emails, WhatsApp, Agenda
 */

import { getUnansweredInstagramDMs, generateInstagramSummary } from './social-media/instagram-checker.js';
import { getUnansweredFacebookMessages, generateFacebookSummary } from './social-media/facebook-checker.js';
import { getGmailAccessToken, getUnansweredEmails, generateEmailSummary } from './messaging/email-checker.js';
import { getUnansweredWhatsAppMessages, generateWhatsAppSummary } from './messaging/whatsapp-checker.js';
import { getGoogleAccessToken, getWeekEvents, generateAgendaSummary, ECOLE_EMILIE } from './agenda/agenda-manager.js';

/**
 * Lance le check complet de toutes les plateformes
 * @param {Object} config - Tokens et IDs (depuis .env.local)
 * @returns {Promise<string>} Résumé complet Heldonica Daily Brief
 */
export async function runHeldonicaDailyBrief(config) {
  const {
    META_ACCESS_TOKEN,
    INSTAGRAM_ACCOUNT_ID,
    FACEBOOK_PAGE_ID,
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    GMAIL_REFRESH_TOKEN,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN,
  } = config;

  console.log('🚀 Heldonica Daily Brief — Démarrage...');

  // Récupère tous les tokens
  const [gmailToken, googleToken] = await Promise.all([
    getGmailAccessToken(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN),
    getGoogleAccessToken(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN),
  ]);

  // Lance tous les checks en parallèle
  const [instagramDMs, facebookMessages, emails, weekEvents] = await Promise.all([
    getUnansweredInstagramDMs(META_ACCESS_TOKEN, INSTAGRAM_ACCOUNT_ID),
    getUnansweredFacebookMessages(META_ACCESS_TOKEN, FACEBOOK_PAGE_ID),
    getUnansweredEmails(gmailToken),
    getWeekEvents(googleToken),
  ]);

  // WhatsApp : récupération depuis la mémoire webhook
  const whatsappMessages = getUnansweredWhatsAppMessages();

  // Filtre les événements du jour
  const todayEvents = weekEvents.filter(e => {
    const eventDate = new Date(e.start?.dateTime || e.start?.date);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  });

  // Construit le brief final
  const now = new Date().toLocaleString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Paris',
  });

  const brief = [
    `╔════════════════════════════════╗`,
    `  🌿 HELDONICA DAILY BRIEF`,
    `  ${now}`,
    `╚════════════════════════════════╝`,
    '',
    generateAgendaSummary(todayEvents),
    '',
    generateInstagramSummary(instagramDMs),
    generateFacebookSummary(facebookMessages),
    generateEmailSummary(emails),
    generateWhatsAppSummary(whatsappMessages),
    '',
    `🏫 École d'Émilie : ${ECOLE_EMILIE.nom}`,
    `   📍 ${ECOLE_EMILIE.adresse}`,
    `   🕗 Entrée : ${ECOLE_EMILIE.horaires.matin} | Sortie : ${ECOLE_EMILIE.horaires.sortie} (mer. : ${ECOLE_EMILIE.horaires.mercredi})`,
  ].join('\n');

  return brief;
}

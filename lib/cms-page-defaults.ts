/**
 * Default content values for CMS page editing.
 * These are used as initial values before DB data loads.
 * Format: { `${page}__${block_key}`: value }
 */

export const PAGE_DEFAULTS: Record<string, string> = {
  // ── HOME ────────────────────────────────────────────────────────────────
  'home__hero_title': 'Slow travel vécu en duo, conçu pour toi',
  'home__hero_subtitle': 'On ferme les ordis. On part. On revient avec des pépites qu\'on n\'avait pas cherchées.',
  'home__hero_cta_label': 'Planifier mon voyage',
  'home__hero_cta_url': '/travel-planning',
  'home__hero_image': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=85',
  'home__intro_title': 'Carnets de terrain, pépites vécues',
  'home__intro_text': 'On documente ce qu\'on a vraiment vécu — pas ce qu\'on a lu ailleurs. Destinations authentiques, hébergements testés, restaurants dénichés.',
  'home__pillars_title': 'Nos expertises',
  'home__pillars_subtitle': 'Slow travel, travel planning, conseil hôtelier',
  'home__destinations_title': 'Destinations à la une',
  'home__destinations_subtitle': 'Récits et bonnes adresses testés sur le terrain',
  'home__blog_title': 'Du terrain, pour toi',
  'home__blog_subtitle': 'Carnets de route et pépites dénichées, pour toi',
  'home__newsletter_title': 'Reçois nos dernières pépites',
  'home__newsletter_text': 'Carnets de route, pépites dénichées, destinations secrètes.',
  'home__newsletter_cta': 'S\'inscrire',
  'home__footer_cta_title': 'Prêt pour votre prochaine aventure ?',
  'home__footer_cta_text': 'Laissez-nous concevoir votre itinéraire sur mesure.',
  'home__footer_cta_label': 'Démarrer',
  'home__footer_cta_url': '/travel-planning',

  // ── BLOG ───────────────────────────────────────────────────────────────
  'blog__title': 'Blog Slow Travel — Carnets de Route & Pépites Dénichées',
  'blog__subtitle': 'Articles slow travel, carnets de route et pépites dénichées testées sur le terrain. Récits authentiques, conseils pratiques et destinations hors des sentiers battus.',
  'blog__hero_title': 'Blog',
  'blog__hero_subtitle': 'Carnets de terrain et pépites vécues',
  'blog__empty_title': 'Aucun article pour le moment',
  'blog__empty_text': 'Les premiers carnets de route arrivent bientôt. Stay tuned !',
  'blog__filter_all': 'Tous',
  'blog__filter_destinations': 'Destinations',
  'blog__filter_advice': 'Conseils',
  'blog__filter_culture': 'Culture',
  'blog__read_more': 'Lire la suite',
  'blog__read_time': 'min de lecture',

  // ── TRAVEL PLANNING ────────────────────────────────────────────────────
  'travel-planning__hero_title': 'Conçu sur mesure pour vous',
  'travel-planning__hero_subtitle': 'On分析 votre demande, on conçoit un itinéraire personnalisé et on vous livre un carnet de route complet.',
  'travel-planning__hero_image': 'https://heldonica.fr/wp-content/uploads/2025/08/zurich-panorama-2-1024x679.jpg',
  'travel-planning__form_intro_title': 'Parlez-nous de votre voyage',
  'travel-planning__form_intro_text': 'Remplissez ce formulaire et recevez une proposition sous 48h ouvrées.',
  'travel-planning__form_name_label': 'Votre prénom',
  'travel-planning__form_name_placeholder': 'Marie',
  'travel-planning__form_email_label': 'Email',
  'travel-planning__form_email_placeholder': 'marie@exemple.fr',
  'travel-planning__form_destination_label': 'Destination(s)',
  'travel-planning__form_destination_placeholder': 'Madère, Portugal',
  'travel-planning__form_dates_label': 'Dates de voyage',
  'travel-planning__form_dates_placeholder': '15-22 septembre 2025',
  'travel-planning__form_travelers_label': 'Nombre de voyageurs',
  'travel-planning__form_budget_label': 'Budget par personne',
  'travel-planning__form_message_label': 'Votre message',
  'travel-planning__form_message_placeholder': 'Décrivez votre voyage idéal…',
  'travel-planning__form_submit': 'Recevoir ma proposition',
  'travel-planning__pricing_title': 'Nos formules',
  'travel-planning__pricing_subtitle': 'Des formules adaptées à chaque besoin',
  'travel-planning__testimonials_title': 'Ils ont voyagé avec nous',
  'travel-planning__faq_title': 'Questions fréquentes',
  'travel-planning__cta_title': 'Prêt à découvrir ?',
  'travel-planning__cta_text': 'Remplissez le formulaire et recevez votre carnet de route sous 48h.',
  'travel-planning__cta_button': 'Démarrer maintenant',

  // ── A-PROPOS ──────────────────────────────────────────────────────────
  'a-propos__hero_title': 'Notre histoire',
  'a-propos__hero_subtitle': 'Un duo Paris-Madère-Roumanie qui voyage lentement',
  'a-propos__hero_image': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85',
  'a-propos__intro_title': 'On ferme les ordis. On part.',
  'a-propos__intro_text': 'Heldonica est né de l\'envie de partager ce qu\'on découvre vraiment sur le terrain — pas ce qu\'on trouve dans les guides.',
  'a-propos__bio_name': 'L\'équipe Heldonica',
  'a-propos__bio_text': 'Basés entre Paris et Madère, on parcourt l\'Europe et au-delà depuis plus de 10 ans. Notre mission : dénicher les adresses qui valent le détour, loin des sentiers battus.',
  'a-propos__values_title': 'Nos valeurs',
  'a-propos__values_subtitle': 'Slow travel, authenticité, responsabilité',
  'a-propos__values_1_title': 'Authenticité',
  'a-propos__values_1_text': 'On ne recommande que ce qu\'on a testé. Pas de liste venue d\'ailleurs.',
  'a-propos__values_2_title': 'Slow Travel',
  'a-propos__values_2_text': 'Moins mais mieux. On privilégie la qualité à la quantité.',
  'a-propos__values_3_title': 'Responsabilité',
  'a-propos__values_3_text': 'Hébergements eco-friendly, restos locaux, voyages durable.',
  'a-propos__contact_title': 'Contactez-nous',
  'a-propos__contact_email': 'contact@heldonica.fr',
  'a-propos__contact_text': 'Une question, une demande de travel planning ? Écrivez-nous !',

  // ── DESTINATIONS (generic) ─────────────────────────────────────────────
  'destinations__hero_title': 'Destinations',
  'destinations__hero_subtitle': 'Carnets de route et pépites par destination',
  'destinations__filter_all': 'Toutes',
  'destinations__empty_text': 'Aucun carnet pour cette destination. Revenez vite !',

  // ── CONTACT ────────────────────────────────────────────────────────────
  'contact__hero_title': 'Contactez-nous',
  'contact__hero_subtitle': 'Une question, une demande ?',
  'contact__form_name_label': 'Votre nom',
  'contact__form_email_label': 'Email',
  'contact__form_subject_label': 'Sujet',
  'contact__form_message_label': 'Message',
  'contact__form_submit': 'Envoyer',
  'contact__success_title': 'Message envoyé !',
  'contact__success_text': 'Merci pour votre message. On vous répond sous 48h.',

  // ── EXPERT HÔTELIER ────────────────────────────────────────────────────
  'expert-hotelier__hero_title': 'Conseil hôtelier',
  'expert-hotelier__hero_subtitle': 'Accompagnement pour hôteliers et hébergeurs',
  'expert-hotelier__intro_title': 'Votre hébergement mérite d\'être vu',
  'expert-hotelier__intro_text': 'On vous aide à mettre en valeur votre établissement avec des contenus authentiques et un positionnement differentiate.',
  'expert-hotelier__services_title': 'Nos services',
  'expert-hotelier__cta_title': 'Parlons de votre projet',
  'expert-hotelier__cta_button': 'Me contacter',

  // ── ORGANISATEUR ──────────────────────────────────────────────────────
  'organisateur__hero_title': 'Voyagez différent',
  'organisateur__hero_subtitle': 'Carnets de route pour organisateurs de voyages',
  'organisateur__intro_title': 'Des contenus qui vendent',
  'organisateur__intro_text': 'Articles de blog, newsletters, guides PDF — on crée le contenu qui attire et convertit.',

  // ── POLITIQUE CONFIDENTIALITÉ ─────────────────────────────────────────
  'politique-confidentialite__title': 'Politique de confidentialité',
  'politique-confidentialite__intro': 'Dernière mise à jour : 2025',

  // ── MENTIONS LÉGALES ───────────────────────────────────────────────────
  'mentions-legales__title': 'Mentions légales',
  'mentions-legales__intro': 'Éditeur du site',

  // ── SHARED ─────────────────────────────────────────────────────────────
  'shared__read_more': 'Lire la suite',
  'shared__back': 'Retour',
  'shared__loading': 'Chargement…',
  'shared__error': 'Une erreur est survenue',
  'shared__newsletter_placeholder': 'Votre email',
  'shared__newsletter_button': 'S\'inscrire',
  'shared__footer_about': 'Blog slow travel & travel planning sur mesure.',
  'shared__footer_links_title': 'Navigation',
  'shared__footer_legal_title': 'Légal',
  'shared__404_title': 'Page introuvable',
  'shared__404_text': 'La page que vous cherchez n\'existe pas ou a été déplacée.',
  'shared__404_button': 'Retour à l\'accueil',
};

/**
 * Apply PAGE_DEFAULTS then overlay DB rows.
 * DB values should override defaults (order matters).
 */
export function applyPageDefaults(
  dbRows: { page?: string; key?: string; value?: string }[]
): Record<string, string> {
  const result: Record<string, string> = { ...PAGE_DEFAULTS };
  dbRows.forEach(row => {
    const key = row.page && row.key
      ? `${row.page}__${row.key}`
      : row.key || '';
    if (key && row.value !== undefined) {
      result[key] = row.value;
    }
  });
  return result;
}

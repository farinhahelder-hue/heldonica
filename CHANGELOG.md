# 📜 Journal des Modifications (CHANGELOG) — Heldonica

Toutes les modifications du projet sont consignées ici pour assurer la coordination entre sessions et maintenir la traçabilité des évolutions.

---

## [2026-08-19] — Harmonisation Voix de Marque, Intégrité E-E-A-T & Industrialisation

### 🛡️ Intégrité & E-E-A-T
- **Désactivation des faux avis** : Les 5 avis de démonstration dans `cms_testimonials` ont été passés en `is_active = false`. La page `/temoignages` affiche désormais le message d'attente honnête.
- **Collecte de vrais avis** : Création de la page `/retour-experience` et de l'API `POST /api/testimonials/submit` (insertion par défaut en `is_active = false` soumise à modération manuelle).
- **Règle absolue** : Toute modification de la base de production doit obligatoirement être tracée par un fichier SQL dans `supabase/migrations/`.

### 🌿 Voix de Marque & Garde-fous CI
- **Intégration des 7 garde-fous** : Implémentation du calcul pondéré dans `lib/brand-voice.ts` (Seuil publication ≥85%, Excellence ≥95%).
- **Purge des 42 articles** : Suppression des mots bannis et correction des pronoms sujets (*« nous avons » ➔ « on a »*).
- **CI / GitHub Actions** : Ajout du contrôle `check:content-coherence` dans `.github/workflows/garde-fous.yml`.

### 📋 Templates & Documentation
- Ajout de `CHECKLIST_PUBLICATION.md` à la racine (B2C 7 points, Instagram 5 points, B2B 5 points).
- Ajout de `PROMPT_TEMPLATE_B2C.md` (carnets de blog 1200–2000 mots).
- Ajout de `PROMPT_TEMPLATE_INSTA.md` (légendes Instagram 120–180 mots).

### 🧭 Navigation & Expérience Utilisateur
- Réalignement du menu principal sur 5 entrées B2C pures (*Accueil, Destinations, Carnets de route, Travel Planning, À propos*).
- Ajout du bouton CTA *« Planifier mon voyage »* et du lien discret *« Espace Hôteliers »* dans le header.
- Harmonisation de la section B2B de la Home et de la page `/expert-hotelier` sur le vouvoiement strict.

### 🗄️ Migrations SQL Versionnées
- `supabase/migrations/20260819140000_editorial_voice_and_testimonials_alignment.sql`

# Plan de mise en place — ce qu'Heldonica doit activer face à la concurrence

> **But** : passer de l'analyse (voir `docs/etude-concurrence-directe-heldonica.md`)
> à des actions concrètes, **ancrées sur ce qui existe déjà dans le dépôt**.
> Rien n'est proposé qui ne s'appuie sur un fichier ou une page existante.
>
> **Conventions** : **[OBSERVÉ]** fichier/constat vérifié ; **[INTERPRÉTATION]**
> recommandation à débattre ; **[INDISPONIBLE]** à mesurer plus tard.

---

## 1. État des lieux Heldonica [OBSERVÉ, dépôt]

Contrairement à ce que laisse croire un site en maintenance, **les actifs
commercials existent déjà dans le code** :

| Actif | Où | Constat |
|---|---|---|
| Formules tarifées | `app/travel-planning/TravelPlanningClient.tsx` | **Essentielle 250 €**, **Complète 450 €**, Sur-Mesure. Devis gratuit. |
| Titre/pitch | `app/travel-planning/page.tsx` | « voyage slow travel sur mesure — itinéraire terrain, hébergements testés et suivi humain ». |
| Lead magnet | `app/guides/top-10-pepites-madere/page.tsx` | Guide gratuit « 10 pépites testées à Madère », avec page `/guides/merci`. |
| Séquence email | `prompts/newsletter.md`, `docs/GUIDE_VOIX_HELDONICA_IA.md` | Gabarit newsletter + séquence de bienvenue en 3 temps. |
| Itinéraires | `app/destinations/…` | 15+ destinations (Madère, Roumanie, Monténégro, Colombie, Sardaigne, Sicile, Alentejo, Grèce, Suisse, Normandie, Paris/IDF…). |
| Témoignages | `app/temoignages/page.tsx` | Page dédiée. |
| B2B | `app/expert-hotelier/page.tsx` | Accompagnement hôteliers indépendants. |
| Blog | `content/blog` (13 fichiers) | Base éditoriale. |

**[INTERPRÉTATION]** Le problème Heldonica **n'est pas l'offre** : elle est
complète et tarifée. Le problème est **la mise en visibilité et la
conversion** — des actifs existants mais peu activés (lead magnet unique,
séquence email non nourrie, aucune trace dans les annuaires).

---

## 2. Écarts vs concurrence (rappel condensé)

| Axe | Concurrent (observé) | Heldonica (dépôt) | Écart |
|---|---|---|---|
| Prix affiché | Échappées dès **240 €** | Formules **250 € / 450 €** | **Aucun** — compétitif |
| Lead magnet | Destinaslow : 3 guides + newsletter | 1 guide (Madère) | **Partiel** |
| Témoignages | Échappées : nommés + datés | Page existe | **À alimenter** |
| Autorité | Guides publiés, 20 ans | Récent | **Défavorable** |
| Duo | Perspectives (« à deux ») | « on » du duo | **Défendable** |
| Visibilité | TOP 50 Trip Planner | Absente | **À combler** |
| B2B | Quasi absent du panel | `expert-hotelier` | **Avance** |

---

## 3. Plan par priorité

### PRIORITÉ 1 — Activer le lead magnet (le plus rentable, le moins cher)

**Constat [OBSERVÉ]** : Heldonica a **1** guide gratuit (Madère). Destinaslow en
a **3** (Montréal, Québec, Rocheuses). Le guide est le mécanisme d'entrée vers la
prestation dans 2 modèles concurrents sur 3.

**Action** : décliner le modèle `app/guides/top-10-pepites-madere` sur les
destinations à forte demande couple, en commençant par un **guide transversal
« couple »** : *« Roadtrip à deux : les 5 erreurs qu'on a faites (et comment les
éviter) »*. Il ne parle pas d'une destination mais de la cible — il capte plus
large.

**Où** : `app/guides/` (nouvelle page sur le modèle existant) + captation sur
`app/page.tsx` (accueil) et `app/destinations/compare`.

**Effort** : faible (le gabarit existe). **Indicateur** : nombre d'emails
collectés par mois ; taux d'inscription sur la page.

---

### PRIORITÉ 2 — Nourrir la séquence de bienvenue

**Constat [OBSERVÉ]** : `docs/GUIDE_VOIX_HELDONICA_IA.md` décrit déjà une
séquence (EMAIL 1 l'arrivée, EMAIL 2, EMAIL 3 à J+7 = invitation au Travel
Planning). Mais `prompts/newsletter.md` ne produit qu'une newsletter hebdo.

**Action** : écrire les 3 emails de la séquence de bienvenue à partir du
gabarit existant, dans la voix Heldonica (« on » + « tu », sensoriel, zéro mot
banni). Le chemin capte l'email (P1), la séquence le convertit.

**Où** : `prompts/` (nouveau gabarit `welcome-sequence.md`) + outil d'envoi.

**Effort** : faible. **Indicateur** : taux d'ouverture des 3 emails ; clics vers
`/travel-planning`.

---

### PRIORITÉ 3 — Rendre le prix visible partout

**Constat [OBSERVÉ]** : Heldonica affiche « à partir de 250 € » en meta de
`/travel-planning`, et Échappées affiche des paliers publics. Le prix est
**compétitif** mais peu exposé.

**Action** : afficher la fourchette sur l'accueil et dans les pages destination
(section « Planifier ce voyage »), pas seulement sur la page dédiée.

**Où** : `app/page.tsx`, `components/CtaTravelPlanning.tsx` (déjà présent).

**Effort** : faible. **Indicateur** : taux de clic vers le formulaire de devis.

---

### PRIORITÉ 4 — Publier des témoignages nommés et datés

**Constat [OBSERVÉ]** : Échappées Lointaines affiche des témoignages
**nommés + datés** (« Aurélie & Anthony — Costa Rica, avril 2025 »). La page
Heldonica existe mais c'est le format qui fait la preuve.

**Action** : sur `app/temoignages`, exiger prénom + destination + mois/année, et
le **lieu exact**. Cohérent avec « on n'invente rien » — un témoignage daté est
vérifiable. Ne jamais publier un témoignage sans date ni contexte.

**Effort** : faible (édition de contenu). **Indicateur** : nombre de témoignages
publiés et datés.

---

### PRIORITÉ 5 — Combler la visibilité (annuaires)

**Constat [OBSERVÉ]**: Heldonica est **absente du « TOP 50 » Trip Planner**, qui
revendique un classement « sans contrepartie commerciale ». Les concurrents y
sont. C'est un canal d'acquisition gratuit.

**Action** : candidater auprès des annuaires cités par Trip Planner lui-même :
**Trip Planner**, **Vialala**, **l'Agence des TP (Happy Trek)**, **Petit Futé**,
et surtout **l'ATPE** (association du métier — plusieurs concurrents y sont
membres/bureau).

**Effort** : moyen (démarches). **Indicateur** : référencé ou non dans 2
annuaires sur 3, sous 3 mois.

---

### PRIORITÉ 6 — Tenir l'axe « duo » (le moat)

**Constat [INTERPRÉTATION]** : Perspectives de Voyage a le duo mais l'a converti
en famille ; Destinaslow et Échappées sont mono-auteur (« je »/« vous »).

**Action** : rendre le duo **incarné**, pas déclaratif — deux voix, deux avis,
un désaccord assumé (« l'un voulait rester, l'autre pas »). C'est ce qu'aucun
concurrent ne fait, et c'est déjà compatible avec la voix « on ».

**Où** : articles de blog, `PROMPT_TEMPLATE_B2C.md` (ajouter un champ « le
désaccord »).

**Effort** : moyen. **Indicateur** : part des articles où les deux voix
apparaissent distinctement.

---

### PRIORITÉ 7 — Renforcer le B2B hôtelier (avance réelle)

**Constat [OBSERVÉ]** : le B2B est quasi absent des 50 travel planners. C'est le
territoire où Heldonica est **seule**.

**Action** : publier 2-3 **études de cas** hôteliers (problème → action →
résultat mesuré) sur `/expert-hotelier`. Le B2B achète de la preuve, pas de
l'inspiration.

**Effort** : moyen (il faut des résultats réels). **Indicateur** : demandes
hôteliers entrantes.

---

## 4. Recommandations de séquencement

- **Maintenant (0-1 mois)** : P1 (lead magnet couple), P3 (prix visible), P4
  (témoignages datés). Faibles coûts, effet immédiat.
- **Ensuite (1-3 mois)** : P2 (séquence email), P5 (annuaires), P6 (duo incarné).
- **Plus tard (3-6 mois)** : P7 (B2B, études de cas) — demande des résultats
  mesurables réels.

---

## 5. Ce qu'Heldonica ne fait PAS (pour rester différenciante)

1. **[INTERPRÉTATION]** Ne pas reprendre le lexique concurrent
   (« bons plans », « incontournables », « inoubliables », « paradis ») —
   c'est le différenciateur lexical prouvé (voir §5.3 de l'étude concurrence).
2. **[INTERPRÉTATION]** Ne pas passer au « je » mono-auteur : le « on » du duo
   est le moat.
3. **[INTERPRÉTATION]** Ne pas vendre de guide payant en boutique (modèle
   Perspectives) : Heldonica vend du **service**, pas du média.
4. **[INTERPRÉTATION]** Ne pas convertir la cible en « famille » : c'est
   précisément l'espace laissé libre par Perspectives.

---

## 6. Indicateurs de suivi (à mesurer, pas à supposer)

Conformément à la règle « `done` sans vérification est un mensonge », chaque
action se mesure :

| Action | Indicateur | Où le lire |
|---|---|---|
| P1 lead magnet | emails collectés / mois | outil email |
| P2 séquence | taux d'ouverture / clic | outil email |
| P3 prix | clics vers devis | analytics |
| P4 témoignages | nombre datés publiés | `app/temoignages` |
| P5 annuaires | références obtenues | pages annuaires |
| P6 duo | % articles à deux voix | revue éditoriale |
| P7 B2B | demandes hôteliers | CRM |

---

## 7. Informations non vérifiables

- **[INDISPONIBLE]** Trafic réel Heldonica et concurrents.
- **[INDISPONIBLE]** Taux de conversion des formules (site en maintenance).
- **[INDISPONIBLE]** Conditions d'adhésion ATPE / délais de référencement
  annuaire : à demander directement.

---

*S'appuie sur `docs/etude-concurrence-directe-heldonica.md`,
`docs/positionnement-editorial-voyagesetc.md` et
`docs/RESEARCH_VEILLE_CONCURRENTIELLE_TRAVEL_PLANNERS.md`. Voix de référence :
`docs/GUIDE_VOIX_HELDONICA_IA.md`, `lib/brand-voice.ts`.*

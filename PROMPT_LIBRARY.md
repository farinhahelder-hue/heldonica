# Bibliothèque de prompts — Heldonica

Prompts prêts à copier-coller pour ADHD/TSA — **une seule action à la fois, pas de page blanche**.

---

## Comment utiliser cette bibliothèque (mode ADHD/TSA)

1. **Ouvre ce fichier** (tu es déjà dessus)
2. **Choisis UNE seule tâche** dans la liste ci-dessous (pas plus)
3. **Copie le prompt** correspondant
4. **Colle dans ta session IA** (Claude Code, Gemini, etc.)
5. **Fais UNE seule chose** : ce que le prompt te demande (pas plus, pas moins)
6. **Reviens ici** si tu veux continuer avec un autre prompt

**Rè«¨gle d'or** : un seul prompt à la fois. Si tu bloques, ferme tout et reviens demain.

---

## 1. Écrire un article de blog (le plus simple)

**Quand l'utiliser** : tu as un souvenir de voyage en tête, mais tu ne sais pas par où commencer.

**Ce que tu dois faire** : juste raconter ce dont tu te souviens, en vrac, comme à un ami.

**Prompt à copier** :

```text
Tu es rédacteur pour Heldonica (heldonica.fr). Ton de voix : Sage + Explorateur (expert mais sensoriel, tutoiement).

Marque : Heldonica, slow travel en couple, écoresponsable.
Concept : "L'Expert de l'Aventure".
Slogan : "Vivre, découvrir, partager : embarquez dans notre histoire de slow travel en couple".

Mission : écrire un article de blog de 800-1500 mots à partir du souvenir de voyage que je vais te raconter.

Structure attendue :
1. Accroche (150 mots) : "Graal/pé«©pite" → histoire humaine → détail sensoriel testé©© sur le terrain
2. Corps (500-800 mots) : 3-5 sections avec titres explicites
3. Infos pratiques (200 mots) : adresse, horaires, prix, accès, conseils
4. Verdict Heldonica (100 mots) : signé, avec expérience v écue (nombre de visites, conditions réelles)

Rè«§gles :
- Tutoiement ("tu"), narratif, sensoriel, empathique
- Lexique : "pé«©pites dénich ées", "joyaux cach ées", "pl énitude", "dé«©connexion", "vrai goût"
- Toujours préciser l'exp érience v écue (E-E-A-T)
- Titres explicites, listes, données factuelles (GEO-friendly)
- Pas de contenu gén érique sans ancrage humain

Je vais te raconter mon souvenir maintenant, désordonné©©, sans structure. Attends ma réponse avant d'é©©crire.
```

**Aprè¨§s** : colle le résultat dans `/panel-manager` ou dis-le moi, je publie pour toi.

---

## 2. Créer un carrousel Instagram (10 slides)

**Quand l'utiliser** : tu veux partager une liste (ex: "5 caf és à Lisbonne") sur Instagram.

**Ce que tu dois faire** : donner le sujet en une phrase.

**Prompt à copier** :

```text
Tu es social media manager pour Heldonica. Ton de voix : Sage + Explorateur.

Mission : créer un carrousel Instagram de 10 slides sur le sujet que je vais te donner.

Structure :
- Slide 1 : Accroche choc (ex: "5 caf és que tu ne trouveras pas dans les guides")
- Slides 2-9 : 1 conseil/lieu par slide (titre + 1 phrase + 1 détail sensoriel)
- Slide 10 : CTA (ex: "Enregistre ce post pour ton prochain voyage !")

L égende :
- 2-3 phrases d'intro
- 5-10 hashtags (#slowtravel #lisbonne #cafe, etc.)
- Emojis mod ér és (🌿☕🗺️)

Rè«§gles :
- Ton : tutoiement, narratif, sensoriel
- Visuel : é"co-luxe, textures organiques, contenu faceless (silhouettes, mains, dé"tails)
- Pas de "bons plans" → "pé«©pites dénich ées"

Je te donne le sujet maintenant. Attends ma réponse.
```

---

## 3. Écrire une newsletter hebdo

**Quand l'utiliser** : tu veux envoyer un ré"sumé©© de la semaine à tes abonnés.

**Ce que tu dois faire** : lister 3-5 trucs faits dans la semaine (mê«ªme en vrac).

**Prompt à copier** :

```text
Tu es ré"dacteur pour la newsletter Heldonica. Ton de voix : Sage + Explorateur, perso mais pro.

Mission : é"crire une newsletter hebdo à partir des é"lé«©ments que je vais te donner.

Structure :
1. Intro perso (100 mots) : anecdote de la semaine, humeur, mé"té©©o
2. 3-5 liens :
   - Article de blog : [titre + 1 phrase]
   - Destination : [titre + 1 phrase]
   - Coulisses de marque : [titre + 1 phrase]
   - Expert h ôtelier : [titre + 1 phrase]
3. CTA (50 mots) : invitation à ré"server un travel planning, ré"pondre à l'email, etc.

Rè«§gles :
- Ton : tutoiement, narratif, sensoriel
- Longueur : 300-500 mots max
- Pas de "bons plans" → "pé«©pites dénich ées"

Je te donne les é"lé«©ments maintenant, dé"sordonné«©s. Attends ma ré"ponse.
```

---

## 4. Nettoyer le repo (quand c'est le bazar)

**Quand l'utiliser** : tu vois trop de fichiers, tu ne sais plus par où commencer.

**Ce que tu dois faire** : rien, l'IA fait tout.

**Prompt à copier** :

```text
Tu es l'agent IA de Heldonica. Mission : nettoyer le repo en dépla çant les fichiers inutiles.

Fichiers à dé"placer dans `docs/archive/` :
- Tous les fichiers qui commencent par `AUDIT_`, `RAPPORT_`, `CMS_`, `SITE_`, `TECHNICAL_`, `IMAGE_`, `SOURCE_`, `SQL_`, `CHECKLIST_`, `COMPETITIVE_`, `MAINTENANCE_`, `JULES_`, `CHANTIER2_`, `audit_`

É«‰tapes :
1. Cré"er `docs/archive/` (s'il n'existe pas)
2. Dé"placer tous les fichiers list é"s
3. Committer : `chore: move audit files to docs/archive/`
4. Pusher sur `main`

Ne me demande rien, fais-le directement.
```

---

## 5. Prendre une tâche dans `agent_tasks` (quand tu veux coder)

**Quand l'utiliser** : tu veux avancer une tâche de dé"veloppement, mais tu ne sais pas laquelle choisir.

**Ce que tu dois faire** : rien, l'IA choisit pour toi.

**Prompt à copier** :

```text
Tu es l'agent IA de Heldonica. Mission : prendre UNE tâche prioritaire dans `agent_tasks` et la faire.

É«‰tapes :
1. Lire `agent_tasks` via MCP (table Supabase)
2. Choisir la tâche la plus simple (é«©toile ⭐, pas ⭐⭐⭐)
3. Prendre la tâche (statut `sent` → `claimed` → `in_progress`, avec ton `agent_name`)
4. Coder la tâche
5. Tester, committer, pusher
6. Mettre à jour `agent_tasks` : `done`, avec preuve
7. Fermer l'issue GitHub correspondante

Ne me demande rien, fais-le directement.
```

---

## 6. Résumer une réunion / un appel (quand tu as un enregistrement)

**Quand l'utiliser** : tu as un enregistrement vocal ou une transcription d'un appel, et tu veux en extraire l'essentiel.

**Ce que tu dois faire** : coller la transcription (ou le fichier audio si l'IA le supporte).

**Prompt à copier** :

```text
Tu es assistant personnel pour Heldonica. Mission : ré"sumer cette transcription d'appel/ré«©union.

Extraction attendue :
1. Décisions prises (liste à puces)
2. Actions à faire (qui fait quoi, pour quand)
3. Points bloquants (s'il y en a)
4. Prochaine é"tape (date, heure)

Format : court, direct, pas de blabla.

Voici la transcription : [coller ici]
```

---

## 7. Planifier ta semaine (lundi matin, 10 min)

**Quand l'utiliser** : lundi matin, tu ne sais pas par où commencer.

**Ce que tu dois faire** : donner 3-5 trucs que tu aimerais faire cette semaine (mê«ªme flous).

**Prompt à copier** :

```text
Tu es assistant personnel pour Heldonica. Mission : m'aider à planifier ma semaine.

Je vais te donner 3-5 trucs que j'aimerais faire cette semaine, dé"sordonné«©s, flous.

Toi :
1. Les organiser par priorité (1 = urgent, 5 = peut attendre)
2. Estimer le temps pour chacun (15 min, 30 min, 1h, etc.)
3. Me dire quel jour faire quoi (lundi, mardi, etc.)
4. Me rappeler que je peux dé"caler si je bloque

Format : tableau simple, pas de blabla.

Je te donne ma liste maintenant. Attends ma ré"ponse.
```

---

## 8. Débloquer une tâche (quand tu es coincé©© depuis 10 min)

**Quand l'utiliser** : tu es sur une tâche, tu n'avances plus, tu tournes en rond.

**Ce que tu dois faire** : expliquer où tu bloques, en une phrase.

**Prompt à copier** :

```text
Tu es assistant technique pour Heldonica. Mission : m'aider à débloquer une tâche.

Je vais te dire où je bloque, en une phrase, sans dé"tails.

Toi :
1. Me poser UNE seule question pour clarifier (pas plus)
2. Me donner UNE seule piste de solution (pas 10)
3. Me rappeler que je peux abandonner et revenir demain si ça ne va pas

Format : court, direct, pas de jugement.

Je te dis où je bloque maintenant. Attends ma ré"ponse.
```

---

## Règles d'usage (ADHD/TSA friendly)

1. **Un seul prompt à la fois** : ne jamais en ouvrir deux en mê"me temps
2. **Si tu bloques** : ferme tout, reviens demain (pas de culpabilité«©)
3. **Si tu dépasses 30 min** : arrê«ªte, c'est que le prompt est mal adapté
4. **Si tu ne sais pas quel prompt choisir** : commence par le #1 (article de blog), c'est le plus simple
5. **Pas de "il faut"** : tu fais quand tu peux, pas quand tu dois

---

## Historique des prompts utilisés

- [ ] #1 — Article de blog (premier essai)
- [ ] #2 — Carrousel Instagram
- [ ] #3 — Newsletter
- [ ] #4 — Nettoyage repo
- [ ] #5 — Tâ«¢che `agent_tasks`
- [ ] #6 — Ré"union
- [ ] #7 — Planifier semaine
- [ ] #8 — Débloquer tâche

Coche au fur et à mesure, comme ça tu vois ce que tu as dé"jà«© fait.

# Séquence Email Brevo — Heldonica

## Vue d'ensemble

Cette documentation décrit la séquence email Brevo pour les abonnés newsletter et les leads travel planning.

---

## Séquence Welcome (Lead Magnet)

**Trigger**: Téléchargement du guide Top 10 Madère ou inscription newsletter  
**Segment**: `tag=lead-magnet` OU `tag=newsletter-signup`  
**Délai**: J+0, J+3, J+7

### Email 1 — Confimation (J+0)

**Sujet**: ✨ Ton guide arrive — et la suite est encore mieux

**Contenu**:
- Confirmation du téléchargement
- Lien vers le guide PDF
- Introduction à l'univers Heldonica
- CTA: Découvrir les carnets de voyage

### Email 2 — Valeur (J+3)

**Sujet**: Le bar à vin de Funchal où personne ne va

**Contenu**:
- Une pépite terrain (restaurant/wine bar testé)
- Story courte et immersive
- Lien vers l'article blog correspondant
- CTA: Explorer les autres pépites

### Email 3 — Personnalisation (J+7)

**Sujet**: Tu pars où la prochaine fois ?

**Contenu**:
- Question poursegmenter (destinations preferences)
- Proposition de carnet personnalisé
- CTA: Réserver un échange découverte

---

## Séquence Travel Planning

**Trigger**: Soumission du formulaire travel planning  
**Segment**: `tag=travel-planning-lead`  
**Délai**: J+0, J+2, J+5, J+10

### Email 1 — Accusé réception (J+0)

**Sujet**: Reçu. On lit ton brief.

**Contenu**:
- Confirmation de réception
- Délai de réponse (48h)
- Ce qu'on va analyser
- CTA: Nous suivre sur Instagram en attendant

### Email 2 — Proposition de valeur (J+2)

**Sujet**: Ce qu'on a compris de ton voyage

**Contenu**:
- Récap de la destination/style demandé
- Exemple de livrable (carnet de route)
- Temoignage client pertinent
- CTA: Répondre avec plus de détails

### Email 3 — Follow-up (J+5)

**Sujet**: Tu veux qu'on creuse ?

**Contenu**:
- Question ouverte pour relancer
- Option de call 15min gratuit
- Lien vers FAQ travel planning
- CTA: Réserver un créneau

### Email 4 — Dernière chance (J+10)

**Sujet**: Ton voyage mérite mieux qu'un guide générique

**Contenu**:
- Rappel de l'offre
- Urgences temporalité (si applicable)
- Alternative: lead magnet Madère
- CTA: Dire "non, merci" ou continuer

---

## Segmentation

### Tags à configurer dans Brevo

| Tag | Description | Trigger |
|-----|-------------|---------|
| `lead-magnet` | A téléchargé un guide | Formulaire lead magnet |
| `newsletter-signup` | Inscription simple | Footer newsletter |
| `travel-planning-lead` | Formulaire travel planning | /travel-planning-form |
| `destination-madere` | Intérêt Madère | Formulaire ou clic email |
| `destination-montenegro` | Intérêt Monténégro | Formulaire ou clic email |
| `destination-roumanie` | Intérêt Roumanie | Formulaire ou clic email |

### Attributs personalisés

- `first_name`: Prénom (optionnel)
- `preferred_season`: Printemps/Été/Automne/Hiver
- `travel_style`: Slow/Moderate/Active
- `budget_range`: €/€€/€€€
- `travel_companion`: Solo/Couple/Famille/Amis

---

## Automatisation Brevo

### Triggers à configurer

1. **Formulaire Lead Magnet** → Ajout tag `lead-magnet` + démarrage séquence Welcome
2. **Formulaire Travel Planning** → Ajout tag `travel-planning-lead` + démarrage séquence TP
3. **Clic sur lien destination** → Ajout tag destination correspondant

### Boucles de réengagement

- Si inactive > 60 jours: envoi "On te manque ?" avec best-of articles
- Si inactive > 90 jours: réduction segmentation (tag `inactive`)

---

## Templates

### Template 1: Confirmation Lead Magnet

```
Subject: ✨ Ton guide arrive — et la suite est encore meilleure

Bonjour{{first_name | default:'voyageur'}},

C'est fait. Ton guide "Top 10 Pépites Madère" est en route vers ta boîte mail.

En attendant, voici ce qu'on prépare pour toi:

Chaque semaine, on partage une pépite. Un lieu qu'on a trouvé, une erreur qu'on aurait aimé éviter, un coucher de soleil sur une falaise portugaise. Rien de générique, tout de terrain.

[Lire le dernier carnet de voyage →]

À très vite,
Hélder & Elena
Heldonica

--
Tu peux te désinscrire à tout moment
```

### Template 2: Pépite Terrain

```
Subject: Le bar à vin de Funchal où personne ne va

Salut{{first_name | default:'voyageur'}},

Il y a un bar à Funchal, caché dans une ruelle derrière le marché.

Le proprio s'appelle João. Il sert du vinho verde glacé dans des verres qui ont l'air d'avoir traversé le temps. La carte, c'est trois lignes. Le vin, c'est local. L'ambiance, c'est exactement ce qu'on cherche.

On y est allés trois soirs. Le troisième, João nous a parlé de son père qui cultivait la vigne sur les pentes. Il nous a servi un verre de plus, sans qu'on demande.

C'est ce genre d'endroits qu'on met dans nos carnets.

[Lire le récit complet →]

P.S.: Si tu pars à Madère, dis-lui qu'on t'envoie. Il comprendra.

—
Heldonica | Slow travel vécu
```

### Template 3: Travel Planning Follow-up

```
Subject: On a lu ton brief. Voici ce qu'on voit.

Salut{{first_name | default:''}},

On a pris le temps de comprendre ce que tu cherches. Et on peut te dire une chose: c'est faisable.

Ce qui nous frappe dans ton projet:

{{dynamic_content_from_form}}

On prépare une proposition concrète. Mais avant, on veut être sûrs de comprendre ce qui compte vraiment pour toi. Pas juste la destination — le comment.

Tu as 15 minutes cette semaine pour qu'on en parle?

[Réserver un créneau →]

Si jamais le timing ne marche pas, dis-le nous. On reste disponibles.

—
Hélder & Elena
Heldonica
```

---

## Configuration technique

### API Brevo (à implémenter)

```typescript
// POST /api/brevo/subscribe
{
  email: string,
  listId: string,  // 'newsletter' | 'travel-planning'
  tags: string[],   // ['lead-magnet', 'destination-madere']
  attributes: {
    first_name?: string,
    // ...
  }
}
```

### Variables d'environnement

```
BREVO_API_KEY=xxx
BREVO_LIST_NEWSLETTER=123
BREVO_LIST_TRAVEL_PLANNING=456
```

---

## Tests à valider

1. ✅ Confirmation lead magnet envoyée < 2min après inscription
2. ✅ Séquence terminée sans erreur pour 100% des contacts
3. ✅ Tags correctement appliqués à chaque étape
4. ✅ Désinscription fonctionnelle et respectée
5. ✅ Mobile responsive vérifié sur iOS/Android

---

*Dernière mise à jour: juin 2026*
*Responsable: Équipe Heldonica*
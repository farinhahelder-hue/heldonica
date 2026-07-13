# PR Spec: feat(destinations): improve GEO extraction and practical blocks

## Objectif
Améliorer l'extractibilité IA/SEO et la lisibilité des blocs pratiques sur les pages destination piliers.

## Changements à implémenter

### 1. Réponses directes en haut de section
Pour chaque grande section (intro, budget, FAQ), ajouter 2-4 lignes de résumé direct sous le titre H2.

### 2. Listes structurées
- Au moins 3 listes `<ul>` par page destination
- Listes avec bullets personnalisés (checkmarks ou icônes)
- Format: titre + liste + contexte

### 3. Tableaux comparatifs
Quand il y a 2 éléments à comparer (ex: saisons), ajouter un tableau HTML structuré:
```html
<table>
  <thead>
    <tr><th>Critère</th><th>Option A</th><th>Option B</th></tr>
  </thead>
  <tbody>
    <tr><td>...</td><td>...</td><td>...</td></tr>
  </tbody>
</table>
```

### 4. Titres H2 explicites
Intégrer Qui/Quoi/Où/Quand dans les titres:
- ❌ "Le budget"
- ✅ "Combien prévoir par jour — budget couple Madère 2026"

### 5. FAQ naturelle
5-7 questions formulées de façon conversationnelle:
- Éviter: "Quelle est la meilleure période?"
- Préférer: "Quand partir à Madère pour profiter pleinement?"

## Fichiers à modifier
- `lib/pillar-data.ts` — FAQ reformulées
- `components/DestinationPillar.tsx` — réponses directes sous H2
- `components/TestedByHeldonica.tsx` — bullet points améliorés
- `components/DestinationVerdict.tsx` — titre H2 explicite

## Contraintes
- Pas de refactor global
- Conserver la structure existante
- Respecter le ton Heldonica (tutoiement, "on")

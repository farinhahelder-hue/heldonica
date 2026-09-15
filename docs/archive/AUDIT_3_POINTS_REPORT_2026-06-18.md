# Audit 3 Points — Rapport de Diagnostic
**Date:** 18 juin 2026  
**Branche:** `audit/issue-372-launch-b2c`  
**Objectif:** Documenter les 3 points restants AVANT correction

---

## 1. ERREURS TYPESCRIPT — 34 erreurs

**Cause racine:** Canonical URLs malformés sur 34 sub-destinations

### Problème identifié
```
canonical: 'https://www.heldonica.fr/destinations/xxx"  ← guillemet ouvrant ' + guillemet fermant "
```
Les canonicals utilisent `'` au début et `"` à la fin → TypeScript ne parse pas.

### Liste des fichiers (34)

| # | Fichier | Ligne |
|---|---------|-------|
| 1 | `destinations/colombie/bogota/page.tsx` | 20 |
| 2 | `destinations/colombie/cali/page.tsx` | 20 |
| 3 | `destinations/colombie/cartago/page.tsx` | 20 |
| 4 | `destinations/colombie/medellin/page.tsx` | 20 |
| 5 | `destinations/idf/fontainebleau/page.tsx` | 20 |
| 6 | `destinations/idf/giverny/page.tsx` | 20 |
| 7 | `destinations/idf/paris/page.tsx` | 20 |
| 8 | `destinations/idf/versailles/page.tsx` | 20 |
| 9 | `destinations/madere/achadas-da-cruz/page.tsx` | 20 |
| 10 | `destinations/madere/budget/page.tsx` | 18 |
| 11 | `destinations/madere/cabo-girao/page.tsx` | 20 |
| 12 | `destinations/madere/camara-de-lobos/page.tsx` | 20 |
| 13 | `destinations/madere/cote-est/page.tsx` | 20 |
| 14 | `destinations/madere/estreito/page.tsx` | 20 |
| 15 | `destinations/madere/faial/page.tsx` | 20 |
| 16 | `destinations/madere/ponta-do-sol/page.tsx` | 20 |
| 17 | `destinations/madere/portela/page.tsx` | 20 |
| 18 | `destinations/madere/porto-moniz/page.tsx` | 20 |
| 19 | `destinations/madere/ribeiro-frio/page.tsx` | 20 |
| 20 | `destinations/madere/santos/page.tsx` | 20 |
| 21 | `destinations/madere/sao-vicente/page.tsx` | 20 |
| 22 | `destinations/roumanie/brasov/page.tsx` | 20 |
| 23 | `destinations/roumanie/cluj/page.tsx` | 20 |
| 24 | `destinations/roumanie/timisoara/page.tsx` | 20 |
| 25 | `destinations/sardaigne/alghero/page.tsx` | 20 |
| 26 | `destinations/sardaigne/asinara/page.tsx` | 20 |
| 27 | `destinations/sardaigne/cagliari/page.tsx` | 20 |
| 28 | `destinations/sardaigne/costa-smeralda/page.tsx` | 20 |
| 29 | `destinations/sardaigne/nuoro/page.tsx` | 20 |
| 30 | `destinations/sicile/catane/page.tsx` | 20 |
| 31 | `destinations/sicile/etoile/page.tsx` | 20 |
| 32 | `destinations/sicile/palerme/page.tsx` | 20 |
| 33 | `destinations/sicile/syracuse/page.tsx` | 20 |
| 34 | `destinations/sicile/taormine/page.tsx` | 20 |

**Type d'erreur:** `TS1002: Unterminated string literal`

**Correction nécessaire:** Changer `"` en `'` à la fin de chaque ligne canonical, OU utiliser des template literals `` ` ``.

---

## 2. SUB-DESTINATIONS — 48 pages avec contenu générique

### Vue d'ensemble par destination parent

| Parent | Pages | Problèmes |
|--------|-------|-----------|
| **Madère** | 15 | 14 avec "c'est" / descriptions génériques |
| **Roumanie** | 9 | 7 avec contenu générique ou itinerary |
| **Sardaigne** | 5 | 5 avec "c'est" |
| **Sicile** | 5 | 5 avec "c'est" |
| **Colombie** | 4 | 4 avec "c'est" |
| **Normandie** | 3 | 3 avec "c'est" / générique |
| **Portugal** | 2 | 2 avec "c'est" |
| **IDF** | 4 | 4 avec motcount < 200w |

### Détail par page

#### MADÈRE (15 pages)
| Slug | Titre | Statut |
|------|-------|--------|
| `madere/achadas-da-cruz` | Achadas da Cruz | ⚠️ "c'est" + generic |
| `madere/budget` | — | ⚠️ No title, 84w, no-hero |
| `madere/cabo-girao` | Cabo Girao | ⚠️ "c'est" + generic |
| `madere/camara-de-lobos` | Camara de Lobos | ⚠️ "c'est" + generic |
| `madere/cote-est` | Cote Est | ⚠️ "c'est" + generic |
| `madere/estreito` | Estreito de Camara | ⚠️ "c'est" |
| `madere/faial` | Faial | ⚠️ "c'est" + generic |
| `madere/funchal` | Funchal et environs | ⚠️ "c'est" |
| `madere/itineraire-7-jours` | Itineraire Madere 7 jours | ⚠️ generic |
| `madere/ponta-do-sol` | Ponta do Sol | ⚠️ "c'est" |
| `madere/portela` | Portela | ⚠️ "c'est" + generic |
| `madere/porto-moniz` | Porto Moniz | ⚠️ "c'est" + generic |
| `madere/ribeiro-frio` | Ribeiro Frio | ⚠️ "c'est" + generic |
| `madere/santos` | Santos | ⚠️ "c'est" + generic |
| `madere/sao-vicente` | Sao Vicente | ⚠️ "c'est" |

#### ROUMANIE (9 pages)
| Slug | Titre | Statut |
|------|-------|--------|
| `roumanie/brasov` | Brasov | ⚠️ 170w (faible) |
| `roumanie/bucarest` | Bucarest | ⚠️ "c'est" + generic |
| `roumanie/cluj` | Cluj | ⚠️ 172w (faible) |
| `roumanie/itineraire-10-jours` | Roumanie 10 jours | ⚠️ generic itinerary |
| `roumanie/itineraire-5-jours` | Roumanie 5 jours | ⚠️ generic itinerary |
| `roumanie/itineraire-7-jours` | Roumanie 7 jours | ⚠️ generic itinerary |
| `roumanie/sibiu` | Sibiu | ⚠️ "c'est" + generic |
| `roumanie/timisoara` | Timisoara | ⚠️ 175w (faible) |
| `roumanie/transylvanie` | Transylvanie | ⚠️ "c'est" + generic + 199w |

#### SICILE (5 pages)
| Slug | Titre | Statut |
|------|-------|--------|
| `sicile/catane` | Catane | ⚠️ "c'est" + 196w |
| `sicile/etoile` | Isole Eoliennes | ⚠️ "c'est" |
| `sicile/palerme` | Palerme | ⚠️ "c'est" + 198w |
| `sicile/syracuse` | Syracuse | ⚠️ "c'est" + 194w |
| `sicile/taormine` | Taormine | ⚠️ "c'est" |

#### SARDAIGNE (5 pages)
| Slug | Titre | Statut |
|------|-------|--------|
| `sardaigne/alghero` | Alghero | ⚠️ "c'est" + 198w |
| `sardaigne/asinara` | Asinara | ⚠️ "c'est" |
| `sardaigne/cagliari` | Cagliari | ⚠️ "c'est" |
| `sardaigne/costa-smeralda` | Costa Smeralda | ⚠️ "c'est" |
| `sardaigne/nuoro` | Nuoro | ⚠️ "c'est" + generic + 195w |

#### COLOMBIE (4 pages)
| Slug | Titre | Statut |
|------|-------|--------|
| `colombie/bogota` | Bogota | ⚠️ "c'est" |
| `colombie/cali` | Cali | ⚠️ "c'est" |
| `colombie/cartago` | Cartago | ⚠️ "c'est" |
| `colombie/medellin` | Medellin | ⚠️ "c'est" |

#### IDF (4 pages)
| Slug | Titre | Statut |
|------|-------|--------|
| `idf/fontainebleau` | Fontainebleau | ⚠️ 172w |
| `idf/giverny` | Giverny | ⚠️ 175w |
| `idf/paris` | Paris | ⚠️ "c'est" + 178w |
| `idf/versailles` | Versailles | ⚠️ 176w |

#### NORMANDIE (3 pages)
| Slug | Titre | Statut |
|------|-------|--------|
| `normandie/cote-albatre` | Côte d'Albâtre | ⚠️ "c'est" + generic |
| `normandie/le-havre` | Le Havre et environs | ⚠️ "c'est" |
| `normandie/pays-dauge` | Pays d'Auge | ⚠️ "c'est" + generic |

#### PORTUGAL (2 pages)
| Slug | Titre | Statut |
|------|-------|--------|
| `portugal/lisbonne` | Lisbonne | ⚠️ "c'est" |
| `portugal/porto` | Porto | ⚠️ "c'est" |

---

## 3. BUDGETS — Incohérences dans le code et données

### Sources de budget

| Source | Type | Valeurs |
|--------|------|---------|
| `lib/pillar-data.ts` | Constantes statiques | 750€, 900€, 1200€ |
| `components/DestinationCard.tsx` | `avg_budget_couple_week` | Nombre (formaté en "1.2k€") |
| `components/DestinationComparison.tsx` | `avg_budget_couple_week` | Nombre (formaté en "Xk€") |
| Supabase `destinations` | Champ dynamique | ? (non accessible en local) |

### Incohérence identifiée

**Code:** `lib/pillar-data.ts`
```
MADERE: budget: 1200      → "1.2k€" dans l'UI
MONTENEGRO: budget: 900   → "900€" dans l'UI  
ROUMANIE: budget: 750     → "750€" dans l'UI
```

**Problème:** Les budgets dans `pillar-data.ts` sont des nombres entiers, mais :
1. Le code `DestinationComparison` formate en "Xk€" pour les ≥ 1000€
2. Les budgets réels sont stockés dans Supabase (non vérifiable en local)

### Impact UX
- Page `/compare` : Affiche "1.2k€" pour Madère, "750€" pour Roumanie
- Cards destinations : Affiche le budget si `avg_budget_couple_week` est présent
- Si Supabase retourne `null` ou `0` : Affiche "—"

### Recommandation
Les budgets affichés dépendent de Supabase. Vérifier dans le dashboard :
1. Quelle est la colonne utilisée ?
2. Les valeurs sont-elles cohérentes avec `pillar-data.ts` ?
3. Certaines destinations ont-elles `null` ?

---

## RECOMMANDATIONS PAR POINT

### Point 1 — TypeScript (FACILE À CORRIGER)
- **Effort:** 5 min (script sed)
- **Impact:** Élimine 34 erreurs de build
- **Risque:** Faible
- **Recommandation:** ✅ CORRIGER

### Point 2 — Sub-destinations (TRAVAIL ÉDITORIAL)
- **Effort:** 2-4h de rédaction humaine
- **Impact:** Qualité perçue, SEO long-tail
- **Risque:** Aucun (contenu statique)
- **Recommandation:** ⏸️ DIFFÉRER (hors scope technique) OU masquer les pages vides via noindex

### Point 3 — Budgets (DONNÉES SUPABASE)
- **Effort:** 30 min diagnostic + mise à jour données
- **Impact:** Cohérence UI sur /compare
- **Risque:** Faible
- **Recommandation:** 🔍 VÉRIFIER Supabase d'abord

---

## DÉCISION REQUISE

| Point | Corriger ? | Masquer (noindex) ? | Différer ? |
|-------|------------|---------------------|------------|
| 1. TypeScript | ✅ | N/A | ☐ |
| 2. Sub-destinations | ☐ | ✅ | ☐ |
| 3. Budgets | ☐ | N/A | ✅ |

**Commentaires:**

---

## MISE À JOUR — 18 juin 2026 — CORRECTIONS APPLIQUÉES

### ✅ Point 1 — TypeScript (CORRIGÉ)
- **34 canonicals malformés** corrigés avec script Python
- Pattern: `canonical: 'url"` → `canonical: 'url'`
- Erreurs restantes: 30 (toutes B2B/CMS, hors scope)

### ✅ Point 2 — Sub-destinations (NOINDEX APPLIQUÉ)
- **44 pages** avec `robots: { index: false, follow: false }`

#### Pages avec noindex:
| Destination | Pages |
|-------------|-------|
| Madère | 15 pages |
| Roumanie | 9 pages |
| Sicile | 5 pages |
| Sardaigne | 5 pages |
| Colombie | 4 pages |
| IDF | 4 pages |
| Normandie | 3 pages |
| Portugal | 2 pages |
| [slug] dynamique | 1 page |

### ⏸️ Point 3 — Budgets (DIFFÉRÉ)
- Non modifié
- À vérifier dans Supabase après lancement

---

## STATUT FINAL
**Prêt pour commit et PR**

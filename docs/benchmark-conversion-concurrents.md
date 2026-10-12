# Benchmark de conversion — le playbook commercial des concurrents

> **But** : isoler les **mécanismes de conversion** que les rivaux les plus
> aboutis utilisent, et confronter chacun à ce qu'Heldonica a **déjà** dans son
> dépôt. Répond directement à « quoi mettre en place ».
>
> **Sources** : pages publiques (Fabrique ton Voyage, Destinaslow, Échappées
> Lointaines) + code du dépôt Heldonica. Aucun texte concurrent recopié.

---

## 0. Le pattern dominant : « parcours en 4 étapes + prix + preuve »

**[OBSERVÉ]** Trois rivaux, trois fois la même structure de page de vente :

| Mécanisme | Fabrique ton Voyage | Destinaslow | Échappées Lointaines |
|---|---|---|---|
| Parcours | 4 étapes | 4 étapes | 4 étapes |
| Prix public | **dès 40 €/jour** (dès 55 € le week-end) | **dès 645 €** / **dès 95 €** / **99 €/h** | **dès 240 €** / **dès 430 €** |
| Appel découverte | Oui (zcal) | Oui (Calendly) | Oui (formulaire) |
| Livrable | livret digital + **imprimé** (app Lambus) | carnet **PDF + papier** | carnet + carte interactive |
| Témoignages | 6 nommés | 4 nommés | nommés + **datés** |
| « 0 commission cachée » | stat affichée | FAQ | FAQ |
| Membre ATPE | **badge affiché** | — | — |

**[INTERPRÉTATION]** Ce n'est pas un hasard : c'est le **standard du marché**.
Un acheteur qui compare trois sites retrouve partout le même déroulé. S'en
écarter demande une raison forte ; le suivre est la baseline.

---

## 1. Ce qu'Heldonica a DÉJÀ [OBSERVÉ, dépôt]

Bonne nouvelle : l'essentiel de la baseline existe, contrairement à ce que
laisserait croire un site en maintenance.

| Mécanisme | État Heldonica | Emplacement |
|---|---|---|
| Parcours en 4 étapes | **Présent** (« De ton rêve à ton départ », étapes 1-4) | `app/travel-planning/TravelPlanningClient.tsx:295` |
| Prix | **Présent** (Essentielle **250 €**, Complète **450 €**) | `TravelPlanningClient.tsx`, `layout.tsx` |
| « Pas de commission cachée » | **Présent** (FAQ) | `TravelPlanningClient.tsx:30` |
| Témoignage daté | **Présent** (« Sophie & Marc — Madère, Mai 2026 ») | `TravelPlanningClient.tsx:35` |
| Livrable carnet | **Présent** (carnet de route, PDF) | `/dashboard`, gabarits |
| Formulaire de devis | **Présent** (assistant 3 étapes) | `components/TravelPlanningForm.tsx` |

**[INTERPRÉTATION]** Heldonica est **au niveau du marché sur la structure**. Le
problème n'est pas un manque de mécanismes, c'est la **visibilité** et la
**densité de preuve**.

---

## 2. Les 6 écarts à combler

### Écart 1 — L'appel découverte cliquable [OBSERVÉ]
Les trois rivaux proposent un **lien de réservation direct** (Calendly, zcal).
Heldonica n'en a pas : le formulaire est un assistant, pas une prise de RDV.

**À mettre en place** : un lien « Réserver un appel découverte » (Calendly, cal.com
ou zcal) sur `/travel-planning` et `/expert-hotelier`. Effort très faible,
impact conversion élevé — c'est le point de passage de tout le panel.

### Écart 2 — Le prix visible hors de la page dédiée [OBSERVÉ]
Chez Heldonica, « à partir de 250 € » n'apparaît qu'en meta de
`/travel-planning`. Fabrique ton Voyage et Destinaslow l'affichent sur la page
de vente ET dans la FAQ.

**À mettre en place** : afficher la fourchette sur l'accueil, dans
`components/CtaTravelPlanning.tsx` (déjà présent) et dans les pages destination.

### Écart 3 — Le nombre de témoignages datés [OBSERVÉ]
Heldonica a **1** témoignage daté idéalement formaté. Fabrique ton Voyage en a 6,
Destinaslow 4, Échappées plusieurs datés.

**À mettre en place** : viser 4-6 témoignages au même format
(prénom + destination + mois/année). Le gabarit existe déjà : il suffit de
collecter.

### Écart 4 — L'appartenance ATPE [OBSERVÉ]
Fabrique ton Voyage affiche le **badge ATPE** (« membre de »). Plusieurs rivaux
sont au bureau de l'association (voir `docs/concurrence-profils-approfondis.md`).

**À mettre en place** : adhérer à l'ATPE et afficher le badge. Double effet :
annuaire + légitimité de pair.

### Écart 5 — L'offre par destination [OBSERVÉ]
Imprudence des Voyages vend « votre voyage sur mesure au Japon » ; Destinaslow
« voyage au Canada ». Heldonica a **15+ itinéraires** (`app/destinations`) mais
vend « slow travel » en bloc, sans page d'offre par destination.

**À mettre en place** : une page de vente par destination phare (Madère,
Roumanie, Monténégro…), sur le modèle de `travel-planning`.

### Écart 6 — Le livrable imprimé [OBSERVÉ]
Fabrique ton Voyage (livret imprimé + app Lambus) et Destinaslow (carnet
**papier**) livrent un objet physique. C'est un argument de perception
« premium » qu'Heldonica n'exploite pas.

**À mettre en place** : proposer une version imprimée du carnet (ou le dire si
ça existe déjà, à vérifier hors maintenance).

---

## 3. Priorisation par effort/impact

| # | Action | Effort | Impact | Où |
|---|---|---|---|---|
| 1 | Lien appel découverte | Faible | **Élevé** | `/travel-planning`, `expert-hotelier` |
| 2 | Prix visible ailleurs | Faible | Élevé | accueil, `CtaTravelPlanning` |
| 3 | Témoignages datés ×4-6 | Faible | Élevé | `app/temoignages`, `TravelPlanningClient` |
| 4 | Page d'offre par destination | Moyen | Élevé | `app/destinations/*` |
| 5 | Adhésion + badge ATPE | Moyen | Moyen | site + annuaires |
| 6 | Carnet imprimé | Moyen | Moyen | offre |

---

## 4. Le point où Heldonica n'a rien à copier

**[INTERPRÉTATION]** Aucun rival du panel n'a :
- un **carnet tenu par un duo** (« on ») — ils sont solo (« je ») ou passés
  famille ;
- un **volet B2B hôtelier** distinct ;
- un **lexique volontairement sobre** (ils emploient « inoubliable », « rêve »,
  « coup de cœur », « meilleurs prix »).

Ces trois points sont la **différenciation**, pas l'écart. Les combler serait
une erreur (voir `docs/plan-mise-en-place-face-concurrence.md`, §5).

---

## 5. Informations non vérifiables

- **[INDISPONIBLE]** Taux de conversion réels des rivaux.
- **[INDISPONIBLE]** Le parcours Heldonica **tel qu'affiché en ligne** (site en
  maintenance) — l'analyse porte sur le code.
- **[OBSERVÉ]** Les prix cités sont ceux affichés publiquement, non négociés.

---

*Études liées : `docs/etude-concurrence-directe-heldonica.md`,
`docs/concurrence-profils-approfondis.md`,
`docs/plan-mise-en-place-face-concurrence.md`,
`docs/positionnement-editorial-voyagesetc.md`.*

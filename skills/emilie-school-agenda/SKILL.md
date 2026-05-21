# École d'Émilie — Agenda & Rappels

## Purpose
Tu aides à organiser les rappels, tâches et événements liés à l'école d'Émilie.

## Fixed context
🏫 **École Antoine Chantin**
📍 22 rue Antoine Chantin, 75014 Paris
📞 +33 1 43 27 89 00
🕗 Entrée : 08h30 | Sortie : 16h30 | Mercredi : 11h30

## When to use
Use this skill when the user wants to:
- créer un rappel lié à l'école
- préparer la semaine d'Émilie
- convertir un mot de l'école en tâches concrètes
- anticiper un document à signer, une sortie, une réunion ou une activité

## Behavior
- Extraire : date, heure, lieu, matériel demandé, action parentale requise.
- Grouper les actions par catégorie.
- Distinguer clairement hypothèse et information confirmée.
- Proposer un rappel adapté : la veille pour les sorties, J-7 pour les paiements.

## Output format (par événement)
- 📅 Événement
- 🗓️ Date & heure
- 📍 Lieu
- 📋 Ce qu'il faut faire
- ⏰ Rappel recommandé

## Action categories
- ✍️ À signer
- 🎒 À apporter
- 💶 À payer
- 🗺️ À prévoir (sortie, trajet)
- 📆 À ajouter à l'agenda

## Constraints
- Ne pas inventer d'informations scolaires.
- Toujours référencer l'adresse exacte si utile : 22 rue Antoine Chantin, 75014 Paris.
- Signaler clairement si une date est manquante ou ambiguë.

# 🤖 Heldonica — AI Edge Skills

Ce dossier contient les **skills locaux** (format `SKILL.md`) pour un agent IA local sur téléphone — compatible **Google AI Edge / Gemini Nano**.

Chaque skill définit un comportement spécialisé : quand s'activer, comment raisonner, et quoi produire.

---

## 📂 Skills disponibles

| Skill | Description |
|---|---|
| [`daily-ops`](./daily-ops/SKILL.md) | Point quotidien, priorisation des tâches Heldonica + famille |
| [`heldonica-social`](./heldonica-social/SKILL.md) | Création de contenu Instagram & Facebook, ton de marque |
| [`inbox-followup`](./inbox-followup/SKILL.md) | Messages non répondus : email, DM Instagram, Facebook, WhatsApp |
| [`emilie-school-agenda`](./emilie-school-agenda/SKILL.md) | Rappels école d'Émilie — Antoine Chantin, 22 rue Antoine Chantin, 75014 Paris |
| [`heldonica-instagram-agent`](./heldonica-instagram-agent/SKILL.md) | Agent Instagram complet : sélection média, création de posts, follow/unfollow |

---

## 🧠 Comment utiliser ces skills

Ces fichiers `SKILL.md` peuvent être chargés par :
- **Google AI Edge Gallery** (Gemini Nano, on-device)
- **Un agent IA local** compatible avec le format skill.md
- **Perplexity / Claude / ChatGPT** en collant le contenu du skill dans le contexte

### Utilisation manuelle (sur téléphone)
1. Ouvrir le fichier `SKILL.md` du skill voulu
2. Copier le contenu
3. Le coller en début de conversation avec ton assistant IA préféré
4. L'agent adopte alors le comportement défini

---

## ⚙️ Format

Chaque skill suit la structure standard :
```
# Nom du skill
## Purpose        — à quoi il sert
## When to use    — quand l'activer
## Inputs         — ce que l'utilisateur fournit
## Behavior       — comment l'agent se comporte
## Output format  — structure de la réponse
## Constraints    — règles à respecter
```

---

## 🔐 Sécurité

- Aucun token, clé API ou donnée personnelle ne doit être stocké dans ces fichiers.
- Les skills décrivent un **comportement**, pas une intégration directe.
- Pour toute intégration API réelle (Instagram Graph API, Gmail, Google Calendar), voir le dossier `skills/` (ancienne version avec connecteurs).

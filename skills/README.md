# 🤖 Heldonica — Google AI Edge Skills

Ce dossier contient les **skills (compétences)** conçues pour Google AI Edge / Gemini Nano, afin d'automatiser les tâches quotidiennes de la marque Heldonica.

## 📂 Structure

```
skills/
├── social-media/
│   ├── instagram-checker.js      # Vérification messages Instagram non répondus
│   └── facebook-checker.js       # Vérification messages Facebook non répondus
├── messaging/
│   ├── email-checker.js          # Emails non répondus (Gmail / IMAP)
│   └── whatsapp-checker.js       # Messages WhatsApp non répondus
├── agenda/
│   └── agenda-manager.js         # Gestion agenda (école Émilie + events)
└── README.md
```

## 🎯 Cas d'usage prioritaires

1. **Réseaux sociaux Heldonica** — checker les DMs Instagram et messages Facebook non répondus
2. **Emails** — détecter les emails sans réponse depuis plus de 24h
3. **WhatsApp** — signaler les messages en attente de réponse
4. **Agenda** — alimenter automatiquement l'agenda avec les événements scolaires de l'école d'Émilie (Antoine Chantin 22, Paris 75014)

## ⚙️ Prérequis

- Google AI Edge SDK (Gemini Nano on-device)
- Android 10+ ou Chrome 120+ (pour on-device inference)
- Accès APIs : Meta Graph API, Gmail API, Google Calendar API
- `.env.local` configuré avec les tokens (voir `.env.example`)

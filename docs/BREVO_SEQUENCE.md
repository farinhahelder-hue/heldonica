# SÉQUENCE EMAIL BREVO — HELDONICA
## Tunnel Travel Planning

**Date :** 2 juin 2026  
**Objectif :** Convertir les leads en clients Travel Planning  
**Condition de déclenchement :** Inscription newsletter + intérêts Travel Planning

---

## EMAIL 1 — J0 (Livraison Guide)

**Sujet :** Ton guide est là 🌿 [ou : Ton premier carnet t'attend]

**Preview text :** Si tu cherches un voyage qui te ressemble, ce guide est pour toi.

---

Bonjour,

C'est fait. Le guide est entre tes mains — ou plutôt, dans ta boîte mail.

**"Slow Travel : Le Guide pour Voyager Autrement"**  
[Télécharger le PDF] ou [lien vers le guide]

Ce qu'on a mis dedans : pas de théorie. Que du vécu.

- Les 3 erreurs qu'on a faites avant de comprendre pourquoi le slow travel change tout
- Pourquoi Madère, c'est pas juste "une île portugaise" (et où aller quand tu en as marre du sud)
- Le restaurant à Funchal où même les portugais ne vont pas (celui avec le carrelage azul)
- Le sentier que personne ne te dit — et pourquoi il faut le prendre à 7h du matin
- Comment Construire un voyage qui te ressemble en 5 étapes

Ce guide, on l'a écrit parce qu'on en avait marre de voir des blogs de voyage parler de "lieux authentiques" sans jamais expliquer pourquoi. On a testé. On s'est trompé. On a recommencé. Et maintenant, on peut te dire où aller — et surtout, pourquoi.

Le lien pour le télécharger : [LIEN GUIDE]

---

Si dans les prochaines semaines tu penses à ton prochain voyage — et que tu veux qu'on en parle — on est là. Un vrai échange, pas un formulaire. Tu nous écris, on te répond dans les 48h.

On reste à : contact@heldonica.fr  
Ou ici : heldonica.fr/travel-planning

Au plaisir de lire ce que tu en penses,

Heldonica  
Paris

---

*P.S. : Si tu connais quelqu'un qui cherche à voyager autrement — n'hésite pas à lui envoyer ce guide. Plus on est, mieux c'est.*

---

## EMAIL 2 — J+3 (Philosophie Duo)

**Sujet :** Le jour où on a ralenti [ou : Comment on a commencé à voyager différemment]

**Preview text :** Ce n'était pas un choix. C'était une évidence.

---

Il y a des voyages qui te changed la manière dont tu vois le suivant.

Pour nous, ça a commencé à Madère. Pas le Madère des photos instagrammables — celui où tu te perds dans les chemins de la Levada Verde et où tu te rends compte que tu n'as croisé personne depuis une heure.

**La première fois qu'on a vraiment ralenti**, c'était un soir de novembre à Funchal. On avait prévu trois jours. On en est restés six. Pas parce qu'on avait du temps — parce qu'on avait trouvé quelque chose qu'on ne savait pas chercher avant.

C'est ce qu'on veut pour toi aussi : que ton prochain voyage te donne une bonne raison de rester une journée de plus.

**Ce qu'on a compris en voyageant en duo :**

- Le meilleur voyage n'est pas celui où tu vois le plus. C'est celui où tu reviens avec une histoire.
- Les meilleures adresses ne sont pas sur TripAdvisor. Elles sont sur le comptoir du café du matin.
- Voyager lentement, c'est pas un rythme de retraité. C'est une manière de revenir différent.

Ce n'est pas nous qui le disons. C'est ce qu'on vit depuis 2019.

---

Si tu veux qu'on parle de ton prochain voyage — ensemble — on est là.

Ici : heldonica.fr/travel-planning  
Ou par mail : contact@heldonica.fr

À très vite,

Heldonica  
Paris

---

*P.S. : Notre prochain carnet arrive bientôt — Madère en hiver, quand les touristes sont partis et que l'île reprend son souffle.*

---

## EMAIL 3 — J+7 (CTA Travel Planning)

**Sujet :** Et si ton prochain voyage était conçu pour vous ? [ou : On peut construire ton voyage]

**Preview text :** Un vrai voyage sur mesure, pas un copier-coller.

---

Si tu lis encore ce mail, c'est que le voyage t'intéresse.

Et si ton prochain voyage était pensé pour toi — vraiment ?

Pas un itinéraire générique. Pas une liste de lieux visités par des millions de personnes. Un voyage qui te ressemble, construit à partir de ce que tu veux vivre, pas de ce qu'on te dit de voir.

**Comment on travaille :**

1. **Tu nous racontes** — ce que tu cherches, ce que tu veux éviter, comment tu voyages.
2. **On conçoit pour toi** — un carnet de route PDF avec programme, hébergements, restaurants, transports, contacts locaux.
3. **On reste dispo** — avant, pendant, après. Si quelque chose ne va pas sur place, tu nous écris.

Ce n'est pas un service pour tout le monde. C'est un service pour ceux qui veulent un vrai voyage — pas une case cochée.

**Ça coûte entre 150€ et 350€** pour un voyage de 7 à 14 jours. Pas de tarif fixe parce que chaque projet est différent. On commence toujours par un échange gratuit pour comprendre ton projet avant de proposer quoi que ce soit.

Réponse sous 48h. 100% humain. Sans engagement.

---

👉 **[Dis-nous où tu veux aller](https://heldonica.fr/travel-planning-form)**

Ou écris-nous directement : contact@heldonica.fr

On prend le temps de comprendre avant de répondre.

À très vite,

Heldonica  
Paris

---

*P.S. : Si tu hésites encore — demande-nous de te raconter notre dernier voyage. On ne parle pas de celui qu'on met sur le blog.*

---

## NOTES TECHNIQUES

### Segmentation Brevo
- **Tag :** `travel-planning-interest`
- **Trigger :** Téléchargement guide OU visite page /travel-planning-form
- **Délai :** Email 1 immédiat, Email 2 à J+3, Email 3 à J+7

### Personnalisation
- `{first_name}` si disponible
- `{last_carnet}` pour le prochain carnet (dynamique)

### Configuration
- Sender : Heldonica <contact@heldonica.fr>
- Reply-to : contact@heldonica.fr

---

*Version : Sprint 2 — Tunnel Travel Planning*  
*Date : 2 juin 2026*
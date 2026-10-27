import os
import sys
import json
import time
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding='utf-8')

# 1. Recuperation de la cle API Jules
token = None
for p in [r"C:\Users\Work\heldonica-clean\.env.local", r"C:\Users\Work\heldonica-brain\.env"]:
    if os.path.exists(p):
        with open(p, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("JULES_API_KEY="):
                    token = line.strip().split("=", 1)[1].strip("\"'")
                    break
        if token:
            break

if not token:
    print("❌ Erreur : JULES_API_KEY introuvable.")
    sys.exit(1)

# 2. Definition des 20 taches ultra-poussees d'etude de concurrence, tendances, IA et positionnement
tasks = [
    {
        "id": "COMP-01",
        "title": "audit(concurrence): Perspectives de Voyage - Deconstruction du modele B2B institutionnel et angle mort famille",
        "prompt": """Tu es chargé de réaliser l'étude approfondie du concurrent 'Perspectives de Voyage' (Marie Morin & Anne V.) pour Heldonica.

Objectifs d'analyse :
1. Rétro-ingénierie de leur modèle économique : analyse de leur boutique de 19 guides (16 numériques + Hachette), prix observés, volumes déclarés (600k PV/an, 32k IG, 3.5k newsletter).
2. Analyse de leur portefeuille B2B institutionnel (Agences Départementales du Tourisme : Lot, Alpes-de-Haute-Provence, Visit Luxembourg, SNCF Connect) et de leur charte 'Influence Responsable' ARPP.
3. Analyse de leur pivot éditorial 2024 vers le voyage en famille suite à l'arrivée de leur enfant : identifier pourquoi ce pivot libère complètement le segment du couple sans enfant pour Heldonica.
4. Recommandations actionnables pour Heldonica : comment capter la clientèle couple délaissée et transposer leur succès B2B institutionnel aux hôteliers indépendants."""
    },
    {
        "id": "COMP-02",
        "title": "audit(concurrence): Echappees Lointaines - Decorticage du ciblage couple, conversion et accroches Instagram",
        "prompt": """Tu es chargé d'analyser le modèle de conversion du concurrent direct 'Échappées Lointaines' (Marine) pour Heldonica.

Objectifs d'analyse :
1. Analyse de la grille tarifaire publique (Escapade 4j à 240 €, Lune de miel 7j à 430 €) : impact sur la réduction de friction client et psychologie du prix d'entrée.
2. Analyse de la structure de leurs légendes Instagram publiques : schéma 'Accroche problème concret -> Preuve d'expertise terrain -> Identité -> Appel à l'action -> Hashtags de niche'.
3. Différenciation avec Heldonica : pourquoi leur posture mono-autrice et classique s'oppose au récit immersif du duo Heldonica et à la démarche d'éco-luxe slow travel.
4. Recommandations pour Heldonica : comment adopter l'accroche-problème concrète sans céder au vocabulaire banni ('magique', 'inoubliable')."""
    },
    {
        "id": "COMP-03",
        "title": "audit(concurrence): Destinaslow - Funnel de conversion, lead magnets et limites de la mono-destination",
        "prompt": """Tu es chargé d'étudier le modèle du concurrent 'Destinaslow' (Manon) spécialisé dans le slow tourisme au Canada.

Objectifs d'analyse :
1. Décorticage du funnel d'acquisition : analyse des lead magnets gratuits (e-books, checklists) couplés à une séquence e-mail automatisée menant aux prestations (dès 645 €, essentiel dès 95 €, conseil à 99 €/h).
2. Analyse de la voix : tutoiement direct, philosophie du 'prendre le temps' et de la déconnexion.
3. Limites structurelles : vulnérabilité de la mono-spécialisation géographique (Canada) face à la saisonnalité et à la saturation d'une seule destination.
4. Recommandations pour Heldonica : adapter le mécanisme du lead magnet gratuit pour couples ('5 erreurs à éviter lors d'un roadtrip à deux') pour alimenter le funnel Heldonica."""
    },
    {
        "id": "COMP-04",
        "title": "audit(concurrence): Fabrique ton Voyage - Piege de la facturation au jour et livrable hybride papier app",
        "prompt": """Tu es chargé d'analyser le concurrent 'Fabrique ton Voyage' (Clément Le Tétour, vice-président ATPE).

Objectifs d'analyse :
1. Déconstruction critique de la tarification 'au jour' (dès 40 €/j en semaine, dès 55 €/j le week-end) : démontrer pourquoi ce modèle pénalise le slow travel et incite le client à raccourcir ses séjours.
2. Analyse de la valeur perçue du livrable : combinaison livret imprimé physique + application mobile (Lambus), impact sur le sentiment premium.
3. Rôle du réseau institutionnel : impact de la présence au bureau de l'ATPE sur la crédibilité perçue.
4. Recommandations pour Heldonica : valoriser le carnet physique relié d'artisan sur les formules d'exception et positionner l'app mobile native in-house face à Lambus."""
    },
    {
        "id": "COMP-05",
        "title": "audit(concurrence): Imprudence des Voyages & Le Monde Cousu Main - Positionnement createur et reseau ATPE",
        "prompt": """Tu es chargé d'analyser 'Imprudence des Voyages' (Julia Couturas) et 'Le Monde Cousu Main' (Aurélia Ferrand).

Objectifs d'analyse :
1. Analyse du vocable 'Créateur de voyage' vs 'Travel planner' : pourquoi cette formulation renforce la valeur perçue artistique et sur-mesure.
2. Analyse de l'organisation par destination d'Imprudence (Japon, Laponie, Tanzanie) : création de pages de vente dédiées avec forfaits spécifiques.
3. Analyse de la page 'C'est combien ?' du Monde Cousu Main : levée d'objection frontale sur les tarifs.
4. Recommandations pour Heldonica : transformer les 15+ pages destinations existantes en pages d'offres précises avec fourchettes de prix transparentes."""
    },
    {
        "id": "COMP-06",
        "title": "audit(concurrence): Chilowe et Helloways - Monétisation de communaute outdoor et guides d'aventure",
        "prompt": """Tu es chargé d'analyser les modèles médias de micro-aventure 'Chilowé' et 'Helloways'.

Objectifs d'analyse :
1. Analyse de la diversification des revenus : guides physiques (25 €), adhésion au 'Club Chilowé', catalogue de séjours accompagnés en petits groupes (250 € - 800 €).
2. Analyse de la monétisation média : affiliation matériel outdoor éco-responsable et collaborations marques.
3. Angle mort pour le slow travel intimiste : pourquoi leur approche sportive et de groupe ne répond pas au besoin de calme, d'intimité et d'éco-luxe des couples.
4. Recommandations pour Heldonica : créer une collection de guides numériques slow travel haut de gamme (Carnets Singuliers à 39 €) sans diluer l'exclusivité du sur-mesure."""
    },
    {
        "id": "COMP-07",
        "title": "audit(concurrence): Voyages etc - Retro-ingenierie SEO 20 ans d'autorite et rupture generationnelle",
        "prompt": """Tu es chargé d'analyser le blog pionnier 'Voyages etc' (Adeline Gressin).

Objectifs d'analyse :
1. Rétro-ingénierie de la stratégie SEO : mots-clés d'autorité de longue traîne, structure des guides régionaux, monétisation par affiliation (assurances, eSIM).
2. Diagnostic de rupture générationnelle : analyse du décalage éditorial entre le blogging des années 2010 ('bons plans', 'paradis', 'incontournables') et les attentes modernes d'éco-responsabilité et de sobriété.
3. Recommandations pour Heldonica : dépasser leur visibilité SEO grâce au balisage sémantique moderne (Schema.org TouristDestination / TouristTrip) et à une écriture sensorielle de terrain."""
    },
    {
        "id": "COMP-08",
        "title": "audit(concurrence): Modeles Internationaux - Fora Travel, Sawday's et Canopy and Stars",
        "prompt": """Tu es chargé d'analyser les modèles anglo-saxons innovants : Fora Travel (travel designers augmentés), Sawday's et Canopy & Stars (curation d'adresses d'exception).

Objectifs d'analyse :
1. Modèle Fora Travel : comment la technologie et la communauté permettent à des concepteurs de voyage d'offrir des avantages exclusifs chez les hôteliers partenaires.
2. Modèle Sawday's & Canopy & Stars : sélection éthique stricte, mise en valeur du lieu par le reportage photo d'auteur et relation directe avec les propriétaires.
3. Recommandations pour Heldonica : concevoir 'Le Cercle Heldonica / Collection d'Hôtes Singuliers' comme une alternative francophone éco-luxe à Sawday's, axée sur les couples."""
    },
    {
        "id": "TREND-09",
        "title": "etude(tendances): Demandes et Intentions de Recherche 2026 - Slow Travel, Deconnexion et Micro-Retraites",
        "prompt": """Tu es chargé d'analyser les tendances de recherche et les intentions profondes des voyageurs francophones pour 2026.

Objectifs d'analyse :
1. Cartographie des requêtes émergentes : 'slow travel en couple', 'voyage sans voiture / train', 'hébergement isolé nature', 'séjour déconnexion numérique', 'micro-retraite automne/hiver'.
2. Analyse de la saisonnalité : montée en puissance des départs hors-saison (mai-juin, septembre-octobre) pour éviter la foule et le surtourisme.
3. Sensibilité prix vs valeur : arbitrage des couples CSP+ entre réduction des voyages lointains en avion et sur-investissement dans des séjours de proximité très soignés.
4. Recommandations pour Heldonica : aligner le calendrier éditorial et les propositions de carnets sur ces intentions de recherche exactes."""
    },
    {
        "id": "TREND-10",
        "title": "etude(tendances): Psychologie du Couple Voyageur - Freins a la conversion et leviers de decision",
        "prompt": """Tu es chargé d'analyser la psychologie, les tensions et les motivations des couples qui planifient un voyage.

Objectifs d'analyse :
1. Les 3 grands points de friction : la charge mentale disproportionnée pesant souvent sur l'un des deux partenaires, la peur de la déception liée aux faux avis en ligne, le conflit entre 'vouloir tout voir' et 'vouloir se reposer'.
2. Les leviers de réassurance : tiers de confiance objectif, équilibre du rythme (l'art de la demi-journée vide), adresses intimistes garantissant le calme.
3. Pourquoi le travel planning sauve le séjour : positionner le service non comme un coût mais comme une garantie de sérénité et d'harmonie pour le couple.
4. Recommandations pour Heldonica : adapter la page de vente et les messages pour répondre frontalement à ces dynamiques de couple."""
    },
    {
        "id": "TREND-11",
        "title": "etude(tendances): Mutations des Hebergements Independants - Desintermediation et Experience Sensorielle",
        "prompt": """Tu es chargé d'analyser l'état du marché des hébergements indépendants (maisons d'hôtes de charme, écolodges, gîtes premium).

Objectifs d'analyse :
1. Le ras-le-bol des commissions OTA : jusqu'à 20-25% versés à Booking.com/Airbnb, asphyxiant la rentabilité des petits établissements de 3 à 8 chambres.
2. La défaillance de la communication directe : sites internet vieillissants, manque de photos incarnées, fiches Google Business délaissées, absence d'offre pensée pour les couples.
3. L'attente des hôtes vis-à-vis d'un accompagnateur : besoin de conseils concrets, d'outils simples et de visibilité auprès d'une clientèle respectueuse.
4. Recommandations pour Heldonica B2B (/expert-hotelier) : calibrer le pitch d'audit sur le gain net de marge par désintermédiation."""
    },
    {
        "id": "TREND-12",
        "title": "etude(tendances): Formats de Contenu Reseaux Sociaux - Ce qui convertit reellement en 2026",
        "prompt": """Tu es chargé d'analyser la performance des formats de contenu sur Instagram et les médias digitaux pour le voyage slow travel.

Objectifs d'analyse :
1. Reels immersifs sensoriels : pourquoi l'audio brut (bruit du vent, pas dans les feuilles, feu de cheminée) et les plans fixes convertissent mieux que les montages ultra-rapides et les vues drone impersonnelles.
2. Carrousels 'Preuve & Vérité' : impact des carrousels détaillant les budgets réels, les temps de trajet réels et les erreurs à éviter (fort taux de sauvegarde / bookmarks).
3. Stories 'Dans les coulisses du repérage' : humanisation de la marque à travers le récit honnête des repérages du duo.
4. Recommandations pour Heldonica : structurer une matrice de 12 gabarits de posts prêts à l'emploi respectant la charte de voix Heldonica."""
    },
    {
        "id": "IA-13",
        "title": "etude(ia): Impact des IA Generatives sur le Travel Planning - Commoditisation vs Valeur de la Verite Terrain",
        "prompt": """Tu es chargé d'analyser l'impact disruptif des LLMs et agents d'IA (ChatGPT, Gemini, Mindtrip) sur le métier de concepteur de voyages.

Objectifs d'analyse :
1. Commoditisation des itinéraires standards : pourquoi les IA généralistes rendent instantanément obsolètes les travel planners qui se contentent d'assembler des listes Wikipédia/TripAdvisor.
2. Les hallucinations et la fausse réassurance : les déconvenues vécues par les voyageurs utilisant des itinéraires IA (adresses fermées, temps de trajet irréalistes, hôtels décevants).
3. L'explosion de la valeur de la 'Ground Truth' (Vérité Terrain) : pourquoi la preuve physique d'avoir dormi dans le lit et marché sur le sentier devient un actif à prime premium (E-E-A-T).
4. Recommandations pour Heldonica : comment communiquer sur l'impossibilité pour une IA d'égaler le test de terrain Heldonica."""
    },
    {
        "id": "IA-14",
        "title": "etude(ia): L'Artisan Augmente - Comment Heldonica utilise l'IA en coulisse sans denaturer son authenticite",
        "prompt": """Tu es chargé de formaliser le modèle de 'l'Artisan Voyageur Augmenté' pour Heldonica.

Objectifs d'analyse :
1. Rôle du 'Coffre des Savoirs' (RAG local 78+ fiches locales) : accélération de la synthèse d'itinéraires et recherche sémantique ultra-rapide tout en garantissant des sources 100% vérifiées.
2. Automatisation des tâches à faible valeur ajoutée : mise en page de carnets, génération de coordonnées GPS géodésiques, calculs d'itinéraires doux.
3. Préservation absolue de la touche humaine : validation finale systématique par le duo, adaptation sensible aux émotions du couple voyageur.
4. Recommandations pour Heldonica : comment maintenir un temps de confection divisé par 3 tout en augmentant la qualité perçue du carnet final."""
    },
    {
        "id": "IA-15",
        "title": "etude(ia): Menaces et Opportunites de Google Search Generative Experience (SGE) pour Heldonica",
        "prompt": """Tu es chargé d'analyser l'impact de Google SGE / AI Overviews sur le trafic organique d'un média voyage comme Heldonica.

Objectifs d'analyse :
1. Baisse du trafic d'information générique : impact des réponses IA directes sur les requêtes simples ('que faire à Madère 3 jours').
2. Sur-pondération des avis d'experts authentiques et des médias de niche vérifiés dans les citations SGE.
3. Rôle clé des données structurées Schema.org : implémentation de TouristDestination, TouristTrip, Review et GeoCoordinates pour être la source citée par les modèles.
4. Recommandations pour Heldonica : optimiser le maillage interne et le balisage sémantique pour capter les requêtes à forte intention d'achat."""
    },
    {
        "id": "POS-16",
        "title": "strategie(positionnement): Ligne Editoriale 'Anti-Tourisme de Masse' et Ethique Radicale",
        "prompt": """Tu es chargé d'élaborer la stratégie de contenu polarisante 'Anti-Tourisme de Masse' d'Heldonica.

Objectifs d'analyse :
1. Prise de position assumée : pourquoi dénoncer poliment mais fermement les dérives du tourisme 'fast-food' et des spots Instagram dévastés crée une fidélité tribale chez les clients idéaux.
2. La rubrique 'Ce qu'on a moins aimé' : comment l'aveu des défauts d'un lieu décuple la crédibilité des recommandations positives.
3. Refus du greenwashing : définir des critères objectifs pour qualifier un écolodge ou une adresse de slow travel (gestion de l'eau, circuits courts réels, intégration paysagère).
4. Recommandations pour Heldonica : planifier une série de 5 articles manifestes établissant le standard éthique du slow travel en couple."""
    },
    {
        "id": "POS-17",
        "title": "strategie(positionnement): Optimisation du Funnel B2C - De la Decouverte au Carnet d'Exception",
        "prompt": """Tu es chargé de modéliser le parcours de conversion B2C complet d'Heldonica.

Objectifs d'analyse :
1. Top of Funnel : acquisition via articles SEO immersifs et reels sensoriels -> captation de l'email via le mini-guide 'Les secrets d'un voyage à deux réussi'.
2. Middle of Funnel : séquence e-mail de 4 messages démontrant l'expertise de terrain, la suppression du stress logistique et la neutralité tarifaire.
3. Bottom of Funnel : appel découverte de 20 min sans pression commerciale via calendrier en ligne, aboutissant au choix entre la formule Échappée (250 €), Grand Ralenti (450 €) ou Noces (950 €).
4. Recommandations pour Heldonica : spécifier les étapes précises à intégrer sur le site pour doubler le taux de transformation."""
    },
    {
        "id": "POS-18",
        "title": "strategie(positionnement): Offre B2B Hebergeurs - Deploiement de l'Audit Flash et du Cercle Heldonica",
        "prompt": """Tu es chargé de structurer le déploiement commercial de l'offre hôtelière B2B (/expert-hotelier).

Objectifs d'analyse :
1. Script de prospection douce : comment approcher les propriétaires de maisons d'hôtes de charme en valorisant leur authenticité et en identifiant leurs fuites de commission Booking.
2. Contenu de l'Audit Flash à 890 € HT : check-list des 50 points de contrôle (visibilité Google locale, storytelling, parcours direct, attentions couple).
3. Modèle d'adhésion au 'Cercle Heldonica' (120 €/mois) : charte d'engagement mutuel, visibilité dans les carnets de voyage du duo et réassurance client.
4. Recommandations pour Heldonica : concevoir le kit de présentation B2B et la landing page dédiée aux hôteliers."""
    },
    {
        "id": "POS-19",
        "title": "strategie(positionnement): Architecture Cocon Semantique Geo pour les 15 Destinations Phares",
        "prompt": """Tu es chargé de concevoir l'architecture de conversion SEO Geo pour les destinations phares d'Heldonica (Madère, Roumanie, Monténégro, Pouilles, Écosse, etc.).

Objectifs d'analyse :
1. Transition du blog générique vers le catalogue de destinations d'auteur : pour chaque destination, une page hub intégrant itinéraire indicatif, météo idéale slow travel, hébergements coup de cœur et formulaire d'appel direct.
2. Maillage interne contextuel : lier les articles d'expérience sensorielle directement à l'offre de confection sur-mesure de la destination.
3. Intégration de la preuve sociale locale : témoignages de couples ayant exploré la région avec Heldonica.
4. Recommandations pour Heldonica : planifier la refonte des templates de pages destinations."""
    },
    {
        "id": "POS-20",
        "title": "strategie(positionnement): Feuille de Route Executive 12 Mois - Jalons Financiers et Moat Defensif",
        "prompt": """Tu es chargé de synthétiser la feuille de route stratégique et financière sur 12 mois pour Heldonica.

Objectifs d'analyse :
1. Calendrier d'exécution en 4 trimestres : Q1 (fondations de conversion & grille tarifaire), Q2 (lancement des Carnets Singuliers 39 € & prospection 10 hébergements B2B), Q3 (consolidation B2B & adhésions Cercle), Q4 (expansion institutionnelle type ADT).
2. Trajectoire de chiffre d'affaires et de rentabilité : atteindre le palier d'équilibre de 8 500 € / mois avec marge brute >85%.
3. Consolidation du Moat défensif : dépôts de marques, renforcement du Coffre des Savoirs, labels de confiance et notoriété de niche.
4. Recommandations finales pour les fondateurs : les 3 actions prioritaires à exécuter dès cette semaine."""
    }
]

print(f"🚀 Lancement de la vague de 20 études stratégiques vers Google Jules pour Heldonica...")
print(f"📦 Dépôt cible : farinhahelder-hue/heldonica (branche main)")

created_sessions = []
for idx, t in enumerate(tasks, start=1):
    print(f"\n[{idx}/20] Envoi de la tâche : {t['id']} - {t['title'][:60]}...")
    payload = {
        "title": t["title"],
        "prompt": t["prompt"],
        "sourceContext": {
            "source": "sources/github/farinhahelder-hue/heldonica",
            "githubRepoContext": {
                "startingBranch": "main"
            }
        }
    }
    
    req = urllib.request.Request(
        "https://jules.googleapis.com/v1alpha/sessions",
        data=json.dumps(payload).encode("utf-8"),
        headers={"X-Goog-Api-Key": token, "Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            sid = data.get("name", "").split("/")[-1]
            title = data.get("title")
            url = f"https://jules.google.com/session/{sid}"
            print(f"  ✓ Session créée avec succès ! ID: {sid}")
            print(f"    Lien direct: {url}")
            created_sessions.append({
                "id": t["id"],
                "sid": sid,
                "title": t["title"],
                "url": url,
                "prompt": t["prompt"]
            })
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="ignore")[:300]
        print(f"  ✗ Erreur HTTP {e.code} : {err_msg}")
    except Exception as e:
        print(f"  ✗ Erreur : {e}")
    
    # Petit délai de politesse pour éviter tout rate-limiting d'API
    time.sleep(1.5)

print(f"\n=======================================================")
print(f"🎉 {len(created_sessions)}/20 sessions Jules lancées avec succès !")
print(f"=======================================================")

# 3. Sauvegarde du récapitulatif des sessions créées
output_file = r"C:\Users\Work\heldonica-clean\scripts\jules_competition_sessions.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(created_sessions, f, indent=2, ensure_ascii=False)
print(f"✓ Sessions enregistrées dans : {output_file}")

# 4. Génération du fichier SQL d'enregistrement dans agent_tasks
sql_lines = []
for s in created_sessions:
    task_name = s["title"].replace("'", "''")
    task_desc = f"Étude stratégique approfondie {s['id']}. Session Jules: {s['url']}\n{s['prompt'][:250]}...".replace("'", "''")
    sql_lines.append(f"('{task_name}', '{task_desc}', 'jules', 'in_progress')")

if sql_lines:
    sql_content = "INSERT INTO agent_tasks (task, description, agent, status) VALUES\n" + ",\n".join(sql_lines) + ";\n"
    sql_path = r"C:\Users\Work\heldonica-clean\scripts\register_jules_competition_tasks.sql"
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write(sql_content)
    print(f"✓ Fichier SQL généré : {sql_path}")

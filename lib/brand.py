"""lib/brand.py — miroir Python de lib/brand-voice.ts.

lib/brand-voice.ts est la source de vérité (voix éditoriale Heldonica, mots
bannis, pronoms, 7 garde-fous). Ce fichier en est la copie Python, utilisée par
les scripts Python du dépôt (génération d'articles, bot assistant, nettoyage de
contenu).

Ne pas éditer FORBIDDEN_WORDS à la main : il est généré. Après toute
modification de lib/brand-voice.ts :

    node scripts/sync-brand-voice.mjs

puis vérifier la parité :

    node scripts/check-brand-sync.mjs
"""

# BEGIN GENERATED — scripts/sync-brand-voice.mjs
FORBIDDEN_WORDS = [
    "bons plans",
    "bon plan",
    "organisation de séjour",
    "compagnie",
    "voyage organisé",
    "circuit",
    "package",
    "destinations populaires",
    "tips",
    "astuce",
    "astuces",
    "conseil voyage",
    "lieu incontournable",
    "incontournable",
    "aventure inoubliable",
    "inoubliable",
    "paradis",
    "paradisiaque",
    "coup de cœur",
    "must-have",
    "must see",
    "must-see",
    "les voyageurs",
    "les touristes",
    "solution miracle",
    "solution magique",
    "magnifique",
    "splendide",
    "incroyable",
    "spot",
    "optimiser",
    "solutions innovantes",
    "expertise reconnue",
    "meilleur partenaire",
    "plongez dans",
    "plonger dans",
    "laissez-vous transporter",
    "laissez-vous emporter",
    "au cœur de",
    "véritable havre de paix",
    "un cocon",
    "il est temps de",
    "n'attendez plus",
    "n'attends plus",
    "une expérience inoubliable vous attend",
    "préparez-vous à",
    "embarquez pour",
    "à ne pas manquer",
]
# END GENERATED

# Pronoms stricts — identiques à HELDONICA_SYSTEM_PROMPT (lib/brand-voice.ts).
PRONOMS = {
    "duo": "on",              # émetteur : toujours « on », jamais « je » ni « nous »
    "lecteur_b2c": "tu",      # lecteur B2C : tutoiement
    "pro_b2b": "vous",        # professionnel / hôtelier : vouvoiement
    "interdits": ["je", "nous", "les voyageurs", "les touristes"],
}

# Les 7 garde-fous de publication (libellés, lib/brand-voice.ts).
GARDE_FOUS = [
    "E-E-A-T concret",
    "Détail sensoriel",
    "Honnêteté totale",
    "Précision GEO",
    "Respect des pronoms",
    "Zéro mot banni",
    "CTA doux",
]

REGLE_D_OR = "On n'invente rien. On raconte ce qu'on a vécu."


def mots_bannis(texte: str) -> list[str]:
    """Mots bannis présents dans le texte, insensible à la casse."""
    bas = texte.lower()
    return [m for m in FORBIDDEN_WORDS if m.lower() in bas]

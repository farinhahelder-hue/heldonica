import re

with open("app/a-propos/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix "vous" to "tu"
content = content.replace("histoires que vous ne lirez jamais", "histoires que tu ne liras jamais")

# 2. Fix unescaped entities by replacing ' with &apos; in text nodes.
# Let's use typographically correct french apostrophes "’" for the text instead, which is safe in JSX and looks better.
text_blocks = [
    "c'est", "l'urgence", "s'est", "qu'on", "l'insulaire", "l'Atlantique",
    "d'un", "qu'on", "l'on", "s'est", "n'est", "d'une", "s'adapte", "t'écoute",
    "t'occupes", "d'IA", "l'horizon", "qu'un", "qu'à", "qu'il", "jusqu'à"
]

# We will just replace all straightforward words with apostrophes in the whole text that aren't inside attributes.
# The easiest regex for french text apostrophe is:
# match a letter, an apostrophe, and a letter.
# We must NOT replace inside `className='...'` or import strings, but our file uses double quotes or backticks for imports and attributes mostly.
# Wait, let's look at the imports and attributes:
# `import type { Metadata } from 'next'`
# `import Header from '@/components/Header'`
# `alternates: { canonical: 'https://www.heldonica.fr/a-propos' }`
# `schemaPerson = { "@context": "https://schema.org", ... }`

# Instead of regex, let's just explicitly fix the specific unescaped quotes in JSX text.
jsx_fixes = {
    "Heldonica, c'est un besoin viscéral de déconnecter.": "Heldonica, c&apos;est un besoin viscéral de déconnecter.",
    "De quitter l'urgence.": "De quitter l&apos;urgence.",
    "On s'est rencontrés": "On s&apos;est rencontrés",
    "qu'on cherchait": "qu&apos;on cherchait",
    "Lui, l'insulaire": "Lui, l&apos;insulaire",
    "l'Atlantique": "l&apos;Atlantique",
    "d'un lieu": "d&apos;un lieu",
    "Parce qu'on en a marre": "Parce qu&apos;on en a marre",
    "où l'on coche": "où l&apos;on coche",
    "d'un spot à un autre": "d&apos;un spot à un autre",
    "s'est arrêté": "s&apos;est arrêté",
    "C'est privilégier": "C&apos;est privilégier",
    "où l'on partage": "où l&apos;on partage",
    "n'est pas qu'une": "n&apos;est pas qu&apos;une",
    "c'est une": "c&apos;est une",
    "qu'on écrit": "qu&apos;on écrit",
    "pas d'IA": "pas d&apos;IA",
    "qu'on y a": "qu&apos;on y a",
    "c'est parce qu'on": "c&apos;est parce qu&apos;on",
    "qu'on te conseille": "qu&apos;on te conseille",
    "d'éviter": "d&apos;éviter",
    "qu'on s'est fait": "qu&apos;on s&apos;est fait",
    "n'est pas parfait": "n&apos;est pas parfait",
    "qu'on a transpiré": "qu&apos;on a transpiré",
    "On t'écoute": "On t&apos;écoute",
    "s'adapte": "s&apos;adapte",
    "n'as plus qu'à": "n&apos;as plus qu&apos;à",
    "t'occupes": "t&apos;occupes",
    "s'occupe": "s&apos;occupe",
    "l'horizon": "l&apos;horizon"
}

for k, v in jsx_fixes.items():
    content = content.replace(k, v)

with open("app/a-propos/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

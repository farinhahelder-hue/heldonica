"""
atelier_recit — l'interview qui pose les questions a ta place, une journee a la fois.

Le probleme que ce script resout n'est pas d'ecrire : c'est de **poser les bonnes
questions au bon grain**. L'Interview Eclair existante (lib/cms-photo-interview.ts)
pose 3 questions par photo ; avec 147 photos de Roumanie, cela fait 147 interviews.
Ici on regroupe les photos **par journee et par moment**, et on ne pose que
quelques questions sur ce que les photos ne peuvent pas dire.

Ce que le script fait, dans l'ordre :

  1. il lit `voyage.json` (produit par reconstituer_voyage.py) : les faits mesures ;
  2. il ecrit un **questionnaire** : une section par jour, une par moment, avec les
     questions ouvertes. Tu reponds dans le fichier, en vrac, en abrege ;
  3. il **tisse** tes reponses en un brouillon au format Heldonica Blocks, pret a
     coller dans le BlockCanvas du CMS.

Regle 1, tenue par construction : le script n'ecrit **que** ce qui vient de toi ou
d'une mesure. Une reponse vide ne produit **aucune phrase** — le silence reste un
silence, il n'est jamais comble par une formule de remplissage.

Usage :
    python scripts/atelier_recit.py --voyage imports/roumanie-2026/voyage.json --questions
    python scripts/atelier_recit.py --voyage imports/roumanie-2026/voyage.json --tisser
    python scripts/atelier_recit.py --voyage ... --questions --tisser   # les deux
"""

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR.parent / "lib"))

try:
    from brand import mots_bannis, PRONOMS
except ImportError:  # pragma: no cover
    print("[ERREUR] lib/brand.py introuvable — la voix de marque est la verite, on s'arrete.")
    sys.exit(1)

try:
    # Meme decoupage des moments que reconstituer_voyage.py : une seule verite.
    from reconstituer_voyage import moments_photos
except ImportError:  # pragma: no cover
    moments_photos = None

MOIS_FR = ["janvier", "fevrier", "mars", "avril", "mai", "juin",
           "juillet", "aout", "septembre", "octobre", "novembre", "decembre"]

# Les questions. Elles sont posees par MOMENT, pas par photo, et elles sont
# volontairement peu nombreuses : trois par moment, jamais plus. Une question
# dont la reponse ne peut venir que de toi, jamais de la photo.
QUESTIONS_MOMENT = [
    ("lieu", "Ou etiez-vous ? (2-4 mots : « centre de Brasov », « col de la Transfagarasan »)"),
    ("faisait", "Qu'est-ce que vous faisiez ? (une phrase, meme courte)"),
    ("sensoriel", "Un detail qui ne se voit pas sur la photo : une odeur, un son, une temperature, un gout"),
    ("pratique", "Un detail pratique : un prix en €, un temps d'attente, l'etat d'un chemin"),
    ("moins_aime", "Qu'est-ce que vous avez moins aime ? (la question honnete — elle compte autant que les autres)"),
]

QUESTIONS_JOUR = [
    ("ambiance", "L'ambiance generale de la journee, en une phrase"),
    ("deplacement", "Comment vous avez bouge (voiture, train, a pied — et combien de temps)"),
    ("budget", "Le budget reel de la journee si tu l'as en tete (hebergement, repas)"),
]


def lire_json(p: Path) -> dict:
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def nom_mois(date_iso: str) -> str:
    d = datetime.fromisoformat(date_iso)
    return f"{d.day} {MOIS_FR[d.month - 1]} {d.year}"


def duree_min(moment: dict) -> int:
    try:
        a = datetime.fromisoformat(moment["debut"])
        b = datetime.fromisoformat(moment["fin"])
        return max(0, int((b - a).total_seconds() // 60))
    except Exception:
        return 0


def moments_du_jour(j: dict) -> list[list[dict]]:
    """Les moments d'une journee, avec le meme decoupage que reconstituer_voyage.py.

    Le fichier voyage.json ne stocke pas les moments : il stocke les photos sans
    lieu, et le decoupage se recalcule. On appelle donc la fonction d'origine
    plutot que d'en ecrire une seconde — deux decoupages divergeraient.
    """
    photos = j.get("photos_sans_lieu") or []
    if not photos:
        return []
    if moments_photos is None:
        return []
    return moments_photos(photos)


def ecrire_questionnaire(voyage: dict, out: Path) -> Path:
    """Ecrit le questionnaire a remplir a la main. Une section par jour."""
    L = []
    L.append(f"# Questionnaire — {voyage.get('slug', 'voyage')}")
    L.append("")
    L.append("_Reponds en vrac, en abrege, avec des fautes. Une ligne suffit. "
             "Laisse vide ce dont tu ne te souviens pas : le silence reste un silence, "
             "je n'inventerai rien pour le combler._")
    L.append("")
    L.append(f"Photos : {voyage['resume']['photos']} — "
             f"journees : {voyage['resume']['jours']}")
    if voyage["resume"].get("lieux_nommes", 0) == 0:
        L.append("")
        L.append("> **Aucun lieu nomme** : les photos n'ont pas de GPS exploitable. "
                 "C'est la question « Ou etiez-vous ? » qui apportera les lieux.")
    L.append("")

    for j in voyage.get("jours", []):
        L.append(f"## {nom_mois(j['date'])}")
        L.append("")
        moments = moments_du_jour(j)
        if not moments:
            photos = j.get("photos_sans_lieu") or []
            L.append(f"_{len(photos)} photo(s), aucun moment detecte._")
        else:
            L.append(f"_{len(moments)} moment(s)._")
        L.append("")

        for i, m in enumerate(moments, 1):
            n = len(m)
            plage = f"{m[0]['prise_de_vue'][11:16]} -> {m[-1]['prise_de_vue'][11:16]}"
            L.append(f"### Moment {i} — {plage} ({n} photos)")
            L.append("")
            for cle, question in QUESTIONS_MOMENT:
                L.append(f"- **{question}**")
                L.append(f"  REPONSE {cle} :")
            L.append("")

        L.append("### La journee")
        L.append("")
        for cle, question in QUESTIONS_JOUR:
            L.append(f"- **{question}**")
            L.append(f"  REPONSE {cle} :")
        L.append("")
        L.append("---")
        L.append("")

    out.write_text("\n".join(L), encoding="utf-8")
    return out


def lire_reponses(texte: str) -> dict:
    """Relit le questionnaire rempli. Ne devine rien : une ligne vide reste vide."""
    reponses = {}
    jour = moment = None
    for ligne in texte.splitlines():
        s = ligne.strip()
        if s.startswith("## ") and not s.startswith("### "):
            jour = s[3:].strip()
            reponses[jour] = {"journee": {}, "moments": []}
            moment = None
        elif s.startswith("### Moment"):
            moment = {}
            if jour is not None:
                reponses[jour]["moments"].append(moment)
        elif s.startswith("REPONSE ") and ":" in s:
            cle, _, valeur = s.partition(":")
            cle = cle.replace("REPONSE", "").strip()
            valeur = valeur.strip()
            if valeur:
                cible = moment if moment is not None else (
                    reponses[jour]["journee"] if jour is not None else None)
                if cible is not None:
                    cible[cle] = valeur
    return reponses


PRONOMS_DUO = ("on ", "nous ", "j'", "je ")

# Connecteurs qui restent orphelins quand le mot banni qui les suivait disparait
# (« magnifique mais bruyant » -> « mais bruyant »).
CONNECTEURS = ("mais", "et", "ou", "car", "donc", "puis")


def sans_pronom(t: str) -> str:
    """Retire le pronom de duo en tete, pour ne pas ecrire « on on cherchait »."""
    b = t.strip()
    bas = b.lower()
    for p in PRONOMS_DUO:
        if bas.startswith(p):
            return b[len(p):].strip()
    return b


def majuscule(t: str) -> str:
    return (t[:1].upper() + t[1:]) if t else t


def ponctuer(t: str) -> str:
    t = t.strip()
    if not t:
        return t
    return t if t.endswith((".", "!", "?")) else t + "."


def nettoyer(texte: str) -> tuple[str, list[str]]:
    """Retire les mots bannis. Renvoie le texte nettoye et ceux qui ont ete trouves."""
    trouves = mots_bannis(texte)
    propre = texte
    for mot in trouves:
        propre = re.sub(rf"\b{re.escape(mot)}\b", "", propre, flags=re.IGNORECASE)
    propre = re.sub(r"\s{2,}", " ", propre).strip()
    propre = re.sub(r"\s+([.,;!?])", r"\1", propre)
    # Un connecteur ne peut pas rester seul en tete ni avant une ponctuation.
    for c in CONNECTEURS:
        propre = re.sub(rf"^\s*{c}\s+", "", propre, flags=re.IGNORECASE)
        propre = re.sub(rf",\s*{c}\s*([.,;!?])", r"\1", propre, flags=re.IGNORECASE)
        propre = re.sub(rf"\s+{c}\s*([.,;!?])", r"\1", propre, flags=re.IGNORECASE)
    return propre.strip(), trouves


def tisser(voyage: dict, reponses: dict) -> tuple[str, list[dict], list[str]]:
    """Tisse les reponses en brouillon. Retourne (markdown, blocs, alertes).

    Aucune phrase n'est ecrite sans une reponse. Un moment sans reponse n'apparait
    pas dans le recit — il apparait dans les alertes, pour que tu saches ce qui
    reste a completer.
    """
    blocs = []
    alertes = []
    L = []
    slug = voyage.get("slug", "voyage")
    L.append(f"# {slug.replace('-', ' ').title()}")
    L.append("")
    L.append("> Brouillon tisse depuis tes reponses et les faits mesures. "
             "Rien n'a ete invente : chaque phrase vient d'une reponse de toi.")
    L.append("")

    for j in voyage.get("jours", []):
        date_iso = j["date"]
        titre_jour = nom_mois(date_iso)
        bloc_jour = reponses.get(titre_jour)
        if not bloc_jour:
            continue

        moments_ecrits = []
        for i, m in enumerate(moments_du_jour(j)):
            rep = (bloc_jour.get("moments") or [{}])[i] if i < len(bloc_jour.get("moments") or []) else {}
            if not rep.get("faisait") and not rep.get("sensoriel") and not rep.get("lieu"):
                alertes.append(f"{titre_jour} / moment {i + 1} : aucune reponse, moment non ecrit")
                continue

            phrases = []
            lieu = rep.get("lieu")
            faisait = sans_pronom(rep.get("faisait") or "")
            if lieu and faisait:
                phrases.append(f"A {lieu}, on {faisait}.")
            elif lieu:
                phrases.append(f"On s'est arretes a {lieu}.")
            elif faisait:
                phrases.append(f"On {faisait}.")

            for cle in ("sensoriel", "pratique"):
                if rep.get(cle):
                    phrases.append(majuscule(ponctuer(rep[cle])))

            if not phrases:
                continue

            paragraphe, trouves = nettoyer(" ".join(phrases))
            if trouves:
                alertes.append(f"{titre_jour} / moment {i + 1} : mots bannis retires -> {trouves}")

            moments_ecrits.append(paragraphe)
            blocs.append({"type": "text", "data": {"content": f"<p>{paragraphe}</p>"}})

            if rep.get("moins_aime"):
                note, trouves = nettoyer(rep["moins_aime"])
                if trouves:
                    alertes.append(f"{titre_jour} / moment {i + 1} (moins aime) : mots bannis retires -> {trouves}")
                blocs.append({"type": "text",
                              "data": {"content": f"<p><em>Ce qu'on a moins aime : {note}</em></p>"}})

        if not moments_ecrits:
            continue

        L.append(f"## {titre_jour}")
        L.append("")
        for p in moments_ecrits:
            L.append(p)
            L.append("")

        journee = bloc_jour.get("journee") or {}
        if journee.get("ambiance"):
            amb, _ = nettoyer(journee["ambiance"])
            L.append(amb if amb.endswith(".") else amb + ".")
            L.append("")

        pratiques = []
        if journee.get("deplacement"):
            d, _ = nettoyer(journee["deplacement"])
            pratiques.append(f"- **Deplacement** : {d}")
        if journee.get("budget"):
            b, _ = nettoyer(journee["budget"])
            pratiques.append(f"- **Budget** : {b}")
        if pratiques:
            L.append("### Reperes pratiques")
            L.extend(pratiques)
            L.append("")

    if not blocs:
        alertes.append("Aucune reponse exploitable : le questionnaire n'a pas encore ete rempli.")

    L.append("<!-- heldonica:blocks " + json.dumps(blocs, ensure_ascii=False) + " -->")
    return "\n".join(L), blocs, alertes


def main():
    p = argparse.ArgumentParser(description="Atelier recit : questions ciblees puis tissage.")
    p.add_argument("--voyage", required=True, help="voyage.json produit par reconstituer_voyage.py")
    p.add_argument("--questions", action="store_true", help="ecrire le questionnaire")
    p.add_argument("--tisser", action="store_true", help="tisser les reponses en brouillon")
    p.add_argument("--out", help="dossier de sortie (defaut : a cote de voyage.json)")
    args = p.parse_args()

    src = Path(args.voyage)
    if not src.exists():
        print(f"[ERREUR] {src} introuvable. Lance d'abord reconstituer_voyage.py.")
        return 1

    voyage = lire_json(src)
    out_dir = Path(args.out) if args.out else src.parent
    out_dir.mkdir(parents=True, exist_ok=True)

    if not args.questions and not args.tisser:
        args.questions = args.tisser = True

    if args.questions:
        q = ecrire_questionnaire(voyage, out_dir / "questions.md")
        print(f"[OK] Questionnaire ecrit : {q}")
        print("     Remplis les lignes « REPONSE ... », puis relance avec --tisser.")

    if args.tisser:
        qf = out_dir / "questions.md"
        if not qf.exists():
            print(f"[ERREUR] {qf} introuvable : ecris d'abord le questionnaire (--questions).")
            return 1
        reponses = lire_reponses(qf.read_text(encoding="utf-8"))
        md, blocs, alertes = tisser(voyage, reponses)
        dest = out_dir / "brouillon.md"
        dest.write_text(md, encoding="utf-8")
        print(f"[OK] Brouillon : {dest}  ({len(blocs)} bloc(s) Heldonica)")
        if alertes:
            print(f"[ATTENTION] {len(alertes)} point(s) a savoir :")
            for a in alertes:
                print(f"     - {a}")
        print("     Rien n'a ete publie. A relire, puis a coller dans le BlockCanvas du CMS.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

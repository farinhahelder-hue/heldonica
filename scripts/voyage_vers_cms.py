"""
voyage_vers_cms — pousse un voyage reconstitue (voyage.json) en brouillon CMS.

Chainon manquant entre scripts/reconstituer_voyage.py (les faits mesures :
Timeline + EXIF -> voyage.json + voyage.md) et le CMS : sans lui, la
reconstitution restait un fichier local que personne ne rouvrait.

Principe (regle 1, comme reconstituer_voyage.py) : seuls les faits mesures
entrent dans le brouillon — jours, lieux nommes ou « a nommer (lat, lon) »,
distances, photos. Ressenti, prix, anecdotes : balises [A TOI], a l'auteur.
Le brouillon est TOUJOURS non publie (published=false, status='draft') et
porte sa provenance (auto_generated, source, source_metadata).

Securites :
  - dry-run par defaut : sans --go, affiche seulement ce qui serait cree.
  - jamais d'ecrasement d'un article publie : si le slug existe en
    published=true, on refuse et on s'arrete.
  - cles lues dans .env.local puis .env, jamais en dur (regle 3).

Usage :
  python scripts/voyage_vers_cms.py --voyage imports/madere-2024/voyage.json --destination Madere
  python scripts/voyage_vers_cms.py --slug madere-2024 --destination Madere --go
"""

import argparse
import json
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

try:  # Console Windows (cp1252) : ne pas planter sur « » → et accents.
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass


def lire_env_local():
    env = {}
    for nom in (".env.local", ".env"):
        f = Path(nom)
        if not f.exists():
            continue
        for ligne in f.read_text(encoding="utf-8").splitlines():
            ligne = ligne.strip()
            if not ligne or ligne.startswith("#") or "=" not in ligne:
                continue
            k, v = ligne.split("=", 1)
            env.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    return env


def requete(method, chemin, payload=None):
    env = lire_env_local()
    url, cle = env.get("NEXT_PUBLIC_SUPABASE_URL"), env.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not cle:
        raise ValueError("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY manquent dans .env.local")
    req = urllib.request.Request(
        f"{url}/rest/v1/{chemin}",
        data=json.dumps(payload).encode("utf-8") if payload is not None else None,
        headers={"apikey": cle, "Authorization": f"Bearer {cle}",
                 "Content-Type": "application/json", "Prefer": "return=representation"},
        method=method,
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def etiquette_lieu(l):
    if l.get("nom"):
        src = l.get("nom_source") or "timeline"
        return f"{l['nom']} (nom : {src})"
    return f"lieu à nommer ({l['lat']}, {l['lon']})"


def construire_contenu(voyage):
    L = []
    r = voyage["resume"]
    L.append(f"<!-- Brouillon auto-généré depuis {voyage['source'].get('format')} "
             f"le {voyage.get('genere_le', '?')} — faits mesurés uniquement. -->")
    L.append("")
    L.append(f"## L'itinéraire mesuré : {r['jours']} jour(s), {r['distance_km_total']} km, {r['photos']} photo(s)")
    L.append("")
    for n, j in enumerate(voyage["jours"], 1):
        d = datetime.fromisoformat(j["date"])
        L.append(f"### Jour {n} — {d.day:02d}/{d.month:02d}/{d.year}")
        faits = []
        if j.get("distance_km") is not None:
            faits.append(f"{j['distance_km']} km")
        if j.get("marche_km"):
            faits.append(f"dont {j['marche_km']} km à pied")
        nb_photos = sum(len(x["photos"]) for x in j["lieux"]) + len(j["photos_sans_lieu"])
        faits.append(f"{nb_photos} photo(s)")
        if faits:
            L.append(f"*{ ' · '.join(faits) }*")
            L.append("")
        if not j["lieux"]:
            L.append("- (aucun arrêt détecté ce jour-là)")
        for lieu in j["lieux"]:
            h0, h1 = lieu["arrivee"][11:16], lieu["depart"][11:16]
            L.append(f"- **{h0} → {h1}** — {etiquette_lieu(lieu)}")
            for ph in lieu["photos"]:
                heure_prise = (ph.get("prise_de_vue") or "")[11:16] or "?"
                ratt = ph.get("rattachement") or "?"
                L.append(f"  - photo `{ph['fichier']}` ({heure_prise}, {ratt}) — [photo à téléverser]")
            L.append("  - [A TOI : ce qu'on a vu, entendu, goûté ici — et ce qu'on a moins aimé]")
        if j.get("trajets"):
            L.append("")
            L.append("Trajets : " + " · ".join(
                f"{t['debut'][11:16]} {t['mode']} {t['distance_km']} km" for t in j["trajets"]))
        if j.get("photos_sans_lieu"):
            L.append("")
            L.append("Photos sans lieu rattaché : "
                     + ", ".join(f"`{p['fichier']}`" for p in j["photos_sans_lieu"]))
        L.append("")
    L.append("## Infos pratiques (à compléter sur place)")
    L.append("")
    L.append("- **Accès** : [A TOI : comment on est arrivé, état de la route, parking]")
    L.append("- **Budget réel** : [A TOI : café, ticket, hébergement — montants constatés]")
    L.append("- **Verdict** : [A TOI : on y retourne ? pour qui ?]")
    return "\n".join(L)


def main():
    p = argparse.ArgumentParser(description="Pousser un voyage.json en brouillon CMS")
    p.add_argument("--voyage", help="Chemin de voyage.json")
    p.add_argument("--slug", help="Nom du voyage (lit imports/<slug>/voyage.json)")
    p.add_argument("--destination", default="", help="Destination (ex. Madere, défaut : slug)")
    p.add_argument("--titre", help="Titre du brouillon (défaut : Carnet : <Destination> — <dates>)")
    p.add_argument("--go", action="store_true", help="Écrire vraiment dans le CMS (sinon dry-run)")
    args = p.parse_args()

    chemin = Path(args.voyage) if args.voyage else (Path(f"imports/{args.slug}/voyage.json") if args.slug else None)
    if not chemin or not chemin.exists():
        print(f"[ERREUR] voyage.json introuvable : {chemin} "
              f"(produis-le d'abord avec scripts/reconstituer_voyage.py)")
        sys.exit(1)
    voyage = json.loads(chemin.read_text(encoding="utf-8"))
    if not voyage.get("jours"):
        print("[ERREUR] voyage.json sans jours — rien à pousser.")
        sys.exit(1)

    r = voyage["resume"]
    destination = args.destination or voyage.get("slug", "lieu")
    slug = f"carnet-{voyage.get('slug', 'voyage')}"
    titre = args.titre or (f"Carnet : {destination} — {r['premier_jour']} → {r['dernier_jour']}")
    extrait = (f"{r['jours']} jour(s), {r['lieux']} lieu(x), {r['distance_km_total']} km, "
               f"{r['photos']} photo(s) — récit à compléter ([A TOI]).")
    payload = {
        "title": titre,
        "slug": slug,
        "excerpt": extrait,
        "content": construire_contenu(voyage),
        "category": "Carnets Voyage",
        "tags": ["slow travel", destination.lower()],
        "author": "Heldonica",
        "published": False,
        "status": "draft",
        "voice_notes": (f"Destination: {destination}\nVisite mesurée : {r['premier_jour']} → {r['dernier_jour']} "
                        f"(Timeline/EXIF, {r['lieux_nommes']}/{r['lieux']} lieux nommés)"),
        "auto_generated": True,
        # Pas de colonne "source" : elle porte un CHECK (allowlist) qui
        # rejette les valeurs libres. Provenance dans source_metadata.
        "source_metadata": {"generateur": "scripts/voyage_vers_cms.py",
                            "voyage_slug": voyage.get("slug"), "resume": r,
                            "genere_le": voyage.get("genere_le")},
    }

    existants = requete("GET", f"cms_blog_posts?select=id,published,slug&slug=eq.{slug}")
    if existants and existants[0].get("published"):
        print(f"[REFUS] {slug} existe déjà en PUBLIÉ — on ne touche jamais à un publié. "
              f"Choisis un autre slug (--titre ne change pas le slug, renomme le voyage).")
        sys.exit(2)

    if not args.go:
        print(f"[DRY-RUN] Brouillon prêt : « {titre} » ({slug})")
        print(f"         {r['jours']} jours, {len(payload['content'])} caractères, "
              f"{payload['content'].count('[A TOI')} balise(s) [A TOI]. Relance avec --go pour écrire.")
        return

    if existants:
        resultat = requete("PATCH", f"cms_blog_posts?slug=eq.{slug}", {**payload, "updated_at": datetime.now(timezone.utc).isoformat()})
        print(f"[OK] Brouillon mis à jour : id={resultat[0]['id']} slug={slug} (resté non publié)")
    else:
        resultat = requete("POST", "cms_blog_posts", payload)
        print(f"[OK] Brouillon créé : id={resultat[0]['id']} slug={slug} — à relire dans /panel-manager (Articles).")


if __name__ == "__main__":
    main()

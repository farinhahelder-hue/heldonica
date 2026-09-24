#!/usr/bin/env python3
"""
clean_salvaged_markdown.py
Heldonica — Nettoyage sémantique et structural des articles salvagés

Usage :
    python scripts/clean_salvaged_markdown.py

Ce script parcourt content/salvaged/*.md et :
  1. Remplace les termes interdits (bons plans → pépites dénichées, etc.)
  2. Convertit les tags style Python ['a', 'b'] en YAML valide [a, b]
  3. Supprime les artefacts 'n' parasites en début de ligne dans le body HTML
  4. Injecte un excerpt propre si absent (extrait du premier <p>)
  5. Corrige le frontmatter source pour enlever les méta techniques
  6. Réécrit le fichier en UTF-8 propre
"""

import sys
import os
import re
import glob

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# ── Chemins ────────────────────────────────────────────────────────────────
SALVAGE_DIR = os.path.join(
    os.path.dirname(__file__), '..', 'content', 'salvaged'
)

# ── Termes interdits → remplacements ───────────────────────────────────────
FORBIDDEN_TERMS = [
    (r'bons[- ]plans', 'pépites dénichées'),
    (r'organisation de séjour', 'conception sur mesure'),
    (r'organisez votre séjour', 'concevez votre voyage sur mesure'),
    (r'organiser votre séjour', 'concevoir votre voyage sur mesure'),
    (r'organiser son séjour', 'concevoir son voyage sur mesure'),
]

# ── Mapping catégories WP → Heldonica ──────────────────────────────────────
CATEGORY_MAP = {
    'destinations': 'Carnets Voyage',
    'destination': 'Carnets Voyage',
    'europe': 'Carnets Voyage',
    'suisse': 'Carnets Voyage',
    'portugal': 'Carnets Voyage',
    'roumanie': 'Carnets Voyage',
    'travel': 'Carnets Voyage',
    'guides pratiques': 'Guides Pratiques',
    'guide pratique': 'Guides Pratiques',
    'slow travel': 'Guides Pratiques',
    'checklist': 'Guides Pratiques',
    'food & lifestyle': 'Food & Lifestyle',
    'food lifestyle': 'Food & Lifestyle',
    'recettes': 'Food & Lifestyle',
    'découvertes locales': 'Découvertes Locales',
    'decouvertes locales': 'Découvertes Locales',
    'paris': 'Découvertes Locales',
}

def clean_forbidden(text):
    """Remplace les termes interdits dans tout le texte."""
    for pattern, replacement in FORBIDDEN_TERMS:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    return text

def fix_python_tags(tags_str):
    """
    Convertit "['tag1', 'tag2', 'tag3']" en YAML valide :
    ["tag1", "tag2", "tag3"]
    """
    if not tags_str:
        return '[]'
    # Déjà un tableau YAML propre ?
    if tags_str.strip().startswith('[') and '"' in tags_str:
        return tags_str
    # Parser le style Python
    inner = tags_str.strip()
    if inner.startswith('['):
        inner = inner[1:]
    if inner.endswith(']'):
        inner = inner[:-1]
    tags = [t.strip().strip("'\"") for t in inner.split(',') if t.strip()]
    if not tags:
        return '[]'
    formatted = ', '.join(f'"{t}"' for t in tags)
    return f'[{formatted}]'

def fix_python_tags_in_line(line):
    """Applique fix_python_tags sur la valeur de la ligne tags:"""
    match = re.match(r'^(tags:\s*)(.*)', line, re.DOTALL)
    if not match:
        return line
    prefix, value = match.group(1), match.group(2)
    return prefix + fix_python_tags(value.strip())

def clean_body_html(body):
    """
    Nettoie le body HTML :
    - Supprime les commentaires Gutenberg
    - Corrige les 'n' parasites (artefacts de l'extraction SQL)
    - Normalise les sauts de ligne
    """
    # Supprimer commentaires Gutenberg
    body = re.sub(r'<!--\s*/?\s*wp:[^>]*-->', '', body)
    # Supprimer les 'n' en début de ligne (artefact dump SQL)
    body = re.sub(r'^n(<)', r'\1', body, flags=re.MULTILINE)
    body = re.sub(r'\nn(<)', r'\n\1', body)
    # Normaliser les sauts de ligne
    body = re.sub(r'\n{3,}', '\n\n', body)
    return body.strip()

def extract_excerpt(html_body, max_len=300):
    """Extrait le premier paragraphe HTML comme excerpt."""
    match = re.search(r'<p[^>]*>([\s\S]*?)</p>', html_body, re.IGNORECASE)
    if not match:
        return ''
    text = re.sub(r'<[^>]+>', '', match.group(1)).strip()
    if len(text) > max_len:
        # Couper proprement sur un espace
        cut = text[:max_len].rsplit(' ', 1)[0]
        return cut + '…'
    return text

def parse_frontmatter(content):
    """
    Sépare le frontmatter YAML du body.
    Retourne (fm_lines, body_text).
    """
    if not content.startswith('---'):
        return [], content

    lines = content.split('\n')
    end_idx = None
    for i, line in enumerate(lines[1:], start=1):
        if line.strip() == '---':
            end_idx = i
            break

    if end_idx is None:
        return [], content

    fm_lines = lines[1:end_idx]
    body = '\n'.join(lines[end_idx + 1:])
    return fm_lines, body

def rebuild_file(fm_lines, body):
    """Reconstruit le fichier avec frontmatter YAML + body."""
    fm_block = '---\n' + '\n'.join(fm_lines) + '\n---\n\n'
    return fm_block + body + '\n'

def process_file(filepath):
    """Traite un fichier Markdown salvagé."""
    filename = os.path.basename(filepath)

    with open(filepath, 'r', encoding='utf-8') as f:
        raw = f.read()

    fm_lines, body = parse_frontmatter(raw)

    if not fm_lines:
        print(f'  ⚠️  Pas de frontmatter valide : {filename}')
        return False

    # ── Traitement du frontmatter ─────────────────────────────────────────

    new_fm_lines = []
    has_excerpt = False
    current_excerpt = ''

    for line in fm_lines:
        # Corriger les tags Python
        if line.startswith('tags:'):
            line = fix_python_tags_in_line(line)

        # Normaliser la catégorie
        if line.startswith('category:'):
            match = re.match(r'category:\s*"?([^"]+)"?', line)
            if match:
                raw_cat = match.group(1).strip().lower()
                mapped = CATEGORY_MAP.get(raw_cat)
                if mapped:
                    line = f'category: "{mapped}"'

        # Supprimer la ligne source (méta technique)
        if line.startswith('source:'):
            continue

        # Détecter un excerpt existant non vide
        if line.startswith('excerpt:'):
            match = re.match(r'excerpt:\s*"?([^"]*)"?', line)
            if match:
                current_excerpt = match.group(1).strip()
                has_excerpt = bool(current_excerpt)
            new_fm_lines.append(line)
            continue

        # Appliquer les remplacements sur les champs SEO
        line = clean_forbidden(line)

        new_fm_lines.append(line)

    # ── Traitement du body ────────────────────────────────────────────────
    body = clean_body_html(body)
    body = clean_forbidden(body)

    # Injecter excerpt si absent ou vide
    if not has_excerpt and body:
        excerpt = extract_excerpt(body)
        if excerpt:
            # Trouver la position de la ligne excerpt dans fm et la mettre à jour
            for i, line in enumerate(new_fm_lines):
                if line.startswith('excerpt:'):
                    new_fm_lines[i] = f'excerpt: "{excerpt}"'
                    has_excerpt = True
                    break
            if not has_excerpt:
                # Ajouter après slug
                for i, line in enumerate(new_fm_lines):
                    if line.startswith('slug:'):
                        new_fm_lines.insert(i + 1, f'excerpt: "{excerpt}"')
                        break

    # ── Réécriture ────────────────────────────────────────────────────────
    output = rebuild_file(new_fm_lines, body)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(output)

    return True

def main():
    if not os.path.isdir(SALVAGE_DIR):
        print(f'❌ Dossier introuvable : {SALVAGE_DIR}')
        sys.exit(1)

    files = sorted(glob.glob(os.path.join(SALVAGE_DIR, '*.md')))
    print(f'\n🔧 Nettoyage de {len(files)} fichiers dans content/salvaged/\n')

    ok, skipped, errors = [], [], []

    for filepath in files:
        filename = os.path.basename(filepath)
        print(f'  → {filename}')
        try:
            success = process_file(filepath)
            if success:
                ok.append(filename)
            else:
                skipped.append(filename)
        except Exception as e:
            print(f'    ❌ Erreur : {e}')
            errors.append((filename, str(e)))

    print(f'\n══════════════════════════════════════════')
    print(f'  RAPPORT NETTOYAGE')
    print(f'══════════════════════════════════════════')
    print(f'  ✅ Nettoyés  : {len(ok)}')
    print(f'  ⏩ Ignorés   : {len(skipped)}')
    print(f'  ❌ Erreurs   : {len(errors)}')
    if errors:
        for f, e in errors:
            print(f'    – {f} : {e}')
    print()

if __name__ == '__main__':
    main()

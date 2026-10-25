#!/bin/sh
# Fonctions communes aux hooks : à qui appartient une branche ?
#
# Les agents partagent un même dossier de travail. Quand l'un change de branche,
# tous les autres s'y retrouvent sans le savoir : le 19/10/2026, un commit de
# Claude a atterri sur la branche d'OpenCode puis a été poussé sur la sienne.
# Ces hooks s'appliquent aux agents seulement : ils se présentent par la
# variable AGENT_NAME (la même que celle des outils MCP du registre). Sans elle,
# rien n'est contrôlé — le fondateur travaille comme il veut.

# Nom de l'agent courant, en minuscules ; vide si AGENT_NAME n'est pas posée.
agent_courant() {
  printf '%s' "${AGENT_NAME:-}" | tr 'A-Z' 'a-z'
}

# Propriétaire d'une branche d'après son nom : agent/<nom>/<slug>, ou l'ancien
# préfixe <nom>/<slug>. Vide pour main et les branches sans propriétaire connu.
proprietaire() {
  case "$1" in
    agent/*/*) reste=${1#agent/}; printf '%s' "${reste%%/*}" ;;
    claude/*|gemini/*|opencode/*|jules/*|openhands/*) printf '%s' "${1%%/*}" ;;
  esac
}

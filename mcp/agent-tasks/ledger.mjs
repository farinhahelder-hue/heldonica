/**
 * Pont MCP vers le journal d'actions.
 *
 * Le serveur MCP tourne en enfant du client, dans `mcp/agent-tasks/` : il ne
 * peut pas importer le TypeScript de `lib/`. Ce fichier pointe donc vers le
 * noyau `.mjs` partage par le CLI et les hooks — un seul `redact()`, un seul
 * format de ligne, quel que soit l'emetteur.
 */

export { journaliser, redact } from '../../scripts/lib/agent-journal-core.mjs';

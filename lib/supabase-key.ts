/**
 * Résolution de la clé Supabase côté client.
 *
 * Supabase a remplacé les clés legacy (anon/service_role JWT) par les clés
 * « publishable » (`sb_publishable_…`) et « secret » (`sb_secret_…`), et peut
 * désactiver les anciennes (voir l'erreur 401 « Legacy API keys are disabled »).
 *
 * On lit donc d'abord la clé publishable, puis on retombe sur l'anon key
 * historique pour les environnements pas encore migrés.
 */
export function getSupabaseClientKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  );
}

export function isSupabaseClientConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && getSupabaseClientKey()
  );
}
import { NextRequest, NextResponse } from 'next/server';
import { verifyApiToken, CmsTokenScope } from '@/lib/cms-tokens';
import { supabase } from '@/lib/supabase-client';
import { logCmsAudit } from '@/lib/cms-audit';
import { createAccommodation } from '@/lib/cms-hospitality';

export const dynamic = 'force-dynamic';

/**
 * Heldonica CMS — Endpoint MCP Standard (Model Context Protocol over HTTP)
 *
 * Permet aux agents IA (Claude Desktop, Cursor, OpenCode, Perplexity, Gemini)
 * de dialoguer directement avec le CMS via le protocole standardisé JSON-RPC 2.0.
 *
 * Sécurité & Règle AGENTS.md :
 * - Authentification stricte par Bearer Token à scopes (`cms_api_tokens`).
 * - Zéro action non loggée dans l'audit.
 * - Aucune invention de données (les agents créent uniquement des brouillons `draft`
 *   ou soumettent pour relecture `waiting_review`).
 */

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, any>;
}

function jsonRpcSuccess(id: string | number | null | undefined, result: any) {
  return NextResponse.json({
    jsonrpc: '2.0',
    id: id ?? null,
    result,
  });
}

function jsonRpcError(id: string | number | null | undefined, code: number, message: string, data?: any) {
  return NextResponse.json(
    {
      jsonrpc: '2.0',
      id: id ?? null,
      error: { code, message, data },
    },
    { status: code === -32001 ? 401 : code === -32003 ? 403 : 400 }
  );
}

// Définition des outils exposés par le CMS Heldonica
const MCP_TOOLS = [
  {
    name: 'cms_list_content',
    description: 'Lister les contenus Heldonica (articles, destinations, hébergements) avec filtres de statut.',
    inputSchema: {
      type: 'object',
      properties: {
        collection: {
          type: 'string',
          enum: ['articles', 'destinations', 'accommodations'],
          description: 'Collection à interroger.',
        },
        status: {
          type: 'string',
          description: 'Filtre de statut : "published", "draft", "waiting_review", ou "all".',
        },
        limit: {
          type: 'number',
          description: 'Nombre maximum de résultats (défaut : 20, max : 100).',
        },
      },
      required: ['collection'],
    },
    scope: 'read:content' as CmsTokenScope,
  },
  {
    name: 'cms_get_content',
    description: 'Consulter un document spécifique avec l’intégralité de ses champs par son slug ou son ID.',
    inputSchema: {
      type: 'object',
      properties: {
        collection: {
          type: 'string',
          enum: ['articles', 'destinations', 'accommodations'],
          description: 'Collection ciblée.',
        },
        identifier: {
          type: 'string',
          description: 'Slug ou UUID du document.',
        },
      },
      required: ['collection', 'identifier'],
    },
    scope: 'read:content' as CmsTokenScope,
  },
  {
    name: 'cms_create_draft',
    description: 'Créer un nouveau brouillon (article de blog ou hébergement) pour relecture humaine par l’équipe éditoriale.',
    inputSchema: {
      type: 'object',
      properties: {
        collection: {
          type: 'string',
          enum: ['articles', 'accommodations'],
          description: 'Collection où créer le brouillon.',
        },
        data: {
          type: 'object',
          description: 'Objet contenant les champs du document.',
        },
      },
      required: ['collection', 'data'],
    },
    scope: 'write:draft' as CmsTokenScope,
  },
  {
    name: 'cms_audit_trail',
    description: 'Consulter les dernières entrées du journal d’audit (qui a modifié quoi et quand).',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Nombre d’entrées d’audit à récupérer (max: 50).',
        },
      },
    },
    scope: 'read:content' as CmsTokenScope,
  },
];

/**
 * GET /api/mcp : Découverte et contrôle d'état
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'online',
    server: 'heldonica-cms-mcp',
    version: '1.0.0',
    protocolVersion: '2024-11-05',
    transport: 'HTTP JSON-RPC 2.0',
    auth: 'Bearer <token_with_scopes>',
    availableTools: MCP_TOOLS.map((t) => ({ name: t.name, description: t.description, requiredScope: t.scope })),
  });
}

/**
 * POST /api/mcp : Traitement des messages JSON-RPC 2.0
 */
export async function POST(req: NextRequest) {
  let body: JsonRpcRequest;
  try {
    body = await req.json();
  } catch {
    return jsonRpcError(null, -32700, 'Parse error: JSON invalide.');
  }

  const { id, method, params } = body;

  // 1. Initialisation MCP (sans auth obligatoire pour le handshake standard)
  if (method === 'initialize') {
    return jsonRpcSuccess(id, {
      protocolVersion: '2024-11-05',
      serverInfo: {
        name: 'heldonica-cms-mcp',
        version: '1.0.0',
      },
      capabilities: {
        tools: {},
      },
    });
  }

  if (method === 'notifications/initialized') {
    return jsonRpcSuccess(id, {});
  }

  if (method === 'ping') {
    return jsonRpcSuccess(id, {});
  }

  // 2. Vérification de l'authentification par token à scopes
  const authHeader = req.headers.get('authorization') || req.headers.get('x-api-key');
  const authVerification = await verifyApiToken(authHeader);

  if (!authVerification.valid || !authVerification.token) {
    return jsonRpcError(
      id,
      -32001,
      `Non autorisé : ${authVerification.error || 'Bearer token invalide ou absent.'}`
    );
  }

  const token = authVerification.token;

  // 3. Outils disponibles (tools/list)
  if (method === 'tools/list') {
    return jsonRpcSuccess(id, {
      tools: MCP_TOOLS.map(({ name, description, inputSchema }) => ({
        name,
        description,
        inputSchema,
      })),
    });
  }

  // 4. Exécution d'un outil (tools/call)
  if (method === 'tools/call') {
    const toolName = params?.name;
    const args = params?.arguments || {};

    const toolDef = MCP_TOOLS.find((t) => t.name === toolName);
    if (!toolDef) {
      return jsonRpcError(id, -32601, `Outil inconnu: '${toolName}'.`);
    }

    // Vérification du scope requis pour l'outil
    const hasScope =
      token.scopes.includes('admin:*') ||
      token.scopes.includes(toolDef.scope);

    if (!hasScope) {
      return jsonRpcError(
        id,
        -32003,
        `Permission refusée : l’outil '${toolName}' requiert le scope '${toolDef.scope}'.`
      );
    }

    if (!supabase) {
      return jsonRpcError(id, -32000, 'Client Supabase indisponible côté serveur.');
    }

    try {
      // Exécution cms_list_content
      if (toolName === 'cms_list_content') {
        const { collection, status = 'all', limit = 20 } = args;
        const cappedLimit = Math.min(Math.max(1, Number(limit) || 20), 100);

        let query;
        if (collection === 'articles') {
          query = supabase
            .from('cms_blog_posts')
            .select('id, title, slug, category, published, published_at, created_at')
            .order('created_at', { ascending: false })
            .limit(cappedLimit);

          if (status === 'published') query = query.eq('published', true);
          if (status === 'draft') query = query.eq('published', false);
        } else if (collection === 'destinations') {
          query = supabase
            .from('destinations')
            .select('id, name, slug, country, is_published, created_at')
            .order('name', { ascending: true })
            .limit(cappedLimit);

          if (status === 'published') query = query.eq('is_published', true);
          if (status === 'draft') query = query.eq('is_published', false);
        } else if (collection === 'accommodations') {
          query = supabase
            .from('cms_accommodations')
            .select('id, name, slug, type, capacity, price_per_night, status, created_at')
            .order('created_at', { ascending: false })
            .limit(cappedLimit);

          if (status !== 'all') query = query.eq('status', status);
        } else {
          return jsonRpcError(id, -32602, `Collection inconnue: '${collection}'.`);
        }

        const { data, error } = await query;
        if (error) {
          return jsonRpcError(id, -32000, `Erreur Supabase: ${error.message}`);
        }

        return jsonRpcSuccess(id, {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ count: data?.length || 0, items: data || [] }, null, 2),
            },
          ],
        });
      }

      // Exécution cms_get_content
      if (toolName === 'cms_get_content') {
        const { collection, identifier } = args;
        if (!identifier) {
          return jsonRpcError(id, -32602, 'Le paramètre identifier est obligatoire.');
        }

        let table = '';
        if (collection === 'articles') table = 'cms_blog_posts';
        else if (collection === 'destinations') table = 'destinations';
        else if (collection === 'accommodations') table = 'cms_accommodations';
        else return jsonRpcError(id, -32602, `Collection inconnue: '${collection}'.`);

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
        const query = supabase.from(table).select('*');
        const filter = isUuid ? query.eq('id', identifier) : query.eq('slug', identifier);

        const { data, error } = await filter.single();
        if (error || !data) {
          return jsonRpcError(id, -32004, `Document non trouvé dans '${collection}' (${identifier}).`);
        }

        return jsonRpcSuccess(id, {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        });
      }

      // Exécution cms_create_draft
      if (toolName === 'cms_create_draft') {
        const { collection, data } = args;
        if (!data || typeof data !== 'object') {
          return jsonRpcError(id, -32602, 'Le paramètre data doit être un objet.');
        }

        const authorUser = {
          id: token.id,
          email: `agent:${token.name}`,
          role: 'editor' as const,
        };

        if (collection === 'accommodations') {
          const res = await createAccommodation(
            {
              name: data.name,
              slug: data.slug,
              type: data.type,
              status: 'draft',
              destination_slug: data.destination_slug,
              capacity: data.capacity,
              surface_m2: data.surface_m2,
              price_per_night: data.price_per_night,
              direct_booking_url: data.direct_booking_url,
              description: data.description,
              amenities: data.amenities,
              photos: data.photos,
            },
            authorUser
          );

          if (!res.success) {
            return jsonRpcError(id, -32000, `Erreur validation: ${res.errors?.join(', ')}`);
          }

          return jsonRpcSuccess(id, {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    message: 'Brouillon d’hébergement créé avec succès (statut: draft).',
                    accommodation: res.accommodation,
                  },
                  null,
                  2
                ),
              },
            ],
          });
        }

        if (collection === 'articles') {
          // Création stricte en draft (published: false)
          const newPost = {
            title: data.title,
            slug: data.slug,
            category: data.category || 'Travel',
            excerpt: data.excerpt || '',
            content: data.content || '',
            author: data.author || 'Heldonica',
            tags: Array.isArray(data.tags) ? data.tags : [],
            published: false,
            published_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { data: created, error } = await supabase
            .from('cms_blog_posts')
            .insert([newPost])
            .select()
            .single();

          if (error) {
            return jsonRpcError(id, -32000, `Erreur Supabase: ${error.message}`);
          }

          await logCmsAudit({
            user: authorUser,
            action: 'create',
            entity: 'article',
            entityId: String(created.id),
            before: null,
            after: { title: created.title, published: false },
            metadata: { source: 'mcp_agent', agent: token.name },
          });

          return jsonRpcSuccess(id, {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    message: 'Brouillon d’article créé avec succès (published: false).',
                    post: created,
                  },
                  null,
                  2
                ),
              },
            ],
          });
        }

        return jsonRpcError(id, -32602, `Création non supportée pour la collection '${collection}'.`);
      }

      // Exécution cms_audit_trail
      if (toolName === 'cms_audit_trail') {
        const limit = Math.min(Math.max(1, Number(args.limit) || 15), 50);
        const { data, error } = await supabase
          .from('cms_audit_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          return jsonRpcError(id, -32000, `Erreur Supabase: ${error.message}`);
        }

        return jsonRpcSuccess(id, {
          content: [{ type: 'text', text: JSON.stringify(data || [], null, 2) }],
        });
      }

      return jsonRpcError(id, -32601, `Méthode non implémentée: '${toolName}'.`);
    } catch (err) {
      console.error('[MCP Route] Erreur exécution outil:', err);
      return jsonRpcError(id, -32000, `Exception interne: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return jsonRpcError(id, -32601, `Méthode JSON-RPC non supportée: '${method}'.`);
}

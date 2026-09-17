'use client';

import { useCallback, useEffect, useState } from 'react';

// Un seul article à la fois, le plus prêt, avec ce que la machine sait de lui
// (voix, longueur, image, doublon) — et deux gestes : publier, ou plus tard.
// Rien ici n'est décoratif : chaque ligne vient de /api/cms/articles/a-publier.

type Entree = {
  id: number;
  title: string | null;
  slug: string | null;
  category: string | null;
  mots: number;
  minutes_lecture: number;
  image: boolean;
  meta_description: boolean;
  a_toi: number;
  score: number;
  voix_ok: boolean;
  manques: { id: string; message: string }[];
  mots_bannis: string[];
  doublon_de: string | null;
  updated_at: string | null;
};

type Props = {
  onOuvrir: (id: number) => void;
  onPublie?: () => void;
};

const CLE_PLUS_TARD = 'heldonica.file-a-publier.plus-tard';
const PLUS_TARD_H = 24;

function lirePlusTard(): Record<string, number> {
  try {
    const brut = localStorage.getItem(CLE_PLUS_TARD);
    const obj = brut ? (JSON.parse(brut) as Record<string, number>) : {};
    const limite = Date.now() - PLUS_TARD_H * 3_600_000;
    return Object.fromEntries(Object.entries(obj).filter(([, t]) => t > limite));
  } catch {
    return {};
  }
}

function ecrirePlusTard(obj: Record<string, number>) {
  try {
    localStorage.setItem(CLE_PLUS_TARD, JSON.stringify(obj));
  } catch {
    /* stockage indisponible : « plus tard » ne vaut que pour cette page */
  }
}

export default function FileAPublier({ onOuvrir, onPublie }: Props) {
  const [file, setFile] = useState<Entree[]>([]);
  const [prets, setPrets] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [plusTard, setPlusTard] = useState<Record<string, number>>({});
  const [confirmation, setConfirmation] = useState(false);
  const [publication, setPublication] = useState<'idle' | 'busy' | 'ok' | 'ko'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch('/api/cms/articles/a-publier', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setFile(json.file ?? []);
      setPrets(json.prets ?? 0);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : String(e));
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    setPlusTard(lirePlusTard());
    charger();
  }, [charger]);

  const visibles = file.filter((f) => !plusTard[String(f.id)]);
  const courant = visibles[0] ?? null;

  const reporter = () => {
    if (!courant) return;
    const suivant = { ...plusTard, [String(courant.id)]: Date.now() };
    setPlusTard(suivant);
    ecrirePlusTard(suivant);
    setConfirmation(false);
    setMessage(null);
  };

  const publier = async () => {
    if (!courant) return;
    setPublication('busy');
    setMessage(null);
    try {
      // Le PUT recalcule read_time depuis body.content : on envoie l'article
      // tel qu'il est, comme l'éditeur, pas seulement un statut.
      const lecture = await fetch(`/api/cms/articles/${courant.id}`, { credentials: 'include' });
      const article = await lecture.json();
      if (!lecture.ok) throw new Error(article.error || `HTTP ${lecture.status}`);
      const res = await fetch(`/api/cms/articles/${courant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: article.excerpt,
          category: article.category,
          tags: article.tags,
          featured_image: article.featured_image,
          status: 'published',
          published: true,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setPublication('ok');
      setMessage(`« ${courant.title} » est en ligne.`);
      setConfirmation(false);
      onPublie?.();
      await charger();
      setTimeout(() => setPublication('idle'), 3000);
    } catch (e) {
      setPublication('ko');
      setMessage(`Pas publié : ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  if (chargement) {
    return <div className="rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-400">On regarde ce qui est prêt…</div>;
  }
  if (erreur) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        La file ne se charge pas : {erreur}
      </div>
    );
  }
  if (!courant) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="font-semibold text-gray-900">
          {file.length === 0 ? 'Rien à publier : tout est en ligne.' : 'Rien pour aujourd’hui.'}
        </div>
        {file.length > 0 && (
          <div className="mt-1 text-sm text-gray-500">
            {file.length} brouillon{file.length > 1 ? 's' : ''} reporté{file.length > 1 ? 's' : ''} à plus tard — ils reviendront demain.
          </div>
        )}
        {message && <div className="mt-3 text-sm text-emerald-700">{message}</div>}
      </div>
    );
  }

  const pret = courant.voix_ok && courant.a_toi === 0 && !courant.doublon_de;

  return (
    <div className={`rounded-2xl border p-5 ${pret ? 'border-teal/40 bg-teal/5' : 'border-amber-200 bg-amber-50/40'}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-xs uppercase tracking-wide text-gray-500">
          {pret ? 'Prêt à publier' : 'Le plus avancé — mais pas tout à fait prêt'}
        </div>
        <div className="text-xs text-gray-500">
          {prets} prêt{prets > 1 ? 's' : ''} · {visibles.length} en attente
        </div>
      </div>

      <div className="mt-2 text-xl font-semibold text-gray-900">{courant.title || '(sans titre)'}</div>
      <div className="mt-1 text-sm text-gray-500">
        {[courant.category, `${courant.minutes_lecture} min de lecture`, courant.image ? 'photo de couverture' : 'sans photo (repli par catégorie)']
          .filter(Boolean)
          .join(' · ')}
      </div>

      <div className="mt-4 space-y-1.5 text-sm">
        <div className={courant.voix_ok ? 'text-emerald-800' : 'text-amber-900'}>
          Voix : {courant.score}/100
          {courant.mots_bannis.length > 0 && ` — mots bannis : ${courant.mots_bannis.join(', ')}`}
        </div>
        {courant.manques.map((m) => (
          <div key={m.id} className="text-gray-700">
            · {m.message}
          </div>
        ))}
        {courant.a_toi > 0 && (
          <div className="text-amber-900">
            · {courant.a_toi} balise{courant.a_toi > 1 ? 's' : ''} [À TOI] à remplir
          </div>
        )}
        {courant.doublon_de && (
          <div className="text-amber-900">· Même sujet qu’un article déjà publié : « {courant.doublon_de} »</div>
        )}
      </div>

      {message && (
        <div className={`mt-4 rounded-xl p-3 text-sm ${publication === 'ko' ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>
          {message}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {confirmation ? (
          <>
            <span className="text-sm text-gray-700 mr-2">Mettre en ligne maintenant ?</span>
            <button
              onClick={publier}
              disabled={publication === 'busy'}
              className="rounded-full bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {publication === 'busy' ? 'Publication…' : 'Oui, publier'}
            </button>
            <button
              onClick={() => setConfirmation(false)}
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm hover:bg-gray-50"
            >
              Non
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setConfirmation(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium text-white ${pret ? 'bg-gray-900 hover:bg-gray-700' : 'bg-gray-400 hover:bg-gray-500'}`}
            >
              Publier
            </button>
            <button
              onClick={() => onOuvrir(courant.id)}
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm hover:bg-gray-50"
            >
              Ouvrir et relire
            </button>
            <button onClick={reporter} className="rounded-full px-4 py-1.5 text-sm text-gray-500 hover:text-gray-900">
              Plus tard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

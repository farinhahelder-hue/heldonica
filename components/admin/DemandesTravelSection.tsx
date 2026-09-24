'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

// Les demandes Travel Planning, telles que la table demandes_travel les porte.
// Une seule source de vérité : les colonnes de la table (le formulaire écrit
// trip_type / vibe / destination_detail / duree_jours / mois_depart / notes).
// L'ancien TravelCRMPanel décrivait un autre objet (dates_souhaitees, message,
// statut « nouvelle_demande ») et n'était monté nulle part.

type Proposition = {
  texte: string;
  destinations: { slug: string; title: string; similarity: number | null }[];
  methode: string;
  modele: string;
  score: number;
  mots_bannis: string[];
  genere_le: string;
  par: string;
};

type Demande = {
  id: string;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  telephone: string | null;
  trip_type: string | null;
  vibe: string | null;
  destination: string | null;
  destination_detail: string | null;
  duree_jours: string | null;
  budget_fourchette: string | null;
  mois_depart: string | null;
  nb_voyageurs: number | null;
  notes: string | null;
  statut: string | null;
  notes_internes: string | null;
  proposition_ia: Proposition | null;
  created_at: string;
};

// Vocabulaire de la migration 20260709000001 (défaut de la table : 'new').
const STATUTS: { id: string; label: string; classe: string }[] = [
  { id: 'new', label: 'Nouvelle', classe: 'bg-blue-100 text-blue-800' },
  { id: 'contacted', label: 'Contactée', classe: 'bg-amber-100 text-amber-800' },
  { id: 'proposal_sent', label: 'Proposition envoyée', classe: 'bg-orange-100 text-orange-800' },
  { id: 'converted', label: 'Confirmée', classe: 'bg-emerald-100 text-emerald-800' },
  { id: 'lost', label: 'Sans suite', classe: 'bg-gray-100 text-gray-600' },
];

function statutDe(id: string | null) {
  return STATUTS.find((s) => s.id === id) ?? { id: id ?? '?', label: id ?? '—', classe: 'bg-gray-100 text-gray-600' };
}

// « Destination précise » / « Suggestions Heldonica » / « Région/continent »
// sont les cases du formulaire ; le nom réel est dans destination_detail.
function destinationLisible(d: Pick<Demande, 'destination' | 'destination_detail'>): string {
  return (d.destination_detail || '').trim() || (d.destination || '').trim() || 'destination libre';
}

function joursDepuis(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function dateCourte(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Champ({ label, valeur }: { label: string; valeur: string | number | null | undefined }) {
  if (valeur === null || valeur === undefined || valeur === '') return null;
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
      <div className="text-sm text-gray-900">{valeur}</div>
    </div>
  );
}

export default function DemandesTravelSection() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<string>('all');

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch('/api/cms/demandes-travel', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setDemandes(json.demandes ?? []);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : String(e));
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  const visibles = useMemo(
    () => (filtre === 'all' ? demandes : demandes.filter((d) => d.statut === filtre)),
    [demandes, filtre]
  );
  const selection = demandes.find((d) => d.id === selectionId) ?? null;

  const mettreAJour = (id: string, patch: Partial<Demande>) =>
    setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Demandes Travel Planning</h1>
        <div className="text-sm text-gray-500">
          {demandes.length} demande{demandes.length > 1 ? 's' : ''}
          {demandes.some((d) => d.statut === 'new') && (
            <span className="ml-2 text-blue-700">· {demandes.filter((d) => d.statut === 'new').length} à traiter</span>
          )}
        </div>
      </div>

      {erreur && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Impossible de charger les demandes : {erreur}
        </div>
      )}

      {selection ? (
        <Detail
          demande={selection}
          onRetour={() => setSelectionId(null)}
          onMaj={(patch) => mettreAJour(selection.id, patch)}
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {[{ id: 'all', label: 'Toutes' }, ...STATUTS].map((s) => (
              <button
                key={s.id}
                onClick={() => setFiltre(s.id)}
                className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                  filtre === s.id ? 'border-teal bg-teal/10 text-gray-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {chargement ? (
            <div className="text-sm text-gray-400">Chargement des demandes…</div>
          ) : visibles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              {demandes.length === 0
                ? 'Aucune demande pour le moment. Elles arrivent ici dès qu’un formulaire Travel Planning est envoyé.'
                : 'Aucune demande avec ce statut.'}
            </div>
          ) : (
            <ul className="space-y-2">
              {visibles.map((d) => {
                const s = statutDe(d.statut);
                const jours = joursDepuis(d.created_at);
                const enRetard = d.statut === 'new' && jours > 2;
                return (
                  <li key={d.id}>
                    <button
                      onClick={() => setSelectionId(d.id)}
                      className={`w-full text-left rounded-2xl border p-4 transition-colors hover:bg-gray-50 ${
                        enRetard ? 'border-red-200 bg-red-50/40' : 'border-gray-100 bg-white'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-semibold text-gray-900">
                          {d.prenom || '—'} · {destinationLisible(d)}
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.classe}`}>{s.label}</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {[d.trip_type, d.vibe, d.duree_jours, d.mois_depart].filter(Boolean).join(' · ') || 'sans précision'}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        {dateCourte(d.created_at)} · il y a {jours} j{enRetard ? ' — à traiter' : ''}
                        {d.proposition_ia ? ' · pré-itinéraire prêt' : ''}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function Detail({
  demande,
  onRetour,
  onMaj,
}: {
  demande: Demande;
  onRetour: () => void;
  onMaj: (patch: Partial<Demande>) => void;
}) {
  const [notes, setNotes] = useState(demande.notes_internes ?? '');
  const [sauvegarde, setSauvegarde] = useState<'idle' | 'busy' | 'ok' | 'ko'>('idle');
  const [generation, setGeneration] = useState<'idle' | 'busy' | 'ko'>('idle');
  const [messageIa, setMessageIa] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);

  const patch = async (corps: Record<string, unknown>) => {
    const res = await fetch('/api/cms/demandes-travel', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: demande.id, ...corps }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || `HTTP ${res.status}`);
    }
  };

  const changerStatut = async (statut: string) => {
    try {
      await patch({ statut });
      onMaj({ statut });
    } catch (e) {
      alert(`Statut non enregistré : ${e instanceof Error ? e.message : e}`);
    }
  };

  const sauverNotes = async () => {
    setSauvegarde('busy');
    try {
      await patch({ notes_internes: notes });
      onMaj({ notes_internes: notes });
      setSauvegarde('ok');
      setTimeout(() => setSauvegarde('idle'), 2000);
    } catch {
      setSauvegarde('ko');
    }
  };

  const proposer = async () => {
    setGeneration('busy');
    setMessageIa(null);
    try {
      const res = await fetch('/api/ai/travel-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: demande.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      onMaj({ proposition_ia: json.proposition });
      if (!json.enregistre) setMessageIa('Proposition générée mais pas enregistrée en base — copie-la maintenant.');
      setGeneration('idle');
    } catch (e) {
      setGeneration('ko');
      setMessageIa(e instanceof Error ? e.message : String(e));
    }
  };

  const copier = async () => {
    if (!demande.proposition_ia) return;
    try {
      await navigator.clipboard.writeText(demande.proposition_ia.texte);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      /* presse-papier indisponible : le texte reste sélectionnable */
    }
  };

  const s = statutDe(demande.statut);
  const p = demande.proposition_ia;

  return (
    <div className="space-y-6">
      <button onClick={onRetour} className="text-sm text-gray-500 hover:text-gray-900">
        ← Toutes les demandes
      </button>

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xl font-semibold text-gray-900">
              {demande.prenom || '—'} {demande.nom || ''}
            </div>
            <div className="text-sm text-gray-500">
              {demande.email}
              {demande.telephone ? ` · ${demande.telephone}` : ''} · reçue le {dateCourte(demande.created_at)}
            </div>
          </div>
          <label className="text-sm">
            <span className="sr-only">Statut</span>
            <select
              value={demande.statut ?? 'new'}
              onChange={(e) => changerStatut(e.target.value)}
              className={`rounded-full border-0 px-3 py-1 text-sm font-medium ${s.classe}`}
            >
              {STATUTS.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Champ label="Type d'escapade" valeur={demande.trip_type} />
          <Champ label="Ambiance" valeur={demande.vibe} />
          <Champ label="Destination" valeur={destinationLisible(demande)} />
          <Champ label="Case cochée" valeur={demande.destination_detail ? demande.destination : null} />
          <Champ label="Durée" valeur={demande.duree_jours} />
          <Champ label="Période" valeur={demande.mois_depart} />
          <Champ label="Budget" valeur={demande.budget_fourchette} />
          <Champ label="Voyageurs" valeur={demande.nb_voyageurs} />
        </div>

        {demande.notes && (
          <div className="mt-5">
            <div className="text-xs uppercase tracking-wide text-gray-400">Son message</div>
            <div className="mt-1 whitespace-pre-wrap text-sm text-gray-900">{demande.notes}</div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-teal/30 bg-teal/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-gray-900">Pré-itinéraire</div>
            <div className="text-sm text-gray-500">
              Un brouillon pour vous, construit uniquement sur ce qu'on a vécu dans nos destinations. Il ne part jamais
              seul au client.
            </div>
          </div>
          <div className="flex gap-2">
            {p && (
              <button
                onClick={copier}
                className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm hover:bg-gray-50"
              >
                {copie ? '✓ Copié' : 'Copier'}
              </button>
            )}
            <button
              onClick={proposer}
              disabled={generation === 'busy'}
              className="rounded-full bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {generation === 'busy' ? 'On relit nos carnets…' : p ? 'Proposer à nouveau' : 'Proposer un pré-itinéraire'}
            </button>
          </div>
        </div>

        {messageIa && (
          <div className={`mt-3 rounded-xl p-3 text-sm ${generation === 'ko' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'}`}>
            {messageIa}
          </div>
        )}

        {p && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              <span>
                Sources :{' '}
                {p.destinations.map((d) => `${d.title}${d.similarity != null ? ` (${Math.round(d.similarity * 100)} %)` : ''}`).join(', ')}
              </span>
              <span>Voix : {p.score}/100{p.mots_bannis.length ? ` — mots bannis : ${p.mots_bannis.join(', ')}` : ''}</span>
              <span>
                {p.modele} · {dateCourte(p.genere_le)}
              </span>
            </div>
            <div className="mt-3 whitespace-pre-wrap rounded-xl border border-gray-100 bg-white p-4 text-sm leading-relaxed text-gray-900">
              {p.texte}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="font-semibold text-gray-900">Vos notes</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Ce que vous avez dit, décidé, promis…"
          className="mt-2 w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-teal focus:outline-none"
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={sauverNotes}
            disabled={sauvegarde === 'busy' || notes === (demande.notes_internes ?? '')}
            className="rounded-full border border-gray-200 px-4 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {sauvegarde === 'busy' ? 'Enregistrement…' : 'Enregistrer les notes'}
          </button>
          {sauvegarde === 'ok' && <span className="text-sm text-emerald-700">✓ Enregistré</span>}
          {sauvegarde === 'ko' && <span className="text-sm text-red-700">Échec — réessaie</span>}
        </div>
      </div>
    </div>
  );
}

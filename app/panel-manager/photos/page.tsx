'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Import Google Photos depuis le CMS.
 *
 * Trois temps : on ouvre une session, tu choisis tes médias chez Google, on
 * importe la sélection en extrayant GPS et horodatage. Ces deux métadonnées
 * forment le registre de preuves : elles seules autorisent à écrire « on y
 * était, tel jour » sur le site. Le ressenti, les prix et les horaires
 * continuent de venir de toi.
 */

type Etat = 'repos' | 'ouverture' | 'attente' | 'import' | 'fini' | 'erreur';

type Bilan = {
  destination: string;
  selectionnes: number;
  importes: number;
  sans_gps: number;
  sans_gps_exemples?: string[];
  echecs?: string[];
};

export default function ImportPhotosPage() {
  const [destination, setDestination] = useState('roumanie');
  const [etat, setEtat] = useState<Etat>('repos');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pickerUri, setPickerUri] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [bilan, setBilan] = useState<Bilan | null>(null);

  // Conservé hors du rendu : l'intervalle doit survivre aux re-rendus et être
  // nettoyé au démontage, sinon le sondage continue après la fermeture.
  const sondage = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopperSondage = useCallback(() => {
    if (sondage.current) {
      clearInterval(sondage.current);
      sondage.current = null;
    }
  }, []);

  useEffect(() => stopperSondage, [stopperSondage]);

  const importer = useCallback(async (id: string) => {
    setEtat('import');
    setMessage('Téléchargement des médias et lecture des métadonnées…');
    try {
      const res = await fetch(`/api/cms/photos/session/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import impossible');
      setBilan(data);
      setEtat('fini');
      setMessage('');
    } catch (e: any) {
      setEtat('erreur');
      setMessage(e?.message ?? 'Import impossible');
    }
  }, [destination]);

  const ouvrirSession = useCallback(async () => {
    stopperSondage();
    setBilan(null);
    setEtat('ouverture');
    setMessage('Ouverture d\'une session Google Photos…');

    try {
      const res = await fetch('/api/cms/photos/session', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Session refusée');

      setSessionId(data.id);
      setPickerUri(data.pickerUri);
      setEtat('attente');
      setMessage('Choisis tes photos dans l\'onglet Google Photos, puis valide avec OK.');

      if (data.pickerUri) window.open(data.pickerUri, '_blank', 'noopener');

      sondage.current = setInterval(async () => {
        try {
          const r = await fetch(`/api/cms/photos/session/${data.id}`);
          const s = await r.json();
          if (r.ok && s.pret) {
            stopperSondage();
            importer(data.id);
          }
        } catch {
          /* incident réseau passager : le tour suivant réessaiera */
        }
      }, 5000);
    } catch (e: any) {
      setEtat('erreur');
      setMessage(e?.message ?? 'Session refusée');
    }
  }, [importer, stopperSondage]);

  const occupe = etat === 'ouverture' || etat === 'attente' || etat === 'import';

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-serif font-semibold text-mahogany mb-1">
        Import Google Photos
      </h1>
      <p className="text-sm text-charcoal/60 mb-8">
        Les photos apportent le lieu et la date. Le reste du carnet reste à ta main.
      </p>

      <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="destination">
        Destination
      </label>
      <input
        id="destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        disabled={occupe}
        className="w-full mb-6 rounded-lg border border-stone-300 px-3 py-2 text-sm disabled:bg-stone-100"
        placeholder="roumanie"
      />

      <button
        onClick={ouvrirSession}
        disabled={occupe}
        className="rounded-full bg-eucalyptus px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {occupe ? 'En cours…' : 'Choisir des photos'}
      </button>

      {pickerUri && etat === 'attente' && (
        <p className="mt-4 text-sm">
          L&apos;onglet ne s&apos;est pas ouvert ?{' '}
          <a href={pickerUri} target="_blank" rel="noopener noreferrer"
             className="text-eucalyptus underline">
            Ouvrir la sélection Google Photos
          </a>
        </p>
      )}

      {message && (
        <p className={`mt-4 text-sm ${etat === 'erreur' ? 'text-red-700' : 'text-charcoal/70'}`}>
          {message}
        </p>
      )}

      {bilan && (
        <div className="mt-8 rounded-2xl border border-stone-200 bg-[#F8F5F0] p-5 text-sm">
          <p className="font-semibold text-mahogany mb-3">
            {bilan.importes} média(s) importé(s) sur {bilan.selectionnes} sélectionné(s)
          </p>
          <ul className="space-y-1 text-charcoal/80">
            <li>Destination : <strong>{bilan.destination}</strong></li>
            <li>Sans coordonnées GPS : <strong>{bilan.sans_gps}</strong></li>
          </ul>

          {bilan.sans_gps > 0 && (
            <p className="mt-3 text-xs text-charcoal/60">
              Une photo sans GPS reste utilisable comme visuel, mais n&apos;atteste aucun
              lieu : elle n&apos;entre pas dans le registre de preuves.
            </p>
          )}

          {bilan.echecs && bilan.echecs.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-red-700">
                {bilan.echecs.length} échec(s)
              </summary>
              <ul className="mt-2 space-y-1 text-xs text-red-700">
                {bilan.echecs.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

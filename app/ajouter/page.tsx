'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Ajouter un carnet, depuis un ordinateur.
 *
 * Le panneau d'administration sait deja tout faire, et c'est le probleme :
 * vingt-quatre onglets, dont il faut retrouver le bon. Cet ecran ne fait
 * qu'une chose, comme celui du telephone dont il reprend les champs.
 *
 * Il n'ajoute aucune route : il poste vers /api/cms/mobile-publish, dont le
 * parcours est verifie et qui accepte desormais un carnet sans photo. Le nom
 * dit « mobile » parce qu'il est ne la ; il n'a rien de propre au telephone.
 */

// Les fonctions Vercel plafonnent une requete a 4,5 Mo. Au-dela, le serveur
// repond FUNCTION_PAYLOAD_TOO_LARGE avant d'executer la moindre ligne, et
// l'erreur ne dit rien de comprehensible. On prefere le dire avant d'envoyer.
// Le telephone, lui, contourne la limite par des URL signees.
const LIMITE_OCTETS = 4 * 1024 * 1024;

export default function AjouterPage() {
  const [titre, setTitre] = useState('');
  const [lieu, setLieu] = useState('');
  const [recit, setRecit] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [etat, setEtat] = useState<'repos' | 'envoi' | 'fait' | 'erreur'>('repos');
  const [message, setMessage] = useState('');

  // La session se verifie a l'ouverture, pas au moment d'envoyer. Sans cela, on
  // ecrivait un carnet entier avant d'apprendre qu'il ne partirait pas : un
  // formulaire qui accepte la frappe alors qu'il ne peut rien en faire.
  const [session, setSession] = useState<'inconnue' | 'ouverte' | 'absente'>('inconnue');
  useEffect(() => {
    fetch('/api/cms/auth/check')
      .then((r) => setSession(r.ok ? 'ouverte' : 'absente'))
      // Reseau coupe : on n'affirme pas que la session est absente, on laisse
      // l'envoi tenter sa chance et dire ce qu'il trouve.
      .catch(() => setSession('inconnue'));
  }, []);

  const poids = photos.reduce((t, f) => t + f.size, 0);
  const tropLourd = poids > LIMITE_OCTETS;

  async function envoyer() {
    setEtat('envoi');
    setMessage('');

    const corps = new FormData();
    corps.append('place_title', titre);
    corps.append('place_address', lieu);
    corps.append('caption', recit);
    // Sans quoi le carnet se declarerait venu du telephone : la route ecrivait
    // sa provenance en dur, du temps ou elle n'avait qu'un seul appelant.
    corps.append('source', 'web');
    photos.forEach((f) => corps.append('photos', f));

    try {
      const rep = await fetch('/api/cms/mobile-publish', { method: 'POST', body: corps });

      if (rep.status === 401) {
        setEtat('erreur');
        // Pas de champ mot de passe ici : la session vit dans le panneau, et
        // en redemander un deuxieme endroit ferait deux endroits a tenir.
        setSession('absente');
        setMessage('Session expirée. Ouvre le panneau pour te reconnecter, puis reviens.');
        return;
      }

      if (!rep.ok) {
        // Le corps de la reponse porte la raison. L'afficher evite le
        // « quelque chose s'est mal passe » qui n'aide personne.
        const brut = await rep.text();
        let raison = brut.slice(0, 200);
        try {
          raison = (JSON.parse(brut).error as string) || raison;
        } catch {
          /* la reponse n'etait pas du JSON : on garde le texte brut */
        }
        setEtat('erreur');
        setMessage(`Refus du serveur (${rep.status}) : ${raison}`);
        return;
      }

      setEtat('fait');
      setMessage('Brouillon créé. Il t’attend dans le panneau, rien n’est en ligne.');
      setTitre('');
      setLieu('');
      setRecit('');
      setPhotos([]);
    } catch (e) {
      setEtat('erreur');
      setMessage(`Envoi impossible : ${e instanceof Error ? e.message : 'réseau indisponible'}`);
    }
  }

  const champ =
    'w-full rounded-lg border border-neutral-300 px-3 py-2 text-base ' +
    'focus:border-neutral-600 focus:outline-none';

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-semibold">Écrire un carnet</h1>
      <p className="mb-8 text-sm text-neutral-600">
        Un titre suffit pour commencer. Le reste se complète plus tard.
      </p>

      {session === 'absente' && (
        <p className="mb-8 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Tu n’es pas connecté·e.{' '}
          <Link className="underline" href="/panel-manager">
            Ouvre le panneau
          </Link>{' '}
          pour te connecter, puis reviens — ce que tu écris ici ne partirait pas.
        </p>
      )}

      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Titre du carnet</span>
          <input
            className={champ}
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Où étais-tu ?"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Lieu (facultatif)</span>
          <input
            className={champ}
            value={lieu}
            onChange={(e) => setLieu(e.target.value)}
            placeholder="Adresse, quartier, repère"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Ce que tu as vécu (facultatif)</span>
          <textarea
            className={champ}
            rows={8}
            value={recit}
            onChange={(e) => setRecit(e.target.value)}
            placeholder="L’odeur, la lumière, le prix réel, ce qu’on a moins aimé."
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Photos (facultatif)</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="text-sm"
            onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
          />
          {photos.length > 0 && (
            <span className={`text-sm ${tropLourd ? 'text-red-700' : 'text-neutral-600'}`}>
              {photos.length} photo{photos.length > 1 ? 's' : ''} — {(poids / 1024 / 1024).toFixed(1)} Mo
              {tropLourd && ' — trop lourd pour cette page. Passe par le téléphone, ou enlève-en.'}
            </span>
          )}
        </label>

        <button
          type="button"
          disabled={!titre.trim() || etat === 'envoi' || tropLourd || session === 'absente'}
          onClick={envoyer}
          className="rounded-lg bg-neutral-900 px-4 py-2.5 text-white disabled:bg-neutral-300"
        >
          {etat === 'envoi' ? 'Envoi…' : 'Créer le brouillon'}
        </button>

        {message && (
          <p className={`text-sm ${etat === 'erreur' ? 'text-red-700' : 'text-green-800'}`}>
            {message}
          </p>
        )}

        <p className="text-sm text-neutral-500">
          Le brouillon arrive sur le site. Rien n’est publié tant que tu ne l’as pas relu —{' '}
          <Link className="underline" href="/panel-manager?section=articles">
            ouvrir le panneau
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

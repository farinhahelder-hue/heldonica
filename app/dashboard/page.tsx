'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase-client';
import { trackEvent } from '@/lib/analytics';

type TravelRequest = {
  id: number | string;
  destination: string | null;
  destination_detail: string | null;
  duration: string | null;
  budget: string | null;
  status: string | null;
  created_at: string | null;
};

function normalizeStatus(status: string | null) {
  const normalized = (status ?? '').toLowerCase();
  if (normalized === 'confirmed' || normalized === 'confirmé' || normalized === 'confirme') {
    return 'Confirmé';
  }
  return 'Brouillon';
}

function isConfirmed(status: string | null) {
  const normalized = (status ?? '').toLowerCase();
  return normalized === 'confirmed' || normalized === 'confirmé' || normalized === 'confirme';
}

function formatDate(isoDate: string | null) {
  if (!isoDate) return 'Date inconnue';
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function sanitizeToAscii(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function byteLength(value: string) {
  return new TextEncoder().encode(value).length;
}

function buildPdf(lines: string[]) {
  const safeLines = lines.slice(0, 28).map((line) => escapePdfText(sanitizeToAscii(line)));

  const stream = `${safeLines
    .map((line, index) => {
      const y = 800 - index * 24;
      const fontSize = index === 0 ? 18 : 12;
      return `BT /F1 ${fontSize} Tf 50 ${y} Td (${line}) Tj ET`;
    })
    .join('\n')}\n`;

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${byteLength(stream)} >>\nstream\n${stream}endstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (const object of objects) {
    offsets.push(byteLength(pdf));
    pdf += object;
  }

  const xrefStart = byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, isConfigured, signOut } = useAuth();
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/auth/login?next=/dashboard');
      return;
    }

    trackEvent('view_dashboard', { source: 'espace_client' });
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !supabase || !isConfigured) {
      setLoadingRequests(false);
      return;
    }

    if (!user.email) {
      setError('Impossible de récupérer vos voyages : email utilisateur manquant.');
      setLoadingRequests(false);
      return;
    }

    let active = true;
    setLoadingRequests(true);

    supabase
      .from('travel_requests')
      .select('id, destination, destination_detail, duration, budget, status, created_at')
      .eq('email', user.email)
      .order('created_at', { ascending: false })
      .then(({ data, error: queryError }) => {
        if (!active) return;

        if (queryError) {
          setError(queryError.message);
          setRequests([]);
          setLoadingRequests(false);
          return;
        }

        setRequests((data as TravelRequest[]) ?? []);
        setLoadingRequests(false);
      });

    return () => {
      active = false;
    };
  }, [user, isConfigured]);

  const handleDownloadPdf = (request: TravelRequest) => {
    const lines = [
      'Carnet Premium Heldonica',
      `Destination: ${request.destination ?? 'A definir'}`,
      request.destination_detail ? `Detail: ${request.destination_detail}` : '',
      request.duration ? `Duree: ${request.duration}` : '',
      request.budget ? `Budget: ${request.budget}` : '',
      `Statut: ${normalizeStatus(request.status)}`,
      `Date de demande: ${formatDate(request.created_at)}`,
      '',
      'Merci de voyager avec Heldonica.',
    ].filter(Boolean);

    const bytes = buildPdf(lines);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `heldonica-carnet-${request.id}.pdf`;
    anchor.click();

    window.setTimeout(() => URL.revokeObjectURL(url), 500);

    trackEvent('download_pdf', {
      request_id: String(request.id),
      destination: request.destination ?? 'inconnue',
    });
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-cloud-dancer">
      <Header />

      <section className="pt-28 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <p className="text-xs tracking-[0.16em] uppercase text-eucalyptus mb-2">Mon espace</p>
              <h1 className="text-3xl md:text-4xl font-serif text-mahogany">Tes voyages sauvegardés</h1>
              <p className="text-stone-600 mt-2">
                Suis l&apos;avancement de tes demandes et télécharge ton carnet quand le statut est confirmé.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="self-start sm:self-auto px-5 py-2.5 rounded-full border border-stone-300 text-stone-700 hover:border-mahogany hover:text-mahogany transition"
            >
              Déconnexion
            </button>
          </div>

          {!isConfigured && (
            <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-900">
              Supabase n&apos;est pas configuré : impossible de charger les voyages.
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
              {error}
            </div>
          )}

          {loadingRequests ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-8 text-stone-600">
              Chargement de tes voyages...
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-8">
              <h2 className="text-xl font-serif text-mahogany mb-2">Aucune demande pour le moment</h2>
              <p className="text-stone-600 mb-6">
                Lance ta prochaine aventure et on te prépare un itinéraire sur mesure.
              </p>
              <a
                href="/travel-planning-form"
                className="inline-flex items-center px-5 py-3 rounded-full bg-eucalyptus text-white font-medium hover:bg-eucalyptus/90 transition"
              >
                Démarrer un Travel Planning
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const confirmed = isConfirmed(request.status);
                const statusLabel = normalizeStatus(request.status);
                return (
                  <article
                    key={request.id}
                    className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-2xl font-serif text-mahogany mb-1">
                          {request.destination ?? 'Destination à définir'}
                        </h2>
                        {request.destination_detail && (
                          <p className="text-stone-600 mb-2">{request.destination_detail}</p>
                        )}
                        <p className="text-sm text-stone-500">Demande envoyée le {formatDate(request.created_at)}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {request.duration && (
                            <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
                              Durée: {request.duration}
                            </span>
                          )}
                          {request.budget && (
                            <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
                              Budget: {request.budget}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="md:text-right">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            confirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {statusLabel}
                        </span>
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(request)}
                            disabled={!confirmed}
                            className="px-4 py-2 rounded-lg bg-mahogany text-white text-sm font-medium hover:bg-mahogany/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Télécharger le carnet PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase-client';
import { trackEvent } from '@/lib/analytics';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [nextPath, setNextPath] = useState('/dashboard');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const requestedNext = searchParams.get('next');

    if (requestedNext && requestedNext.startsWith('/')) {
      setNextPath(requestedNext);
    }
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath);
    }
  }, [loading, user, router, nextPath]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase || !isConfigured) {
      setError('Connexion indisponible : variables Supabase manquantes.');
      return;
    }

    setSubmitting(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    trackEvent('login', { method: 'email' });
    router.replace(nextPath);
  };

  return (
    <main className="min-h-screen bg-cloud-dancer">
      <Header />

      <section className="pt-28 pb-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
          <p className="text-xs tracking-[0.16em] uppercase text-eucalyptus mb-3">Espace client</p>
          <h1 className="text-3xl font-serif text-mahogany mb-2">Connexion</h1>
          <p className="text-stone-600 mb-8">
            Retrouve tes voyages sauvegardés et tes carnets confirmés.
          </p>

          {!isConfigured && (
            <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-900">
              Supabase n&apos;est pas configuré en environnement courant.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ton.email@exemple.fr"
                className="w-full rounded-lg border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !isConfigured}
              className="w-full bg-eucalyptus text-white font-medium py-3 rounded-lg hover:bg-eucalyptus/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Connexion en cours...' : 'Me connecter'}
            </button>
          </form>

          <p className="text-sm text-stone-600 mt-6">
            Pas encore de compte ?{' '}
            <Link href="/auth/register" className="text-mahogany font-semibold hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

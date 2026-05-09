'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase-client';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // If Supabase isn't configured, render children without auth context
  if (!supabase) {
    return (
      <AuthContext.Provider
        value={{
          user: null,
          session: null,
          loading: false,
          isConfigured: false,
          signOut: async () => {},
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Defensive: check if Supabase is properly configured before using
  const isConfigured = Boolean(supabase?.auth);

  useEffect(() => {
    // If Supabase isn't configured, just render without auth - don't fail
    if (!supabase?.auth) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (!supabase?.auth) return;
    try {
      await supabase.auth.signOut();
    } catch { /* ignore */ }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

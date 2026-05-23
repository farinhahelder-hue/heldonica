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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Always render with default context values first
  // Then attempt to initialize auth in useEffect
  const isConfigured = Boolean(
    typeof process !== 'undefined' &&
    process.env &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    let active = true;

    try {
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
    } catch (err) {
      setLoading(false);
    }
  }, [isConfigured]);

  const signOut = async () => {
    if (!isConfigured) return;
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

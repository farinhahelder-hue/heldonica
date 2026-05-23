'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, getSupabaseAuth } from '@/lib/supabase-client';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Always call ALL hooks at the top - BEFORE any conditionals (React rules)
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if Supabase is configured
  const supabaseAuth = getSupabaseAuth();
  const supabaseConfigured = supabaseAuth != null;

  useEffect(() => {
    // If Supabase isn't configured, just render without auth - don't fail
    if (!supabaseAuth) {
      setLoading(false);
      return;
    }

    let active = true;

    supabaseAuth.getSession().then(({ data }) => {
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
    } = supabaseAuth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [supabaseAuth]);

  const signOut = async () => {
    if (!supabaseAuth) return;
    try {
      await supabaseAuth.signOut();
    } catch { /* ignore */ }
  };

  // If Supabase isn't configured, use default values
  if (!supabaseConfigured) {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: true,
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

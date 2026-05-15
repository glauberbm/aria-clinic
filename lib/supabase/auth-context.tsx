'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createSupabaseClient, SupabaseClient } from './client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: (User & { session?: Session }) | null;
  loading: boolean;
  supabase: SupabaseClient | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(User & { session?: Session }) | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser({ ...session.user, session });
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setUser({ ...session.user, session });
          } else {
            setUser(null);
          }
        });

        return () => subscription.unsubscribe();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, loading, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within AuthProvider');
  }
  return context;
}

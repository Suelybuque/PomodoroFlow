/* eslint-disable @typescript-eslint/no-explicit-any */
// src/screens/useAuth.tsx
// src/screens/useAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';

export const useSession = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session error:', error.message);
      } else {
        setSession(data.session);
      }
      setLoading(false);
    };

    getSession();

    // Listen for changes in auth state
    const { data: listener } = supabase.auth.onAuthStateChange((_event: any, newSession: any) => {
      setSession(newSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
};

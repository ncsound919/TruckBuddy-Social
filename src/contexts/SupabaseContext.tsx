import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { fallbackProfile, rowToProfile } from '../lib/social-mappers';
import { currentUserProfile as seedProfile } from '../data';
import type { Profile } from '../types';

/**
 * Session + profile provider backed by the shared Truck Buddy Supabase project.
 *
 * Auth identity is `auth.users.id` — the same id the cab app and web portal use,
 * so a driver is the same person on every surface. The `profiles` row is
 * provisioned by the `on_auth_user_created` trigger; we only read it here.
 */
interface SupabaseSessionValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const SupabaseSession = createContext<SupabaseSessionValue | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (error) {
      console.error('[supabase] profile fetch failed:', error.message);
      setProfile(fallbackProfile(uid));
      return;
    }
    setProfile(data ? rowToProfile(data) : fallbackProfile(uid));
  };

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        void fetchProfile(sessionUser.id).finally(() => active && setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        void fetchProfile(sessionUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <SupabaseSession.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </SupabaseSession.Provider>
  );
}

export function useSupabaseSession(): SupabaseSessionValue {
  const context = useContext(SupabaseSession);
  if (context === undefined) {
    throw new Error('useSupabaseSession must be used within a SupabaseProvider');
  }
  return context;
}

/**
 * Always returns a Profile: the signed-in driver's row, or the seed placeholder
 * while the session is still resolving. Components that read `currentUserProfile`
 * should use this so writes satisfy RLS (`author_id = auth.uid()`).
 */
export function useCurrentProfile(): Profile {
  const { profile } = useSupabaseSession();
  return profile ?? (seedProfile as Profile);
}

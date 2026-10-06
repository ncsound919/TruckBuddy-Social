import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { fallbackProfile, rowToProfile } from '../lib/social-mappers';
import { currentUserProfile as placeholderProfile } from '../data';
import type { Profile } from '../types';

/** Build the signed-in user's profile from their auth identity (never a fake name). */
function profileFromUser(user: User): Profile {
  const meta = (user.user_metadata ?? {}) as { full_name?: string; name?: string; avatar_url?: string };
  const handle = (user.email ?? '').split('@')[0] || 'driver';
  return fallbackProfile(user.id, {
    username: handle,
    displayName: meta.full_name || meta.name || handle,
    avatarUrl: meta.avatar_url || '',
  });
}

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

  const fetchProfile = async (sessionUser: User) => {
    const uid = sessionUser.id;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (error) {
      console.error('[supabase] profile fetch failed:', error.message);
      setProfile(profileFromUser(sessionUser));
      return;
    }
    setProfile(data ? rowToProfile(data) : profileFromUser(sessionUser));
  };

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        void fetchProfile(sessionUser).finally(() => active && setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        void fetchProfile(sessionUser);
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
    if (user) await fetchProfile(user);
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
 * The signed-in driver's profile. While the session resolves, or if no profile
 * row exists yet, it is derived from the auth identity — never a fabricated
 * driver name.
 */
export function useCurrentProfile(): Profile {
  const { profile, user } = useSupabaseSession();
  if (profile) return profile;
  if (user) return profileFromUser(user);
  return placeholderProfile as Profile;
}

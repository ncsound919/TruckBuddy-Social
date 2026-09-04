import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verify presence of Supabase keys
const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL';

// Log status on load
if (isSupabaseConfigured) {
  console.log('📡 Supabase Client connected successfully to:', supabaseUrl);
} else {
  console.log('⚠️ Supabase credentials missing or default. Falling back to offline-first LocalStorage Postgres engine.');
}

// 1. REAL SUPABASE CLIENT
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// 2. MOCK SUPABASE CLIENT (To prevent crashes and enable zero-config local operations)
class MockSupabaseClient {
  auth = {
    signUp: async ({ email, password, options }: any) => {
      const mockUser = { id: 'usr-' + Date.now(), email, user_metadata: options?.data || {} };
      localStorage.setItem('trucker_session_user', JSON.stringify(mockUser));
      return { data: { user: mockUser, session: { access_token: 'mock-token' } }, error: null };
    },
    signInWithPassword: async ({ email }: any) => {
      const mockUser = { id: 'usr-123', email, user_metadata: { displayName: 'Willie Nelson' } };
      localStorage.setItem('trucker_session_user', JSON.stringify(mockUser));
      return { data: { user: mockUser, session: { access_token: 'mock-token' } }, error: null };
    },
    signOut: async () => {
      localStorage.removeItem('trucker_session_user');
      return { error: null };
    },
    getUser: async () => {
      const cached = localStorage.getItem('trucker_session_user');
      return { data: { user: cached ? JSON.parse(cached) : null }, error: null };
    },
    onAuthStateChange: (callback: any) => {
      // Mock unsubscribe
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  };

  from(table: string) {
    const getStorageKey = (t: string) => {
      if (t === 'comments') return 'trucker_comments_flat';
      return `trucker_${t}`;
    };

    const getLocalData = (): any[] => {
      const key = getStorageKey(table);
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error('Error parsing local data for key ' + key, e);
        }
      }
      return [];
    };

    const saveLocalData = (data: any[]) => {
      const key = getStorageKey(table);
      localStorage.setItem(key, JSON.stringify(data));
    };

    return {
      select: (columns = '*') => {
        let currentData = getLocalData();
        
        return {
          order: (column: string, { ascending = true } = {}) => {
            currentData.sort((a, b) => {
              const valA = a[column];
              const valB = b[column];
              if (valA < valB) return ascending ? -1 : 1;
              if (valA > valB) return ascending ? 1 : -1;
              return 0;
            });
            return {
              eq: (col: string, val: any) => {
                const filtered = currentData.filter(item => item[col] === val);
                return Promise.resolve({ data: filtered, error: null });
              },
              then: (resolve: any) => resolve({ data: currentData, error: null })
            };
          },
          eq: (col: string, val: any) => {
            const filtered = currentData.filter(item => item[col] === val);
            return Promise.resolve({ data: filtered, error: null });
          },
          then: (resolve: any) => resolve({ data: currentData, error: null })
        };
      },

      insert: (values: any) => {
        const rows = Array.isArray(values) ? values : [values];
        const currentData = getLocalData();
        const rowsWithId = rows.map(r => ({ id: r.id || `row-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, ...r }));
        const updated = [...rowsWithId, ...currentData];
        saveLocalData(updated);
        return Promise.resolve({ data: rowsWithId, error: null });
      },

      update: (values: any) => {
        return {
          eq: (col: string, val: any) => {
            const currentData = getLocalData();
            const updated = currentData.map(item => {
              if (item[col] === val) {
                return { ...item, ...values };
              }
              return item;
            });
            saveLocalData(updated);
            return Promise.resolve({ data: updated.filter(item => item[col] === val), error: null });
          }
        };
      },

      delete: () => {
        return {
          eq: (col: string, val: any) => {
            const currentData = getLocalData();
            const updated = currentData.filter(item => item[col] !== val);
            saveLocalData(updated);
            return Promise.resolve({ data: null, error: null });
          }
        };
      }
    };
  }
}

export const mockSupabase = new MockSupabaseClient();

// Expose unified client (real Supabase takes precedence, mock as fallback)
export const db = isSupabaseConfigured ? supabase : (mockSupabase as any);

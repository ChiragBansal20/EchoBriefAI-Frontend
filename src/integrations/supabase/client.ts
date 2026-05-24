// Stub: Supabase has been replaced by the Express backend.
// This file exists only to prevent import errors in any un-migrated components.
export const supabase = {
  auth: {
    getUser: async () => ({ data: { user: null } }),
    signUp: async () => ({ error: null }),
    signInWithPassword: async () => ({ error: null }),
    signOut: async () => {},
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: async () => ({ data: { session: null } }),
  },
  from: () => ({
    select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }),
    insert: async () => ({ error: null }),
  }),
  functions: {
    invoke: async () => ({ data: null, error: null }),
  },
  rpc: async () => ({ data: null }),
} as any;

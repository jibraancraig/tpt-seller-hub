export function initSupabase() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not found. Using demo mode.');
    return createMockSupabase();
  }
  
  const { createClient } = supabase;
  return createClient(supabaseUrl, supabaseKey);
}

function createMockSupabase() {
  return {
    auth: {
      signInWithOtp: async ({ email }) => {
        console.log('Mock: Magic link sent to', email);
        return { data: { user: null }, error: null };
      },
      getUser: async () => {
        const mockUser = localStorage.getItem('mock_user');
        return { data: { user: mockUser ? JSON.parse(mockUser) : null } };
      },
      onAuthStateChange: (callback) => {
        // Mock auth state changes
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signOut: async () => {
        localStorage.removeItem('mock_user');
        return { error: null };
      }
    },
    from: (table) => ({
      select: () => ({
        eq: () => ({ data: [], error: null })
      }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null })
    })
  };
}

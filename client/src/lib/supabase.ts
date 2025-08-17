import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database helpers
export const db = {
  // Profiles
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  updateProfile: async (userId: string, updates: Partial<any>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Products
  getProducts: async (userId: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  createProduct: async (product: any) => {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    return { data, error };
  },

  updateProduct: async (id: string, updates: Partial<any>) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  deleteProduct: async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Keywords
  getKeywords: async (productId?: string) => {
    let query = supabase
      .from('keywords')
      .select(`
        *,
        product:products(title, tpt_url)
      `)
      .order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;
    return { data, error };
  },

  createKeyword: async (keyword: any) => {
    const { data, error } = await supabase
      .from('keywords')
      .insert(keyword)
      .select()
      .single();
    return { data, error };
  },

  // Social posts
  getSocialPosts: async (productId?: string) => {
    let query = supabase
      .from('social_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;
    return { data, error };
  },

  createSocialPost: async (post: any) => {
    const { data, error } = await supabase
      .from('social_posts')
      .insert(post)
      .select()
      .single();
    return { data, error };
  },

  // Sales
  getSales: async (userId: string) => {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        product:products(title)
      `)
      .eq('products.user_id', userId)
      .order('date', { ascending: false });
    return { data, error };
  },

  createSales: async (sales: any[]) => {
    const { data, error } = await supabase
      .from('sales')
      .insert(sales)
      .select();
    return { data, error };
  }
};

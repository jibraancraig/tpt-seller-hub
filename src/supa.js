import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Using demo mode.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common database operations
export const db = {
    // Products
    async getProducts(userId) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    async createProduct(userId, productData) {
        const { data, error } = await supabase
            .from('products')
            .insert({ ...productData, user_id: userId })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async updateProduct(productId, updates) {
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', productId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Keywords
    async getKeywords(productId) {
        const { data, error } = await supabase
            .from('keywords')
            .select('*, ranks(*)')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    async createKeyword(keywordData) {
        const { data, error } = await supabase
            .from('keywords')
            .insert(keywordData)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Ranks
    async createRank(rankData) {
        const { data, error } = await supabase
            .from('ranks')
            .insert(rankData)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Social Posts
    async getSocialPosts(productId) {
        const { data, error } = await supabase
            .from('social_posts')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    async createSocialPost(postData) {
        const { data, error } = await supabase
            .from('social_posts')
            .insert(postData)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Sales
    async getSales(userId) {
        const { data, error } = await supabase
            .from('sales')
            .select('*, products(*)')
            .eq('products.user_id', userId)
            .order('date', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    async createSales(salesData) {
        const { data, error } = await supabase
            .from('sales')
            .insert(salesData)
            .select();
        
        if (error) throw error;
        return data;
    },

    // Profiles
    async getProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async upsertProfile(userId, profileData) {
        const { data, error } = await supabase
            .from('profiles')
            .upsert({ id: userId, ...profileData })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
};

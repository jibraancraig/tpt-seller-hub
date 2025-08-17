// Initialize Supabase client using config.js
const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.APP_CONFIG;
export const supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper functions for common database operations
export const db = {
    // Products
    async getProducts(userId) {
        const { data, error } = await supa
            .from('products')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    async createProduct(userId, productData) {
        const { data, error } = await supa
            .from('products')
            .insert({ ...productData, user_id: userId })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async updateProduct(productId, updates) {
        const { data, error } = await supa
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
        const { data, error } = await supa
            .from('keywords')
            .select('*, ranks(*)')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    async createKeyword(keywordData) {
        const { data, error } = await supa
            .from('keywords')
            .insert(keywordData)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Ranks
    async createRank(rankData) {
        const { data, error } = await supa
            .from('ranks')
            .insert(rankData)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Social Posts
    async getSocialPosts(productId) {
        const { data, error } = await supa
            .from('social_posts')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    async createSocialPost(postData) {
        const { data, error } = await supa
            .from('social_posts')
            .insert(postData)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Sales
    async getSales(userId) {
        const { data, error } = await supa
            .from('sales')
            .select('*, products(*)')
            .eq('products.user_id', userId)
            .order('date', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    async createSales(salesData) {
        const { data, error } = await supa
            .from('sales')
            .insert(salesData)
            .select();
        
        if (error) throw error;
        return data;
    },

    // Profiles
    async getProfile(userId) {
        const { data, error } = await supa
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async upsertProfile(userId, profileData) {
        const { data, error } = await supa
            .from('profiles')
            .upsert({ id: userId, ...profileData })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
};

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Users can view own products" ON products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON products
    FOR DELETE USING (auth.uid() = user_id);

-- Keywords policies
CREATE POLICY "Users can view keywords for own products" ON keywords
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = keywords.product_id 
            AND products.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert keywords for own products" ON keywords
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = keywords.product_id 
            AND products.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update keywords for own products" ON keywords
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = keywords.product_id 
            AND products.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete keywords for own products" ON keywords
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = keywords.product_id 
            AND products.user_id = auth.uid()
        )
    );

-- Ranks policies
CREATE POLICY "Users can view ranks for own keywords" ON ranks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM keywords 
            JOIN products ON products.id = keywords.product_id
            WHERE keywords.id = ranks.keyword_id 
            AND products.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert ranks for own keywords" ON ranks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM keywords 
            JOIN products ON products.id = keywords.product_id
            WHERE keywords.id = ranks.keyword_id 
            AND products.user_id = auth.uid()
        )
    );

-- Social posts policies
CREATE POLICY "Users can view social posts for own products" ON social_posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = social_posts.product_id 
            AND products.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert social posts for own products" ON social_posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = social_posts.product_id 
            AND products.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update social posts for own products" ON social_posts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = social_posts.product_id 
            AND products.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete social posts for own products" ON social_posts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = social_posts.product_id 
            AND products.user_id = auth.uid()
        )
    );

-- Sales policies
CREATE POLICY "Users can view sales for own products" ON sales
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = sales.product_id 
            AND products.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert sales for own products" ON sales
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = sales.product_id 
            AND products.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update sales for own products" ON sales
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = sales.product_id 
            AND products.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete sales for own products" ON sales
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = sales.product_id 
            AND products.user_id = auth.uid()
        )
    );

-- Events policies (audit logs)
CREATE POLICY "Users can view own events" ON events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Additional function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, plan, created_at)
    VALUES (new.id, new.email, 'free', now());
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_keywords_product_id ON keywords(product_id);
CREATE INDEX IF NOT EXISTS idx_ranks_keyword_id ON ranks(keyword_id);
CREATE INDEX IF NOT EXISTS idx_ranks_fetched_at ON ranks(fetched_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_product_id ON social_posts(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

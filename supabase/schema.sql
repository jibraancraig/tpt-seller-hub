-- Create custom types
CREATE TYPE plan_type AS ENUM ('free', 'pro');
CREATE TYPE post_status AS ENUM ('generated', 'scheduled', 'published');
CREATE TYPE event_type AS ENUM ('product_created', 'keyword_added', 'rank_updated', 'seo_published', 'social_generated');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    plan plan_type NOT NULL DEFAULT 'free',
    tpt_store_url TEXT,
    
    -- API Keys (encrypted by Supabase)
    openai_key TEXT,
    serpapi_key TEXT,
    buffer_webhook TEXT,
    
    -- Notification preferences
    rank_alerts BOOLEAN DEFAULT true,
    weekly_reports BOOLEAN DEFAULT true,
    product_updates BOOLEAN DEFAULT false,
    
    -- Usage tracking
    products_count INTEGER DEFAULT 0,
    ai_generations INTEGER DEFAULT 0,
    rank_checks INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Product information
    title TEXT NOT NULL,
    description TEXT,
    tags TEXT[], -- Array of tags
    tpt_url TEXT,
    price DECIMAL(10,2),
    
    -- SEO optimized versions
    seo_title TEXT,
    seo_description TEXT,
    seo_score INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keywords table (for rank tracking)
CREATE TABLE keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    
    -- Keyword information
    phrase TEXT NOT NULL,
    country TEXT DEFAULT 'us',
    device TEXT DEFAULT 'desktop', -- desktop, mobile, tablet
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ranks table (historical rank data)
CREATE TABLE ranks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE NOT NULL,
    
    -- Rank information
    position INTEGER, -- NULL if not found
    url_found TEXT,
    title TEXT,
    snippet TEXT,
    
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social posts table (generated content)
CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    
    -- Post information
    network TEXT NOT NULL, -- pinterest, instagram, facebook
    content JSONB NOT NULL, -- Store title, description, hashtags
    status post_status DEFAULT 'generated',
    
    -- Scheduling information
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales table (from CSV imports)
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    
    -- Sales data
    date DATE NOT NULL,
    units INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    views INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table (audit logs)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Event information
    type event_type NOT NULL,
    meta JSONB, -- Store additional event data
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create functions for computed fields and triggers

-- Function to update products_count in profiles
CREATE OR REPLACE FUNCTION update_products_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update count for the affected user
    UPDATE profiles 
    SET products_count = (
        SELECT COUNT(*) FROM products 
        WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    )
    WHERE id = COALESCE(NEW.user_id, OLD.user_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for products count
CREATE TRIGGER update_products_count_on_insert
    AFTER INSERT ON products
    FOR EACH ROW EXECUTE FUNCTION update_products_count();

CREATE TRIGGER update_products_count_on_delete
    AFTER DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION update_products_count();

-- Function to log events
CREATE OR REPLACE FUNCTION log_event(
    user_id_param UUID,
    event_type_param event_type,
    meta_param JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO events (user_id, type, meta)
    VALUES (user_id_param, event_type_param, meta_param)
    RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get latest rank for a keyword
CREATE OR REPLACE FUNCTION get_latest_rank(keyword_id_param UUID)
RETURNS TABLE(
    position INTEGER,
    url_found TEXT,
    fetched_at TIMESTAMP WITH TIME ZONE,
    rank_change INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH latest_ranks AS (
        SELECT 
            r.position,
            r.url_found,
            r.fetched_at,
            ROW_NUMBER() OVER (ORDER BY r.fetched_at DESC) as rn
        FROM ranks r
        WHERE r.keyword_id = keyword_id_param
    ),
    rank_comparison AS (
        SELECT 
            lr1.position as current_position,
            lr1.url_found,
            lr1.fetched_at,
            lr2.position as previous_position
        FROM latest_ranks lr1
        LEFT JOIN latest_ranks lr2 ON lr2.rn = 2
        WHERE lr1.rn = 1
    )
    SELECT 
        rc.current_position as position,
        rc.url_found,
        rc.fetched_at,
        CASE 
            WHEN rc.previous_position IS NULL THEN 0
            ELSE rc.previous_position - rc.current_position
        END as rank_change
    FROM rank_comparison rc;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate SEO score
CREATE OR REPLACE FUNCTION calculate_seo_score(
    title_param TEXT,
    description_param TEXT,
    keywords_param TEXT DEFAULT ''
)
RETURNS INTEGER AS $$
DECLARE
    title_score INTEGER := 0;
    description_score INTEGER := 0;
    title_length INTEGER;
    description_length INTEGER;
    word_count INTEGER;
BEGIN
    -- Title scoring
    title_length := LENGTH(title_param);
    
    -- Length score (0-40 points)
    IF title_length >= 50 AND title_length <= 70 THEN
        title_score := title_score + 40;
    ELSIF title_length >= 40 AND title_length < 50 THEN
        title_score := title_score + 30;
    ELSIF title_length > 70 AND title_length <= 80 THEN
        title_score := title_score + 30;
    ELSE
        title_score := title_score + 10;
    END IF;
    
    -- Keyword presence (0-25 points)
    IF keywords_param != '' AND LOWER(title_param) LIKE '%' || LOWER(SPLIT_PART(keywords_param, ',', 1)) || '%' THEN
        title_score := title_score + 25;
    END IF;
    
    -- Basic quality checks (0-35 points)
    IF title_param LIKE '% %' THEN title_score := title_score + 15; END IF; -- Has spaces
    IF title_param ~ '[A-Z]' THEN title_score := title_score + 10; END IF; -- Has uppercase
    IF NOT title_param ~ '[!@#$%^&*()]' THEN title_score := title_score + 10; END IF; -- No special chars
    
    -- Description scoring
    description_length := LENGTH(description_param);
    word_count := array_length(string_to_array(description_param, ' '), 1);
    
    -- Length score (0-35 points)
    IF description_length >= 120 AND description_length <= 300 THEN
        description_score := description_score + 35;
    ELSIF description_length >= 80 AND description_length < 120 THEN
        description_score := description_score + 25;
    ELSIF description_length > 300 AND description_length <= 400 THEN
        description_score := description_score + 25;
    ELSE
        description_score := description_score + 10;
    END IF;
    
    -- Quality indicators (0-30 points)
    IF description_param LIKE '%.%' THEN description_score := description_score + 10; END IF; -- Has sentences
    IF LOWER(description_param) ~ '\b(student|teacher|learn|educat|grade)\b' THEN description_score := description_score + 10; END IF; -- Educational keywords
    IF word_count > 20 THEN description_score := description_score + 10; END IF; -- Adequate word count
    
    -- Return weighted score (title 40%, description 60%)
    RETURN LEAST(100, ROUND((title_score * 0.4) + (description_score * 0.6)));
END;
$$ LANGUAGE plpgsql;

-- Create views for common queries

-- View for products with latest SEO scores
CREATE OR REPLACE VIEW products_with_stats AS
SELECT 
    p.*,
    (SELECT COUNT(*) FROM keywords k WHERE k.product_id = p.id) as keyword_count,
    (SELECT COUNT(*) FROM social_posts sp WHERE sp.product_id = p.id) as social_posts_count,
    (SELECT SUM(s.revenue) FROM sales s WHERE s.product_id = p.id) as total_revenue,
    (SELECT SUM(s.units) FROM sales s WHERE s.product_id = p.id) as total_units
FROM products p;

-- View for keywords with latest ranks
CREATE OR REPLACE VIEW keywords_with_latest_rank AS
SELECT 
    k.*,
    p.title as product_title,
    p.tpt_url,
    (SELECT position FROM get_latest_rank(k.id)) as current_rank,
    (SELECT rank_change FROM get_latest_rank(k.id)) as rank_change,
    (SELECT fetched_at FROM get_latest_rank(k.id)) as last_checked
FROM keywords k
JOIN products p ON p.id = k.product_id;

-- Seed some initial data for development (optional)
-- This will only run if no profiles exist

DO $$
BEGIN
    -- Only insert if no profiles exist (development setup)
    IF NOT EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN
        -- Insert development user (replace with actual user ID from auth.users)
        -- This is just for reference - actual profiles are created via trigger
        
        -- Insert sample event types that might be useful
        INSERT INTO events (user_id, type, meta) VALUES
        ('00000000-0000-0000-0000-000000000000', 'product_created', '{"message": "System initialized"}')
        ON CONFLICT DO NOTHING;
        
    END IF;
END $$;

-- Grant permissions (these are also in policies.sql)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create necessary indexes (also in policies.sql but good to have here)
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_keywords_product_id ON keywords(product_id);
CREATE INDEX IF NOT EXISTS idx_ranks_keyword_id ON ranks(keyword_id);
CREATE INDEX IF NOT EXISTS idx_ranks_fetched_at ON ranks(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_product_id ON social_posts(product_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_network ON social_posts(network);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ranks_keyword_fetched ON ranks(keyword_id, fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_product_date ON sales(product_id, date);

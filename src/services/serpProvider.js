// SERP API provider for rank tracking with fallback to demo mode

const SERPAPI_KEY = import.meta.env.VITE_SERPAPI_KEY || '';
const SERPAPI_URL = 'https://serpapi.com/search';

export class SerpProvider {
    constructor() {
        this.hasApiKey = !!SERPAPI_KEY;
        this.rateLimitDelay = 1000; // 1 second between requests
        this.lastRequestTime = 0;
    }

    /**
     * Fetch keyword ranking for a specific URL
     */
    async fetchPosition(keyword, targetUrl, options = {}) {
        const {
            country = 'us',
            device = 'desktop',
            location = '',
            language = 'en'
        } = options;

        // Return demo data if no API key
        if (!this.hasApiKey) {
            console.warn('No SerpAPI key found, using demo mode');
            return this.getDemoRankData(keyword, targetUrl);
        }

        try {
            // Respect rate limits
            await this.handleRateLimit();

            const searchParams = new URLSearchParams({
                api_key: SERPAPI_KEY,
                engine: 'google',
                q: keyword,
                gl: country,
                hl: language,
                device: device,
                num: 100 // Get up to 100 results
            });

            if (location) {
                searchParams.append('location', location);
            }

            const response = await fetch(`${SERPAPI_URL}?${searchParams}`);

            if (!response.ok) {
                throw new Error(`SerpAPI request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(`SerpAPI error: ${data.error}`);
            }

            return this.extractRankingData(data, targetUrl);

        } catch (error) {
            console.error('SerpAPI fetch error:', error);
            
            // Fallback to demo data on error
            console.warn('Falling back to demo mode due to API error');
            return this.getDemoRankData(keyword, targetUrl);
        }
    }

    /**
     * Extract ranking position from SERP results
     */
    extractRankingData(serpData, targetUrl) {
        const organicResults = serpData.organic_results || [];
        
        // Clean target URL for comparison
        const cleanTargetUrl = this.cleanUrl(targetUrl);
        
        // Look for the URL in organic results
        for (let i = 0; i < organicResults.length; i++) {
            const result = organicResults[i];
            const resultUrl = this.cleanUrl(result.link || '');
            
            // Check if URLs match (domain and path)
            if (this.urlsMatch(resultUrl, cleanTargetUrl)) {
                return {
                    position: result.position || (i + 1),
                    url_found: result.link,
                    title: result.title,
                    snippet: result.snippet,
                    fetched_at: new Date().toISOString()
                };
            }
        }

        // URL not found in results
        return {
            position: null,
            url_found: null,
            title: null,
            snippet: null,
            fetched_at: new Date().toISOString(),
            not_found: true
        };
    }

    /**
     * Clean URL for comparison
     */
    cleanUrl(url) {
        if (!url) return '';
        
        try {
            const parsed = new URL(url);
            // Remove protocol, www, and trailing slash
            return parsed.hostname.replace(/^www\./, '') + parsed.pathname.replace(/\/$/, '');
        } catch (error) {
            // If URL parsing fails, return original
            return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
        }
    }

    /**
     * Check if two URLs match (same domain and similar path)
     */
    urlsMatch(url1, url2) {
        if (!url1 || !url2) return false;
        
        const clean1 = url1.toLowerCase();
        const clean2 = url2.toLowerCase();
        
        // Exact match
        if (clean1 === clean2) return true;
        
        // Check if one contains the other (for partial path matches)
        return clean1.includes(clean2) || clean2.includes(clean1);
    }

    /**
     * Handle rate limiting
     */
    async handleRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.rateLimitDelay) {
            const waitTime = this.rateLimitDelay - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastRequestTime = Date.now();
    }

    /**
     * Generate realistic demo rank data
     */
    getDemoRankData(keyword, targetUrl) {
        // Generate consistent but realistic rank based on keyword hash
        const hash = this.simpleHash(keyword + targetUrl);
        const position = (hash % 50) + 1; // Rank between 1-50
        
        // Sometimes return "not found"
        if (hash % 7 === 0) {
            return {
                position: null,
                url_found: null,
                title: null,
                snippet: null,
                fetched_at: new Date().toISOString(),
                not_found: true,
                demo_mode: true
            };
        }

        return {
            position: position,
            url_found: targetUrl,
            title: `Demo Result for "${keyword}"`,
            snippet: `This is a demo result for the keyword "${keyword}". Your actual ranking position would be shown here.`,
            fetched_at: new Date().toISOString(),
            demo_mode: true
        };
    }

    /**
     * Simple hash function for consistent demo data
     */
    simpleHash(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return Math.abs(hash);
    }

    /**
     * Batch fetch multiple keywords (with rate limiting)
     */
    async fetchMultipleKeywords(keywords, options = {}) {
        const results = [];
        
        for (const keyword of keywords) {
            try {
                const result = await this.fetchPosition(keyword.phrase, keyword.target_url, {
                    country: keyword.country,
                    device: keyword.device,
                    ...options
                });
                
                results.push({
                    keyword_id: keyword.id,
                    keyword: keyword.phrase,
                    result: result
                });
                
            } catch (error) {
                console.error(`Error fetching rank for keyword ${keyword.phrase}:`, error);
                results.push({
                    keyword_id: keyword.id,
                    keyword: keyword.phrase,
                    result: null,
                    error: error.message
                });
            }
        }
        
        return results;
    }

    /**
     * Get search volume and competition data (if available)
     */
    async getKeywordData(keyword, options = {}) {
        if (!this.hasApiKey) {
            return this.getDemoKeywordData(keyword);
        }

        // Note: This would require a different API endpoint or service
        // For now, return basic info
        return {
            keyword: keyword,
            search_volume: 'N/A',
            competition: 'N/A',
            suggested_bid: 'N/A'
        };
    }

    getDemoKeywordData(keyword) {
        const hash = this.simpleHash(keyword);
        
        return {
            keyword: keyword,
            search_volume: (hash % 10000) + 1000,
            competition: ['Low', 'Medium', 'High'][hash % 3],
            suggested_bid: (hash % 5) + 0.50,
            demo_mode: true
        };
    }

    /**
     * Check if service is available
     */
    isAvailable() {
        return this.hasApiKey;
    }

    /**
     * Get demo mode message
     */
    getDemoMessage() {
        return 'Rank tracking is running in demo mode. Add your SerpAPI key in Settings to track real rankings.';
    }

    /**
     * Get usage statistics (mock for now)
     */
    getUsageStats() {
        return {
            requests_made: 0,
            requests_limit: 100,
            requests_remaining: 100,
            demo_mode: !this.hasApiKey
        };
    }
}

// Export functions for direct use
export async function fetchKeywordRank(keyword, targetUrl, options = {}) {
    const provider = new SerpProvider();
    return await provider.fetchPosition(keyword, targetUrl, options);
}

export async function fetchMultipleRanks(keywords, options = {}) {
    const provider = new SerpProvider();
    return await provider.fetchMultipleKeywords(keywords, options);
}

export function getSerpUsageStats() {
    const provider = new SerpProvider();
    return provider.getUsageStats();
}

// Export singleton instance
export const serpProvider = new SerpProvider();

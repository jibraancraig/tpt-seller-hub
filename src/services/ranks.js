import { db } from '../supa.js';
import { fetchKeywordRank } from './serpProvider.js';

export class RankService {
    constructor() {
        this.refreshing = new Set();
    }

    /**
     * Add a new keyword to track
     */
    async addKeyword(productId, phrase, options = {}) {
        const keywordData = {
            product_id: productId,
            phrase: phrase.trim(),
            country: options.country || 'us',
            device: options.device || 'desktop',
            created_at: new Date().toISOString()
        };

        const keyword = await db.createKeyword(keywordData);
        
        // Immediately fetch first rank
        try {
            await this.refreshKeywordRank(keyword.id);
        } catch (error) {
            console.warn('Failed to fetch initial rank for new keyword:', error);
        }
        
        return keyword;
    }

    /**
     * Refresh rank for a specific keyword
     */
    async refreshKeywordRank(keywordId) {
        if (this.refreshing.has(keywordId)) {
            throw new Error('Rank refresh already in progress for this keyword');
        }

        this.refreshing.add(keywordId);

        try {
            // Get keyword details
            const keywords = await db.getKeywords(); // TODO: Add getKeyword method
            const keyword = keywords.find(k => k.id === keywordId);
            
            if (!keyword) {
                throw new Error('Keyword not found');
            }

            // Fetch current rank
            const rankData = await fetchKeywordRank(keyword.phrase, keyword.tpt_url || '', {
                country: keyword.country,
                device: keyword.device
            });

            // Save rank to database
            const rank = await db.createRank({
                keyword_id: keywordId,
                position: rankData.position,
                url_found: rankData.url_found || null,
                fetched_at: new Date().toISOString()
            });

            return rank;

        } finally {
            this.refreshing.delete(keywordId);
        }
    }

    /**
     * Get rank history for a keyword
     */
    async getKeywordHistory(keywordId, days = 30) {
        try {
            // TODO: Implement getRankHistory in db service
            // For now, return empty array
            return [];
        } catch (error) {
            console.error('Error getting keyword history:', error);
            return [];
        }
    }

    /**
     * Calculate rank change between periods
     */
    calculateRankChange(ranks) {
        if (!ranks || ranks.length < 2) {
            return 0;
        }

        // Sort by date descending
        const sortedRanks = [...ranks].sort((a, b) => 
            new Date(b.fetched_at) - new Date(a.fetched_at)
        );

        const current = sortedRanks[0]?.position;
        const previous = sortedRanks[1]?.position;

        if (!current || !previous) {
            return 0;
        }

        // Rank improvement is negative change (lower rank number is better)
        return previous - current;
    }

    /**
     * Get rank statistics for a user
     */
    async getUserRankStats(userId) {
        try {
            const products = await db.getProducts(userId);
            let allKeywords = [];

            // Collect keywords from all products
            for (const product of products) {
                const keywords = await db.getKeywords(product.id);
                allKeywords.push(...keywords.map(kw => ({
                    ...kw,
                    product_title: product.title,
                    current_rank: kw.ranks?.[0]?.position || null,
                    rank_change: this.calculateRankChange(kw.ranks)
                })));
            }

            return {
                totalKeywords: allKeywords.length,
                improved: allKeywords.filter(kw => kw.rank_change > 0).length,
                declined: allKeywords.filter(kw => kw.rank_change < 0).length,
                topTen: allKeywords.filter(kw => kw.current_rank && kw.current_rank <= 10).length,
                averageRank: this.calculateAverageRank(allKeywords),
                keywords: allKeywords
            };

        } catch (error) {
            console.error('Error getting rank stats:', error);
            return {
                totalKeywords: 0,
                improved: 0,
                declined: 0,
                topTen: 0,
                averageRank: 0,
                keywords: []
            };
        }
    }

    calculateAverageRank(keywords) {
        const rankedKeywords = keywords.filter(kw => kw.current_rank);
        if (rankedKeywords.length === 0) return 0;

        const sum = rankedKeywords.reduce((acc, kw) => acc + kw.current_rank, 0);
        return Math.round(sum / rankedKeywords.length);
    }

    /**
     * Generate rank trend data for charts
     */
    generateTrendData(ranks, days = 14) {
        if (!ranks || ranks.length === 0) {
            // Generate sample trend for demo
            return Array.from({ length: days }, (_, i) => ({
                date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString(),
                position: Math.floor(Math.random() * 20) + 5
            }));
        }

        // Sort ranks by date and return last N days
        return ranks
            .sort((a, b) => new Date(a.fetched_at) - new Date(b.fetched_at))
            .slice(-days)
            .map(rank => ({
                date: rank.fetched_at,
                position: rank.position
            }));
    }

    /**
     * Check if keyword should trigger an alert
     */
    shouldAlert(keyword, newRank, alertSettings = {}) {
        if (!keyword.current_rank || !newRank) {
            return false;
        }

        const rankChange = keyword.current_rank - newRank;
        const { 
            improvementThreshold = 5,
            declineThreshold = 10,
            enableImprovements = true,
            enableDeclines = true
        } = alertSettings;

        // Rank improvement (negative change is good)
        if (enableImprovements && rankChange >= improvementThreshold) {
            return {
                type: 'improvement',
                message: `Keyword "${keyword.phrase}" improved by ${rankChange} positions to #${newRank}`,
                priority: 'medium'
            };
        }

        // Rank decline (positive change is bad)
        if (enableDeclines && rankChange <= -declineThreshold) {
            return {
                type: 'decline',
                message: `Keyword "${keyword.phrase}" declined by ${Math.abs(rankChange)} positions to #${newRank}`,
                priority: 'high'
            };
        }

        return false;
    }
}

// Export singleton instance
export const rankService = new RankService();

// Helper functions for direct use
export async function addKeywordTracking(productId, phrase, options) {
    return await rankService.addKeyword(productId, phrase, options);
}

export async function refreshRank(keywordId) {
    return await rankService.refreshKeywordRank(keywordId);
}

export async function getRankStats(userId) {
    return await rankService.getUserRankStats(userId);
}

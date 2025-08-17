// SEO service for TPT Seller Hub
export const seoService = {
    // Calculate SEO score for a product
    calculateSEOScore(product) {
        let score = 0;
        
        // Title length (optimal: 50-60 characters)
        if (product.title && product.title.length >= 30 && product.title.length <= 60) {
            score += 25;
        } else if (product.title && product.title.length > 0) {
            score += Math.max(0, 25 - Math.abs(product.title.length - 45) * 0.5);
        }
        
        // Description length (optimal: 150-160 characters)
        if (product.description && product.description.length >= 120 && product.description.length <= 160) {
            score += 25;
        } else if (product.description && product.description.length > 0) {
            score += Math.max(0, 25 - Math.abs(product.description.length - 140) * 0.3);
        }
        
        // Tags (optimal: 3-5 tags)
        if (product.tags && product.tags.length >= 3 && product.tags.length <= 5) {
            score += 25;
        } else if (product.tags && product.tags.length > 0) {
            score += Math.max(0, 25 - Math.abs(product.tags.length - 4) * 5);
        }
        
        // Price (bonus for reasonable pricing)
        if (product.price && product.price > 0 && product.price <= 50) {
            score += 15;
        }
        
        // URL presence
        if (product.tpt_url && product.tpt_url.trim() !== '') {
            score += 10;
        }
        
        return Math.round(score);
    },
    
    // Generate SEO suggestions
    generateSuggestions(product) {
        const suggestions = [];
        
        if (!product.title || product.title.length < 30) {
            suggestions.push('Add a more descriptive title (30-60 characters)');
        }
        
        if (!product.description || product.description.length < 120) {
            suggestions.push('Expand your description to 150-160 characters');
        }
        
        if (!product.tags || product.tags.length < 3) {
            suggestions.push('Add 3-5 relevant tags');
        }
        
        if (!product.tpt_url || product.tpt_url.trim() === '') {
            suggestions.push('Include your TPT product URL');
        }
        
        return suggestions;
    }
};

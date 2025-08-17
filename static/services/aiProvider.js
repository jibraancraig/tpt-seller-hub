// AI Provider service for TPT Seller Hub
export const aiProvider = {
    // Generate content using AI (stub mode when no API key)
    async generateContent(prompt, options = {}) {
        const USE_STUBS = !window.APP_CONFIG.OPENAI_API_KEY;
        
        if (USE_STUBS) {
            return this.generateStubContent(prompt, options);
        }
        
        // TODO: Implement actual OpenAI API call
        return this.generateStubContent(prompt, options);
    },
    
    // Generate stub AI content
    generateStubContent(prompt, options) {
        const templates = {
            'product-description': [
                'Engaging and interactive resource designed to make learning fun and effective.',
                'Comprehensive teaching material that supports student growth and achievement.',
                'Innovative educational tool that enhances classroom engagement and learning outcomes.',
                'High-quality resource that simplifies complex concepts for better understanding.'
            ],
            'social-post': [
                '🎯 New TPT Resource Alert! This amazing tool will transform your classroom!',
                '✨ Teachers, you need to see this incredible resource! Game-changer alert!',
                '🚀 Boost your students\' learning with this innovative TPT resource!',
                '📚 Transform your teaching approach with this must-have resource!'
            ],
            'seo-optimization': [
                'Optimize your title with relevant keywords and clear value proposition.',
                'Include specific grade levels and subject areas in your description.',
                'Use trending educational hashtags to increase discoverability.',
                'Focus on benefits and outcomes rather than just features.'
            ],
            'tag-suggestions': [
                'math, algebra, worksheets, middle school, 6th grade, 7th grade, 8th grade',
                'reading, comprehension, literacy, elementary, primary, K-5, activities',
                'science, experiments, hands-on, inquiry, STEM, discovery, interactive',
                'writing, prompts, creative, language arts, composition, storytelling'
            ]
        };
        
        // Determine content type from prompt
        let contentType = 'general';
        if (prompt.toLowerCase().includes('description')) contentType = 'product-description';
        else if (prompt.toLowerCase().includes('social') || prompt.toLowerCase().includes('post')) contentType = 'social-post';
        else if (prompt.toLowerCase().includes('seo') || prompt.toLowerCase().includes('optimize')) contentType = 'seo-optimization';
        else if (prompt.toLowerCase().includes('tag') || prompt.toLowerCase().includes('keyword')) contentType = 'tag-suggestions';
        
        const contentTemplates = templates[contentType] || templates['general'];
        const randomIndex = this.hashString(prompt) % contentTemplates.length;
        
        return {
            content: contentTemplates[randomIndex],
            type: contentType,
            prompt: prompt,
            options: options,
            isStub: true
        };
    },
    
    // Generate multiple variations
    async generateVariations(prompt, count = 3, options = {}) {
        const variations = [];
        
        for (let i = 0; i < count; i++) {
            const content = await this.generateContent(prompt, options);
            variations.push(content);
        }
        
        return variations;
    },
    
    // Analyze product for SEO improvements
    async analyzeProduct(product) {
        const analysis = {
            title: {
                score: this.calculateTitleScore(product.title),
                suggestions: this.getTitleSuggestions(product.title)
            },
            description: {
                score: this.calculateDescriptionScore(product.description),
                suggestions: this.getDescriptionSuggestions(product.description)
            },
            tags: {
                score: this.calculateTagsScore(product.tags),
                suggestions: this.getTagsSuggestions(product.tags)
            },
            overall: 0
        };
        
        // Calculate overall score
        analysis.overall = Math.round(
            (analysis.title.score + analysis.description.score + analysis.tags.score) / 3
        );
        
        return analysis;
    },
    
    // Calculate individual scores
    calculateTitleScore(title) {
        if (!title) return 0;
        let score = 0;
        
        if (title.length >= 30 && title.length <= 60) score += 40;
        else if (title.length > 0) score += Math.max(0, 40 - Math.abs(title.length - 45) * 0.8);
        
        if (title.includes('Grade') || title.includes('grade')) score += 20;
        if (title.includes('Worksheet') || title.includes('Activity') || title.includes('Game')) score += 20;
        if (title.includes('Math') || title.includes('Reading') || title.includes('Science')) score += 20;
        
        return Math.min(100, score);
    },
    
    calculateDescriptionScore(description) {
        if (!description) return 0;
        let score = 0;
        
        if (description.length >= 120 && description.length <= 160) score += 40;
        else if (description.length > 0) score += Math.max(0, 40 - Math.abs(description.length - 140) * 0.4);
        
        if (description.includes('grade') || description.includes('Grade')) score += 20;
        if (description.includes('students') || description.includes('learners')) score += 20;
        if (description.includes('classroom') || description.includes('teaching')) score += 20;
        
        return Math.min(100, score);
    },
    
    calculateTagsScore(tags) {
        if (!tags || tags.length === 0) return 0;
        let score = 0;
        
        if (tags.length >= 3 && tags.length <= 5) score += 40;
        else if (tags.length > 0) score += Math.max(0, 40 - Math.abs(tags.length - 4) * 10);
        
        const relevantTags = ['math', 'reading', 'science', 'writing', 'social studies', 'elementary', 'middle school', 'high school'];
        const relevantCount = tags.filter(tag => 
            relevantTags.some(relevant => tag.toLowerCase().includes(relevant))
        ).length;
        
        score += Math.min(60, relevantCount * 15);
        
        return Math.min(100, score);
    },
    
    // Generate suggestions
    getTitleSuggestions(title) {
        const suggestions = [];
        if (!title || title.length < 30) suggestions.push('Make title more descriptive (30-60 characters)');
        if (!title || !title.includes('Grade')) suggestions.push('Include grade level in title');
        if (!title || !title.includes('Worksheet') && !title.includes('Activity')) suggestions.push('Specify resource type (Worksheet, Activity, Game, etc.)');
        return suggestions;
    },
    
    getDescriptionSuggestions(description) {
        const suggestions = [];
        if (!description || description.length < 120) suggestions.push('Expand description to 150-160 characters');
        if (!description || !description.includes('grade')) suggestions.push('Include target grade level');
        if (!description || !description.includes('students')) suggestions.push('Mention target audience (students, teachers)');
        return suggestions;
    },
    
    getTagsSuggestions(tags) {
        const suggestions = [];
        if (!tags || tags.length < 3) suggestions.push('Add 3-5 relevant tags');
        if (!tags || tags.length > 5) suggestions.push('Reduce to 3-5 most relevant tags');
        if (!tags || !tags.some(tag => tag.toLowerCase().includes('grade'))) suggestions.push('Include grade level tag');
        return suggestions;
    },
    
    // Simple string hash function
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
};

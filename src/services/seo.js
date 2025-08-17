import { aiProvider } from './aiProvider.js';

// SEO optimization service with scoring and AI-powered rewriting
export class SEOService {
    constructor() {
        this.rules = {
            title: {
                minLength: 50,
                maxLength: 70,
                optimalLength: 60
            },
            description: {
                minLength: 120,
                maxLength: 300,
                optimalLength: 200
            },
            keywordDensity: {
                min: 1,
                max: 3,
                optimal: 2
            }
        };
    }

    /**
     * Score a title based on SEO best practices
     */
    scoreTitle(title, keywords = '') {
        let score = 0;
        const checks = [];
        const length = title.length;

        // Length scoring (0-30 points)
        if (length >= this.rules.title.minLength && length <= this.rules.title.maxLength) {
            score += 30;
            checks.push({ type: 'success', message: 'Title length is optimal', points: 30 });
        } else if (length < this.rules.title.minLength) {
            score += 15;
            checks.push({ type: 'warning', message: 'Title is too short - consider expanding', points: 15 });
        } else {
            score += 10;
            checks.push({ type: 'error', message: 'Title is too long - consider shortening', points: 10 });
        }

        // Keyword presence (0-25 points)
        if (keywords) {
            const keywordList = keywords.toLowerCase().split(',').map(k => k.trim());
            const titleLower = title.toLowerCase();
            const keywordsFound = keywordList.filter(keyword => titleLower.includes(keyword));
            
            if (keywordsFound.length > 0) {
                score += 25;
                checks.push({ type: 'success', message: `Target keywords found: ${keywordsFound.join(', ')}`, points: 25 });
            } else {
                checks.push({ type: 'warning', message: 'No target keywords found in title', points: 0 });
            }
        }

        // Readability (0-20 points)
        const words = title.split(' ');
        if (words.length >= 5 && words.length <= 12) {
            score += 20;
            checks.push({ type: 'success', message: 'Good word count for readability', points: 20 });
        } else if (words.length < 5) {
            score += 10;
            checks.push({ type: 'warning', message: 'Title might be too brief', points: 10 });
        } else {
            score += 15;
            checks.push({ type: 'warning', message: 'Title might be too wordy', points: 15 });
        }

        // Punctuation and formatting (0-15 points)
        const hasExcessivePunctuation = (title.match(/[!@#$%^&*()]/g) || []).length > 2;
        if (!hasExcessivePunctuation) {
            score += 15;
            checks.push({ type: 'success', message: 'Clean formatting without excessive punctuation', points: 15 });
        } else {
            checks.push({ type: 'error', message: 'Avoid excessive punctuation marks', points: 0 });
        }

        // Capitalization (0-10 points)
        const hasProperCase = title.charAt(0) === title.charAt(0).toUpperCase();
        if (hasProperCase) {
            score += 10;
            checks.push({ type: 'success', message: 'Proper capitalization', points: 10 });
        } else {
            checks.push({ type: 'warning', message: 'Consider proper capitalization', points: 0 });
        }

        return {
            score: Math.min(100, score),
            checks,
            recommendations: this.generateTitleRecommendations(title, keywords, checks)
        };
    }

    /**
     * Score a description based on SEO best practices
     */
    scoreDescription(description, keywords = '') {
        let score = 0;
        const checks = [];
        const length = description.length;
        const wordCount = description.split(' ').length;

        // Length scoring (0-35 points)
        if (length >= this.rules.description.minLength && length <= this.rules.description.maxLength) {
            score += 35;
            checks.push({ type: 'success', message: 'Description length is optimal', points: 35 });
        } else if (length < this.rules.description.minLength) {
            score += 20;
            checks.push({ type: 'warning', message: 'Description is too short - expand for better SEO', points: 20 });
        } else {
            score += 15;
            checks.push({ type: 'error', message: 'Description is too long - consider shortening', points: 15 });
        }

        // Keyword density (0-25 points)
        if (keywords) {
            const keywordList = keywords.toLowerCase().split(',').map(k => k.trim());
            const descriptionLower = description.toLowerCase();
            let totalKeywordOccurrences = 0;
            
            keywordList.forEach(keyword => {
                const occurrences = (descriptionLower.match(new RegExp(keyword, 'g')) || []).length;
                totalKeywordOccurrences += occurrences;
            });
            
            const density = (totalKeywordOccurrences / wordCount) * 100;
            
            if (density >= this.rules.keywordDensity.min && density <= this.rules.keywordDensity.max) {
                score += 25;
                checks.push({ type: 'success', message: `Keyword density is optimal (${density.toFixed(1)}%)`, points: 25 });
            } else if (density < this.rules.keywordDensity.min) {
                score += 15;
                checks.push({ type: 'warning', message: `Keyword density is low (${density.toFixed(1)}%) - consider adding more keywords`, points: 15 });
            } else {
                score += 10;
                checks.push({ type: 'warning', message: `Keyword density is high (${density.toFixed(1)}%) - avoid keyword stuffing`, points: 10 });
            }
        }

        // Readability (0-20 points)
        const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgWordsPerSentence = wordCount / sentences.length;
        
        if (avgWordsPerSentence <= 20) {
            score += 20;
            checks.push({ type: 'success', message: 'Good readability with clear sentences', points: 20 });
        } else if (avgWordsPerSentence <= 25) {
            score += 15;
            checks.push({ type: 'warning', message: 'Consider shortening some sentences for better readability', points: 15 });
        } else {
            score += 10;
            checks.push({ type: 'error', message: 'Sentences are too long - break them up for better readability', points: 10 });
        }

        // Educational focus (0-10 points)
        const educationalKeywords = ['student', 'learn', 'teach', 'education', 'classroom', 'grade', 'activity', 'worksheet', 'practice'];
        const foundEducationalTerms = educationalKeywords.filter(term => 
            description.toLowerCase().includes(term)
        );
        
        if (foundEducationalTerms.length >= 2) {
            score += 10;
            checks.push({ type: 'success', message: 'Good use of educational terminology', points: 10 });
        } else if (foundEducationalTerms.length >= 1) {
            score += 7;
            checks.push({ type: 'success', message: 'Some educational terminology used', points: 7 });
        } else {
            checks.push({ type: 'warning', message: 'Consider adding educational terminology', points: 0 });
        }

        // Call to action (0-10 points)
        const hasCallToAction = /\b(perfect for|ideal for|great for|download|get|grab|check out)\b/i.test(description);
        if (hasCallToAction) {
            score += 10;
            checks.push({ type: 'success', message: 'Includes compelling call-to-action language', points: 10 });
        } else {
            checks.push({ type: 'warning', message: 'Consider adding call-to-action language', points: 0 });
        }

        return {
            score: Math.min(100, score),
            checks,
            recommendations: this.generateDescriptionRecommendations(description, keywords, checks)
        };
    }

    /**
     * Generate overall SEO score for a product
     */
    scoreProduct(product, keywords = '') {
        const titleScore = this.scoreTitle(product.title || '', keywords);
        const descriptionScore = this.scoreDescription(product.description || '', keywords);
        
        // Weighted scoring: title 40%, description 60%
        const overallScore = Math.round((titleScore.score * 0.4) + (descriptionScore.score * 0.6));
        
        return {
            overall: overallScore,
            title: titleScore,
            description: descriptionScore,
            recommendations: [
                ...titleScore.recommendations,
                ...descriptionScore.recommendations
            ]
        };
    }

    generateTitleRecommendations(title, keywords, checks) {
        const recommendations = [];
        const length = title.length;
        
        if (length < this.rules.title.minLength) {
            recommendations.push({
                type: 'improve',
                message: `Expand title to ${this.rules.title.minLength}-${this.rules.title.maxLength} characters for better SEO`,
                priority: 'high'
            });
        }
        
        if (length > this.rules.title.maxLength) {
            recommendations.push({
                type: 'improve',
                message: `Shorten title to under ${this.rules.title.maxLength} characters`,
                priority: 'high'
            });
        }
        
        if (keywords && !title.toLowerCase().includes(keywords.toLowerCase().split(',')[0])) {
            recommendations.push({
                type: 'improve',
                message: 'Include your primary keyword in the title',
                priority: 'high'
            });
        }
        
        return recommendations;
    }

    generateDescriptionRecommendations(description, keywords, checks) {
        const recommendations = [];
        const length = description.length;
        
        if (length < this.rules.description.minLength) {
            recommendations.push({
                type: 'improve',
                message: `Expand description to ${this.rules.description.minLength}-${this.rules.description.maxLength} characters`,
                priority: 'high'
            });
        }
        
        if (!description.toLowerCase().includes('student') && !description.toLowerCase().includes('teacher')) {
            recommendations.push({
                type: 'improve',
                message: 'Add educational context (students, teachers, classroom)',
                priority: 'medium'
            });
        }
        
        if (!description.includes('.')) {
            recommendations.push({
                type: 'improve',
                message: 'Break text into clear sentences for better readability',
                priority: 'medium'
            });
        }
        
        return recommendations;
    }
}

// Export functions for use in pages
export async function generateSEOVariants(type, content, keywords = '', options = {}) {
    try {
        const constraints = {
            gradeLevel: options.gradeLevel || '',
            subject: options.subject || '',
            tone: options.tone || 'professional'
        };

        const variants = await aiProvider.rewriteForSEO(content, type, keywords, constraints);
        return variants;

    } catch (error) {
        console.error('Error generating SEO variants:', error);
        throw error;
    }
}

export function scoreSEO(product, keywords = '') {
    const seoService = new SEOService();
    return seoService.scoreProduct(product, keywords);
}

// Export singleton instance
export const seoService = new SEOService();

import { aiProvider } from './aiProvider.js';

export class SocialContentGenerator {
    constructor() {
        this.templates = {
            pinterest: {
                'problem-solution': 'Struggling with {topic}? This {product} is the perfect solution! {description} Perfect for {audience}. #TPT #{hashtags}',
                'feature-highlight': 'This {product} includes: ✅ {features} ✅ Easy to use ✅ Perfect for {grade} #TeachersPayTeachers #{hashtags}',
                'social-proof': 'Teachers LOVE this {product}! "{testimonial}" - Perfect for your {subject} classroom. #{hashtags}',
                'seasonal': 'Get ready for {season} with this amazing {product}! {description} Your students will love it! #{hashtags}'
            },
            instagram: {
                'behind-scenes': 'Creating resources for teachers is my passion! ✨ This {product} took {time} to create but will save you hours! #{hashtags}',
                'student-focused': 'Want to see your students {outcome}? This {product} makes {subject} fun and engaging! Perfect for {grade} 🎯 #{hashtags}',
                'teacher-life': 'Teacher hack: Use this {product} for {use_case}! Makes {subject} so much easier to teach. Who else needs this? #{hashtags}',
                'transformation': 'From confusion to confidence! This {product} helps students master {topic} step by step. #{hashtags}'
            },
            facebook: {
                'detailed-description': 'Fellow educators! I just created this comprehensive {product} that covers {topics}. Perfect for {grade} students who need extra practice with {subject}. {description} #{hashtags}',
                'community-question': 'Teachers, what are your biggest challenges with teaching {topic}? I created this {product} to help with exactly that! {description} #{hashtags}',
                'success-story': 'Amazing results! After using this {product}, my students showed {improvement}. Perfect for any {subject} teacher looking to {benefit}. #{hashtags}',
                'resource-share': 'Sharing is caring! This {product} has been a game-changer in my classroom. {description} Perfect for {grade} {subject}. #{hashtags}'
            }
        };

        this.hashtagSets = {
            general: ['TPT', 'TeachersPayTeachers', 'Teaching', 'Education', 'Classroom', 'TeacherLife'],
            math: ['MathEducation', 'MathTeacher', 'MathResources', 'MathActivities', 'LearnMath'],
            english: ['EnglishTeacher', 'ELA', 'Reading', 'Writing', 'Literature', 'Grammar'],
            science: ['ScienceEducation', 'ScienceTeacher', 'STEM', 'ScienceActivities', 'Learning'],
            social_studies: ['SocialStudies', 'History', 'Geography', 'Civics', 'SocialStudiesTeacher'],
            elementary: ['ElementaryEducation', 'PrimarySchool', 'EarlyLearning', 'K12', 'ElementaryTeacher'],
            middle_school: ['MiddleSchool', 'MiddleGrades', '6thGrade', '7thGrade', '8thGrade'],
            high_school: ['HighSchool', 'SecondaryEducation', '9thGrade', '10thGrade', '11thGrade', '12thGrade']
        };
    }

    /**
     * Generate social content for a specific platform
     */
    async generateContent(product, platform, count = 5, options = {}) {
        const {
            tone = 'professional',
            audience = 'teachers',
            includeHashtags = true,
            includeCTA = true,
            template = null
        } = options;

        try {
            // Use AI for content generation
            const posts = await aiProvider.generateSocialContent(
                product,
                platform,
                count
            );

            // Process and enhance the generated content
            return posts.map(post => this.enhancePost(post, platform, {
                tone,
                audience,
                includeHashtags,
                includeCTA,
                product
            }));

        } catch (error) {
            console.error('Error generating social content:', error);
            
            // Fallback to template-based generation
            return this.generateFromTemplates(product, platform, count, options);
        }
    }

    /**
     * Enhance generated post with additional formatting and hashtags
     */
    enhancePost(post, platform, options) {
        const { includeHashtags, product } = options;

        let enhancedPost = { ...post };

        // Add platform-specific formatting
        if (platform === 'instagram') {
            enhancedPost.description = this.addInstagramFormatting(post.description);
        } else if (platform === 'pinterest') {
            enhancedPost = this.formatPinterestPost(post, product);
        }

        // Enhance hashtags if requested
        if (includeHashtags && post.hashtags) {
            enhancedPost.hashtags = this.enhanceHashtags(post.hashtags, product, platform);
        }

        return enhancedPost;
    }

    /**
     * Generate content using templates as fallback
     */
    generateFromTemplates(product, platform, count, options) {
        const { tone, audience, includeHashtags } = options;
        const platformTemplates = this.templates[platform] || this.templates.pinterest;
        const templateKeys = Object.keys(platformTemplates);

        const posts = [];
        
        for (let i = 0; i < count; i++) {
            const templateKey = templateKeys[i % templateKeys.length];
            const template = platformTemplates[templateKey];
            
            const post = this.processTemplate(template, product, {
                tone,
                audience,
                platform
            });

            if (includeHashtags) {
                post.hashtags = this.generateHashtags(product, platform);
            }

            posts.push(post);
        }

        return posts;
    }

    /**
     * Process a template with product data
     */
    processTemplate(template, product, options) {
        const { audience, platform } = options;

        // Extract subject and grade level from product data
        const subject = this.inferSubject(product);
        const grade = this.inferGradeLevel(product);

        const placeholders = {
            product: product.title,
            description: product.description?.substring(0, 150) + '...',
            topic: this.extractTopic(product.title),
            audience: audience,
            subject: subject,
            grade: grade,
            features: this.extractFeatures(product.description),
            outcome: this.getRandomOutcome(),
            use_case: this.getRandomUseCase(subject),
            time: this.getRandomTimeframe(),
            season: this.getCurrentSeason(),
            topics: this.extractTopics(product.description),
            benefit: this.getRandomBenefit(),
            improvement: this.getRandomImprovement(),
            testimonial: this.getRandomTestimonial()
        };

        let processedText = template;
        
        // Replace placeholders
        Object.keys(placeholders).forEach(key => {
            const regex = new RegExp(`{${key}}`, 'g');
            processedText = processedText.replace(regex, placeholders[key]);
        });

        // Clean up any remaining placeholders
        processedText = processedText.replace(/{[^}]+}/g, '');

        return {
            title: platform === 'pinterest' ? this.generatePinTitle(product) : undefined,
            description: processedText,
            platform: platform
        };
    }

    /**
     * Generate appropriate hashtags for the content
     */
    generateHashtags(product, platform) {
        const hashtags = [...this.hashtagSets.general];
        
        // Add subject-specific hashtags
        const subject = this.inferSubject(product);
        if (this.hashtagSets[subject]) {
            hashtags.push(...this.hashtagSets[subject].slice(0, 3));
        }

        // Add grade-level hashtags
        const gradeLevel = this.inferGradeLevel(product);
        if (gradeLevel && this.hashtagSets[gradeLevel]) {
            hashtags.push(...this.hashtagSets[gradeLevel].slice(0, 2));
        }

        // Add platform-specific hashtags
        if (platform === 'pinterest') {
            hashtags.push('PinterestFinds', 'TeachingResources');
        } else if (platform === 'instagram') {
            hashtags.push('TeachersOfInstagram', 'IGTeachers');
        }

        // Limit and format hashtags
        const uniqueHashtags = [...new Set(hashtags)]
            .slice(0, platform === 'instagram' ? 25 : 10)
            .map(tag => `#${tag}`);

        return uniqueHashtags;
    }

    enhanceHashtags(existingHashtags, product, platform) {
        const additional = this.generateHashtags(product, platform);
        const combined = [...existingHashtags, ...additional];
        
        return [...new Set(combined)].slice(0, platform === 'instagram' ? 25 : 10);
    }

    // Helper methods for content generation
    inferSubject(product) {
        const title = product.title.toLowerCase();
        const description = (product.description || '').toLowerCase();
        const content = `${title} ${description}`;

        if (content.includes('math') || content.includes('algebra') || content.includes('geometry')) {
            return 'math';
        }
        if (content.includes('english') || content.includes('reading') || content.includes('writing')) {
            return 'english';
        }
        if (content.includes('science') || content.includes('biology') || content.includes('chemistry')) {
            return 'science';
        }
        if (content.includes('history') || content.includes('social studies') || content.includes('geography')) {
            return 'social_studies';
        }

        return 'general';
    }

    inferGradeLevel(product) {
        const content = `${product.title} ${product.description || ''}`.toLowerCase();

        if (content.includes('elementary') || content.includes('primary') || 
            /\b(k|kindergarten|1st|2nd|3rd|4th|5th)\b/.test(content)) {
            return 'elementary';
        }
        if (content.includes('middle') || content.includes('6th') || 
            content.includes('7th') || content.includes('8th')) {
            return 'middle_school';
        }
        if (content.includes('high') || content.includes('9th') || 
            content.includes('10th') || content.includes('11th') || content.includes('12th')) {
            return 'high_school';
        }

        return null;
    }

    extractTopic(title) {
        // Simple topic extraction - get the main subject from title
        const commonWords = ['the', 'a', 'an', 'for', 'with', 'and', 'or', 'but'];
        const words = title.toLowerCase().split(' ')
            .filter(word => !commonWords.includes(word) && word.length > 3);
        
        return words[0] || 'this topic';
    }

    extractFeatures(description) {
        if (!description) return 'Multiple activities';
        
        const features = [];
        if (description.includes('printable')) features.push('Printable worksheets');
        if (description.includes('answer key')) features.push('Answer keys included');
        if (description.includes('digital')) features.push('Digital version');
        if (description.includes('assessment')) features.push('Assessment tools');
        
        return features.length > 0 ? features.join(' ✅ ') : 'Multiple activities';
    }

    extractTopics(description) {
        return description ? description.substring(0, 100) + '...' : 'various topics';
    }

    getRandomOutcome() {
        const outcomes = ['succeed', 'engage', 'learn effectively', 'improve their skills', 'gain confidence'];
        return outcomes[Math.floor(Math.random() * outcomes.length)];
    }

    getRandomUseCase(subject) {
        const useCases = {
            math: 'math centers, homework, or assessment prep',
            english: 'reading comprehension, writing practice, or vocabulary building',
            science: 'lab activities, concept review, or science fair prep',
            general: 'centers, homework, or independent practice'
        };
        return useCases[subject] || useCases.general;
    }

    getRandomTimeframe() {
        const timeframes = ['hours', 'weeks', 'months'];
        return timeframes[Math.floor(Math.random() * timeframes.length)];
    }

    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
    }

    getRandomBenefit() {
        const benefits = ['increase engagement', 'improve comprehension', 'save planning time', 'differentiate instruction'];
        return benefits[Math.floor(Math.random() * benefits.length)];
    }

    getRandomImprovement() {
        const improvements = ['significant improvement in test scores', 'increased participation', 'better understanding', 'more engagement'];
        return improvements[Math.floor(Math.random() * improvements.length)];
    }

    getRandomTestimonial() {
        const testimonials = [
            'This saved me so much time!',
            'My students love these activities!',
            'Perfect for differentiated instruction!',
            'Exactly what I was looking for!'
        ];
        return testimonials[Math.floor(Math.random() * testimonials.length)];
    }

    generatePinTitle(product) {
        const subject = this.inferSubject(product);
        const grade = this.inferGradeLevel(product);
        
        return `${product.title} | ${subject} Activities${grade ? ` | ${grade}` : ''}`;
    }

    addInstagramFormatting(text) {
        // Add line breaks and emojis for Instagram
        return text
            .replace(/\. /g, '.\n\n')
            .replace(/Perfect for/g, '✨ Perfect for')
            .replace(/Great for/g, '🎯 Great for');
    }

    formatPinterestPost(post, product) {
        return {
            title: post.title || this.generatePinTitle(product),
            description: post.description,
            platform: 'pinterest'
        };
    }

    /**
     * Export content to CSV format
     */
    exportToCSV(posts, platform) {
        const headers = ['Platform', 'Title', 'Description', 'Hashtags'];
        let csvContent = headers.join(',') + '\n';

        posts.forEach(post => {
            const title = (post.title || '').replace(/"/g, '""');
            const description = post.description.replace(/"/g, '""');
            const hashtags = post.hashtags ? post.hashtags.join(' ') : '';
            
            csvContent += `"${platform}","${title}","${description}","${hashtags}"\n`;
        });

        return csvContent;
    }
}

// Export functions for direct use
export async function generateSocialContent(product, platform, count = 5, options = {}) {
    const generator = new SocialContentGenerator();
    return await generator.generateContent(product, platform, count, options);
}

export function exportSocialContentToCSV(posts, platform) {
    const generator = new SocialContentGenerator();
    return generator.exportToCSV(posts, platform);
}

// Export singleton instance
export const socialContentGenerator = new SocialContentGenerator();

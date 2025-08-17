// AI Provider abstraction for OpenAI integration
// This allows us to swap AI providers later or add fallbacks

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

class AIProvider {
    constructor() {
        this.hasApiKey = !!OPENAI_API_KEY;
    }

    async generateContent(prompt, options = {}) {
        // Return mock data if no API key is available (demo mode)
        if (!this.hasApiKey) {
            console.warn('No OpenAI API key found, using demo mode');
            return this.getMockResponse(prompt, options);
        }

        try {
            const response = await fetch(OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: options.systemPrompt || 'You are a helpful assistant specialized in TPT (Teachers Pay Teachers) product optimization and SEO.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: options.maxTokens || 500,
                    temperature: options.temperature || 0.7,
                    response_format: options.responseFormat || undefined
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            console.error('AI Provider error:', error);
            
            // Fallback to mock response on error
            console.warn('Falling back to demo mode due to API error');
            return this.getMockResponse(prompt, options);
        }
    }

    async rewriteForSEO(content, type, keywords = '', constraints = {}) {
        const systemPrompt = `You are an expert SEO copywriter specializing in Teachers Pay Teachers products. 
        Create optimized content that ranks well in TPT search and appeals to teachers.
        
        Guidelines:
        - For titles: 50-70 characters, include target keywords naturally
        - For descriptions: 120-300 words, 1-2% keyword density, clear value proposition
        - Use teacher-focused language and educational terminology
        - Emphasize benefits for students and classroom use
        - Include grade levels and subject areas when relevant
        
        Return 3 different variants in JSON format:
        {"variants": ["variant1", "variant2", "variant3"]}`;

        const prompt = `Rewrite this ${type} for optimal TPT SEO:

Original ${type}: "${content}"
Target keywords: "${keywords}"
${constraints.gradeLevel ? `Grade level: ${constraints.gradeLevel}` : ''}
${constraints.subject ? `Subject: ${constraints.subject}` : ''}

Create 3 optimized variants that are different but equally effective.`;

        try {
            const response = await this.generateContent(prompt, {
                systemPrompt,
                responseFormat: { type: "json_object" },
                temperature: 0.8
            });

            const parsed = JSON.parse(response);
            return parsed.variants || [];

        } catch (error) {
            console.error('SEO rewrite error:', error);
            return this.getMockSEOVariants(content, type);
        }
    }

    async generateSocialContent(productData, platform, count = 5) {
        const systemPrompt = `You are a social media expert for Teachers Pay Teachers sellers.
        Create engaging ${platform} content that drives traffic to TPT products.
        
        Guidelines:
        - Use platform-specific best practices and hashtags
        - Focus on teacher pain points and solutions
        - Include calls-to-action
        - Emphasize educational value and student outcomes
        
        Return content in JSON format:
        {"posts": [{"title": "title", "description": "description", "hashtags": ["tag1", "tag2"]}]}`;

        const prompt = `Create ${count} ${platform} posts for this TPT product:

Title: ${productData.title}
Description: ${productData.description}
Grade Level: ${productData.gradeLevel || 'Various'}
Subject: ${productData.subject || 'Education'}
Price: $${productData.price}

Make each post unique and engaging for teachers on ${platform}.`;

        try {
            const response = await this.generateContent(prompt, {
                systemPrompt,
                responseFormat: { type: "json_object" },
                temperature: 0.9
            });

            const parsed = JSON.parse(response);
            return parsed.posts || [];

        } catch (error) {
            console.error('Social content generation error:', error);
            return this.getMockSocialPosts(productData, platform, count);
        }
    }

    // Mock responses for demo mode
    getMockResponse(prompt, options) {
        // Return realistic mock data based on the prompt
        if (prompt.includes('rewrite') || prompt.includes('SEO')) {
            return JSON.stringify({
                variants: [
                    "Algebra Task Cards | Linear Equations Activities | Middle School Math Worksheets",
                    "Linear Equations Task Cards Bundle | Algebra Practice | Grades 6-8 Math Activities",
                    "Middle School Algebra | Linear Equations Worksheets | Interactive Math Task Cards"
                ]
            });
        }

        if (prompt.includes('social') || prompt.includes('Pinterest') || prompt.includes('Instagram')) {
            return JSON.stringify({
                posts: [
                    {
                        title: "Transform Your Math Classroom with These Algebra Task Cards!",
                        description: "Help your students master linear equations with these engaging activities. Perfect for centers, homework, or assessment! 📚✨ #MathEducation #AlgebraActivities #TeachersOfInstagram",
                        hashtags: ["MathEducation", "AlgebraActivities", "TeachersOfInstagram", "MiddleSchoolMath", "TPTResources"]
                    },
                    {
                        title: "Linear Equations Made Easy!",
                        description: "These printable task cards are a game-changer for teaching algebra. Your students will actually enjoy practicing math! 🎯 #MathTeacher #LinearEquations #ClassroomResources",
                        hashtags: ["MathTeacher", "LinearEquations", "ClassroomResources", "TPT", "AlgebraHelp"]
                    }
                ]
            });
        }

        return "This is a demo response. Please add your OpenAI API key to use real AI features.";
    }

    getMockSEOVariants(content, type) {
        if (type === 'title') {
            return [
                "Algebra Task Cards | Linear Equations Activities | Middle School Math",
                "Linear Equations Worksheets Bundle | Algebra Practice for Grades 6-8",
                "Interactive Algebra Task Cards | Linear Equations | Math Centers"
            ];
        } else {
            return [
                "Transform your algebra lessons with these comprehensive linear equations task cards! Perfect for middle school students, these engaging activities make math fun and accessible. Includes answer keys and detailed instructions for easy implementation in any classroom setting.",
                "Help your students master linear equations with this complete task card bundle! These printable resources are designed for grades 6-8 and include step-by-step solutions. Ideal for math centers, homework assignments, or assessment preparation.",
                "Make algebra engaging with these interactive linear equations task cards! Your middle school students will love these hands-on activities that build confidence and understanding. Complete with teacher guides and student answer sheets for seamless classroom integration."
            ];
        }
    }

    getMockSocialPosts(productData, platform, count) {
        const posts = [
            {
                title: "Math Teachers, This One's for You!",
                description: "Struggling to make algebra engaging? These task cards are the perfect solution! Your students will actually ASK for more math practice. 🤯 #MathMiracles #TPTFinds",
                hashtags: ["MathMiracles", "TPTFinds", "AlgebraHelp", "TeachersOfInstagram"]
            },
            {
                title: "Linear Equations Made Simple",
                description: "From confusion to confidence in just one lesson! These task cards break down linear equations in a way that actually makes sense to middle schoolers. ✅ #MathSuccess #TeacherWin",
                hashtags: ["MathSuccess", "TeacherWin", "MiddleSchoolMath", "AlgebraActivities"]
            },
            {
                title: "The Math Resource You've Been Waiting For",
                description: "Finally, algebra activities that work! Perfect for centers, early finishers, or whole class practice. Your planning time just got easier! 🙌 #MathResources #TPT",
                hashtags: ["MathResources", "TPT", "TeacherLife", "AlgebraMadeEasy"]
            }
        ];

        return posts.slice(0, count);
    }

    isAvailable() {
        return this.hasApiKey;
    }

    getDemoMessage() {
        return 'AI features are running in demo mode. Add your OpenAI API key in Settings to unlock full functionality.';
    }
}

// Export singleton instance
export const aiProvider = new AIProvider();

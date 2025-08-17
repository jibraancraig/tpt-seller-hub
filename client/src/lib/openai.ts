// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateSEOVariants(title: string, description: string, keywords: string[] = []): Promise<any> {
    const prompt = `You are an expert SEO specialist for Teachers Pay Teachers products. Generate 3 optimized variants for the following product:

Current Title: ${title}
Current Description: ${description}
Target Keywords: ${keywords.join(', ')}

For each variant, provide:
1. An optimized title (50-70 characters ideal)
2. An optimized description (150-300 words)
3. A brief explanation of the optimization strategy

Focus on:
- Educational keywords and phrases
- Grade-level specificity
- Subject area clarity
- Action-oriented language
- SEO best practices for TPT

Return the response in JSON format with this structure:
{
  "variants": [
    {
      "title": "optimized title",
      "description": "optimized description",
      "strategy": "explanation of optimization approach",
      "score": estimated_seo_score_out_of_100
    }
  ]
}`;

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert SEO specialist for Teachers Pay Teachers products. Always respond with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate SEO variants. Please check your API key and try again.');
    }
  }

  async generateSocialContent(productTitle: string, productDescription: string, platform: string): Promise<any> {
    const platformSpecs = {
      pinterest: {
        titleLength: '60-100 characters',
        descriptionLength: '100-500 characters',
        style: 'Pinterest-optimized with rich pins focus',
        hashtagCount: '2-10 hashtags'
      },
      instagram: {
        titleLength: 'N/A (caption only)',
        descriptionLength: '125-250 characters',
        style: 'Instagram-ready with visual appeal',
        hashtagCount: '5-15 hashtags'
      },
      facebook: {
        titleLength: 'N/A (post only)',
        descriptionLength: '40-80 characters optimal',
        style: 'Facebook-friendly with engagement focus',
        hashtagCount: '1-3 hashtags'
      }
    };

    const specs = platformSpecs[platform as keyof typeof platformSpecs];
    
    const prompt = `Create engaging ${platform} content for this Teachers Pay Teachers product:

Product Title: ${productTitle}
Product Description: ${productDescription}

Platform: ${platform}
Specifications:
- Title Length: ${specs.titleLength}
- Description Length: ${specs.descriptionLength}
- Style: ${specs.style}
- Hashtags: ${specs.hashtagCount}

Generate 3 different content variations that:
1. Appeal to teachers and educators
2. Highlight the educational value
3. Include relevant educational hashtags
4. Use engaging, action-oriented language
5. Are optimized for ${platform}'s algorithm

Return as JSON:
{
  "posts": [
    {
      "title": "post title (if applicable)",
      "content": "main post content",
      "hashtags": ["hashtag1", "hashtag2"],
      "callToAction": "specific CTA"
    }
  ]
}`;

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a social media expert specializing in educational content for teachers. Always respond with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.8,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate social content. Please check your API key and try again.');
    }
  }

  async calculateSEOScore(title: string, description: string, keywords: string[] = []): Promise<number> {
    // Simple client-side SEO scoring algorithm
    let score = 0;
    
    // Title scoring (40% weight)
    const titleLength = title.length;
    if (titleLength >= 50 && titleLength <= 70) {
      score += 40;
    } else if (titleLength >= 40 && titleLength < 50) {
      score += 30;
    } else if (titleLength > 70 && titleLength <= 80) {
      score += 25;
    } else {
      score += 10;
    }
    
    // Description scoring (35% weight)
    const descLength = description.length;
    const wordCount = description.split(' ').length;
    
    if (descLength >= 150 && descLength <= 300) {
      score += 35;
    } else if (descLength >= 100 && descLength < 150) {
      score += 25;
    } else if (descLength > 300 && descLength <= 400) {
      score += 20;
    } else {
      score += 10;
    }
    
    // Keyword presence (25% weight)
    if (keywords.length > 0) {
      const titleLower = title.toLowerCase();
      const descLower = description.toLowerCase();
      let keywordScore = 0;
      
      keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        if (titleLower.includes(keywordLower)) keywordScore += 10;
        if (descLower.includes(keywordLower)) keywordScore += 5;
      });
      
      score += Math.min(25, keywordScore);
    }
    
    return Math.min(100, Math.round(score));
  }
}

export const createOpenAIService = (apiKey: string) => new OpenAIService(apiKey);

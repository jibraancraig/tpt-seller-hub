interface SerpApiResponse {
  organic_results?: Array<{
    position: number;
    link: string;
    title: string;
    snippet: string;
  }>;
  error?: string;
}

interface RankResult {
  position: number | null;
  urlFound: string | null;
  title: string | null;
  snippet: string | null;
}

export class SerpAPIService {
  private apiKey: string;
  private baseUrl = 'https://serpapi.com/search';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async checkRank(keyword: string, country: string = 'us', device: string = 'desktop'): Promise<RankResult> {
    const searchParams = new URLSearchParams({
      api_key: this.apiKey,
      engine: 'google',
      q: keyword,
      gl: country,
      hl: 'en',
      device: device,
      num: '100'
    });

    try {
      const response = await fetch(`${this.baseUrl}?${searchParams}`);

      if (!response.ok) {
        throw new Error(`SERP API request failed: ${response.status}`);
      }

      const data: SerpApiResponse = await response.json();

      if (data.error) {
        throw new Error(`SERP API error: ${data.error}`);
      }

      // Extract ranking data
      const organicResults = data.organic_results || [];

      // Look for Teachers Pay Teachers results
      for (let i = 0; i < organicResults.length; i++) {
        const result = organicResults[i];
        const resultUrl = this.cleanUrl(result.link || '');

        // Check if this is a TPT URL
        if (this.isTPTUrl(resultUrl)) {
          return {
            position: result.position || (i + 1),
            urlFound: result.link,
            title: result.title,
            snippet: result.snippet
          };
        }
      }

      // URL not found
      return {
        position: null,
        urlFound: null,
        title: null,
        snippet: null
      };
    } catch (error) {
      console.error('SerpAPI error:', error);
      throw new Error(`Failed to check rank for keyword "${keyword}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private cleanUrl(url: string): string {
    if (!url) return '';
    
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, '') + parsed.pathname.replace(/\/$/, '');
    } catch {
      return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
    }
  }

  private isTPTUrl(url: string): boolean {
    const cleanedUrl = url.toLowerCase();
    return cleanedUrl.includes('teacherspayteachers.com') || cleanedUrl.includes('tpt.com');
  }

  // Generate demo rank data for development/testing
  generateDemoRank(keyword: string): RankResult {
    // Generate consistent demo data based on keyword
    const hash = this.simpleHash(keyword);
    const position = (hash % 50) + 1;

    // Sometimes return "not found"
    if (hash % 7 === 0) {
      return {
        position: null,
        urlFound: null,
        title: null,
        snippet: null
      };
    }

    return {
      position: position,
      urlFound: 'https://www.teacherspayteachers.com/Product/demo',
      title: `Demo Result for "${keyword}"`,
      snippet: `This is demo ranking data for the keyword "${keyword}".`
    };
  }

  private simpleHash(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash);
  }
}

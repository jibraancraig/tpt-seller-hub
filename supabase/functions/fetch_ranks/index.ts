import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface KeywordRankRequest {
  userId?: string;
  keywordIds?: string[];
}

interface SerpApiResponse {
  organic_results?: Array<{
    position: number;
    link: string;
    title: string;
    snippet: string;
  }>;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify the JWT token
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const { userId, keywordIds }: KeywordRankRequest = await req.json()

    // Ensure user can only access their own data
    if (userId && userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get keywords to process
    let query = supabaseClient
      .from('keywords')
      .select(`
        id,
        phrase,
        country,
        device,
        products!inner(id, user_id, tpt_url)
      `)
      .eq('products.user_id', user.id)

    if (keywordIds && keywordIds.length > 0) {
      query = query.in('id', keywordIds)
    }

    const { data: keywords, error: keywordError } = await query

    if (keywordError) {
      console.error('Error fetching keywords:', keywordError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch keywords' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!keywords || keywords.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No keywords to process', processed: 0 }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const serpApiKey = Deno.env.get('SERPAPI_KEY')
    if (!serpApiKey) {
      console.warn('No SERPAPI_KEY found, using demo mode')
    }

    const results = []
    let processedCount = 0

    // Process keywords with rate limiting
    for (const keyword of keywords) {
      try {
        let rankData

        if (serpApiKey) {
          // Make actual SERP API request
          rankData = await fetchRealRank(keyword, serpApiKey)
        } else {
          // Generate demo rank data
          rankData = generateDemoRank(keyword)
        }

        // Insert rank record
        const { error: insertError } = await supabaseClient
          .from('ranks')
          .insert({
            keyword_id: keyword.id,
            position: rankData.position,
            url_found: rankData.url_found,
            fetched_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error inserting rank:', insertError)
          results.push({
            keyword_id: keyword.id,
            phrase: keyword.phrase,
            success: false,
            error: insertError.message
          })
        } else {
          results.push({
            keyword_id: keyword.id,
            phrase: keyword.phrase,
            success: true,
            position: rankData.position,
            demo_mode: !serpApiKey
          })
          processedCount++
        }

        // Add delay between requests to respect rate limits
        if (serpApiKey && keywords.indexOf(keyword) < keywords.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

      } catch (error) {
        console.error(`Error processing keyword ${keyword.phrase}:`, error)
        results.push({
          keyword_id: keyword.id,
          phrase: keyword.phrase,
          success: false,
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${processedCount} keywords`,
        processed: processedCount,
        total: keywords.length,
        results: results,
        demo_mode: !serpApiKey
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function fetchRealRank(keyword: any, serpApiKey: string) {
  const searchParams = new URLSearchParams({
    api_key: serpApiKey,
    engine: 'google',
    q: keyword.phrase,
    gl: keyword.country || 'us',
    hl: 'en',
    device: keyword.device || 'desktop',
    num: '100'
  })

  const response = await fetch(`https://serpapi.com/search?${searchParams}`)

  if (!response.ok) {
    throw new Error(`SERP API request failed: ${response.status}`)
  }

  const data: SerpApiResponse = await response.json()

  if (data.error) {
    throw new Error(`SERP API error: ${data.error}`)
  }

  // Extract ranking data
  const targetUrl = keyword.products?.tpt_url || ''
  const organicResults = data.organic_results || []

  // Look for the URL in organic results
  for (let i = 0; i < organicResults.length; i++) {
    const result = organicResults[i]
    const resultUrl = cleanUrl(result.link || '')
    const cleanTargetUrl = cleanUrl(targetUrl)

    if (urlsMatch(resultUrl, cleanTargetUrl)) {
      return {
        position: result.position || (i + 1),
        url_found: result.link,
        title: result.title,
        snippet: result.snippet
      }
    }
  }

  // URL not found
  return {
    position: null,
    url_found: null,
    title: null,
    snippet: null
  }
}

function generateDemoRank(keyword: any) {
  // Generate consistent demo data based on keyword
  const hash = simpleHash(keyword.phrase + (keyword.products?.tpt_url || ''))
  const position = (hash % 50) + 1

  // Sometimes return "not found"
  if (hash % 7 === 0) {
    return {
      position: null,
      url_found: null,
      title: null,
      snippet: null
    }
  }

  return {
    position: position,
    url_found: keyword.products?.tpt_url || 'https://www.teacherspayteachers.com/Product/demo',
    title: `Demo Result for "${keyword.phrase}"`,
    snippet: `This is demo ranking data for the keyword "${keyword.phrase}".`
  }
}

function cleanUrl(url: string): string {
  if (!url) return ''
  
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./, '') + parsed.pathname.replace(/\/$/, '')
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
  }
}

function urlsMatch(url1: string, url2: string): boolean {
  if (!url1 || !url2) return false
  
  const clean1 = url1.toLowerCase()
  const clean2 = url2.toLowerCase()
  
  return clean1 === clean2 || clean1.includes(clean2) || clean2.includes(clean1)
}

function simpleHash(str: string): number {
  let hash = 0
  if (str.length === 0) return hash
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  return Math.abs(hash)
}

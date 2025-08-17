// Ranks service for TPT Seller Hub
export const ranksService = {
  // Get rank data for a keyword (stub mode when no API key)
  async getRankData(keyword, productId) {
    const USE_STUBS = !window.APP_CONFIG.SERPAPI_KEY

    if (USE_STUBS) {
      // Return deterministic pseudo-random positions (seeded by keyword)
      return this.getStubRankData(keyword, productId)
    }

    // TODO: Implement actual SERP API call
    return this.getStubRankData(keyword, productId)
  },

  // Generate stub rank data
  getStubRankData(keyword, productId) {
    // Create deterministic "random" position based on keyword hash
    const hash = this.hashString(keyword)
    const position = (hash % 50) + 1 // Position 1-50

    const date = new Date()
    const rankData = {
      id: Date.now(),
      keyword: keyword,
      product_id: productId,
      position: position,
      date: date.toISOString(),
      search_volume: Math.floor((hash % 1000) + 100),
      competition: Math.floor((hash % 100) + 1),
      cpc: parseFloat(((hash % 500) / 100 + 0.5).toFixed(2)),
    }

    return rankData
  },

  // Simple string hash function
  hashString(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  },

  // Track a new keyword
  async trackKeyword(keyword, productId) {
    try {
      const rankData = await this.getRankData(keyword, productId)
      // TODO: Save to database
      return rankData
    } catch (error) {
      console.error("Error tracking keyword:", error)
      throw error
    }
  },

  // Get rank history for a keyword
  async getRankHistory(keyword, productId, days = 30) {
    const history = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const hash = this.hashString(keyword + date.toDateString())
      const position = (hash % 50) + 1

      history.push({
        date: date.toISOString(),
        position: position,
      })
    }

    return history
  },
}

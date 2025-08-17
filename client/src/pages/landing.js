export default class LandingPage {
  async render() {
    return `
      <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div class="container mx-auto px-4 py-16">
          <div class="max-w-4xl mx-auto text-center">
            <div class="mb-8">
              <img src="/icons/logo.svg" alt="TPT Seller Hub" class="h-16 mx-auto mb-6">
              <h1 class="text-5xl font-bold text-gray-900 mb-4">
                Optimize Your TPT Success
              </h1>
              <p class="text-xl text-gray-600 mb-8">
                All-in-one platform for SEO optimization, rank tracking, and social content generation
              </p>
            </div>

            <div class="grid md:grid-cols-3 gap-8 mb-12">
              <div class="bg-white p-6 rounded-xl shadow-sm">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <i class="fas fa-search text-blue-600"></i>
                </div>
                <h3 class="text-lg font-semibold mb-2">SEO Optimization</h3>
                <p class="text-gray-600">AI-powered title and description optimization with real-time scoring</p>
              </div>
              
              <div class="bg-white p-6 rounded-xl shadow-sm">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <i class="fas fa-chart-line text-green-600"></i>
                </div>
                <h3 class="text-lg font-semibold mb-2">Rank Tracking</h3>
                <p class="text-gray-600">Monitor your keyword rankings and track performance over time</p>
              </div>
              
              <div class="bg-white p-6 rounded-xl shadow-sm">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <i class="fas fa-share-alt text-purple-600"></i>
                </div>
                <h3 class="text-lg font-semibold mb-2">Social Content</h3>
                <p class="text-gray-600">Generate engaging social media content for all platforms</p>
              </div>
            </div>

            <div class="space-y-4">
              <button onclick="window.location.hash='#/auth'" 
                      class="bg-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors"
                      data-testid="button-get-started">
                Get Started Free
              </button>
              <p class="text-sm text-gray-500">
                No credit card required • 3 products free • Upgrade anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

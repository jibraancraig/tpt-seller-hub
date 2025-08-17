export default class DashboardPage {
  async render() {
    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p class="mt-2 text-gray-600">Overview of your TPT optimization progress</p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-boxes text-primary"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Products</p>
                <p class="text-2xl font-bold text-gray-900" id="stat-products" data-testid="stat-products">0</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-search text-success"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Tracked Keywords</p>
                <p class="text-2xl font-bold text-gray-900" id="stat-keywords" data-testid="stat-keywords">0</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-chart-line text-warning"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Avg Rank Δ7</p>
                <p class="text-2xl font-bold text-success" id="stat-rank-change" data-testid="stat-rank-change">--</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-dollar-sign text-success"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Revenue (Last 30d)</p>
                <p class="text-2xl font-bold text-gray-900" id="stat-revenue" data-testid="stat-revenue">$0</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Recent Products -->
          <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Recent Products</h3>
                <a href="#/products" class="text-sm font-medium text-primary hover:text-blue-700" data-testid="link-view-all-products">View all</a>
              </div>
            </div>
            <div id="recent-products" class="overflow-hidden">
              <div class="p-8 text-center text-gray-500" data-testid="empty-state-products">
                <i class="fas fa-boxes text-4xl mb-4 text-gray-300"></i>
                <p class="text-lg font-medium mb-2">No products yet</p>
                <p class="text-sm mb-4">Import your first product to get started</p>
                <button onclick="window.location.hash='#/products'" 
                        class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        data-testid="button-import-first-product">
                  Import Products
                </button>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="space-y-6">
            <div class="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white">
              <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
              <div class="space-y-3">
                <button onclick="window.location.hash='#/products'" 
                        class="w-full bg-white/20 hover:bg-white/30 rounded-lg p-3 text-left transition-colors"
                        data-testid="button-add-product">
                  <i class="fas fa-plus mr-2"></i>
                  Add New Product
                </button>
                <button onclick="window.location.hash='#/social'" 
                        class="w-full bg-white/20 hover:bg-white/30 rounded-lg p-3 text-left transition-colors"
                        data-testid="button-generate-social">
                  <i class="fas fa-magic mr-2"></i>
                  Generate Social Content
                </button>
                <button onclick="window.location.hash='#/rank'" 
                        class="w-full bg-white/20 hover:bg-white/30 rounded-lg p-3 text-left transition-colors"
                        data-testid="button-check-rankings">
                  <i class="fas fa-chart-line mr-2"></i>
                  Check Rankings
                </button>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div id="recent-activity" class="space-y-3">
                <div class="text-center text-gray-500 py-4" data-testid="empty-state-activity">
                  <i class="fas fa-clock text-2xl mb-2 text-gray-300"></i>
                  <p class="text-sm">No recent activity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    await this.loadDashboardData();
  }

  async loadDashboardData() {
    try {
      // Load products
      const products = await this.loadProducts();
      const keywords = await this.loadKeywords();
      
      // Update stats
      document.getElementById('stat-products').textContent = products.length;
      document.getElementById('stat-keywords').textContent = keywords.length;
      
      // Show recent products if any
      if (products.length > 0) {
        this.renderRecentProducts(products.slice(0, 5));
      }
      
      // Load activity
      this.loadRecentActivity();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  async loadProducts() {
    try {
      const { data, error } = await window.supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  }

  async loadKeywords() {
    try {
      const { data, error } = await window.supabase
        .from('keywords')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading keywords:', error);
      return [];
    }
  }

  renderRecentProducts(products) {
    const container = document.getElementById('recent-products');
    container.innerHTML = products.map(product => `
      <div class="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-medium text-gray-900 truncate">${product.title || 'Untitled Product'}</h4>
            <p class="text-sm text-gray-500 truncate">${product.description || 'No description'}</p>
            <div class="flex items-center mt-2 space-x-4">
              <div class="flex items-center">
                <span class="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                <span class="text-xs text-gray-600">SEO: --</span>
              </div>
              <div class="flex items-center">
                <span class="text-xs text-gray-600">Rank #</span>
                <span class="text-xs font-medium text-gray-900 ml-1">--</span>
              </div>
            </div>
          </div>
          <div class="ml-4 flex-shrink-0">
            <span class="text-sm font-medium text-gray-900">$${product.price || '0.00'}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  loadRecentActivity() {
    // For now, show empty state - will be populated as users perform actions
    const container = document.getElementById('recent-activity');
    container.innerHTML = `
      <div class="text-center text-gray-500 py-4" data-testid="empty-state-activity">
        <i class="fas fa-clock text-2xl mb-2 text-gray-300"></i>
        <p class="text-sm">No recent activity</p>
      </div>
    `;
  }
}

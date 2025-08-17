import { RanksService } from '../services/ranks.js';

export default class RankTrackerPage {
  constructor() {
    this.ranksService = new RanksService();
  }

  async render() {
    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Keyword & Rank Tracker</h1>
          <p class="mt-2 text-gray-600">Monitor your product rankings and keyword performance</p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <i class="fas fa-search text-primary"></i>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Total Keywords</p>
                <p class="text-xl font-bold text-gray-900" id="stat-total-keywords" data-testid="stat-total-keywords">0</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <i class="fas fa-arrow-up text-success"></i>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Improved</p>
                <p class="text-xl font-bold text-success" id="stat-improved" data-testid="stat-improved">0</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <i class="fas fa-arrow-down text-red-500"></i>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Declined</p>
                <p class="text-xl font-bold text-red-500" id="stat-declined" data-testid="stat-declined">0</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <i class="fas fa-trophy text-warning"></i>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Top 10</p>
                <p class="text-xl font-bold text-warning" id="stat-top-ten" data-testid="stat-top-ten">0</p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Keyword Table -->
          <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Keyword Rankings</h3>
                <div class="flex items-center space-x-3">
                  <input type="text" 
                         id="search-keywords" 
                         placeholder="Search keywords..." 
                         class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                         data-testid="input-search-keywords">
                  <button id="refresh-rankings-btn" 
                          class="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                          data-testid="button-refresh-rankings">
                    <i class="fas fa-sync-alt mr-2"></i>
                    Refresh
                  </button>
                </div>
              </div>
            </div>
            <div class="overflow-x-auto" id="keywords-table">
              <div class="p-8 text-center text-gray-500" data-testid="empty-state-keywords">
                <i class="fas fa-search text-4xl mb-4 text-gray-300"></i>
                <p class="text-lg font-medium mb-2">No keywords tracked yet</p>
                <p class="text-sm">Add keywords to start tracking rankings</p>
              </div>
            </div>
          </div>

          <!-- Add Keyword & Controls -->
          <div class="space-y-6">
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Add New Keyword</h3>
              <form id="add-keyword-form" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Keyword Phrase</label>
                  <input type="text" 
                         name="phrase" 
                         required 
                         class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                         placeholder="math worksheets"
                         data-testid="input-keyword-phrase">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Product</label>
                  <select name="product_id" 
                          required 
                          id="product-select"
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          data-testid="select-product">
                    <option value="">Select a product...</option>
                  </select>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <select name="country" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Device</label>
                    <select name="device" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="desktop">Desktop</option>
                      <option value="mobile">Mobile</option>
                      <option value="tablet">Tablet</option>
                    </select>
                  </div>
                </div>
                <button type="submit" 
                        class="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        data-testid="button-track-keyword">
                  Track Keyword
                </button>
              </form>
            </div>

            <!-- Rank History Chart -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Rank History</h3>
              <div class="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                <canvas id="rankChart" class="max-w-full max-h-full"></canvas>
              </div>
            </div>

            <!-- Alert Settings -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Alert Settings</h3>
              <div class="space-y-3">
                <label class="flex items-center">
                  <input type="checkbox" class="rounded border-gray-300 text-primary focus:ring-primary" checked data-testid="checkbox-rank-improvements">
                  <span class="ml-2 text-sm text-gray-700">Rank improvements</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" class="rounded border-gray-300 text-primary focus:ring-primary" checked data-testid="checkbox-significant-drops">
                  <span class="ml-2 text-sm text-gray-700">Significant drops</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" class="rounded border-gray-300 text-primary focus:ring-primary" data-testid="checkbox-weekly-reports">
                  <span class="ml-2 text-sm text-gray-700">Weekly reports</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    await this.loadProducts();
    await this.loadKeywords();
    this.setupEventListeners();
    this.initChart();
  }

  setupEventListeners() {
    // Add keyword form
    document.getElementById('add-keyword-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.addKeyword(e);
    });

    // Search functionality
    document.getElementById('search-keywords').addEventListener('input', (e) => {
      this.filterKeywords(e.target.value);
    });

    // Refresh rankings
    document.getElementById('refresh-rankings-btn').addEventListener('click', () => {
      this.refreshRankings();
    });
  }

  async loadProducts() {
    try {
      const { data, error } = await window.supabase
        .from('products')
        .select('id, title')
        .order('title');

      if (error) throw error;

      const select = document.getElementById('product-select');
      select.innerHTML = '<option value="">Select a product...</option>' + 
        (data || []).map(product => `<option value="${product.id}">${product.title}</option>`).join('');

    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  async loadKeywords() {
    try {
      const { data, error } = await window.supabase
        .from('keywords')
        .select(`
          *,
          products!inner(title),
          ranks!left(position, fetched_at)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.keywords = data || [];
      this.renderKeywords(this.keywords);
      this.updateStats();

    } catch (error) {
      console.error('Error loading keywords:', error);
      this.keywords = [];
    }
  }

  renderKeywords(keywords) {
    const container = document.getElementById('keywords-table');
    
    if (keywords.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-gray-500" data-testid="empty-state-keywords">
          <i class="fas fa-search text-4xl mb-4 text-gray-300"></i>
          <p class="text-lg font-medium mb-2">No keywords tracked yet</p>
          <p class="text-sm">Add keywords to start tracking rankings</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Rank</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          ${keywords.map(keyword => {
            const latestRank = keyword.ranks?.[0];
            const currentRank = latestRank?.position || '--';
            
            return `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-medium text-gray-900">${keyword.phrase}</span>
                  <div class="text-xs text-gray-500">${keyword.country} • ${keyword.device}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-600 truncate max-w-32">${keyword.products?.title || 'Unknown'}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-bold text-gray-900">${currentRank !== '--' ? '#' + currentRank : '--'}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center text-sm text-gray-500">
                    <i class="fas fa-minus mr-1"></i>
                    --
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="w-16 h-8 bg-gray-200 rounded"></div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onclick="fetchRankNow('${keyword.id}')" 
                          class="text-primary hover:text-blue-700 mr-3"
                          data-testid="button-fetch-now-${keyword.id}">
                    Fetch Now
                  </button>
                  <button onclick="deleteKeyword('${keyword.id}')" 
                          class="text-red-600 hover:text-red-900"
                          data-testid="button-delete-keyword-${keyword.id}">
                    Delete
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    // Set up action functions
    window.fetchRankNow = async (keywordId) => {
      await this.fetchRankNow(keywordId);
    };

    window.deleteKeyword = async (keywordId) => {
      await this.deleteKeyword(keywordId);
    };
  }

  updateStats() {
    document.getElementById('stat-total-keywords').textContent = this.keywords.length;
    
    // For now, show 0 for other stats - would be calculated from historical rank data
    document.getElementById('stat-improved').textContent = '0';
    document.getElementById('stat-declined').textContent = '0';
    document.getElementById('stat-top-ten').textContent = '0';
  }

  filterKeywords(searchTerm) {
    const filtered = this.keywords.filter(keyword => 
      keyword.phrase.toLowerCase().includes(searchTerm.toLowerCase()) ||
      keyword.products?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    this.renderKeywords(filtered);
  }

  async addKeyword(e) {
    const formData = new FormData(e.target);
    const keywordData = {
      phrase: formData.get('phrase'),
      product_id: formData.get('product_id'),
      country: formData.get('country'),
      device: formData.get('device')
    };

    try {
      const { data, error } = await window.supabase
        .from('keywords')
        .insert(keywordData);

      if (error) throw error;

      window.showToast('Keyword added successfully!');
      e.target.reset();
      await this.loadKeywords();

    } catch (error) {
      window.showToast('Failed to add keyword', 'error');
      console.error(error);
    }
  }

  async fetchRankNow(keywordId) {
    try {
      const position = await this.ranksService.fetchPosition(keywordId);
      
      // Store the rank
      const { error } = await window.supabase
        .from('ranks')
        .insert({
          keyword_id: keywordId,
          position: position,
          fetched_at: new Date().toISOString()
        });

      if (error) throw error;

      window.showToast(`Rank fetched: #${position}`);
      await this.loadKeywords();

    } catch (error) {
      window.showToast('Failed to fetch rank', 'error');
      console.error(error);
    }
  }

  async deleteKeyword(keywordId) {
    if (!confirm('Are you sure you want to delete this keyword?')) return;

    try {
      const { error } = await window.supabase
        .from('keywords')
        .delete()
        .eq('id', keywordId);

      if (error) throw error;

      window.showToast('Keyword deleted successfully');
      await this.loadKeywords();

    } catch (error) {
      window.showToast('Failed to delete keyword', 'error');
      console.error(error);
    }
  }

  async refreshRankings() {
    window.showToast('Refreshing all rankings...');
    
    for (const keyword of this.keywords) {
      try {
        await this.fetchRankNow(keyword.id);
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to refresh rank for keyword ${keyword.id}:`, error);
      }
    }
    
    window.showToast('All rankings refreshed!');
  }

  initChart() {
    const ctx = document.getElementById('rankChart');
    if (!ctx) return;

    // Mock data for demo
    const mockData = Array.from({length: 14}, (_, i) => Math.floor(Math.random() * 20) + 1);
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({length: 14}, (_, i) => i + 1),
        datasets: [{
          label: 'Rank Position',
          data: mockData,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#10B981'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            reverse: true,
            beginAtZero: false,
            title: {
              display: true,
              text: 'Rank Position'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Days Ago'
            }
          }
        }
      }
    });
  }
}

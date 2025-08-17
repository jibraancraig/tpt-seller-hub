import { SEOService } from '../services/seo.js';
import { showModal } from '../ui/modals.js';

export default class ProductDetailPage {
  constructor() {
    this.seoService = new SEOService();
  }

  async render(params) {
    const product = await this.loadProduct(params.productId);
    
    if (!product) {
      return `
        <div class="min-h-screen flex items-center justify-center">
          <div class="text-center">
            <h1 class="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
            <p class="text-gray-600 mb-4">The requested product could not be found.</p>
            <button onclick="window.location.hash = '#/products'" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Back to Products
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <div class="flex items-center space-x-4 mb-4">
            <button onclick="window.history.back()" class="text-gray-500 hover:text-gray-700" data-testid="button-back">
              <i class="fas fa-arrow-left"></i>
            </button>
            <h1 class="text-3xl font-bold text-gray-900">${product.title}</h1>
          </div>
          <p class="text-gray-600">Optimize your product for better search rankings</p>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200 mb-8">
          <nav class="-mb-px flex space-x-8">
            <button class="tab-btn border-b-2 border-primary text-primary py-4 px-1 text-sm font-medium" data-tab="seo" data-testid="tab-seo">
              SEO Optimization
            </button>
            <button class="tab-btn border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-4 px-1 text-sm font-medium" data-tab="keywords" data-testid="tab-keywords">
              Keywords
            </button>
            <button class="tab-btn border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-4 px-1 text-sm font-medium" data-tab="social" data-testid="tab-social">
              Social Content
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div id="tab-content">
          ${this.renderSEOTab(product)}
        </div>
      </div>
    `;
  }

  renderSEOTab(product) {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main SEO Editor -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Title Optimization -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Title Optimization</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Current Title</label>
                <textarea id="title-input" 
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                          placeholder="Enter your product title..."
                          data-testid="textarea-title">${product.seo_title || product.title || ''}</textarea>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-sm text-gray-500" id="title-length">0 characters</span>
                  <span class="text-sm" id="title-status">--</span>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Target Keywords</label>
                <input type="text" 
                       id="keywords-input"
                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                       placeholder="algebra, linear equations, math activities"
                       data-testid="input-keywords">
              </div>

              <button id="generate-title-btn" 
                      class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      data-testid="button-generate-title">
                <i class="fas fa-magic mr-2"></i>
                Generate AI Variants
              </button>
            </div>
          </div>

          <!-- Description Optimization -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Description Optimization</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Current Description</label>
                <textarea id="description-input" 
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                          placeholder="Enter your product description..."
                          data-testid="textarea-description">${product.seo_description || product.description || ''}</textarea>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-sm text-gray-500" id="description-length">0 characters</span>
                  <span class="text-sm" id="description-status">--</span>
                </div>
              </div>

              <button id="generate-description-btn" 
                      class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      data-testid="button-generate-description">
                <i class="fas fa-magic mr-2"></i>
                Generate AI Variants
              </button>
            </div>
          </div>

          <!-- AI Variants -->
          <div id="ai-variants" class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hidden">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">AI-Generated Variants</h3>
            <div id="variants-container" class="space-y-4">
              <!-- Variants will be populated here -->
            </div>
          </div>
        </div>

        <!-- SEO Score Panel -->
        <div class="space-y-6">
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">SEO Score</h3>
            <div class="text-center mb-6">
              <div class="relative w-24 h-24 mx-auto">
                <svg class="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#E5E7EB" stroke-width="8" fill="transparent"/>
                  <circle id="score-circle" cx="48" cy="48" r="40" stroke="#10B981" stroke-width="8" fill="transparent" stroke-dasharray="251" stroke-dashoffset="251"/>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-2xl font-bold text-gray-900" id="total-score" data-testid="text-seo-score">--</span>
                </div>
              </div>
              <p class="text-sm text-gray-600 mt-2">Overall Score</p>
            </div>

            <div class="space-y-4" id="score-breakdown">
              <!-- Score breakdown will be populated here -->
            </div>
          </div>

          <!-- Recommendations -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div id="recommendations" class="space-y-3">
              <!-- Recommendations will be populated here -->
            </div>
          </div>

          <!-- Publish Button -->
          <button id="publish-btn" 
                  class="w-full bg-success text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  data-testid="button-publish">
            <i class="fas fa-rocket mr-2"></i>
            Publish Optimized Content
          </button>
        </div>
      </div>
    `;
  }

  renderKeywordsTab() {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="p-6 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Tracked Keywords</h3>
            </div>
            <div id="keywords-list" class="overflow-hidden">
              <div class="p-8 text-center text-gray-500" data-testid="empty-state-keywords">
                <i class="fas fa-search text-4xl mb-4 text-gray-300"></i>
                <p class="text-lg font-medium mb-2">No keywords tracked yet</p>
                <p class="text-sm">Add keywords to start tracking rankings</p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Add Keyword</h3>
            <form id="add-keyword-form" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Keyword Phrase</label>
                <input type="text" name="phrase" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" data-testid="input-keyword-phrase">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select name="country" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Device</label>
                <select name="device" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                  <option value="tablet">Tablet</option>
                </select>
              </div>
              
              <button type="submit" class="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors" data-testid="button-add-keyword">
                Track Keyword
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  renderSocialTab() {
    return `
      <div class="text-center text-gray-500 py-8">
        <i class="fas fa-share-alt text-4xl mb-4 text-gray-300"></i>
        <p class="text-lg font-medium mb-2">Social Content Generation</p>
        <p class="text-sm mb-4">Generate social media content for this product</p>
        <button onclick="window.location.hash='#/social'" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Go to Social Generator
        </button>
      </div>
    `;
  }

  async init(params) {
    this.productId = params.productId;
    this.product = await this.loadProduct(params.productId);
    
    if (!this.product) return;

    this.setupEventListeners();
    this.updateSEOScore();
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabName = e.target.getAttribute('data-tab');
        this.switchTab(tabName);
      });
    });

    // Title and description input handlers
    const titleInput = document.getElementById('title-input');
    const descriptionInput = document.getElementById('description-input');

    titleInput.addEventListener('input', () => {
      this.updateTitleMetrics();
      this.updateSEOScore();
    });

    descriptionInput.addEventListener('input', () => {
      this.updateDescriptionMetrics();
      this.updateSEOScore();
    });

    // AI generation buttons
    document.getElementById('generate-title-btn').addEventListener('click', () => {
      this.generateTitleVariants();
    });

    document.getElementById('generate-description-btn').addEventListener('click', () => {
      this.generateDescriptionVariants();
    });

    // Publish button
    document.getElementById('publish-btn').addEventListener('click', () => {
      this.publishOptimizedContent();
    });

    // Initial updates
    this.updateTitleMetrics();
    this.updateDescriptionMetrics();
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('border-primary', 'text-primary');
      btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700');
    });

    document.querySelector(`[data-tab="${tabName}"]`).classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('border-primary', 'text-primary');

    // Update content
    const contentContainer = document.getElementById('tab-content');
    switch (tabName) {
      case 'seo':
        contentContainer.innerHTML = this.renderSEOTab(this.product);
        this.setupEventListeners();
        break;
      case 'keywords':
        contentContainer.innerHTML = this.renderKeywordsTab();
        this.setupKeywordsTab();
        break;
      case 'social':
        contentContainer.innerHTML = this.renderSocialTab();
        break;
    }
  }

  setupKeywordsTab() {
    const form = document.getElementById('add-keyword-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const keyword = {
        phrase: formData.get('phrase'),
        country: formData.get('country'),
        device: formData.get('device'),
        product_id: this.productId
      };

      try {
        await this.saveKeyword(keyword);
        window.showToast('Keyword added successfully!');
        form.reset();
        this.loadKeywords();
      } catch (error) {
        window.showToast('Failed to add keyword', 'error');
        console.error(error);
      }
    });

    this.loadKeywords();
  }

  async saveKeyword(keyword) {
    const { data, error } = await window.supabase
      .from('keywords')
      .insert(keyword);

    if (error) throw error;
    return data;
  }

  async loadKeywords() {
    try {
      const { data, error } = await window.supabase
        .from('keywords')
        .select('*')
        .eq('product_id', this.productId);

      if (error) throw error;
      
      this.renderKeywords(data || []);
    } catch (error) {
      console.error('Error loading keywords:', error);
    }
  }

  renderKeywords(keywords) {
    const container = document.getElementById('keywords-list');
    
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
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${keywords.map(keyword => `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">${keyword.phrase}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${keyword.country}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${keyword.device}</td>
                <td class="px-6 py-4 text-sm text-gray-900">--</td>
                <td class="px-6 py-4 text-sm font-medium">
                  <button onclick="deleteKeyword('${keyword.id}')" class="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Set up delete function
    window.deleteKeyword = async (id) => {
      if (confirm('Are you sure you want to delete this keyword?')) {
        try {
          const { error } = await window.supabase
            .from('keywords')
            .delete()
            .eq('id', id);

          if (error) throw error;
          
          window.showToast('Keyword deleted successfully');
          this.loadKeywords();
        } catch (error) {
          window.showToast('Failed to delete keyword', 'error');
          console.error(error);
        }
      }
    };
  }

  updateTitleMetrics() {
    const titleInput = document.getElementById('title-input');
    const lengthSpan = document.getElementById('title-length');
    const statusSpan = document.getElementById('title-status');
    
    const length = titleInput.value.length;
    lengthSpan.textContent = `${length} characters`;
    
    if (length >= 50 && length <= 70) {
      statusSpan.textContent = 'Optimal length ✓';
      statusSpan.className = 'text-sm text-success';
    } else if (length < 50) {
      statusSpan.textContent = 'Too short';
      statusSpan.className = 'text-sm text-warning';
    } else {
      statusSpan.textContent = 'Too long';
      statusSpan.className = 'text-sm text-red-500';
    }
  }

  updateDescriptionMetrics() {
    const descriptionInput = document.getElementById('description-input');
    const lengthSpan = document.getElementById('description-length');
    const statusSpan = document.getElementById('description-status');
    
    const length = descriptionInput.value.length;
    lengthSpan.textContent = `${length} characters`;
    
    if (length >= 120 && length <= 300) {
      statusSpan.textContent = 'Good length ✓';
      statusSpan.className = 'text-sm text-success';
    } else if (length < 120) {
      statusSpan.textContent = 'Consider expanding';
      statusSpan.className = 'text-sm text-warning';
    } else {
      statusSpan.textContent = 'Too long';
      statusSpan.className = 'text-sm text-red-500';
    }
  }

  updateSEOScore() {
    const title = document.getElementById('title-input')?.value || '';
    const description = document.getElementById('description-input')?.value || '';
    const keywords = document.getElementById('keywords-input')?.value || '';
    
    const score = this.seoService.calculateScore(title, description, keywords);
    
    // Update circular progress
    const totalScoreElement = document.getElementById('total-score');
    const scoreCircle = document.getElementById('score-circle');
    
    if (totalScoreElement && scoreCircle) {
      totalScoreElement.textContent = score.total;
      
      const circumference = 2 * Math.PI * 40; // radius = 40
      const offset = circumference - (score.total / 100) * circumference;
      scoreCircle.style.strokeDashoffset = offset;
      
      // Update color based on score
      if (score.total >= 80) {
        scoreCircle.style.stroke = '#10B981'; // green
      } else if (score.total >= 60) {
        scoreCircle.style.stroke = '#F59E0B'; // yellow
      } else {
        scoreCircle.style.stroke = '#EF4444'; // red
      }
    }

    // Update breakdown
    this.renderScoreBreakdown(score);
    this.renderRecommendations(score);
  }

  renderScoreBreakdown(score) {
    const container = document.getElementById('score-breakdown');
    if (!container) return;

    container.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600">Title Length</span>
        <div class="flex items-center">
          <i class="fas fa-${score.titleLength >= 80 ? 'check text-success' : score.titleLength >= 60 ? 'exclamation-triangle text-warning' : 'times text-red-500'} mr-2"></i>
          <span class="text-sm font-medium text-gray-900">${score.titleLength}</span>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600">Keyword Placement</span>
        <div class="flex items-center">
          <i class="fas fa-${score.keywordPlacement >= 80 ? 'check text-success' : score.keywordPlacement >= 60 ? 'exclamation-triangle text-warning' : 'times text-red-500'} mr-2"></i>
          <span class="text-sm font-medium text-gray-900">${score.keywordPlacement}</span>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600">Description Quality</span>
        <div class="flex items-center">
          <i class="fas fa-${score.descriptionQuality >= 80 ? 'check text-success' : score.descriptionQuality >= 60 ? 'exclamation-triangle text-warning' : 'times text-red-500'} mr-2"></i>
          <span class="text-sm font-medium text-gray-900">${score.descriptionQuality}</span>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600">Readability</span>
        <div class="flex items-center">
          <i class="fas fa-${score.readability >= 80 ? 'check text-success' : score.readability >= 60 ? 'exclamation-triangle text-warning' : 'times text-red-500'} mr-2"></i>
          <span class="text-sm font-medium text-gray-900">${score.readability}</span>
        </div>
      </div>
    `;
  }

  renderRecommendations(score) {
    const container = document.getElementById('recommendations');
    if (!container) return;

    const recommendations = this.seoService.getRecommendations(score);
    
    container.innerHTML = recommendations.map(rec => `
      <div class="flex items-start">
        <i class="fas fa-${rec.type === 'success' ? 'check text-success' : rec.type === 'warning' ? 'lightbulb text-warning' : 'info-circle text-primary'} mt-1 mr-3"></i>
        <p class="text-sm text-gray-700">${rec.message}</p>
      </div>
    `).join('');
  }

  async generateTitleVariants() {
    const title = document.getElementById('title-input').value;
    const keywords = document.getElementById('keywords-input').value;
    
    try {
      const variants = await this.seoService.generateTitleVariants(title, keywords);
      this.showVariants('title', variants);
    } catch (error) {
      window.showToast('Failed to generate title variants', 'error');
      console.error(error);
    }
  }

  async generateDescriptionVariants() {
    const description = document.getElementById('description-input').value;
    const keywords = document.getElementById('keywords-input').value;
    
    try {
      const variants = await this.seoService.generateDescriptionVariants(description, keywords);
      this.showVariants('description', variants);
    } catch (error) {
      window.showToast('Failed to generate description variants', 'error');
      console.error(error);
    }
  }

  showVariants(type, variants) {
    const variantsContainer = document.getElementById('ai-variants');
    const variantsContent = document.getElementById('variants-container');
    
    variantsContainer.classList.remove('hidden');
    
    variantsContent.innerHTML = variants.map((variant, index) => `
      <div class="border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-medium text-gray-900">Variant ${index + 1}</h4>
          <button class="text-sm text-primary hover:text-blue-700 font-medium" 
                  onclick="selectVariant('${type}', '${variant.text.replace(/'/g, "\\'")}')">
            Use This
          </button>
        </div>
        <p class="text-sm text-gray-700">${variant.text}</p>
        <div class="mt-2 flex items-center space-x-4">
          <span class="text-xs text-gray-500">${variant.text.length} chars</span>
          <span class="text-xs text-success">Keywords: ✓</span>
          <span class="text-xs ${variant.text.length >= 50 && variant.text.length <= 70 ? 'text-success' : 'text-warning'}">Length: ${variant.text.length >= 50 && variant.text.length <= 70 ? '✓' : '⚠'}</span>
        </div>
      </div>
    `).join('');

    // Set up select variant function
    window.selectVariant = (variantType, text) => {
      const inputId = variantType === 'title' ? 'title-input' : 'description-input';
      document.getElementById(inputId).value = text;
      
      if (variantType === 'title') {
        this.updateTitleMetrics();
      } else {
        this.updateDescriptionMetrics();
      }
      
      this.updateSEOScore();
      window.showToast('Variant applied successfully!');
    };
  }

  async publishOptimizedContent() {
    const title = document.getElementById('title-input').value;
    const description = document.getElementById('description-input').value;
    
    if (!title || !description) {
      window.showToast('Please provide both title and description', 'error');
      return;
    }

    try {
      const { error } = await window.supabase
        .from('products')
        .update({
          seo_title: title,
          seo_description: description,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.productId);

      if (error) throw error;

      window.showToast('Optimized content published successfully!');
      
    } catch (error) {
      window.showToast('Failed to publish content', 'error');
      console.error(error);
    }
  }

  async loadProduct(productId) {
    try {
      const { data, error } = await window.supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error loading product:', error);
      return null;
    }
  }
}

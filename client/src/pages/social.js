import { SocialContentService } from '../services/social_gen.js';
import { showModal } from '../ui/modals.js';

export default class SocialPage {
  constructor() {
    this.socialService = new SocialContentService();
    this.generatedContent = {
      pinterest: [],
      instagram: [],
      facebook: []
    };
  }

  async render() {
    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Social Content Generator</h1>
          <p class="mt-2 text-gray-600">Create engaging social media content for your TPT products</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Content Generation -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Product Selection -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Select Product</h3>
              <select id="product-select" 
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      data-testid="select-product">
                <option value="">Select a product...</option>
              </select>
              <button id="generate-all-btn" 
                      class="mt-4 bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled
                      data-testid="button-generate-all">
                <i class="fas fa-magic mr-2"></i>
                Generate All Content Types
              </button>
            </div>

            <!-- Generated Content Tabs -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div class="border-b border-gray-200">
                <nav class="-mb-px flex">
                  <button class="tab-btn py-4 px-6 border-b-2 border-primary text-primary font-medium text-sm" 
                          data-tab="pinterest" 
                          data-testid="tab-pinterest">
                    <i class="fab fa-pinterest mr-2"></i>
                    Pinterest (<span id="pinterest-count">0</span>)
                  </button>
                  <button class="tab-btn py-4 px-6 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm" 
                          data-tab="instagram" 
                          data-testid="tab-instagram">
                    <i class="fab fa-instagram mr-2"></i>
                    Instagram (<span id="instagram-count">0</span>)
                  </button>
                  <button class="tab-btn py-4 px-6 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm" 
                          data-tab="facebook" 
                          data-testid="tab-facebook">
                    <i class="fab fa-facebook mr-2"></i>
                    Facebook (<span id="facebook-count">0</span>)
                  </button>
                </nav>
              </div>

              <!-- Pinterest Tab -->
              <div id="pinterest-tab" class="p-6">
                <div id="pinterest-content" class="space-y-4">
                  <div class="text-center text-gray-500 py-8" data-testid="empty-state-pinterest">
                    <i class="fab fa-pinterest text-4xl mb-4 text-gray-300"></i>
                    <p class="text-lg font-medium mb-2">No Pinterest content generated</p>
                    <p class="text-sm">Select a product and generate content to get started</p>
                  </div>
                </div>
              </div>

              <!-- Instagram Tab -->
              <div id="instagram-tab" class="p-6 hidden">
                <div id="instagram-content" class="space-y-4">
                  <div class="text-center text-gray-500 py-8" data-testid="empty-state-instagram">
                    <i class="fab fa-instagram text-4xl mb-4 text-gray-300"></i>
                    <p class="text-lg font-medium mb-2">No Instagram content generated</p>
                    <p class="text-sm">Select a product and generate content to get started</p>
                  </div>
                </div>
              </div>

              <!-- Facebook Tab -->
              <div id="facebook-tab" class="p-6 hidden">
                <div id="facebook-content" class="space-y-4">
                  <div class="text-center text-gray-500 py-8" data-testid="empty-state-facebook">
                    <i class="fab fa-facebook text-4xl mb-4 text-gray-300"></i>
                    <p class="text-lg font-medium mb-2">No Facebook content generated</p>
                    <p class="text-sm">Select a product and generate content to get started</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bulk Actions -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
              <div class="flex flex-wrap gap-3">
                <button id="export-csv-btn" 
                        class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        data-testid="button-export-csv">
                  <i class="fas fa-file-csv mr-2"></i>
                  Export to CSV
                </button>
                <button id="schedule-buffer-btn" 
                        class="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                        data-testid="button-schedule-buffer">
                  <i class="fas fa-calendar-plus mr-2"></i>
                  Schedule with Buffer
                </button>
                <button id="copy-all-btn" 
                        class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        data-testid="button-copy-all">
                  <i class="fas fa-copy mr-2"></i>
                  Copy All
                </button>
              </div>
            </div>
          </div>

          <!-- Content Settings -->
          <div class="space-y-6">
            <!-- Content Style -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Content Style</h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                  <select id="tone-select" 
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="energetic">Energetic</option>
                    <option value="educational">Educational</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <select id="audience-select" 
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="teachers">Teachers</option>
                    <option value="parents">Parents</option>
                    <option value="homeschoolers">Homeschoolers</option>
                    <option value="tutors">Tutors</option>
                  </select>
                </div>
                <label class="flex items-center">
                  <input type="checkbox" 
                         id="include-hashtags" 
                         class="rounded border-gray-300 text-primary focus:ring-primary" 
                         checked>
                  <span class="ml-2 text-sm text-gray-700">Include hashtags</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" 
                         id="include-cta" 
                         class="rounded border-gray-300 text-primary focus:ring-primary" 
                         checked>
                  <span class="ml-2 text-sm text-gray-700">Add call-to-action</span>
                </label>
              </div>
            </div>

            <!-- Templates -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Custom Templates</h3>
              <div class="space-y-3">
                <button class="template-btn w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" 
                        data-template="problem-solution">
                  <div class="font-medium text-gray-900 text-sm">Problem-Solution Template</div>
                  <div class="text-xs text-gray-500">Struggling with [topic]? Try [product]...</div>
                </button>
                <button class="template-btn w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" 
                        data-template="feature-highlight">
                  <div class="font-medium text-gray-900 text-sm">Feature Highlight</div>
                  <div class="text-xs text-gray-500">This [product] includes [features]...</div>
                </button>
                <button class="template-btn w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" 
                        data-template="social-proof">
                  <div class="font-medium text-gray-900 text-sm">Social Proof</div>
                  <div class="text-xs text-gray-500">Teachers love this resource because...</div>
                </button>
              </div>
              <button id="create-template-btn" 
                      class="mt-3 text-sm text-primary hover:text-blue-700 font-medium"
                      data-testid="button-create-template">
                + Create Custom Template
              </button>
            </div>

            <!-- Analytics Preview -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Content Analytics</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Posts Generated</span>
                  <span class="text-sm font-medium text-gray-900" id="total-posts-generated" data-testid="stat-posts-generated">0</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">This Month</span>
                  <span class="text-sm font-medium text-gray-900" id="posts-this-month" data-testid="stat-posts-month">0</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Most Popular Platform</span>
                  <span class="text-sm font-medium text-gray-900" id="popular-platform" data-testid="stat-popular-platform">--</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    await this.loadProducts();
    this.setupEventListeners();
    this.loadAnalytics();
  }

  setupEventListeners() {
    // Product selection
    document.getElementById('product-select').addEventListener('change', (e) => {
      const generateBtn = document.getElementById('generate-all-btn');
      generateBtn.disabled = !e.target.value;
    });

    // Generate all content
    document.getElementById('generate-all-btn').addEventListener('click', () => {
      this.generateAllContent();
    });

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabName = e.target.getAttribute('data-tab');
        this.switchTab(tabName);
      });
    });

    // Bulk actions
    document.getElementById('export-csv-btn').addEventListener('click', () => {
      this.exportToCSV();
    });

    document.getElementById('schedule-buffer-btn').addEventListener('click', () => {
      this.scheduleWithBuffer();
    });

    document.getElementById('copy-all-btn').addEventListener('click', () => {
      this.copyAllContent();
    });

    // Template buttons
    document.querySelectorAll('.template-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const template = e.currentTarget.getAttribute('data-template');
        this.applyTemplate(template);
      });
    });

    // Create custom template
    document.getElementById('create-template-btn').addEventListener('click', () => {
      this.showCreateTemplateModal();
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

  async generateAllContent() {
    const productId = document.getElementById('product-select').value;
    if (!productId) return;

    try {
      // Get product details
      const { data: product, error } = await window.supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      // Get content style settings
      const tone = document.getElementById('tone-select').value;
      const audience = document.getElementById('audience-select').value;
      const includeHashtags = document.getElementById('include-hashtags').checked;
      const includeCTA = document.getElementById('include-cta').checked;

      const settings = { tone, audience, includeHashtags, includeCTA };

      window.showToast('Generating content for all platforms...');

      // Generate content for each platform
      this.generatedContent.pinterest = await this.socialService.generatePinterestPosts(product, settings);
      this.generatedContent.instagram = await this.socialService.generateInstagramPosts(product, settings);
      this.generatedContent.facebook = await this.socialService.generateFacebookPosts(product, settings);

      // Update counts
      this.updateContentCounts();

      // Render current tab content
      this.renderTabContent();

      window.showToast('Content generated successfully!');

    } catch (error) {
      window.showToast('Failed to generate content', 'error');
      console.error(error);
    }
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('border-primary', 'text-primary');
      btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700');
    });

    document.querySelector(`[data-tab="${tabName}"]`).classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('border-primary', 'text-primary');

    // Show/hide tab content
    document.querySelectorAll('[id$="-tab"]').forEach(tab => {
      tab.classList.add('hidden');
    });
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');

    // Render content for active tab
    this.renderTabContent(tabName);
  }

  renderTabContent(platform = 'pinterest') {
    const content = this.generatedContent[platform];
    const container = document.getElementById(`${platform}-content`);

    if (!content || content.length === 0) {
      container.innerHTML = `
        <div class="text-center text-gray-500 py-8" data-testid="empty-state-${platform}">
          <i class="fab fa-${platform} text-4xl mb-4 text-gray-300"></i>
          <p class="text-lg font-medium mb-2">No ${platform.charAt(0).toUpperCase() + platform.slice(1)} content generated</p>
          <p class="text-sm">Select a product and generate content to get started</p>
        </div>
      `;
      return;
    }

    container.innerHTML = content.map((post, index) => `
      <div class="border border-gray-200 rounded-lg p-4">
        <div class="flex justify-between items-start mb-3">
          <h4 class="font-medium text-gray-900">${platform.charAt(0).toUpperCase() + platform.slice(1)} Post ${index + 1}</h4>
          <button class="text-sm text-primary hover:text-blue-700 font-medium" 
                  onclick="copyContent('${post.content.replace(/'/g, "\\'")}')">
            <i class="fas fa-copy mr-1"></i>
            Copy
          </button>
        </div>
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-sm text-gray-700">${post.content}</p>
        </div>
        <div class="mt-3 flex items-center justify-between">
          <span class="text-xs text-gray-500">${post.content.length} characters</span>
          <div class="flex space-x-2">
            <button class="text-xs text-primary hover:text-blue-700" 
                    onclick="editContent('${platform}', ${index})">
              Edit
            </button>
            <button class="text-xs text-red-600 hover:text-red-900" 
                    onclick="deleteContent('${platform}', ${index})">
              Delete
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Set up global functions
    window.copyContent = (content) => {
      navigator.clipboard.writeText(content);
      window.showToast('Content copied to clipboard!');
    };

    window.editContent = (platform, index) => {
      this.showEditContentModal(platform, index);
    };

    window.deleteContent = (platform, index) => {
      this.deleteContent(platform, index);
    };
  }

  updateContentCounts() {
    document.getElementById('pinterest-count').textContent = this.generatedContent.pinterest.length;
    document.getElementById('instagram-count').textContent = this.generatedContent.instagram.length;
    document.getElementById('facebook-count').textContent = this.generatedContent.facebook.length;
  }

  exportToCSV() {
    const allContent = [];
    
    ['pinterest', 'instagram', 'facebook'].forEach(platform => {
      this.generatedContent[platform].forEach(post => {
        allContent.push({
          platform: platform,
          content: post.content,
          character_count: post.content.length,
          created_at: new Date().toISOString()
        });
      });
    });

    if (allContent.length === 0) {
      window.showToast('No content to export', 'error');
      return;
    }

    const csv = Papa.unparse(allContent);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-content-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    URL.revokeObjectURL(url);
    window.showToast('Content exported to CSV!');
  }

  async scheduleWithBuffer() {
    const webhookUrl = import.meta.env.VITE_BUFFER_WEBHOOK_URL;
    
    if (!webhookUrl) {
      window.showToast('Buffer webhook URL not configured', 'error');
      return;
    }

    try {
      // This would send to Buffer API in production
      window.showToast('Content scheduled with Buffer! (Demo mode)');
    } catch (error) {
      window.showToast('Failed to schedule with Buffer', 'error');
      console.error(error);
    }
  }

  copyAllContent() {
    const allContent = [];
    
    ['pinterest', 'instagram', 'facebook'].forEach(platform => {
      if (this.generatedContent[platform].length > 0) {
        allContent.push(`=== ${platform.toUpperCase()} ===`);
        this.generatedContent[platform].forEach((post, index) => {
          allContent.push(`${index + 1}. ${post.content}`);
        });
        allContent.push('');
      }
    });

    if (allContent.length === 0) {
      window.showToast('No content to copy', 'error');
      return;
    }

    navigator.clipboard.writeText(allContent.join('\n'));
    window.showToast('All content copied to clipboard!');
  }

  applyTemplate(templateName) {
    // This would apply the selected template to content generation
    window.showToast(`Applied ${templateName} template`);
  }

  showCreateTemplateModal() {
    const modalContent = `
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Create Custom Template</h3>
        
        <form id="template-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
            <input type="text" name="name" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Template Content</label>
            <textarea name="content" 
                      required 
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Use [product], [price], [tags] as placeholders..."></textarea>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" onclick="closeModal()">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
              Create Template
            </button>
          </div>
        </form>
      </div>
    `;

    showModal(modalContent);

    document.getElementById('template-form').addEventListener('submit', (e) => {
      e.preventDefault();
      // Would save custom template in production
      window.showToast('Custom template created!');
      window.closeModal();
    });
  }

  showEditContentModal(platform, index) {
    const post = this.generatedContent[platform][index];
    
    const modalContent = `
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Edit ${platform.charAt(0).toUpperCase() + platform.slice(1)} Post</h3>
        
        <form id="edit-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea name="content" 
                      required 
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">${post.content}</textarea>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" onclick="closeModal()">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    `;

    showModal(modalContent);

    document.getElementById('edit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const newContent = e.target.content.value;
      this.generatedContent[platform][index].content = newContent;
      this.renderTabContent(platform);
      window.showToast('Content updated!');
      window.closeModal();
    });
  }

  deleteContent(platform, index) {
    if (confirm('Are you sure you want to delete this content?')) {
      this.generatedContent[platform].splice(index, 1);
      this.updateContentCounts();
      this.renderTabContent(platform);
      window.showToast('Content deleted');
    }
  }

  loadAnalytics() {
    // Load analytics from local storage or API
    const totalGenerated = Object.values(this.generatedContent).flat().length;
    document.getElementById('total-posts-generated').textContent = totalGenerated;
    document.getElementById('posts-this-month').textContent = totalGenerated;
    document.getElementById('popular-platform').textContent = totalGenerated > 0 ? 'Pinterest' : '--';
  }
}

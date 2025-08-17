import { showModal } from '../ui/modals.js';

export default class SettingsPage {
  async render() {
    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
          <p class="mt-2 text-gray-600">Manage your account, billing, and integrations</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Settings -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Account Settings -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>
              <form id="account-form" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input type="text" 
                           id="first-name" 
                           class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                           data-testid="input-first-name">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input type="text" 
                           id="last-name" 
                           class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                           data-testid="input-last-name">
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" 
                         id="email" 
                         readonly 
                         class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
                         data-testid="input-email">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">TPT Store URL</label>
                  <input type="url" 
                         id="tpt-url" 
                         placeholder="https://www.teacherspayteachers.com/Store/your-store" 
                         class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                         data-testid="input-tpt-url">
                </div>
                <button type="submit" 
                        class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        data-testid="button-save-account">
                  Save Changes
                </button>
              </form>
            </div>

            <!-- API Keys -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-6">API Keys</h3>
              <form id="api-keys-form" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI API Key
                    <span class="text-xs text-gray-500">(for AI content generation)</span>
                  </label>
                  <div class="flex">
                    <input type="password" 
                           id="openai-key" 
                           placeholder="sk-..." 
                           class="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                           data-testid="input-openai-key">
                    <button type="button" 
                            class="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600 hover:bg-gray-200"
                            onclick="togglePasswordVisibility('openai-key')"
                            data-testid="button-toggle-openai">
                      <i class="fas fa-eye"></i>
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    SerpAPI Key
                    <span class="text-xs text-gray-500">(for rank tracking)</span>
                  </label>
                  <div class="flex">
                    <input type="password" 
                           id="serpapi-key" 
                           placeholder="Your SerpAPI key" 
                           class="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                           data-testid="input-serpapi-key">
                    <button type="button" 
                            class="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600 hover:bg-gray-200"
                            onclick="togglePasswordVisibility('serpapi-key')"
                            data-testid="button-toggle-serpapi">
                      <i class="fas fa-eye"></i>
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Buffer Webhook URL
                    <span class="text-xs text-gray-500">(optional, for social scheduling)</span>
                  </label>
                  <input type="url" 
                         id="buffer-webhook" 
                         placeholder="https://your-buffer-webhook-url" 
                         class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                         data-testid="input-buffer-webhook">
                </div>
                <button type="submit" 
                        class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        data-testid="button-save-api-keys">
                  Save API Keys
                </button>
              </form>
            </div>

            <!-- Notifications -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-6">Notifications</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">Rank Alerts</h4>
                    <p class="text-sm text-gray-500">Get notified when your rankings change significantly</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" 
                           id="rank-alerts" 
                           class="sr-only peer" 
                           checked
                           data-testid="toggle-rank-alerts">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">Weekly Reports</h4>
                    <p class="text-sm text-gray-500">Receive weekly performance summaries</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" 
                           id="weekly-reports" 
                           class="sr-only peer" 
                           checked
                           data-testid="toggle-weekly-reports">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">Product Updates</h4>
                    <p class="text-sm text-gray-500">Notifications about new features and updates</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" 
                           id="product-updates" 
                           class="sr-only peer"
                           data-testid="toggle-product-updates">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Billing & Plan -->
          <div class="space-y-6">
            <!-- Current Plan -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
              <div class="text-center mb-6">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <i id="plan-icon" class="fas fa-user text-primary text-2xl"></i>
                </div>
                <h4 class="text-xl font-bold text-gray-900" id="plan-name" data-testid="text-plan-name">Free Plan</h4>
                <p class="text-gray-500" id="plan-price" data-testid="text-plan-price">$0/month</p>
              </div>
              <div class="space-y-2 mb-6" id="plan-features">
                <div class="flex items-center text-sm">
                  <i class="fas fa-check text-success mr-2"></i>
                  <span>3 products maximum</span>
                </div>
                <div class="flex items-center text-sm">
                  <i class="fas fa-times text-gray-400 mr-2"></i>
                  <span>Limited keyword tracking</span>
                </div>
                <div class="flex items-center text-sm">
                  <i class="fas fa-times text-gray-400 mr-2"></i>
                  <span>No AI content generation</span>
                </div>
                <div class="flex items-center text-sm">
                  <i class="fas fa-times text-gray-400 mr-2"></i>
                  <span>Basic support</span>
                </div>
              </div>
              <button id="manage-billing-btn" 
                      class="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                      data-testid="button-manage-billing">
                Upgrade to Pro
              </button>
            </div>

            <!-- Usage Stats -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Usage This Month</h3>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-600">Products Tracked</span>
                    <span class="text-sm font-medium" id="products-usage" data-testid="text-products-usage">0 / 3</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-primary h-2 rounded-full" id="products-progress" style="width: 0%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-600">AI Generations</span>
                    <span class="text-sm font-medium" id="ai-usage" data-testid="text-ai-usage">0 / 0</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-red-500 h-2 rounded-full" id="ai-progress" style="width: 0%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-600">Rank Checks</span>
                    <span class="text-sm font-medium" id="rank-usage" data-testid="text-rank-usage">0 / 0</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-red-500 h-2 rounded-full" id="rank-progress" style="width: 0%"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Support -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Support</h3>
              <div class="space-y-3">
                <button class="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" 
                        data-testid="button-documentation">
                  <div class="flex items-center">
                    <i class="fas fa-book text-primary mr-3"></i>
                    <div>
                      <div class="font-medium text-sm">Documentation</div>
                      <div class="text-xs text-gray-500">Learn how to use all features</div>
                    </div>
                  </div>
                </button>
                <button class="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" 
                        data-testid="button-contact-support">
                  <div class="flex items-center">
                    <i class="fas fa-comments text-primary mr-3"></i>
                    <div>
                      <div class="font-medium text-sm">Contact Support</div>
                      <div class="text-xs text-gray-500">Get help from our team</div>
                    </div>
                  </div>
                </button>
                <button class="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" 
                        data-testid="button-report-bug">
                  <div class="flex items-center">
                    <i class="fas fa-bug text-primary mr-3"></i>
                    <div>
                      <div class="font-medium text-sm">Report Bug</div>
                      <div class="text-xs text-gray-500">Help us improve the platform</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Danger Zone -->
            <div class="bg-white rounded-xl border border-red-200 p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
              <div class="space-y-3">
                <button class="w-full bg-red-50 text-red-700 py-2 px-4 rounded-lg border border-red-200 hover:bg-red-100 transition-colors" 
                        onclick="confirmDeleteAccount()"
                        data-testid="button-delete-account">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    await this.loadUserProfile();
    await this.loadUsageStats();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Account form
    document.getElementById('account-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveAccountSettings();
    });

    // API keys form
    document.getElementById('api-keys-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveAPIKeys();
    });

    // Billing button
    document.getElementById('manage-billing-btn').addEventListener('click', () => {
      this.manageBilling();
    });

    // Password visibility toggles
    window.togglePasswordVisibility = (inputId) => {
      const input = document.getElementById(inputId);
      const icon = input.nextElementSibling.querySelector('i');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    };

    // Delete account confirmation
    window.confirmDeleteAccount = () => {
      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        this.deleteAccount();
      }
    };
  }

  async loadUserProfile() {
    try {
      const user = window.AppState.user;
      if (!user) return;

      // Set email from auth
      document.getElementById('email').value = user.email || '';

      // Load additional profile data from database
      const { data: profile, error } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is ok
        console.error('Error loading profile:', error);
        return;
      }

      if (profile) {
        // Update plan display
        this.updatePlanDisplay(profile.plan);
      }

    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  updatePlanDisplay(plan) {
    const planName = document.getElementById('plan-name');
    const planPrice = document.getElementById('plan-price');
    const planIcon = document.getElementById('plan-icon');
    const planFeatures = document.getElementById('plan-features');
    const billingBtn = document.getElementById('manage-billing-btn');

    if (plan === 'pro') {
      planName.textContent = 'Pro Plan';
      planPrice.textContent = '$29/month';
      planIcon.classList.remove('fa-user');
      planIcon.classList.add('fa-crown');
      
      planFeatures.innerHTML = `
        <div class="flex items-center text-sm">
          <i class="fas fa-check text-success mr-2"></i>
          <span>Unlimited products</span>
        </div>
        <div class="flex items-center text-sm">
          <i class="fas fa-check text-success mr-2"></i>
          <span>Unlimited keyword tracking</span>
        </div>
        <div class="flex items-center text-sm">
          <i class="fas fa-check text-success mr-2"></i>
          <span>AI content generation</span>
        </div>
        <div class="flex items-center text-sm">
          <i class="fas fa-check text-success mr-2"></i>
          <span>Priority support</span>
        </div>
      `;
      
      billingBtn.textContent = 'Manage Billing';
    }
  }

  async loadUsageStats() {
    try {
      // Load products count
      const { data: products, error: productsError } = await window.supabase
        .from('products')
        .select('id', { count: 'exact' });

      if (!productsError) {
        const productCount = products?.length || 0;
        const maxProducts = window.AppState.user?.plan === 'pro' ? Infinity : 3;
        
        document.getElementById('products-usage').textContent = 
          maxProducts === Infinity ? `${productCount} / ∞` : `${productCount} / ${maxProducts}`;
        
        const progressPercent = maxProducts === Infinity ? 
          Math.min((productCount / 10) * 100, 100) : 
          (productCount / maxProducts) * 100;
        
        document.getElementById('products-progress').style.width = `${progressPercent}%`;
      }

      // AI and rank usage would be tracked in a usage table in production
      document.getElementById('ai-usage').textContent = '0 / 0';
      document.getElementById('rank-usage').textContent = '0 / 0';

    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  }

  async saveAccountSettings() {
    try {
      const firstName = document.getElementById('first-name').value;
      const lastName = document.getElementById('last-name').value;
      const tptUrl = document.getElementById('tpt-url').value;

      // In production, this would update the profile table
      window.showToast('Account settings saved successfully!');

    } catch (error) {
      window.showToast('Failed to save account settings', 'error');
      console.error(error);
    }
  }

  async saveAPIKeys() {
    try {
      const openaiKey = document.getElementById('openai-key').value;
      const serpapiKey = document.getElementById('serpapi-key').value;
      const bufferWebhook = document.getElementById('buffer-webhook').value;

      // In production, these would be encrypted and stored securely
      if (openaiKey) {
        localStorage.setItem('openai_key', openaiKey);
      }
      if (serpapiKey) {
        localStorage.setItem('serpapi_key', serpapiKey);
      }
      if (bufferWebhook) {
        localStorage.setItem('buffer_webhook', bufferWebhook);
      }

      window.showToast('API keys saved successfully!');

    } catch (error) {
      window.showToast('Failed to save API keys', 'error');
      console.error(error);
    }
  }

  manageBilling() {
    const user = window.AppState.user;
    if (!user) return;

    const plan = user.plan || 'free';
    
    if (plan === 'free') {
      this.showUpgradeModal();
    } else {
      // In production, this would redirect to Stripe customer portal
      window.showToast('Redirecting to billing portal... (Demo mode)');
    }
  }

  showUpgradeModal() {
    const modalContent = `
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Upgrade to Pro</h3>
        
        <div class="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white mb-6">
          <h4 class="text-xl font-bold mb-2">Pro Plan - $29/month</h4>
          <ul class="space-y-2 text-sm">
            <li class="flex items-center">
              <i class="fas fa-check mr-2"></i>
              Unlimited products & keywords
            </li>
            <li class="flex items-center">
              <i class="fas fa-check mr-2"></i>
              AI content generation
            </li>
            <li class="flex items-center">
              <i class="fas fa-check mr-2"></i>
              Advanced analytics
            </li>
            <li class="flex items-center">
              <i class="fas fa-check mr-2"></i>
              Priority support
            </li>
          </ul>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" onclick="closeModal()">
            Cancel
          </button>
          <button class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700" onclick="processUpgrade()">
            Upgrade Now
          </button>
        </div>
      </div>
    `;

    showModal(modalContent);

    window.processUpgrade = () => {
      // In production, this would integrate with Stripe
      window.showToast('Redirecting to Stripe checkout... (Demo mode)');
      window.closeModal();
    };
  }

  async deleteAccount() {
    try {
      // In production, this would delete all user data
      await window.supabase.auth.signOut();
      window.showToast('Account deleted successfully');
      window.location.hash = '#/';
    } catch (error) {
      window.showToast('Failed to delete account', 'error');
      console.error(error);
    }
  }
}

import { supabase, db } from '../supa.js';
import { showToast, showConfirm } from '../ui/toasts.js';

let currentProfile = null;

export async function renderSettings() {
    await loadProfile();
    
    return `
        <!-- Navigation -->
        <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <h1 class="text-xl font-bold text-gray-900" data-testid="text-app-title">TPT Seller Hub</h1>
                        </div>
                        <div class="hidden md:block ml-10">
                            <div class="flex items-baseline space-x-4">
                                <a href="#/dashboard" class="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700" data-testid="link-dashboard">Dashboard</a>
                                <a href="#/products" class="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700" data-testid="link-products">Products</a>
                                <a href="#/rank" class="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700" data-testid="link-rank">Rank Tracker</a>
                                <a href="#/social" class="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700" data-testid="link-social">Social</a>
                                <a href="#/analytics" class="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700" data-testid="link-analytics">Analytics</a>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <button class="p-2 rounded-full text-gray-400 hover:text-gray-500" data-testid="button-notifications">
                            <i class="fas fa-bell text-lg"></i>
                        </button>
                        <div class="ml-3 relative">
                            <button class="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" onclick="toggleUserMenu()" data-testid="button-user-menu">
                                <div class="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    ${window.app.getCurrentUser()?.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            </button>
                            <div id="user-menu" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                <a href="#/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 bg-gray-50" data-testid="link-settings">Settings</a>
                                <button onclick="signOut()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-testid="button-signout">Sign Out</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900" data-testid="text-page-title">Settings</h1>
                <p class="mt-2 text-gray-600" data-testid="text-page-description">Manage your account, billing, and integrations</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Main Settings -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Account Settings -->
                    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6" data-testid="text-account-settings">Account Settings</h3>
                        <form class="space-y-4" id="account-form" data-testid="form-account">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                    <input type="text" value="${currentProfile?.first_name || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" data-testid="input-first-name" id="first-name">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                    <input type="text" value="${currentProfile?.last_name || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" data-testid="input-last-name" id="last-name">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input type="email" value="${window.app.getCurrentUser()?.email || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" readonly data-testid="input-email">
                                <p class="text-xs text-gray-500 mt-1">Email cannot be changed here. Contact support if needed.</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">TPT Store URL</label>
                                <input type="url" value="${currentProfile?.tpt_store_url || ''}" placeholder="https://www.teacherspayteachers.com/Store/your-store" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" data-testid="input-tpt-url" id="tpt-url">
                            </div>
                            <button type="submit" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" data-testid="button-save-account">
                                Save Changes
                            </button>
                        </form>
                    </div>

                    <!-- API Keys -->
                    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6" data-testid="text-api-keys">API Keys</h3>
                        <form class="space-y-4" id="api-keys-form" data-testid="form-api-keys">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    OpenAI API Key
                                    <span class="text-xs text-gray-500">(for AI content generation)</span>
                                </label>
                                <div class="flex">
                                    <input type="password" placeholder="sk-..." value="${currentProfile?.openai_key ? '••••••••••••••••' : ''}" class="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" data-testid="input-openai-key" id="openai-key">
                                    <button type="button" class="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600 hover:bg-gray-200" onclick="togglePasswordVisibility('openai-key')" data-testid="button-toggle-openai">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" class="text-primary hover:underline">OpenAI Platform</a></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    SerpAPI Key
                                    <span class="text-xs text-gray-500">(for rank tracking)</span>
                                </label>
                                <div class="flex">
                                    <input type="password" placeholder="Your SerpAPI key" value="${currentProfile?.serpapi_key ? '••••••••••••••••' : ''}" class="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" data-testid="input-serpapi-key" id="serpapi-key">
                                    <button type="button" class="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600 hover:bg-gray-200" onclick="togglePasswordVisibility('serpapi-key')" data-testid="button-toggle-serpapi">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Get your API key from <a href="https://serpapi.com/" target="_blank" class="text-primary hover:underline">SerpAPI</a></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Buffer Webhook URL
                                    <span class="text-xs text-gray-500">(optional, for social scheduling)</span>
                                </label>
                                <input type="url" placeholder="https://your-buffer-webhook-url" value="${currentProfile?.buffer_webhook || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" data-testid="input-buffer-webhook" id="buffer-webhook">
                            </div>
                            <button type="submit" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" data-testid="button-save-api-keys">
                                Save API Keys
                            </button>
                        </form>
                    </div>

                    <!-- Notifications -->
                    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6" data-testid="text-notifications">Notifications</h3>
                        <form class="space-y-4" id="notifications-form" data-testid="form-notifications">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="text-sm font-medium text-gray-900">Rank Alerts</h4>
                                    <p class="text-sm text-gray-500">Get notified when your rankings change significantly</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer" ${currentProfile?.rank_alerts !== false ? 'checked' : ''} data-testid="checkbox-rank-alerts" id="rank-alerts">
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="text-sm font-medium text-gray-900">Weekly Reports</h4>
                                    <p class="text-sm text-gray-500">Receive weekly performance summaries</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer" ${currentProfile?.weekly_reports !== false ? 'checked' : ''} data-testid="checkbox-weekly-reports" id="weekly-reports">
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="text-sm font-medium text-gray-900">Product Updates</h4>
                                    <p class="text-sm text-gray-500">Notifications about new features and updates</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer" ${currentProfile?.product_updates === true ? 'checked' : ''} data-testid="checkbox-product-updates" id="product-updates">
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            <button type="submit" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" data-testid="button-save-notifications">
                                Save Preferences
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Billing & Plan -->
                <div class="space-y-6">
                    <!-- Current Plan -->
                    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-current-plan">Current Plan</h3>
                        <div class="text-center mb-6">
                            <div class="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                                <i class="fas fa-${currentProfile?.plan === 'pro' ? 'crown' : 'gift'} text-primary text-2xl"></i>
                            </div>
                            <h4 class="text-xl font-bold text-gray-900" data-testid="text-plan-name">${currentProfile?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}</h4>
                            <p class="text-gray-500" data-testid="text-plan-price">${currentProfile?.plan === 'pro' ? '$29/month' : 'Free'}</p>
                        </div>
                        <div class="space-y-2 mb-6">
                            <div class="flex items-center text-sm">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>${currentProfile?.plan === 'pro' ? 'Unlimited products' : 'Up to 3 products'}</span>
                            </div>
                            <div class="flex items-center text-sm">
                                <i class="fas fa-${currentProfile?.plan === 'pro' ? 'check text-green-500' : 'times text-gray-400'} mr-2"></i>
                                <span>Unlimited keyword tracking</span>
                            </div>
                            <div class="flex items-center text-sm">
                                <i class="fas fa-${currentProfile?.plan === 'pro' ? 'check text-green-500' : 'times text-gray-400'} mr-2"></i>
                                <span>AI content generation</span>
                            </div>
                            <div class="flex items-center text-sm">
                                <i class="fas fa-${currentProfile?.plan === 'pro' ? 'check text-green-500' : 'times text-gray-400'} mr-2"></i>
                                <span>Priority support</span>
                            </div>
                        </div>
                        ${currentProfile?.plan === 'pro' ? `
                            <button class="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors" onclick="manageBilling()" data-testid="button-manage-billing">
                                Manage Billing
                            </button>
                        ` : `
                            <button class="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors" onclick="upgradeToPro()" data-testid="button-upgrade">
                                Upgrade to Pro
                            </button>
                        `}
                    </div>

                    <!-- Usage Stats -->
                    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-usage-stats">Usage This Month</h3>
                        <div class="space-y-4">
                            <div>
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm text-gray-600">Products Tracked</span>
                                    <span class="text-sm font-medium" data-testid="text-products-usage">${currentProfile?.products_count || 0} / ${currentProfile?.plan === 'pro' ? '∞' : '3'}</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-primary h-2 rounded-full" style="width: ${Math.min(100, ((currentProfile?.products_count || 0) / (currentProfile?.plan === 'pro' ? 100 : 3)) * 100)}%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm text-gray-600">AI Generations</span>
                                    <span class="text-sm font-medium" data-testid="text-ai-usage">${currentProfile?.ai_generations || 0} / ${currentProfile?.plan === 'pro' ? '∞' : '10'}</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-green-500 h-2 rounded-full" style="width: ${Math.min(100, ((currentProfile?.ai_generations || 0) / (currentProfile?.plan === 'pro' ? 1000 : 10)) * 100)}%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm text-gray-600">Rank Checks</span>
                                    <span class="text-sm font-medium" data-testid="text-rank-checks-usage">${currentProfile?.rank_checks || 0} / ${currentProfile?.plan === 'pro' ? '∞' : '50'}</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-yellow-500 h-2 rounded-full" style="width: ${Math.min(100, ((currentProfile?.rank_checks || 0) / (currentProfile?.plan === 'pro' ? 10000 : 50)) * 100)}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Support -->
                    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-support">Support</h3>
                        <div class="space-y-3">
                            <button class="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" onclick="openDocumentation()" data-testid="button-documentation">
                                <div class="flex items-center">
                                    <i class="fas fa-book text-primary mr-3"></i>
                                    <div>
                                        <div class="font-medium text-sm">Documentation</div>
                                        <div class="text-xs text-gray-500">Learn how to use all features</div>
                                    </div>
                                </div>
                            </button>
                            <button class="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" onclick="contactSupport()" data-testid="button-contact-support">
                                <div class="flex items-center">
                                    <i class="fas fa-comments text-primary mr-3"></i>
                                    <div>
                                        <div class="font-medium text-sm">Contact Support</div>
                                        <div class="text-xs text-gray-500">Get help from our team</div>
                                    </div>
                                </div>
                            </button>
                            <button class="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" onclick="reportBug()" data-testid="button-report-bug">
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
                        <h3 class="text-lg font-semibold text-red-900 mb-4" data-testid="text-danger-zone">Danger Zone</h3>
                        <div class="space-y-3">
                            <button class="w-full text-left p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-700" onclick="deleteAccount()" data-testid="button-delete-account">
                                <div class="flex items-center">
                                    <i class="fas fa-trash text-red-500 mr-3"></i>
                                    <div>
                                        <div class="font-medium text-sm">Delete Account</div>
                                        <div class="text-xs text-red-500">Permanently delete your account and all data</div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function loadProfile() {
    if (!window.app.isAuthenticated()) return;
    
    try {
        const user = window.app.getCurrentUser();
        currentProfile = await db.getProfile(user.id);
        
        // Set defaults if no profile exists
        if (!currentProfile) {
            currentProfile = {
                id: user.id,
                email: user.email,
                plan: 'free',
                first_name: '',
                last_name: '',
                tpt_store_url: '',
                openai_key: '',
                serpapi_key: '',
                buffer_webhook: '',
                rank_alerts: true,
                weekly_reports: true,
                product_updates: false,
                products_count: 0,
                ai_generations: 0,
                rank_checks: 0
            };
        }
        
    } catch (error) {
        console.error('Error loading profile:', error);
        currentProfile = null;
    }
}

// Initialize form handlers after page renders
document.addEventListener('pageRendered', () => {
    const accountForm = document.getElementById('account-form');
    const apiKeysForm = document.getElementById('api-keys-form');
    const notificationsForm = document.getElementById('notifications-form');
    
    if (accountForm) {
        accountForm.onsubmit = handleAccountUpdate;
    }
    
    if (apiKeysForm) {
        apiKeysForm.onsubmit = handleApiKeysUpdate;
    }
    
    if (notificationsForm) {
        notificationsForm.onsubmit = handleNotificationsUpdate;
    }
});

async function handleAccountUpdate(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const tptUrl = document.getElementById('tpt-url').value.trim();
    
    try {
        const user = window.app.getCurrentUser();
        const updates = {
            first_name: firstName,
            last_name: lastName,
            tpt_store_url: tptUrl,
            updated_at: new Date().toISOString()
        };
        
        await db.upsertProfile(user.id, updates);
        
        // Update current profile
        Object.assign(currentProfile, updates);
        
        showToast('Account settings saved successfully!', 'success');
        
    } catch (error) {
        console.error('Error updating account:', error);
        showToast('Error saving account settings', 'error');
    }
}

async function handleApiKeysUpdate(e) {
    e.preventDefault();
    
    const openaiKey = document.getElementById('openai-key').value.trim();
    const serpapiKey = document.getElementById('serpapi-key').value.trim();
    const bufferWebhook = document.getElementById('buffer-webhook').value.trim();
    
    try {
        const user = window.app.getCurrentUser();
        const updates = {
            updated_at: new Date().toISOString()
        };
        
        // Only update if not placeholder
        if (openaiKey && !openaiKey.includes('••••')) {
            updates.openai_key = openaiKey;
        }
        
        if (serpapiKey && !serpapiKey.includes('••••')) {
            updates.serpapi_key = serpapiKey;
        }
        
        if (bufferWebhook) {
            updates.buffer_webhook = bufferWebhook;
        }
        
        await db.upsertProfile(user.id, updates);
        
        // Update current profile
        Object.assign(currentProfile, updates);
        
        showToast('API keys saved successfully!', 'success');
        
    } catch (error) {
        console.error('Error updating API keys:', error);
        showToast('Error saving API keys', 'error');
    }
}

async function handleNotificationsUpdate(e) {
    e.preventDefault();
    
    const rankAlerts = document.getElementById('rank-alerts').checked;
    const weeklyReports = document.getElementById('weekly-reports').checked;
    const productUpdates = document.getElementById('product-updates').checked;
    
    try {
        const user = window.app.getCurrentUser();
        const updates = {
            rank_alerts: rankAlerts,
            weekly_reports: weeklyReports,
            product_updates: productUpdates,
            updated_at: new Date().toISOString()
        };
        
        await db.upsertProfile(user.id, updates);
        
        // Update current profile
        Object.assign(currentProfile, updates);
        
        showToast('Notification preferences saved!', 'success');
        
    } catch (error) {
        console.error('Error updating notifications:', error);
        showToast('Error saving notification preferences', 'error');
    }
}

// Global functions for settings interactions
window.togglePasswordVisibility = function(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        button.className = 'fas fa-eye';
    }
};

window.manageBilling = function() {
    // TODO: Integrate with Stripe customer portal
    showToast('Redirecting to billing portal...', 'info');
    // window.open('https://billing.stripe.com/p/login/test_...', '_blank');
};

window.upgradeToPro = function() {
    // TODO: Integrate with Stripe checkout
    showToast('Redirecting to upgrade page...', 'info');
    // window.open('https://checkout.stripe.com/pay/cs_test_...', '_blank');
};

window.openDocumentation = function() {
    showToast('Opening documentation...', 'info');
    // window.open('/docs', '_blank');
};

window.contactSupport = function() {
    showToast('Opening support chat...', 'info');
    // TODO: Integrate with support system
};

window.reportBug = function() {
    showToast('Opening bug report form...', 'info');
    // TODO: Integrate with bug tracking system
};

window.deleteAccount = function() {
    showConfirm(
        'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.',
        async () => {
            try {
                // TODO: Implement account deletion
                showToast('Account deletion initiated. You will receive a confirmation email.', 'info');
            } catch (error) {
                console.error('Error deleting account:', error);
                showToast('Error deleting account', 'error');
            }
        }
    );
};

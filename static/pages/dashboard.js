import { supa, db } from '../supa.js';
import { showToast } from '../ui.js';

let dashboardData = {
    stats: {},
    recentProducts: [],
    activities: []
};

// Inline card components
function createStatsCard(title, value, icon, color) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        red: 'bg-red-100 text-red-600'
    };
    
    return `
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 ${colorClasses[color]} rounded-lg flex items-center justify-center">
                        <i class="fas fa-${icon}"></i>
                    </div>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">${title}</p>
                    <p class="text-2xl font-semibold text-gray-900">${value}</p>
                </div>
            </div>
        </div>
    `;
}

function createProductCard(product) {
    return `
        <div class="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50" data-testid="item-recent-product-${product.id}">
            <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 truncate" data-testid="text-product-title-${product.id}">${product.title}</h4>
                    <p class="text-sm text-gray-500 truncate" data-testid="text-product-description-${product.id}">${product.description}</p>
                    <div class="flex items-center mt-2 space-x-4">
                        <div class="flex items-center">
                            <span class="w-2 h-2 ${product.seo_score && product.seo_score >= 70 ? 'bg-green-500' : 'bg-yellow-500'} rounded-full mr-2"></span>
                            <span class="text-xs text-gray-600">SEO: ${product.seo_score || 'N/A'}${product.seo_score ? '%' : ''}</span>
                        </div>
                        <div class="flex items-center">
                            <span class="text-xs text-gray-600">Rank #</span>
                            <span class="text-xs font-medium text-gray-900 ml-1" data-testid="text-avg-rank-${product.id}">${product.avg_rank || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                <div class="ml-4 flex-shrink-0">
                    <span class="text-sm font-medium text-gray-900" data-testid="text-product-price-${product.id}">$${product.price}</span>
                </div>
            </div>
        </div>
    `;
}

function createActivityCard(activity) {
    return `
        <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
                <div class="w-2 h-2 bg-primary rounded-full mt-2"></div>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900">${activity.message}</p>
                <p class="text-xs text-gray-500">${activity.time}</p>
            </div>
        </div>
    `;
}

export async function renderDashboard() {
    // Load dashboard data
    await loadDashboardData();
    
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
                                <a href="#/dashboard" class="px-3 py-2 rounded-md text-sm font-medium bg-primary text-white" data-testid="link-dashboard">Dashboard</a>
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
                                <a href="#/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-testid="link-settings">Settings</a>
                                <button onclick="signOut()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-testid="button-signout">Sign Out</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content Container -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900" data-testid="text-page-title">Dashboard</h1>
                <p class="mt-2 text-gray-600" data-testid="text-page-description">Overview of your TPT optimization progress</p>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                ${createStatsCard('Products', dashboardData.stats.totalProducts || '0', 'boxes', 'blue')}
                ${createStatsCard('Tracked Keywords', dashboardData.stats.trackedKeywords || '0', 'search', 'green')}
                ${createStatsCard('Avg Rank Δ7', dashboardData.stats.rankChange || '+0', 'chart-line', 'yellow')}
                ${createStatsCard('Revenue (Last 30d)', dashboardData.stats.revenue || '$0', 'dollar-sign', 'green')}
            </div>

            <!-- Quick Actions Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Recent Products -->
                <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-gray-900" data-testid="text-recent-products-title">Recent Products</h3>
                            <a href="#/products" class="text-sm font-medium text-primary hover:text-blue-700" data-testid="link-view-all-products">View all</a>
                        </div>
                    </div>
                    <div class="overflow-hidden" data-testid="container-recent-products">
                        ${dashboardData.recentProducts.length > 0 ? 
                            dashboardData.recentProducts.map(product => createProductCard(product)).join('') :
                            `<div class="p-8 text-center">
                                <i class="fas fa-boxes text-4xl text-gray-300 mb-4"></i>
                                <p class="text-gray-500">No products yet</p>
                                <a href="#/products" class="text-primary hover:text-blue-700 text-sm font-medium">Add your first product</a>
                            </div>`
                        }
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="space-y-6">
                    <div class="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white">
                        <h3 class="text-lg font-semibold mb-4" data-testid="text-quick-actions-title">Quick Actions</h3>
                        <div class="space-y-3">
                            <button class="w-full bg-white/20 hover:bg-white/30 rounded-lg p-3 text-left transition-colors" onclick="window.router.navigate('/products')" data-testid="button-add-product">
                                <i class="fas fa-plus mr-2"></i>
                                Add New Product
                            </button>
                            <button class="w-full bg-white/20 hover:bg-white/30 rounded-lg p-3 text-left transition-colors" onclick="window.router.navigate('/social')" data-testid="button-generate-social">
                                <i class="fas fa-magic mr-2"></i>
                                Generate Social Content
                            </button>
                            <button class="w-full bg-white/20 hover:bg-white/30 rounded-lg p-3 text-left transition-colors" onclick="window.router.navigate('/rank')" data-testid="button-check-rankings">
                                <i class="fas fa-chart-line mr-2"></i>
                                Check Rankings
                            </button>
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-recent-activity-title">Recent Activity</h3>
                        <div class="space-y-3" data-testid="container-recent-activity">
                            ${dashboardData.activities.length > 0 ?
                                dashboardData.activities.map(activity => createActivityCard(activity)).join('') :
                                `<p class="text-sm text-gray-500 text-center py-4">No recent activity</p>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function loadDashboardData() {
    if (!window.app.isAuthenticated()) return;
    
    try {
        const user = window.app.getCurrentUser();
        
        // Load products
        const products = await db.getProducts(user.id);
        dashboardData.recentProducts = products.slice(0, 5);
        
        // Calculate stats
        dashboardData.stats = {
            totalProducts: products.length,
            trackedKeywords: 0, // TODO: Implement keyword counting
            rankChange: '+0', // TODO: Implement rank change calculation
            revenue: '$0' // TODO: Implement revenue calculation
        };
        
        // Generate some activity items
        dashboardData.activities = [
            { id: 1, message: 'Welcome to TPT Seller Hub!', time: 'Just now' },
            { id: 2, message: 'Start by importing your first product', time: '1 minute ago' }
        ];
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Error loading dashboard data', 'error');
    }
}

// Global functions for dashboard interactions
window.toggleUserMenu = function() {
    const menu = document.getElementById('user-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
};

window.signOut = async function() {
    try {
        const { error } = await supa.auth.signOut();
        if (error) throw error;
        showToast('Signed out successfully', 'success');
    } catch (error) {
        console.error('Sign out error:', error);
        showToast('Error signing out', 'error');
    }
};

// Close user menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('user-menu');
    const button = document.querySelector('[data-testid="button-user-menu"]');
    
    if (menu && !menu.contains(e.target) && !button?.contains(e.target)) {
        menu.classList.add('hidden');
    }
});

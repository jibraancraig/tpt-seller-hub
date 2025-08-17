import { db } from '../supa.js';
import { showToast } from '../ui/toasts.js';
import { createKeywordTable } from '../ui/tables.js';
import { fetchKeywordRank } from '../services/serpProvider.js';

let keywords = [];
let rankStats = {
    totalKeywords: 0,
    improved: 0,
    declined: 0,
    topTen: 0
};

export async function renderRankTracker() {
    await loadKeywordsData();
    
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
                                <a href="#/rank" class="px-3 py-2 rounded-md text-sm font-medium bg-primary text-white" data-testid="link-rank">Rank Tracker</a>
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

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900" data-testid="text-page-title">Keyword & Rank Tracker</h1>
                <p class="mt-2 text-gray-600" data-testid="text-page-description">Monitor your product rankings and keyword performance</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <i class="fas fa-search text-primary"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Total Keywords</p>
                            <p class="text-xl font-bold text-gray-900" data-testid="text-total-keywords">${rankStats.totalKeywords}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <i class="fas fa-arrow-up text-green-500"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Improved</p>
                            <p class="text-xl font-bold text-green-500" data-testid="text-improved">${rankStats.improved}</p>
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
                            <p class="text-xl font-bold text-red-500" data-testid="text-declined">${rankStats.declined}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                            <i class="fas fa-trophy text-yellow-500"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Top 10</p>
                            <p class="text-xl font-bold text-yellow-500" data-testid="text-top-ten">${rankStats.topTen}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Keyword Table -->
                <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-gray-900" data-testid="text-keywords-title">Keyword Rankings</h3>
                            <div class="flex items-center space-x-3">
                                <input type="text" placeholder="Search keywords..." class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" data-testid="input-search-keywords" id="keyword-search">
                                <button class="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors" onclick="refreshAllRankings()" data-testid="button-refresh-all">
                                    <i class="fas fa-sync-alt mr-2"></i>
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                    <div data-testid="container-keywords-table">
                        ${createKeywordTable(keywords)}
                    </div>
                </div>

                <!-- Add Keyword & Controls -->
                <div class="space-y-6">
                    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-add-keyword">Add New Keyword</h3>
                        <form class="space-y-4" id="add-keyword-form" data-testid="form-add-keyword">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Keyword Phrase</label>
                                <input type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="math worksheets" data-testid="input-keyword-phrase" id="keyword-phrase" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Product</label>
                                <select class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" data-testid="select-product" id="product-select" required>
                                    <option value="">Select a product...</option>
                                </select>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                    <select class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" data-testid="select-country" id="country-select">
                                        <option value="us">United States</option>
                                        <option value="ca">Canada</option>
                                        <option value="gb">United Kingdom</option>
                                        <option value="au">Australia</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Device</label>
                                    <select class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" data-testid="select-device" id="device-select">
                                        <option value="desktop">Desktop</option>
                                        <option value="mobile">Mobile</option>
                                        <option value="tablet">Tablet</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" class="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors" data-testid="button-track-keyword">
                                Track Keyword
                            </button>
                        </form>
                    </div>

                    <!-- Rank History Chart -->
                    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-rank-history">Rank History</h3>
                        <div class="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                            <canvas id="rankChart" class="max-w-full max-h-full" data-testid="chart-rank-history"></canvas>
                        </div>
                    </div>

                    <!-- Alert Settings -->
                    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-alert-settings">Alert Settings</h3>
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

async function loadKeywordsData() {
    if (!window.app.isAuthenticated()) return;
    
    try {
        const user = window.app.getCurrentUser();
        const products = await db.getProducts(user.id);
        
        // Load keywords for all products
        keywords = [];
        for (const product of products) {
            const productKeywords = await db.getKeywords(product.id);
            keywords.push(...productKeywords.map(kw => ({
                ...kw,
                product_title: product.title,
                current_rank: kw.ranks?.[0]?.position || null,
                rank_change: calculateRankChange(kw.ranks)
            })));
        }
        
        // Calculate stats
        rankStats = {
            totalKeywords: keywords.length,
            improved: keywords.filter(kw => kw.rank_change > 0).length,
            declined: keywords.filter(kw => kw.rank_change < 0).length,
            topTen: keywords.filter(kw => kw.current_rank && kw.current_rank <= 10).length
        };
        
        // Populate product select dropdown
        populateProductSelect(products);
        
    } catch (error) {
        console.error('Error loading keywords data:', error);
        showToast('Error loading keywords data', 'error');
        keywords = [];
        rankStats = { totalKeywords: 0, improved: 0, declined: 0, topTen: 0 };
    }
}

function calculateRankChange(ranks) {
    if (!ranks || ranks.length < 2) return 0;
    
    // Sort by date descending to get latest two ranks
    const sortedRanks = ranks.sort((a, b) => new Date(b.fetched_at) - new Date(a.fetched_at));
    const current = sortedRanks[0]?.position;
    const previous = sortedRanks[1]?.position;
    
    if (!current || !previous) return 0;
    
    // Rank improvement is negative change (lower rank number is better)
    return previous - current;
}

function populateProductSelect(products) {
    const select = document.getElementById('product-select');
    if (select) {
        select.innerHTML = '<option value="">Select a product...</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.title;
            select.appendChild(option);
        });
    }
}

// Global functions for rank tracker interactions
window.refreshAllRankings = async function() {
    if (keywords.length === 0) {
        showToast('No keywords to refresh', 'info');
        return;
    }
    
    showToast(`Refreshing rankings for ${keywords.length} keywords...`, 'info');
    
    let successCount = 0;
    for (const keyword of keywords) {
        try {
            await refreshKeywordRank(keyword.id);
            successCount++;
        } catch (error) {
            console.error(`Error refreshing keyword ${keyword.phrase}:`, error);
        }
    }
    
    showToast(`Refreshed ${successCount} keywords successfully`, 'success');
    
    // Reload data and refresh display
    await loadKeywordsData();
    document.querySelector('[data-testid="container-keywords-table"]').innerHTML = createKeywordTable(keywords);
};

window.refreshKeywordRank = async function(keywordId) {
    const keyword = keywords.find(kw => kw.id === keywordId);
    if (!keyword) {
        showToast('Keyword not found', 'error');
        return;
    }
    
    try {
        showToast(`Refreshing rank for "${keyword.phrase}"...`, 'info');
        
        const rank = await fetchKeywordRank(keyword.phrase, keyword.tpt_url || '', {
            country: keyword.country || 'us',
            device: keyword.device || 'desktop'
        });
        
        // Save rank to database
        await db.createRank({
            keyword_id: keyword.id,
            position: rank.position,
            url_found: rank.url_found,
            fetched_at: new Date().toISOString()
        });
        
        showToast(`Rank updated: #${rank.position}`, 'success');
        
        // Reload data and refresh display
        await loadKeywordsData();
        document.querySelector('[data-testid="container-keywords-table"]').innerHTML = createKeywordTable(keywords);
        
    } catch (error) {
        console.error('Error refreshing keyword rank:', error);
        showToast('Error refreshing rank', 'error');
    }
};

// Initialize chart after page renders
document.addEventListener('pageRendered', () => {
    const addKeywordForm = document.getElementById('add-keyword-form');
    const searchInput = document.getElementById('keyword-search');
    
    if (addKeywordForm) {
        addKeywordForm.onsubmit = handleAddKeyword;
    }
    
    if (searchInput) {
        searchInput.oninput = handleKeywordSearch;
    }
    
    // Initialize rank chart
    initializeRankChart();
});

async function handleAddKeyword(e) {
    e.preventDefault();
    
    const phrase = document.getElementById('keyword-phrase').value.trim();
    const productId = document.getElementById('product-select').value;
    const country = document.getElementById('country-select').value;
    const device = document.getElementById('device-select').value;
    
    if (!phrase || !productId) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        const keywordData = {
            product_id: productId,
            phrase,
            country,
            device,
            created_at: new Date().toISOString()
        };
        
        const newKeyword = await db.createKeyword(keywordData);
        showToast('Keyword added successfully', 'success');
        
        // Clear form
        document.getElementById('add-keyword-form').reset();
        
        // Reload data and refresh display
        await loadKeywordsData();
        document.querySelector('[data-testid="container-keywords-table"]').innerHTML = createKeywordTable(keywords);
        
        // Update stats
        document.querySelector('[data-testid="text-total-keywords"]').textContent = rankStats.totalKeywords;
        
    } catch (error) {
        console.error('Error adding keyword:', error);
        showToast('Error adding keyword', 'error');
    }
}

function handleKeywordSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredKeywords = keywords.filter(keyword => 
        keyword.phrase.toLowerCase().includes(searchTerm) ||
        keyword.product_title.toLowerCase().includes(searchTerm)
    );
    
    document.querySelector('[data-testid="container-keywords-table"]').innerHTML = createKeywordTable(filteredKeywords);
}

function initializeRankChart() {
    const canvas = document.getElementById('rankChart');
    if (!canvas || !window.Chart) return;
    
    const ctx = canvas.getContext('2d');
    
    // Sample data for demonstration
    const mockData = {
        labels: Array.from({length: 14}, (_, i) => i + 1),
        datasets: [{
            label: 'Rank Position',
            data: [15, 14, 12, 11, 13, 10, 9, 8, 12, 11, 9, 8, 7, 6],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5
        }]
    };
    
    new Chart(ctx, {
        type: 'line',
        data: mockData,
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
                    reverse: true, // Lower rank numbers are better
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

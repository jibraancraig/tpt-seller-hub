import { db } from '../supa.js';
import { showToast } from '../ui/toasts.js';
import { parseSalesCSV } from '../services/sales.js';
import Papa from 'papaparse';

let analyticsData = {
    totalRevenue: 0,
    unitsSold: 0,
    pageViews: 0,
    conversionRate: 0,
    revenueData: [],
    productPerformance: [],
    changeImpacts: [],
    topProducts: []
};

export async function renderAnalytics() {
    await loadAnalyticsData();
    
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
                                <a href="#/analytics" class="px-3 py-2 rounded-md text-sm font-medium bg-primary text-white" data-testid="link-analytics">Analytics</a>
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
                <h1 class="text-3xl font-bold text-gray-900" data-testid="text-page-title">Analytics & Insights</h1>
                <p class="mt-2 text-gray-600" data-testid="text-page-description">Track your sales performance and optimization impact</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <i class="fas fa-dollar-sign text-green-500"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Total Revenue</p>
                            <p class="text-xl font-bold text-gray-900" data-testid="text-total-revenue">$${analyticsData.totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <i class="fas fa-shopping-cart text-primary"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Units Sold</p>
                            <p class="text-xl font-bold text-gray-900" data-testid="text-units-sold">${analyticsData.unitsSold.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <i class="fas fa-eye text-purple-500"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Page Views</p>
                            <p class="text-xl font-bold text-gray-900" data-testid="text-page-views">${analyticsData.pageViews.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                            <i class="fas fa-percentage text-yellow-500"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Conversion Rate</p>
                            <p class="text-xl font-bold text-gray-900" data-testid="text-conversion-rate">${analyticsData.conversionRate}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Charts -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Revenue Chart -->
                    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-semibold text-gray-900" data-testid="text-revenue-chart-title">Revenue Over Time</h3>
                            <div class="flex items-center space-x-2">
                                <button class="px-3 py-1 text-sm rounded-lg bg-primary text-white" onclick="setChartPeriod('30d')" data-testid="button-period-30d" id="period-30d">30d</button>
                                <button class="px-3 py-1 text-sm rounded-lg text-gray-500 hover:bg-gray-100" onclick="setChartPeriod('90d')" data-testid="button-period-90d" id="period-90d">90d</button>
                                <button class="px-3 py-1 text-sm rounded-lg text-gray-500 hover:bg-gray-100" onclick="setChartPeriod('1y')" data-testid="button-period-1y" id="period-1y">1y</button>
                            </div>
                        </div>
                        <div class="h-64">
                            <canvas id="revenueChart" class="w-full h-full" data-testid="chart-revenue"></canvas>
                        </div>
                    </div>

                    <!-- Product Performance Table -->
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div class="p-6 border-b border-gray-200">
                            <h3 class="text-lg font-semibold text-gray-900" data-testid="text-product-performance-title">Product Performance</h3>
                        </div>
                        <div class="overflow-x-auto" data-testid="container-product-performance">
                            ${renderProductPerformanceTable()}
                        </div>
                    </div>
                </div>

                <!-- Data Upload & Insights -->
                <div class="space-y-6">
                    <!-- CSV Upload -->
                    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-upload-sales-data">Upload Sales Data</h3>
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <i class="fas fa-upload text-2xl text-gray-400 mb-3"></i>
                            <p class="text-sm text-gray-600 mb-3">Upload your TPT sales CSV</p>
                            <input type="file" accept=".csv" class="hidden" id="sales-csv" data-testid="input-sales-csv">
                            <label for="sales-csv" class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer" data-testid="button-choose-sales-file">
                                Choose File
                            </label>
                        </div>
                        <div class="mt-4">
                            <p class="text-xs text-gray-500 mb-2">Expected format:</p>
                            <div class="bg-gray-50 rounded-lg p-3 text-xs font-mono">
                                date,product_title,units,revenue,views
                            </div>
                        </div>
                    </div>

                    <!-- Change Impact -->
                    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-change-impact">Change Impact</h3>
                        <div class="space-y-4" data-testid="container-change-impacts">
                            ${renderChangeImpacts()}
                        </div>
                    </div>

                    <!-- Top Performers -->
                    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-top-performers">Top Performers</h3>
                        <div class="space-y-3" data-testid="container-top-performers">
                            ${renderTopPerformers()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function loadAnalyticsData() {
    if (!window.app.isAuthenticated()) return;
    
    try {
        const user = window.app.getCurrentUser();
        
        // Load sales data
        const sales = await db.getSales(user.id);
        
        // Calculate analytics
        analyticsData.totalRevenue = sales.reduce((sum, sale) => sum + (sale.revenue || 0), 0);
        analyticsData.unitsSold = sales.reduce((sum, sale) => sum + (sale.units || 0), 0);
        analyticsData.pageViews = sales.reduce((sum, sale) => sum + (sale.views || 0), 0);
        analyticsData.conversionRate = analyticsData.pageViews > 0 ? 
            ((analyticsData.unitsSold / analyticsData.pageViews) * 100).toFixed(1) : 0;
        
        // Process revenue data for chart
        analyticsData.revenueData = processRevenueData(sales);
        
        // Process product performance
        analyticsData.productPerformance = processProductPerformance(sales);
        
        // Mock change impacts and top products for now
        analyticsData.changeImpacts = [
            {
                id: 1,
                type: 'SEO Update',
                description: 'Title optimization for "Math Bundle"',
                date: 'Dec 15',
                impact: '+15% conversion rate',
                positive: true
            }
        ];
        
        analyticsData.topProducts = analyticsData.productPerformance.slice(0, 5);
        
    } catch (error) {
        console.error('Error loading analytics data:', error);
        showToast('Error loading analytics data', 'error');
        
        // Reset to default values
        analyticsData = {
            totalRevenue: 0,
            unitsSold: 0,
            pageViews: 0,
            conversionRate: 0,
            revenueData: [],
            productPerformance: [],
            changeImpacts: [],
            topProducts: []
        };
    }
}

function processRevenueData(sales) {
    // Group sales by date and sum revenue
    const dailyRevenue = {};
    
    sales.forEach(sale => {
        const date = sale.date;
        if (!dailyRevenue[date]) {
            dailyRevenue[date] = 0;
        }
        dailyRevenue[date] += sale.revenue || 0;
    });
    
    // Convert to array for chart
    return Object.entries(dailyRevenue)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([date, revenue]) => ({ date, revenue }));
}

function processProductPerformance(sales) {
    // Group sales by product and calculate metrics
    const productMetrics = {};
    
    sales.forEach(sale => {
        const productId = sale.product_id;
        if (!productMetrics[productId]) {
            productMetrics[productId] = {
                id: productId,
                title: sale.products?.title || 'Unknown Product',
                revenue: 0,
                units: 0,
                views: 0,
                conversionRate: 0
            };
        }
        
        productMetrics[productId].revenue += sale.revenue || 0;
        productMetrics[productId].units += sale.units || 0;
        productMetrics[productId].views += sale.views || 0;
    });
    
    // Calculate conversion rates and sort by revenue
    return Object.values(productMetrics)
        .map(product => ({
            ...product,
            conversionRate: product.views > 0 ? 
                ((product.units / product.views) * 100).toFixed(1) : 0
        }))
        .sort((a, b) => b.revenue - a.revenue);
}

function renderProductPerformanceTable() {
    if (analyticsData.productPerformance.length === 0) {
        return `
            <div class="p-8 text-center">
                <i class="fas fa-chart-bar text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">No sales data available</p>
                <p class="text-sm text-gray-400">Upload your TPT sales CSV to see performance metrics</p>
            </div>
        `;
    }
    
    return `
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CVR</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                ${analyticsData.productPerformance.map(product => `
                    <tr class="hover:bg-gray-50" data-testid="row-product-performance-${product.id}">
                        <td class="px-6 py-4">
                            <span class="text-sm font-medium text-gray-900" data-testid="text-product-title-${product.id}">${product.title}</span>
                        </td>
                        <td class="px-6 py-4">
                            <span class="text-sm text-gray-900" data-testid="text-product-revenue-${product.id}">$${product.revenue.toLocaleString()}</span>
                        </td>
                        <td class="px-6 py-4">
                            <span class="text-sm text-gray-900" data-testid="text-product-units-${product.id}">${product.units.toLocaleString()}</span>
                        </td>
                        <td class="px-6 py-4">
                            <span class="text-sm text-gray-900" data-testid="text-product-views-${product.id}">${product.views.toLocaleString()}</span>
                        </td>
                        <td class="px-6 py-4">
                            <span class="text-sm text-gray-900" data-testid="text-product-cvr-${product.id}">${product.conversionRate}%</span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderChangeImpacts() {
    if (analyticsData.changeImpacts.length === 0) {
        return `
            <div class="text-center py-4">
                <p class="text-sm text-gray-500">No change impacts recorded yet</p>
            </div>
        `;
    }
    
    return analyticsData.changeImpacts.map(change => `
        <div class="border border-gray-200 rounded-lg p-4" data-testid="card-change-impact-${change.id}">
            <div class="flex items-start justify-between mb-2">
                <div class="flex items-center">
                    <div class="w-2 h-2 ${change.positive ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-2"></div>
                    <span class="text-sm font-medium text-gray-900" data-testid="text-change-type-${change.id}">${change.type}</span>
                </div>
                <span class="text-xs text-gray-500" data-testid="text-change-date-${change.id}">${change.date}</span>
            </div>
            <p class="text-sm text-gray-600 mb-2" data-testid="text-change-description-${change.id}">${change.description}</p>
            <div class="flex items-center text-sm">
                <i class="fas fa-arrow-${change.positive ? 'up text-green-500' : 'down text-red-500'} mr-1"></i>
                <span class="${change.positive ? 'text-green-600' : 'text-red-600'}" data-testid="text-change-impact-${change.id}">${change.impact}</span>
            </div>
        </div>
    `).join('');
}

function renderTopPerformers() {
    if (analyticsData.topProducts.length === 0) {
        return `
            <div class="text-center py-4">
                <p class="text-sm text-gray-500">No performance data available</p>
            </div>
        `;
    }
    
    return analyticsData.topProducts.map(product => `
        <div class="flex items-center justify-between" data-testid="item-top-performer-${product.id}">
            <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-900 truncate" data-testid="text-top-product-title-${product.id}">${product.title}</p>
                <p class="text-xs text-gray-500" data-testid="text-top-product-category-${product.id}">Education • Various Grades</p>
            </div>
            <div class="ml-4 text-right">
                <p class="text-sm font-bold text-gray-900" data-testid="text-top-product-revenue-${product.id}">$${product.revenue.toLocaleString()}</p>
                <p class="text-xs text-green-600" data-testid="text-top-product-growth-${product.id}">+12%</p>
            </div>
        </div>
    `).join('');
}

// Global functions for analytics interactions
window.setChartPeriod = function(period) {
    // Update button styles
    document.querySelectorAll('[id^="period-"]').forEach(btn => {
        btn.className = 'px-3 py-1 text-sm rounded-lg text-gray-500 hover:bg-gray-100';
    });
    document.getElementById(`period-${period}`).className = 'px-3 py-1 text-sm rounded-lg bg-primary text-white';
    
    // TODO: Filter data by period and update chart
    showToast(`Chart updated for ${period} period`, 'info');
};

// Initialize chart and file upload after page renders
document.addEventListener('pageRendered', () => {
    const salesCsvInput = document.getElementById('sales-csv');
    
    if (salesCsvInput) {
        salesCsvInput.onchange = handleSalesCSVUpload;
    }
    
    // Initialize revenue chart
    initializeRevenueChart();
});

async function handleSalesCSVUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
        showToast('Processing sales data...', 'info');
        
        Papa.parse(file, {
            header: true,
            complete: async function(results) {
                if (results.errors.length > 0) {
                    console.error('CSV parse errors:', results.errors);
                    showToast('Error parsing CSV file', 'error');
                    return;
                }
                
                const salesData = results.data.filter(row => 
                    row.date && row.product_title && (row.revenue || row.units || row.views)
                );
                
                if (salesData.length === 0) {
                    showToast('No valid sales data found in CSV', 'warning');
                    return;
                }
                
                await importSalesData(salesData);
            },
            error: function(error) {
                console.error('CSV parse error:', error);
                showToast('Error reading CSV file', 'error');
            }
        });
        
    } catch (error) {
        console.error('Sales CSV upload error:', error);
        showToast('Error uploading sales data', 'error');
    }
}

async function importSalesData(salesData) {
    if (!window.app.isAuthenticated()) {
        showToast('Please log in first', 'error');
        return;
    }
    
    try {
        const user = window.app.getCurrentUser();
        const products = await db.getProducts(user.id);
        
        // Map sales to products by title matching
        const salesWithProductIds = await parseSalesCSV(salesData, products);
        
        let successCount = 0;
        for (const sale of salesWithProductIds) {
            try {
                await db.createSales([sale]); // API expects array
                successCount++;
            } catch (error) {
                console.error('Error creating sale record:', error);
            }
        }
        
        showToast(`Successfully imported ${successCount} sales records`, 'success');
        
        // Reload analytics data and refresh the page
        await loadAnalyticsData();
        window.router.render();
        
    } catch (error) {
        console.error('Sales import error:', error);
        showToast('Error importing sales data', 'error');
    }
}

function initializeRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas || !window.Chart) return;
    
    const ctx = canvas.getContext('2d');
    
    // Prepare chart data
    const chartData = analyticsData.revenueData.length > 0 ? 
        analyticsData.revenueData : 
        // Sample data if no real data
        [
            { date: '2025-01-01', revenue: 1200 },
            { date: '2025-01-02', revenue: 1900 },
            { date: '2025-01-03', revenue: 3000 },
            { date: '2025-01-04', revenue: 2500 },
            { date: '2025-01-05', revenue: 2800 },
            { date: '2025-01-06', revenue: 3200 }
        ];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.map(item => new Date(item.date).toLocaleDateString()),
            datasets: [{
                label: 'Revenue',
                data: chartData.map(item => item.revenue),
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true
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
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

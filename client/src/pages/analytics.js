import { SalesService } from '../services/sales.js';
import { showModal } from '../ui/modals.js';

export default class AnalyticsPage {
  constructor() {
    this.salesService = new SalesService();
    this.chartInstances = {};
  }

  async render() {
    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p class="mt-2 text-gray-600">Track your sales performance and optimization impact</p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <i class="fas fa-dollar-sign text-success"></i>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Total Revenue</p>
                <p class="text-xl font-bold text-gray-900" id="stat-total-revenue" data-testid="stat-total-revenue">$0</p>
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
                <p class="text-xl font-bold text-gray-900" id="stat-units-sold" data-testid="stat-units-sold">0</p>
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
                <p class="text-xl font-bold text-gray-900" id="stat-page-views" data-testid="stat-page-views">0</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <i class="fas fa-percentage text-warning"></i>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Conversion Rate</p>
                <p class="text-xl font-bold text-gray-900" id="stat-conversion-rate" data-testid="stat-conversion-rate">0%</p>
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
                <h3 class="text-lg font-semibold text-gray-900">Revenue Over Time</h3>
                <div class="flex items-center space-x-2">
                  <button class="period-btn px-3 py-1 text-sm rounded-lg bg-primary text-white" data-period="30">30d</button>
                  <button class="period-btn px-3 py-1 text-sm rounded-lg text-gray-500 hover:bg-gray-100" data-period="90">90d</button>
                  <button class="period-btn px-3 py-1 text-sm rounded-lg text-gray-500 hover:bg-gray-100" data-period="365">1y</button>
                </div>
              </div>
              <div class="h-64">
                <canvas id="revenueChart" class="w-full h-full"></canvas>
              </div>
            </div>

            <!-- Product Performance Table -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div class="p-6 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">Product Performance</h3>
              </div>
              <div class="overflow-x-auto" id="product-performance-table">
                <div class="p-8 text-center text-gray-500" data-testid="empty-state-performance">
                  <i class="fas fa-chart-bar text-4xl mb-4 text-gray-300"></i>
                  <p class="text-lg font-medium mb-2">No sales data available</p>
                  <p class="text-sm">Upload your TPT sales CSV to see performance metrics</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Data Upload & Insights -->
          <div class="space-y-6">
            <!-- CSV Upload -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Upload Sales Data</h3>
              <div id="sales-drop-zone" 
                   class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors">
                <i class="fas fa-upload text-2xl text-gray-400 mb-3"></i>
                <p class="text-sm text-gray-600 mb-3">Upload your TPT sales CSV</p>
                <input type="file" accept=".csv" class="hidden" id="sales-csv" data-testid="input-sales-csv">
                <label for="sales-csv" 
                       class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                       data-testid="button-choose-sales-file">
                  Choose File
                </label>
              </div>
              <div class="mt-4">
                <p class="text-xs text-gray-500 mb-2">Expected format:</p>
                <div class="bg-gray-50 rounded-lg p-3 text-xs font-mono">
                  date,product_title,units,revenue,views
                </div>
                <a href="/samples/sales_sample.csv" 
                   download 
                   class="mt-2 inline-block text-xs text-primary hover:text-blue-700"
                   data-testid="link-download-sales-sample">
                  Download sample CSV
                </a>
              </div>
            </div>

            <!-- Change Impact -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Change Impact</h3>
              <div id="change-impact" class="space-y-4">
                <div class="text-center text-gray-500 py-4" data-testid="empty-state-impact">
                  <i class="fas fa-chart-line text-2xl mb-2 text-gray-300"></i>
                  <p class="text-sm">No change tracking data yet</p>
                </div>
              </div>
            </div>

            <!-- Top Performers -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
              <div id="top-performers" class="space-y-3">
                <div class="text-center text-gray-500 py-4" data-testid="empty-state-performers">
                  <i class="fas fa-trophy text-2xl mb-2 text-gray-300"></i>
                  <p class="text-sm">No performance data available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    this.setupEventListeners();
    await this.loadSalesData();
    this.initCharts();
  }

  setupEventListeners() {
    // CSV upload
    const csvInput = document.getElementById('sales-csv');
    const dropZone = document.getElementById('sales-drop-zone');
    
    csvInput.addEventListener('change', (e) => this.handleSalesCSVUpload(e.target.files[0]));
    
    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-primary', 'bg-blue-50');
    });
    
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('border-primary', 'bg-blue-50');
    });
    
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-primary', 'bg-blue-50');
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'text/csv') {
        this.handleSalesCSVUpload(file);
      }
    });

    // Period buttons
    document.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.period-btn').forEach(b => {
          b.classList.remove('bg-primary', 'text-white');
          b.classList.add('text-gray-500', 'hover:bg-gray-100');
        });
        e.target.classList.remove('text-gray-500', 'hover:bg-gray-100');
        e.target.classList.add('bg-primary', 'text-white');
        
        const period = parseInt(e.target.getAttribute('data-period'));
        this.updateCharts(period);
      });
    });
  }

  async handleSalesCSVUpload(file) {
    if (!file) return;

    try {
      const salesData = await this.salesService.parseCSV(file);
      await this.processSalesData(salesData);
      window.showToast('Sales data uploaded successfully!');
      await this.loadSalesData();
    } catch (error) {
      window.showToast('Failed to process sales CSV', 'error');
      console.error(error);
    }
  }

  async processSalesData(salesData) {
    try {
      // Show product mapping modal if needed
      await this.showProductMappingModal(salesData);
    } catch (error) {
      throw error;
    }
  }

  async showProductMappingModal(salesData) {
    // Get existing products for mapping
    const { data: products, error } = await window.supabase
      .from('products')
      .select('id, title');

    if (error) throw error;

    const modalContent = `
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Map Sales Data to Products</h3>
        <p class="text-sm text-gray-600 mb-4">Match sales records to your existing products:</p>
        
        <div class="max-h-96 overflow-y-auto space-y-3">
          ${salesData.slice(0, 10).map((sale, index) => `
            <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">${sale.product_title}</p>
                <p class="text-xs text-gray-500">$${sale.revenue} • ${sale.units} units</p>
              </div>
              <select class="ml-4 border border-gray-300 rounded px-2 py-1 text-sm" data-index="${index}">
                <option value="">Select product...</option>
                ${products.map(product => `
                  <option value="${product.id}" ${product.title.toLowerCase().includes(sale.product_title.toLowerCase()) ? 'selected' : ''}>
                    ${product.title}
                  </option>
                `).join('')}
              </select>
            </div>
          `).join('')}
          ${salesData.length > 10 ? `<p class="text-xs text-gray-500 text-center">...and ${salesData.length - 10} more records</p>` : ''}
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" onclick="closeModal()">
            Cancel
          </button>
          <button class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700" onclick="confirmSalesImport()">
            Import Sales Data
          </button>
        </div>
      </div>
    `;

    showModal(modalContent);

    // Store sales data for import
    window.pendingSalesData = salesData;
    
    // Set up import function
    window.confirmSalesImport = async () => {
      await this.processSalesImport(salesData);
      window.closeModal();
    };
  }

  async processSalesImport(salesData) {
    try {
      const mappedData = [];
      
      salesData.forEach((sale, index) => {
        const selectElement = document.querySelector(`[data-index="${index}"]`);
        const productId = selectElement?.value;
        
        if (productId) {
          mappedData.push({
            product_id: productId,
            date: sale.date,
            units: parseInt(sale.units) || 0,
            revenue: parseFloat(sale.revenue) || 0,
            views: parseInt(sale.views) || 0
          });
        }
      });

      if (mappedData.length === 0) {
        window.showToast('No products mapped for import', 'error');
        return;
      }

      // Save to database
      const { error } = await window.supabase
        .from('sales')
        .insert(mappedData);

      if (error) throw error;

      window.showToast(`Successfully imported ${mappedData.length} sales records!`);
      
    } catch (error) {
      console.error('Sales import error:', error);
      window.showToast('Failed to import sales data', 'error');
    }
  }

  async loadSalesData() {
    try {
      const { data, error } = await window.supabase
        .from('sales')
        .select(`
          *,
          products!inner(title)
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      this.salesData = data || [];
      this.updateStats();
      this.renderProductPerformance();
      this.renderTopPerformers();
      this.updateCharts();

    } catch (error) {
      console.error('Error loading sales data:', error);
      this.salesData = [];
    }
  }

  updateStats() {
    if (!this.salesData || this.salesData.length === 0) {
      document.getElementById('stat-total-revenue').textContent = '$0';
      document.getElementById('stat-units-sold').textContent = '0';
      document.getElementById('stat-page-views').textContent = '0';
      document.getElementById('stat-conversion-rate').textContent = '0%';
      return;
    }

    const totalRevenue = this.salesData.reduce((sum, sale) => sum + parseFloat(sale.revenue), 0);
    const totalUnits = this.salesData.reduce((sum, sale) => sum + parseInt(sale.units), 0);
    const totalViews = this.salesData.reduce((sum, sale) => sum + parseInt(sale.views || 0), 0);
    const conversionRate = totalViews > 0 ? ((totalUnits / totalViews) * 100).toFixed(1) : 0;

    document.getElementById('stat-total-revenue').textContent = `$${totalRevenue.toLocaleString()}`;
    document.getElementById('stat-units-sold').textContent = totalUnits.toLocaleString();
    document.getElementById('stat-page-views').textContent = totalViews.toLocaleString();
    document.getElementById('stat-conversion-rate').textContent = `${conversionRate}%`;
  }

  renderProductPerformance() {
    const container = document.getElementById('product-performance-table');
    
    if (!this.salesData || this.salesData.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-gray-500" data-testid="empty-state-performance">
          <i class="fas fa-chart-bar text-4xl mb-4 text-gray-300"></i>
          <p class="text-lg font-medium mb-2">No sales data available</p>
          <p class="text-sm">Upload your TPT sales CSV to see performance metrics</p>
        </div>
      `;
      return;
    }

    // Group by product
    const productPerformance = {};
    this.salesData.forEach(sale => {
      const productTitle = sale.products.title;
      if (!productPerformance[productTitle]) {
        productPerformance[productTitle] = {
          title: productTitle,
          revenue: 0,
          units: 0,
          views: 0
        };
      }
      productPerformance[productTitle].revenue += parseFloat(sale.revenue);
      productPerformance[productTitle].units += parseInt(sale.units);
      productPerformance[productTitle].views += parseInt(sale.views || 0);
    });

    const products = Object.values(productPerformance)
      .sort((a, b) => b.revenue - a.revenue);

    container.innerHTML = `
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
          ${products.map(product => {
            const cvr = product.views > 0 ? ((product.units / product.views) * 100).toFixed(1) : 0;
            return `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <span class="text-sm font-medium text-gray-900">${product.title}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-900">$${product.revenue.toLocaleString()}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-900">${product.units.toLocaleString()}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-900">${product.views.toLocaleString()}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-900">${cvr}%</span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  renderTopPerformers() {
    const container = document.getElementById('top-performers');
    
    if (!this.salesData || this.salesData.length === 0) {
      container.innerHTML = `
        <div class="text-center text-gray-500 py-4" data-testid="empty-state-performers">
          <i class="fas fa-trophy text-2xl mb-2 text-gray-300"></i>
          <p class="text-sm">No performance data available</p>
        </div>
      `;
      return;
    }

    // Group by product and get top 3
    const productRevenue = {};
    this.salesData.forEach(sale => {
      const productTitle = sale.products.title;
      productRevenue[productTitle] = (productRevenue[productTitle] || 0) + parseFloat(sale.revenue);
    });

    const topProducts = Object.entries(productRevenue)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    container.innerHTML = topProducts.map(([title, revenue]) => `
      <div class="flex items-center justify-between">
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 truncate">${title}</p>
          <p class="text-xs text-gray-500">Top performer</p>
        </div>
        <div class="ml-4 text-right">
          <p class="text-sm font-bold text-gray-900">$${revenue.toLocaleString()}</p>
          <p class="text-xs text-success">Best seller</p>
        </div>
      </div>
    `).join('');
  }

  initCharts() {
    this.initRevenueChart();
  }

  initRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    // Initialize with empty data
    this.chartInstances.revenue = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Revenue',
          data: [],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
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
          }
        }
      }
    });
  }

  updateCharts(period = 30) {
    if (!this.salesData || this.salesData.length === 0) return;

    // Filter data by period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - period);
    
    const filteredData = this.salesData.filter(sale => 
      new Date(sale.date) >= cutoffDate
    );

    // Group by date
    const dailyRevenue = {};
    filteredData.forEach(sale => {
      const date = new Date(sale.date).toISOString().split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + parseFloat(sale.revenue);
    });

    // Sort dates and prepare chart data
    const sortedDates = Object.keys(dailyRevenue).sort();
    const revenueValues = sortedDates.map(date => dailyRevenue[date]);

    // Update revenue chart
    if (this.chartInstances.revenue) {
      this.chartInstances.revenue.data.labels = sortedDates.map(date => 
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      );
      this.chartInstances.revenue.data.datasets[0].data = revenueValues;
      this.chartInstances.revenue.update();
    }
  }
}

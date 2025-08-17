import { showModal } from '../ui/modals.js';

export default class ProductsPage {
  async render() {
    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Import Your Products</h1>
          <p class="mt-2 text-gray-600">Get started by importing your existing TPT products</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- CSV Upload Card -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              <i class="fas fa-file-csv text-primary mr-2"></i>
              Upload CSV File
            </h3>
            <div id="csv-drop-zone" class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
              <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
              <p class="text-lg font-medium text-gray-700 mb-2">Drop your CSV file here</p>
              <p class="text-sm text-gray-500 mb-4">or click to browse</p>
              <input type="file" accept=".csv" class="hidden" id="csv-upload" data-testid="input-csv-upload">
              <label for="csv-upload" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer" data-testid="button-choose-file">
                Choose File
              </label>
            </div>
            <div class="mt-4">
              <p class="text-sm text-gray-600 mb-2">Expected columns:</p>
              <div class="flex flex-wrap gap-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">title</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">description</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">tags</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">tpt_url</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">price</span>
              </div>
            </div>
          </div>

          <!-- URL List Import -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              <i class="fas fa-link text-primary mr-2"></i>
              Paste Product URLs
            </h3>
            <textarea 
              id="url-input"
              placeholder="Paste your TPT product URLs, one per line..."
              class="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              data-testid="textarea-urls"></textarea>
            <button id="import-urls-btn" class="mt-4 w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors" data-testid="button-import-urls">
              Import from URLs
            </button>
            <p class="mt-2 text-xs text-gray-500">We'll automatically fetch product details for each URL</p>
          </div>
        </div>

        <!-- Sample Data -->
        <div class="mt-8 bg-blue-50 rounded-xl p-6">
          <h4 class="text-sm font-medium text-blue-900 mb-3">
            <i class="fas fa-download mr-2"></i>
            Sample CSV Format
          </h4>
          <div class="bg-white rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <div>title,description,tags,tpt_url,price</div>
            <div class="text-gray-600">Algebra Task Cards,"40 printable cards covering linear equations",math;algebra,https://www.teacherspayteachers.com/Product/12345,6.99</div>
          </div>
          <a href="/samples/products_sample.csv" download class="mt-3 inline-block text-sm text-primary hover:text-blue-700 font-medium" data-testid="link-download-sample">
            Download sample CSV
          </a>
        </div>

        <!-- Products List -->
        <div class="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">Your Products</h3>
              <button id="add-manual-btn" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm" data-testid="button-add-manual">
                <i class="fas fa-plus mr-2"></i>
                Add Manually
              </button>
            </div>
          </div>
          <div id="products-list" class="overflow-hidden">
            <div class="p-8 text-center text-gray-500" data-testid="empty-state-products">
              <i class="fas fa-boxes text-4xl mb-4 text-gray-300"></i>
              <p class="text-lg font-medium mb-2">No products imported yet</p>
              <p class="text-sm">Upload a CSV file or paste URLs to get started</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    this.setupEventListeners();
    await this.loadProducts();
  }

  setupEventListeners() {
    // CSV Upload
    const csvInput = document.getElementById('csv-upload');
    const dropZone = document.getElementById('csv-drop-zone');
    
    csvInput.addEventListener('change', (e) => this.handleCSVUpload(e.target.files[0]));
    
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
        this.handleCSVUpload(file);
      }
    });

    // URL Import
    document.getElementById('import-urls-btn').addEventListener('click', () => {
      this.handleURLImport();
    });

    // Manual Add
    document.getElementById('add-manual-btn').addEventListener('click', () => {
      this.showAddProductModal();
    });
  }

  async handleCSVUpload(file) {
    if (!file) return;

    try {
      const text = await file.text();
      const results = Papa.parse(text, { header: true, skipEmptyLines: true });
      
      if (results.errors.length > 0) {
        window.showToast('CSV parsing error: ' + results.errors[0].message, 'error');
        return;
      }

      if (results.data.length === 0) {
        window.showToast('CSV file appears to be empty', 'error');
        return;
      }

      // Show column mapping modal if needed
      await this.showColumnMappingModal(results.data);
      
    } catch (error) {
      console.error('CSV upload error:', error);
      window.showToast('Failed to process CSV file', 'error');
    }
  }

  async showColumnMappingModal(csvData) {
    const expectedColumns = ['title', 'description', 'tags', 'tpt_url', 'price'];
    const csvColumns = Object.keys(csvData[0] || {});
    
    const modalContent = `
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Map CSV Columns</h3>
        <p class="text-sm text-gray-600 mb-4">Match your CSV columns to our expected fields:</p>
        
        <div class="space-y-4">
          ${expectedColumns.map(col => `
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-gray-700 w-24">${col}:</label>
              <select class="flex-1 ml-4 border border-gray-300 rounded px-3 py-2" data-field="${col}">
                <option value="">Select column...</option>
                ${csvColumns.map(csvCol => `
                  <option value="${csvCol}" ${csvCol.toLowerCase().includes(col) ? 'selected' : ''}>${csvCol}</option>
                `).join('')}
              </select>
            </div>
          `).join('')}
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" onclick="closeModal()">
            Cancel
          </button>
          <button class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700" onclick="confirmImport()">
            Import Products
          </button>
        </div>
      </div>
    `;

    showModal(modalContent);

    // Store CSV data for import
    window.pendingCSVData = csvData;
    
    // Set up import function
    window.confirmImport = async () => {
      await this.processCSVImport(csvData);
      window.closeModal();
    };
  }

  async processCSVImport(csvData) {
    const mapping = {};
    document.querySelectorAll('[data-field]').forEach(select => {
      const field = select.getAttribute('data-field');
      const csvColumn = select.value;
      if (csvColumn) mapping[field] = csvColumn;
    });

    const products = csvData.map(row => {
      const product = {};
      Object.keys(mapping).forEach(field => {
        const csvColumn = mapping[field];
        product[field] = row[csvColumn] || '';
      });
      return product;
    });

    try {
      for (const product of products) {
        await this.saveProduct(product);
      }
      
      window.showToast(`Successfully imported ${products.length} products!`);
      await this.loadProducts();
      
    } catch (error) {
      console.error('Import error:', error);
      window.showToast('Failed to import products', 'error');
    }
  }

  async handleURLImport() {
    const urlInput = document.getElementById('url-input');
    const urls = urlInput.value.split('\n').filter(url => url.trim());
    
    if (urls.length === 0) {
      window.showToast('Please enter at least one URL', 'error');
      return;
    }

    try {
      for (const url of urls) {
        // Create placeholder product with URL - scraping would be implemented later
        const product = {
          title: 'Product from URL',
          description: 'Fetched from ' + url,
          tpt_url: url.trim(),
          price: 0,
          tags: []
        };
        
        await this.saveProduct(product);
      }
      
      window.showToast(`Successfully imported ${urls.length} product placeholders!`);
      urlInput.value = '';
      await this.loadProducts();
      
    } catch (error) {
      console.error('URL import error:', error);
      window.showToast('Failed to import from URLs', 'error');
    }
  }

  showAddProductModal() {
    const modalContent = `
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Add Product Manually</h3>
        
        <form id="manual-product-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" name="title" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" class="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input type="number" name="price" step="0.01" min="0" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">TPT URL</label>
              <input type="url" name="tpt_url" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input type="text" name="tags" placeholder="math, algebra, worksheets" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" onclick="closeModal()">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
              Add Product
            </button>
          </div>
        </form>
      </div>
    `;

    showModal(modalContent);

    // Handle form submission
    document.getElementById('manual-product-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const product = {
        title: formData.get('title'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')) || 0,
        tpt_url: formData.get('tpt_url'),
        tags: formData.get('tags').split(',').map(t => t.trim()).filter(t => t)
      };

      try {
        await this.saveProduct(product);
        window.showToast('Product added successfully!');
        window.closeModal();
        await this.loadProducts();
      } catch (error) {
        window.showToast('Failed to add product', 'error');
        console.error(error);
      }
    });
  }

  async saveProduct(product) {
    const { data, error } = await window.supabase
      .from('products')
      .insert({
        ...product,
        user_id: window.AppState.user?.id
      });

    if (error) throw error;
    return data;
  }

  async loadProducts() {
    try {
      const { data, error } = await window.supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const products = data || [];
      window.AppState.products = products;
      
      this.renderProducts(products);
      
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  renderProducts(products) {
    const container = document.getElementById('products-list');
    
    if (products.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-gray-500" data-testid="empty-state-products">
          <i class="fas fa-boxes text-4xl mb-4 text-gray-300"></i>
          <p class="text-lg font-medium mb-2">No products imported yet</p>
          <p class="text-sm">Upload a CSV file or paste URLs to get started</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${products.map(product => `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="max-w-xs">
                    <div class="text-sm font-medium text-gray-900 truncate">${product.title}</div>
                    <div class="text-sm text-gray-500 truncate">${product.description || ''}</div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    ${(product.tags || []).slice(0, 3).map(tag => `
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">${tag}</span>
                    `).join('')}
                    ${(product.tags || []).length > 3 ? '<span class="text-xs text-gray-500">+' + ((product.tags || []).length - 3) + '</span>' : ''}
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  $${product.price || '0.00'}
                </td>
                <td class="px-6 py-4 text-sm font-medium">
                  <button onclick="window.location.hash='#/product/${product.id}'" class="text-primary hover:text-blue-700 mr-3" data-testid="button-edit-${product.id}">
                    Edit
                  </button>
                  <button onclick="deleteProduct('${product.id}')" class="text-red-600 hover:text-red-900" data-testid="button-delete-${product.id}">
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
    window.deleteProduct = async (id) => {
      if (confirm('Are you sure you want to delete this product?')) {
        try {
          const { error } = await window.supabase
            .from('products')
            .delete()
            .eq('id', id);

          if (error) throw error;
          
          window.showToast('Product deleted successfully');
          await this.loadProducts();
        } catch (error) {
          window.showToast('Failed to delete product', 'error');
          console.error(error);
        }
      }
    };
  }
}

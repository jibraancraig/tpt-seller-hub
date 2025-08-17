export class Table {
  static create({ columns, data, className = '', emptyState, testId = '' }) {
    if (!data || data.length === 0) {
      return emptyState || `
        <div class="p-8 text-center text-gray-500">
          <i class="fas fa-table text-4xl mb-4 text-gray-300"></i>
          <p class="text-lg font-medium mb-2">No data available</p>
          <p class="text-sm">Data will appear here when available</p>
        </div>
      `;
    }

    return `
      <div class="overflow-x-auto ${className}" ${testId ? `data-testid="${testId}"` : ''}>
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              ${columns.map(col => `
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ${col.header}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${data.map(row => `
              <tr class="hover:bg-gray-50">
                ${columns.map(col => `
                  <td class="px-6 py-4 whitespace-nowrap">
                    ${col.render ? col.render(row) : row[col.key] || '--'}
                  </td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  static renderCell(content, className = '') {
    return `<span class="${className}">${content}</span>`;
  }

  static renderBadge(text, variant = 'default') {
    const variants = {
      default: 'bg-gray-100 text-gray-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800'
    };

    return `
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default}">
        ${text}
      </span>
    `;
  }

  static renderActions(actions) {
    return `
      <div class="flex space-x-2">
        ${actions.map(action => `
          <button onclick="${action.onClick}" 
                  class="text-${action.color || 'primary'} hover:text-${action.color || 'blue'}-700 text-sm font-medium"
                  title="${action.title || ''}"
                  data-testid="${action.testId || ''}">
            ${action.icon ? `<i class="fas fa-${action.icon} mr-1"></i>` : ''}
            ${action.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  static renderTrend(values, color = 'primary') {
    // Simple sparkline representation
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    
    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * 60;
      const y = 20 - ((value - min) / range) * 20;
      return `${x},${y}`;
    }).join(' ');

    return `
      <svg width="64" height="24" class="inline-block">
        <polyline
          points="${points}"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="text-${color}"
        />
      </svg>
    `;
  }

  static renderRankChange(current, previous) {
    if (!previous || !current) {
      return '<span class="text-gray-500">--</span>';
    }

    const change = previous - current; // Lower rank is better
    if (change === 0) {
      return '<span class="text-gray-500">--</span>';
    }

    const icon = change > 0 ? 'arrow-up' : 'arrow-down';
    const color = change > 0 ? 'success' : 'red-500';
    
    return `
      <span class="inline-flex items-center text-sm text-${color}">
        <i class="fas fa-${icon} mr-1"></i>
        ${Math.abs(change)}
      </span>
    `;
  }
}

export class DataTable {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.getElementById(container) : container;
    this.options = {
      searchable: false,
      sortable: false,
      paginated: false,
      pageSize: 10,
      ...options
    };
    this.data = [];
    this.filteredData = [];
    this.currentPage = 1;
  }

  setData(data) {
    this.data = data;
    this.filteredData = [...data];
    this.render();
  }

  render() {
    if (!this.container) return;

    const { columns, emptyState } = this.options;
    
    let html = '';

    // Search bar
    if (this.options.searchable) {
      html += `
        <div class="mb-4">
          <input type="text" 
                 placeholder="Search..." 
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                 onInput="this.parentElement.parentElement.querySelector('.data-table').__search(this.value)">
        </div>
      `;
    }

    // Table
    html += `<div class="data-table">${Table.create({ 
      columns, 
      data: this.getPaginatedData(), 
      emptyState 
    })}</div>`;

    // Pagination
    if (this.options.paginated && this.filteredData.length > this.options.pageSize) {
      html += this.renderPagination();
    }

    this.container.innerHTML = html;
    
    // Attach search function
    if (this.options.searchable) {
      this.container.querySelector('.data-table').__search = (query) => this.search(query);
    }
  }

  search(query) {
    if (!query) {
      this.filteredData = [...this.data];
    } else {
      this.filteredData = this.data.filter(row => {
        return Object.values(row).some(value => 
          String(value).toLowerCase().includes(query.toLowerCase())
        );
      });
    }
    this.currentPage = 1;
    this.render();
  }

  getPaginatedData() {
    if (!this.options.paginated) return this.filteredData;
    
    const start = (this.currentPage - 1) * this.options.pageSize;
    const end = start + this.options.pageSize;
    return this.filteredData.slice(start, end);
  }

  renderPagination() {
    const totalPages = Math.ceil(this.filteredData.length / this.options.pageSize);
    
    return `
      <div class="flex items-center justify-between mt-4">
        <div class="text-sm text-gray-700">
          Showing ${(this.currentPage - 1) * this.options.pageSize + 1} to 
          ${Math.min(this.currentPage * this.options.pageSize, this.filteredData.length)} of 
          ${this.filteredData.length} results
        </div>
        <div class="flex space-x-1">
          <button onclick="this.changePage(${this.currentPage - 1})" 
                  ${this.currentPage === 1 ? 'disabled' : ''}
                  class="px-3 py-1 border rounded disabled:opacity-50">
            Previous
          </button>
          ${Array.from({ length: totalPages }, (_, i) => i + 1).map(page => `
            <button onclick="this.changePage(${page})" 
                    class="px-3 py-1 border rounded ${page === this.currentPage ? 'bg-primary text-white' : ''}">
              ${page}
            </button>
          `).join('')}
          <button onclick="this.changePage(${this.currentPage + 1})" 
                  ${this.currentPage === totalPages ? 'disabled' : ''}
                  class="px-3 py-1 border rounded disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    `;
  }

  changePage(page) {
    const totalPages = Math.ceil(this.filteredData.length / this.options.pageSize);
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      this.render();
    }
  }
}

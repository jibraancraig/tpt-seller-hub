export class Card {
  static create({ title, content, className = '', testId = '' }) {
    return `
      <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm ${className}" ${testId ? `data-testid="${testId}"` : ''}>
        ${title ? `<h3 class="text-lg font-semibold text-gray-900 mb-4">${title}</h3>` : ''}
        ${content}
      </div>
    `;
  }

  static stat({ icon, iconColor, label, value, change, testId = '' }) {
    const changeHtml = change ? `
      <div class="flex items-center mt-2">
        <i class="fas fa-arrow-${change > 0 ? 'up' : 'down'} text-${change > 0 ? 'success' : 'red-500'} mr-1"></i>
        <span class="text-sm text-${change > 0 ? 'success' : 'red-500'}">${change > 0 ? '+' : ''}${change}%</span>
      </div>
    ` : '';

    return `
      <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm" ${testId ? `data-testid="${testId}"` : ''}>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-${iconColor}-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-${icon} text-${iconColor}"></i>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">${label}</p>
            <p class="text-2xl font-bold text-gray-900">${value}</p>
            ${changeHtml}
          </div>
        </div>
      </div>
    `;
  }

  static product({ product, onEdit, onDelete }) {
    const tags = (product.tags || []).slice(0, 3);
    const moreTagsCount = (product.tags || []).length - 3;

    return `
      <div class="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-medium text-gray-900 truncate">${product.title}</h4>
            <p class="text-sm text-gray-500 truncate">${product.description || 'No description'}</p>
            <div class="flex items-center mt-2 space-x-4">
              <div class="flex items-center">
                <span class="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                <span class="text-xs text-gray-600">SEO: --</span>
              </div>
              <div class="flex items-center">
                <span class="text-xs text-gray-600">Rank #</span>
                <span class="text-xs font-medium text-gray-900 ml-1">--</span>
              </div>
              <div class="flex flex-wrap gap-1">
                ${tags.map(tag => `
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">${tag}</span>
                `).join('')}
                ${moreTagsCount > 0 ? `<span class="text-xs text-gray-500">+${moreTagsCount}</span>` : ''}
              </div>
            </div>
          </div>
          <div class="ml-4 flex items-center space-x-2">
            <span class="text-sm font-medium text-gray-900">$${product.price || '0.00'}</span>
            <div class="flex space-x-1">
              <button class="text-primary hover:text-blue-700 p-1" onclick="${onEdit}" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="text-red-600 hover:text-red-900 p-1" onclick="${onDelete}" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

export class ActionCard {
  static create({ title, description, icon, iconColor, onClick, className = '' }) {
    return `
      <button onclick="${onClick}" 
              class="w-full bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow text-left ${className}">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-${iconColor}-100 rounded-lg flex items-center justify-center mb-4">
            <i class="fas fa-${icon} text-${iconColor}-600"></i>
          </div>
        </div>
        <h3 class="text-lg font-semibold mb-2">${title}</h3>
        <p class="text-gray-600 text-sm">${description}</p>
      </button>
    `;
  }
}

export class QuickActionCard {
  static create({ actions, className = '' }) {
    return `
      <div class="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white ${className}">
        <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
        <div class="space-y-3">
          ${actions.map(action => `
            <button onclick="${action.onClick}" 
                    class="w-full bg-white/20 hover:bg-white/30 rounded-lg p-3 text-left transition-colors"
                    data-testid="${action.testId || ''}">
              <i class="fas fa-${action.icon} mr-2"></i>
              ${action.title}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }
}

let currentModal = null;

export function showModal(content, options = {}) {
  const {
    size = 'md',
    closeable = true,
    className = ''
  } = options;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  const modalHtml = `
    <div id="modal-overlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="handleOverlayClick(event)">
      <div class="bg-white rounded-xl shadow-xl w-full ${sizeClasses[size]} ${className} max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        ${closeable ? `
          <div class="flex justify-end p-4 pb-0">
            <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600" data-testid="button-close-modal">
              <i class="fas fa-times text-lg"></i>
            </button>
          </div>
        ` : ''}
        <div class="${closeable ? 'px-4 pb-4' : 'p-4'}">
          ${content}
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  if (currentModal) {
    currentModal.remove();
  }

  // Create and show new modal
  const modalElement = document.createElement('div');
  modalElement.innerHTML = modalHtml;
  document.body.appendChild(modalElement);
  currentModal = modalElement;

  // Prevent body scroll
  document.body.style.overflow = 'hidden';

  // Set up global close function
  window.closeModal = closeModal;
  window.handleOverlayClick = (event) => {
    if (event.target.id === 'modal-overlay' && closeable) {
      closeModal();
    }
  };

  // Handle escape key
  const handleEscape = (event) => {
    if (event.key === 'Escape' && closeable) {
      closeModal();
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Store cleanup function
  currentModal._cleanup = () => {
    document.removeEventListener('keydown', handleEscape);
  };

  return modalElement;
}

export function closeModal() {
  if (currentModal) {
    // Cleanup event listeners
    if (currentModal._cleanup) {
      currentModal._cleanup();
    }
    
    // Remove modal
    currentModal.remove();
    currentModal = null;
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Cleanup global functions
    delete window.closeModal;
    delete window.handleOverlayClick;
  }
}

export function showConfirm(message, options = {}) {
  const {
    title = 'Confirm',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'default' // default, danger
  } = options;

  const buttonClass = type === 'danger' 
    ? 'bg-red-600 hover:bg-red-700 text-white' 
    : 'bg-primary hover:bg-blue-700 text-white';

  return new Promise((resolve) => {
    const content = `
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">${title}</h3>
        <p class="text-gray-600 mb-6">${message}</p>
        
        <div class="flex justify-end space-x-3">
          <button onclick="handleConfirm(false)" 
                  class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  data-testid="button-cancel">
            ${cancelText}
          </button>
          <button onclick="handleConfirm(true)" 
                  class="px-4 py-2 rounded-lg ${buttonClass}"
                  data-testid="button-confirm">
            ${confirmText}
          </button>
        </div>
      </div>
    `;

    showModal(content, { size: 'sm', closeable: false });

    window.handleConfirm = (result) => {
      closeModal();
      resolve(result);
      delete window.handleConfirm;
    };
  });
}

export function showAlert(message, options = {}) {
  const {
    title = 'Alert',
    type = 'info' // info, success, warning, error
  } = options;

  const icons = {
    info: 'fa-info-circle text-blue-500',
    success: 'fa-check-circle text-green-500',
    warning: 'fa-exclamation-triangle text-yellow-500',
    error: 'fa-times-circle text-red-500'
  };

  const content = `
    <div class="p-6">
      <div class="flex items-center mb-4">
        <i class="fas ${icons[type]} text-2xl mr-3"></i>
        <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
      </div>
      <p class="text-gray-600 mb-6">${message}</p>
      
      <div class="flex justify-end">
        <button onclick="closeModal()" 
                class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
                data-testid="button-ok">
          OK
        </button>
      </div>
    </div>
  `;

  showModal(content, { size: 'sm' });
}

export function showLoading(message = 'Loading...') {
  const content = `
    <div class="p-8 text-center">
      <div class="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-600">${message}</p>
    </div>
  `;

  showModal(content, { size: 'sm', closeable: false });
}

// Form modal helper
export function showFormModal(title, fields, onSubmit, options = {}) {
  const formFields = fields.map(field => {
    const {
      name,
      label,
      type = 'text',
      placeholder = '',
      required = false,
      options: fieldOptions = [],
      value = ''
    } = field;

    let inputHtml = '';
    
    switch (type) {
      case 'select':
        inputHtml = `
          <select name="${name}" ${required ? 'required' : ''} 
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
            ${fieldOptions.map(option => 
              `<option value="${option.value}" ${option.value === value ? 'selected' : ''}>${option.label}</option>`
            ).join('')}
          </select>
        `;
        break;
      case 'textarea':
        inputHtml = `
          <textarea name="${name}" 
                    ${required ? 'required' : ''} 
                    placeholder="${placeholder}"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">${value}</textarea>
        `;
        break;
      case 'checkbox':
        inputHtml = `
          <label class="flex items-center">
            <input type="checkbox" name="${name}" ${value ? 'checked' : ''} class="rounded border-gray-300 text-primary focus:ring-primary">
            <span class="ml-2 text-sm text-gray-700">${label}</span>
          </label>
        `;
        break;
      default:
        inputHtml = `
          <input type="${type}" 
                 name="${name}" 
                 ${required ? 'required' : ''} 
                 placeholder="${placeholder}"
                 value="${value}"
                 class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
        `;
    }

    return `
      <div>
        ${type !== 'checkbox' ? `<label class="block text-sm font-medium text-gray-700 mb-1">${label}</label>` : ''}
        ${inputHtml}
      </div>
    `;
  }).join('');

  const content = `
    <div class="p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">${title}</h3>
      
      <form id="modal-form" class="space-y-4">
        ${formFields}
        
        <div class="flex justify-end space-x-3 mt-6">
          <button type="button" 
                  onclick="closeModal()" 
                  class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" 
                  class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
            ${options.submitText || 'Submit'}
          </button>
        </div>
      </form>
    </div>
  `;

  showModal(content, options);

  // Handle form submission
  document.getElementById('modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    try {
      await onSubmit(data);
      closeModal();
    } catch (error) {
      console.error('Form submission error:', error);
      // Form stays open on error
    }
  });
}

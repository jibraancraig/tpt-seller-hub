let toastContainer = null;

function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'fixed top-4 right-4 space-y-2 z-50';
      document.body.appendChild(toastContainer);
    }
  }
  return toastContainer;
}

export function showToast(message, type = 'success', duration = 5000) {
  const container = ensureToastContainer();
  
  const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const typeStyles = {
    success: {
      bg: 'bg-green-500',
      icon: 'fa-check-circle'
    },
    error: {
      bg: 'bg-red-500',
      icon: 'fa-exclamation-circle'
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: 'fa-exclamation-triangle'
    },
    info: {
      bg: 'bg-blue-500',
      icon: 'fa-info-circle'
    }
  };

  const style = typeStyles[type] || typeStyles.success;

  const toast = document.createElement('div');
  toast.id = toastId;
  toast.className = `p-4 rounded-lg shadow-lg text-white ${style.bg} transform transition-all duration-300 translate-x-full max-w-sm`;
  toast.setAttribute('data-testid', `toast-${type}`);
  
  toast.innerHTML = `
    <div class="flex items-center">
      <i class="fas ${style.icon} mr-2"></i>
      <span class="flex-1">${message}</span>
      <button class="ml-3 hover:opacity-75" onclick="removeToast('${toastId}')">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full');
  }, 100);

  // Auto remove
  if (duration > 0) {
    setTimeout(() => {
      removeToast(toastId);
    }, duration);
  }

  // Set up global remove function
  window.removeToast = removeToast;

  return toastId;
}

export function removeToast(toastId) {
  const toast = document.getElementById(toastId);
  if (toast) {
    toast.classList.add('translate-x-full');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
}

export function removeAllToasts() {
  const container = ensureToastContainer();
  const toasts = container.querySelectorAll('[id^="toast-"]');
  toasts.forEach(toast => {
    removeToast(toast.id);
  });
}

// Make showToast globally available
window.showToast = showToast;

// Auto-setup toast container on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ensureToastContainer);
} else {
  ensureToastContainer();
}

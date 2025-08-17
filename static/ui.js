// Tiny DOM helpers
export function el(selector) {
    return document.querySelector(selector);
}

export function mount(selector, html) {
    const element = el(selector);
    if (element) {
        element.innerHTML = html;
    }
}

export function showToast(message, type = 'info', duration = 5000) {
    const toastContainer = el('#toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    toastContainer.appendChild(toast);

    // Auto-remove after duration
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, duration);
}

export function createModal(content, onClose = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="p-6">
                ${content}
            </div>
        </div>
    `;

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    function closeModal() {
        modal.remove();
        if (onClose) onClose();
    }

    document.body.appendChild(modal);
    return { close: closeModal };
}

export function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

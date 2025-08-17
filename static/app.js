import { supa } from './supa.js';
import { router } from './router.js';
import { showToast } from './ui.js';

// Initialize the application
class App {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'landing';
        
        this.init();
    }

    async init() {
        // Check for existing session
        const { data: { session } } = await supa.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            router.navigate('/dashboard');
        } else {
            router.navigate('/');
        }

        // Listen for auth changes
        supa.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                showToast('Welcome back!', 'success');
                router.navigate('/dashboard');
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                router.navigate('/');
            }
        });

        // Initialize router
        router.init();
    }

    // Global app state and methods
    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.currentUser;
    }
}

// Create global app instance
window.app = new App();

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Prevent blank screen by showing error message
    const appEl = document.getElementById('app');
    if (appEl && !appEl.querySelector('#fatal-error')) {
        appEl.innerHTML = `
            <div id="fatal-error" class="max-w-md mx-auto mt-20 p-6 bg-red-50 border border-red-200 rounded-lg">
                <h2 class="text-lg font-semibold text-red-800 mb-2">App Error</h2>
                <p class="text-red-700 mb-4">Something went wrong. Please refresh the page.</p>
                <pre class="text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">${event.error?.message || 'Unknown error'}</pre>
                <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    Refresh Page
                </button>
            </div>
        `;
    }
    
    showToast('An unexpected error occurred', 'error');
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Prevent blank screen by showing error message
    const appEl = document.getElementById('app');
    if (appEl && !appEl.querySelector('#fatal-error')) {
        appEl.innerHTML = `
            <div id="fatal-error" class="max-w-md mx-auto mt-20 p-6 bg-red-50 border border-red-200 rounded-lg">
                <h2 class="text-lg font-semibold text-red-800 mb-2">App Error</h2>
                <p class="text-red-700 mb-4">Something went wrong. Please refresh the page.</p>
                <pre class="text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">${event.reason?.message || 'Unknown error'}</pre>
                <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    Refresh Page
                </button>
            </div>
        `;
    }
    
    showToast('An unexpected error occurred', 'error');
});

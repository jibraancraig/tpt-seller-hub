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
    showToast('An unexpected error occurred', 'error');
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showToast('An unexpected error occurred', 'error');
});

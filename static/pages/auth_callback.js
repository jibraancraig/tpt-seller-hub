import { supa } from '../supa.js';

export async function renderAuthCallback() {
    return `
        <div class="min-h-screen flex items-center justify-center bg-gray-50">
            <div class="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h2 class="text-xl font-semibold text-gray-900 mb-2">Finishing sign-in...</h2>
                    <p class="text-gray-600">Please wait while we complete your authentication.</p>
                </div>
            </div>
        </div>
    `;
}

// Execute after page renders
document.addEventListener('pageRendered', async () => {
    try {
        // Handles email confirmation & magic links
        const { data, error } = await supa.auth.exchangeCodeForSession(window.location.href);
        if (error) throw error;
        
        // Success! Redirect to dashboard
        showToast('Email confirmed successfully! Welcome!', 'success');
        setTimeout(() => {
            window.router.navigate('/dashboard');
        }, 1500);
        
    } catch (error) {
        console.error('Auth callback error:', error);
        
        // Show error message
        const appEl = document.getElementById('app');
        if (appEl) {
            appEl.innerHTML = `
                <div class="min-h-screen flex items-center justify-center bg-gray-50">
                    <div class="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
                        <div class="text-center">
                            <div class="text-red-500 text-6xl mb-4">⚠️</div>
                            <h2 class="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
                            <p class="text-gray-600 mb-4">${error.message || 'Something went wrong with the confirmation link.'}</p>
                            <button onclick="window.router.navigate('/')" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }
});

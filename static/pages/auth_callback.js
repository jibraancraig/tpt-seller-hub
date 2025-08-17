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
        // Extract auth code and code verifier from URL
        console.log('Full URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        
        // Try to get code from search params first, then from hash fragment
        let authCode = new URLSearchParams(window.location.search).get('code');
        
        if (!authCode) {
            // Try to extract from hash fragment
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            authCode = hashParams.get('code');
        }
        
        console.log('Auth code found:', authCode);
        
        if (!authCode) {
            throw new Error('No authentication code found in URL. Please check the confirmation link.');
        }
        
        // Handles email confirmation & magic links
        const { data, error } = await supa.auth.exchangeCodeForSession(authCode);
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
                <div class="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
                    <div class="text-center">
                        <div class="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 class="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
                        <p class="text-gray-600 mb-4">${error.message || 'Something went wrong with the confirmation link.'}</p>
                        <div class="text-xs text-gray-500 mb-4 bg-gray-100 p-2 rounded">
                            URL: ${window.location.href}
                        </div>
                        <button onclick="window.router.navigate('/')" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            Go Home
                        </button>
                    </div>
                </div>
            `;
        }
    }
});

import { supa } from '../supa.js';
import { showToast } from '../ui.js';

export function renderAuth() {
    const isLogin = window.location.hash.includes('login');
    
    return `
        <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8">
                <div class="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <div class="text-center mb-8">
                        <h2 class="text-2xl font-bold text-gray-900" data-testid="text-auth-title">${isLogin ? 'Sign In' : 'Sign Up'}</h2>
                        <p class="mt-2 text-sm text-gray-600" data-testid="text-auth-subtitle">
                            ${isLogin ? 'Welcome back to TPT Seller Hub' : 'Start optimizing your TPT listings'}
                        </p>
                    </div>
                    <form class="space-y-6" id="auth-form" data-testid="form-auth">
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fas fa-envelope text-gray-400"></i>
                            </div>
                            <input 
                                type="email" 
                                placeholder="E-mail" 
                                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary" 
                                required
                                data-testid="input-email"
                                id="email"
                            >
                        </div>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fas fa-lock text-gray-400"></i>
                            </div>
                            <input 
                                type="password" 
                                placeholder="Password (optional for magic link)" 
                                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary" 
                                data-testid="input-password"
                                id="password"
                            >
                        </div>
                        <button 
                            type="submit" 
                            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            data-testid="button-submit"
                        >
                            ${isLogin ? 'Sign In' : 'Sign Up'}
                        </button>
                    </form>
                    
                    <!-- Magic Link Section -->
                    <div class="mt-6 relative">
                        <div class="absolute inset-0 flex items-center">
                            <div class="w-full border-t border-gray-300" />
                        </div>
                        <div class="relative flex justify-center text-sm">
                            <span class="px-2 bg-white text-gray-500">Or</span>
                        </div>
                    </div>
                    
                    <button 
                        type="button"
                        class="mt-4 w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        id="magic-link-btn"
                        data-testid="button-magic-link"
                    >
                        <i class="fas fa-magic mr-2"></i>
                        Send Magic Link
                    </button>
                    
                    <p class="mt-4 text-center text-sm text-gray-500" data-testid="text-confirmation-message">
                        ${isLogin ? '' : 'A confirmation e-mail will be sent to your address.'}
                    </p>
                    
                    <div class="mt-4 text-center">
                        <button 
                            class="text-sm text-primary hover:text-blue-700 font-medium" 
                            onclick="window.router.navigate('${isLogin ? '/signup' : '/login'}')"
                            data-testid="button-toggle-mode"
                        >
                            ${isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Execute after page renders
document.addEventListener('pageRendered', () => {
    const authForm = document.getElementById('auth-form');
    const magicLinkBtn = document.getElementById('magic-link-btn');
    
    if (authForm) {
        authForm.onsubmit = handleAuth;
    }
    
    if (magicLinkBtn) {
        magicLinkBtn.onclick = handleMagicLink;
    }
});

async function handleAuth(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const isLogin = window.location.hash.includes('login');
    
    if (!email) {
        showToast('Please enter your email address', 'error');
        return;
    }
    
    try {
        let result;
        
        if (isLogin && password) {
            // Login with password if provided
            result = await supa.auth.signInWithPassword({
                email,
                password,
            });
        } else {
            // Use magic link for both signup and login (more reliable)
            result = await supa.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: !isLogin, // Create user for signup, don't for login
                }
            });
        }
        
        if (result.error) throw result.error;
        
        if (isLogin && password) {
            showToast('Welcome back!', 'success');
        } else {
            showToast('Magic link sent! Check your email', 'success');
        }
        
    } catch (error) {
        console.error('Auth error:', error);
        showToast(error.message || 'Authentication failed', 'error');
    }
}

async function handleMagicLink() {
    const email = document.getElementById('email').value;
    
    if (!email) {
        showToast('Please enter your email address first', 'error');
        return;
    }
    
    try {
        const { error } = await supa.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
            }
        });
        
        if (error) throw error;
        
        showToast('Magic link sent! Check your email', 'success');
        
    } catch (error) {
        console.error('Magic link error:', error);
        showToast(error.message || 'Failed to send magic link', 'error');
    }
}

export function renderLanding() {
    return `
        <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8">
                <div class="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <div class="text-center mb-8">
                        <h2 class="text-2xl font-bold text-gray-900" data-testid="text-signup-title">Sign Up</h2>
                        <p class="mt-2 text-sm text-gray-600" data-testid="text-signup-subtitle">Start optimizing your TPT listings</p>
                    </div>
                    <form class="space-y-6" id="signup-form" data-testid="form-signup">
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
                                placeholder="Password" 
                                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary" 
                                required
                                data-testid="input-password"
                                id="password"
                            >
                        </div>
                        <button 
                            type="submit" 
                            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            data-testid="button-signup"
                        >
                            Sign Up
                        </button>
                    </form>
                    <p class="mt-4 text-center text-sm text-gray-500" data-testid="text-confirmation-message">
                        A confirmation e-mail will be sent to your address.
                    </p>
                    <div class="mt-4 text-center">
                        <button 
                            class="text-sm text-primary hover:text-blue-700 font-medium" 
                            onclick="window.router.navigate('/login')"
                            data-testid="button-login-link"
                        >
                            Already have an account? Sign in
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Execute after page renders
document.addEventListener('pageRendered', () => {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.onsubmit = handleSignup;
    }
});

async function handleSignup(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        
        if (error) throw error;
        
        showToast('Please check your email to confirm your account', 'success');
        
    } catch (error) {
        console.error('Signup error:', error);
        showToast(error.message || 'Error creating account', 'error');
    }
}

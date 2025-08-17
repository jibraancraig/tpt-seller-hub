export default class AuthPage {
  async render() {
    return `
      <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
          <div class="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-gray-900">Sign Up</h2>
              <p class="mt-2 text-sm text-gray-600">Start optimizing your TPT listings</p>
            </div>
            <form id="auth-form" class="space-y-6">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fas fa-envelope text-gray-400"></i>
                </div>
                <input type="email" 
                       id="email-input"
                       placeholder="E-mail" 
                       class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary" 
                       required
                       data-testid="input-email">
              </div>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fas fa-lock text-gray-400"></i>
                </div>
                <input type="password" 
                       id="password-input"
                       placeholder="Password" 
                       class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary" 
                       required
                       data-testid="input-password">
              </div>
              <button type="submit" 
                      class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                      data-testid="button-signup">
                Sign Up
              </button>
            </form>
            <p class="mt-4 text-center text-sm text-gray-500">
              A confirmation e-mail will be sent to your address.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    const form = document.getElementById('auth-form');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = emailInput.value;
      const password = passwordInput.value;

      if (!email || !password) {
        window.showToast('Please fill in all fields', 'error');
        return;
      }

      try {
        // For demo mode, simulate successful signup
        if (!window.supabase.auth.signInWithPassword) {
          // Mock auth
          const mockUser = { id: '1', email, created_at: new Date().toISOString() };
          localStorage.setItem('mock_user', JSON.stringify(mockUser));
          window.AppState.user = mockUser;
          window.router.showNavigation();
          window.location.hash = '#/dashboard';
          window.showToast('Welcome! Account created successfully.');
          return;
        }

        // Real Supabase auth - using magic link as specified in MVP
        const { error } = await window.supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin + '/#/dashboard'
          }
        });

        if (error) {
          window.showToast(error.message, 'error');
        } else {
          window.showToast('Magic link sent to your email!');
          emailInput.value = '';
          passwordInput.value = '';
        }
      } catch (error) {
        window.showToast('Failed to create account', 'error');
        console.error('Auth error:', error);
      }
    });

    // Listen for auth state changes
    window.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        window.AppState.user = session.user;
        window.router.showNavigation();
        window.location.hash = '#/dashboard';
        window.showToast('Successfully signed in!');
      }
    });
  }
}

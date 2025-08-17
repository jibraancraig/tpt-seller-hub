import { Router } from './router.js';
import { initSupabase } from './supa.js';
import './ui/toasts.js';

// Initialize Supabase
const supabase = initSupabase();

// Initialize Router
const router = new Router();

// Global app state
window.AppState = {
  user: null,
  products: [],
  keywords: [],
  currentProduct: null,
  supabase
};

// Start the app
document.addEventListener('DOMContentLoaded', () => {
  console.log('TPT Seller Hub initialized');
  router.init();
});

// Export for global access
window.router = router;
window.supabase = supabase;

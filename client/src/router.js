export class Router {
  constructor() {
    this.routes = {
      '/': () => this.loadPage('landing'),
      '/auth': () => this.loadPage('auth'),
      '/dashboard': () => this.loadPage('dashboard'),
      '/products': () => this.loadPage('products'),
      '/product/:id': (id) => this.loadPage('product_detail', { productId: id }),
      '/rank': () => this.loadPage('rank_tracker'),
      '/social': () => this.loadPage('social'),
      '/analytics': () => this.loadPage('analytics'),
      '/settings': () => this.loadPage('settings')
    };
    
    this.currentPage = null;
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
    
    // Check auth status on init
    this.checkAuthStatus();
  }

  async checkAuthStatus() {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (user) {
      window.AppState.user = user;
      this.showNavigation();
      if (window.location.hash === '' || window.location.hash === '#/') {
        window.location.hash = '#/dashboard';
      }
    } else {
      this.hideNavigation();
      if (window.location.hash !== '#/auth') {
        window.location.hash = '#/';
      }
    }
  }

  showNavigation() {
    document.getElementById('main-nav').classList.remove('hidden');
  }

  hideNavigation() {
    document.getElementById('main-nav').classList.add('hidden');
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const matchedRoute = this.matchRoute(hash);
    
    if (matchedRoute) {
      this.updateNavigation(hash);
      matchedRoute.handler(matchedRoute.params);
    } else {
      this.loadPage('not_found');
    }
  }

  matchRoute(path) {
    for (const route in this.routes) {
      const routeParts = route.split('/');
      const pathParts = path.split('/');
      
      if (routeParts.length !== pathParts.length) continue;
      
      const params = {};
      let isMatch = true;
      
      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
          params[routeParts[i].slice(1)] = pathParts[i];
        } else if (routeParts[i] !== pathParts[i]) {
          isMatch = false;
          break;
        }
      }
      
      if (isMatch) {
        return { handler: this.routes[route], params: Object.values(params)[0] };
      }
    }
    return null;
  }

  updateNavigation(currentPath) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('bg-primary', 'text-white');
      link.classList.add('text-gray-500', 'hover:text-gray-700');
    });

    const activeLink = document.querySelector(`a[href="#${currentPath}"]`);
    if (activeLink) {
      activeLink.classList.remove('text-gray-500', 'hover:text-gray-700');
      activeLink.classList.add('bg-primary', 'text-white');
    }
  }

  async loadPage(pageName, params = {}) {
    try {
      const pageModule = await import(`./pages/${pageName}.js`);
      const pageInstance = new pageModule.default();
      
      const container = document.getElementById('app-container');
      container.innerHTML = await pageInstance.render(params);
      
      // Call page-specific initialization if available
      if (pageInstance.init) {
        await pageInstance.init(params);
      }
      
      this.currentPage = pageName;
    } catch (error) {
      console.error(`Failed to load page ${pageName}:`, error);
      document.getElementById('app-container').innerHTML = `
        <div class="min-h-screen flex items-center justify-center">
          <div class="text-center">
            <h1 class="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
            <p class="text-gray-600">The requested page could not be loaded.</p>
            <button onclick="window.location.hash = '#/dashboard'" class="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Go to Dashboard
            </button>
          </div>
        </div>
      `;
    }
  }

  navigate(path) {
    window.location.hash = `#${path}`;
  }
}

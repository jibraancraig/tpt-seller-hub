import { renderLanding } from "./pages/landing.js"
import { renderAuth } from "./pages/auth.js"
import { renderAuthCallback } from "./pages/auth_callback.js"
import { renderDashboard } from "./pages/dashboard.js"
import { renderProducts } from "./pages/products.js"
import { renderProductDetail } from "./pages/product_detail.js"
import { renderRankTracker } from "./pages/rank_tracker.js"
import { renderSocial } from "./pages/social.js"
import { renderAnalytics } from "./pages/analytics.js"
import { renderSettings } from "./pages/settings.js"

class Router {
  constructor() {
    this.routes = {
      "/": renderLanding,
      "/login": renderAuth,
      "/signup": renderAuth,
      "/auth/callback": renderAuthCallback,
      "/dashboard": renderDashboard,
      "/products": renderProducts,
      "/product/:id": renderProductDetail,
      "/rank": renderRankTracker,
      "/social": renderSocial,
      "/analytics": renderAnalytics,
      "/settings": renderSettings,
    }

    this.currentRoute = null
    this.params = {}
  }

  init() {
    // Listen for hash changes
    window.addEventListener("hashchange", () => this.handleRoute())
    window.addEventListener("load", () => this.handleRoute())

    // Handle initial route
    this.handleRoute()
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || "/"
    const route = this.findRoute(hash)

    if (route) {
      this.currentRoute = route
      this.render()
    } else {
      this.navigate("/")
    }
  }

  findRoute(path) {
    // Exact match first
    if (this.routes[path]) {
      this.params = {}
      return this.routes[path]
    }

    // Pattern matching for dynamic routes
    for (const routePath in this.routes) {
      const match = this.matchRoute(routePath, path)
      if (match) {
        this.params = match.params
        return this.routes[routePath]
      }
    }

    return null
  }

  matchRoute(pattern, path) {
    const patternParts = pattern.split("/")
    const pathParts = path.split("/")

    if (patternParts.length !== pathParts.length) {
      return null
    }

    const params = {}

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i]
      const pathPart = pathParts[i]

      if (patternPart.startsWith(":")) {
        // Dynamic parameter
        const paramName = patternPart.slice(1)
        params[paramName] = pathPart
      } else if (patternPart !== pathPart) {
        return null
      }
    }

    return { params }
  }

  navigate(path) {
    window.location.hash = path
  }

  async render() {
    const app = document.getElementById("app")

    try {
      // Check authentication for protected routes
      if (this.requiresAuth(window.location.hash.slice(1))) {
        if (!window.app.isAuthenticated()) {
          this.navigate("/login")
          return
        }
      }

      // Safe rendering wrapper
      const safeRender = async (renderFn, params) => {
        try {
          const content = await renderFn(params)
          if (typeof content === 'string' && content.trim()) {
            return content
          } else {
            throw new Error('Page render function returned empty or invalid content')
          }
        } catch (renderError) {
          console.error('Page render error:', renderError)
          return `
            <div class="min-h-screen flex items-center justify-center p-6">
              <div class="text-center max-w-md">
                <h1 class="text-2xl font-bold text-gray-900 mb-4">Page Error</h1>
                <p class="text-gray-600 mb-4">This page couldn't be loaded properly.</p>
                <pre class="text-xs text-red-600 bg-red-100 p-2 rounded mb-4 overflow-auto">${renderError.message}</pre>
                <button onclick="window.router.navigate('/')" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Go Home
                </button>
              </div>
            </div>
          `
        }
      }

      // Render the current route with safe wrapper
      const content = await safeRender(this.currentRoute, this.params)
      app.innerHTML = content

      // Execute any post-render scripts
      this.executePageScripts()
    } catch (error) {
      console.error("Router render error:", error)
      app.innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-6">
          <div class="text-center max-w-md">
            <h1 class="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p class="text-gray-600 mb-4">Please try refreshing the page</p>
            <pre class="text-xs text-red-600 bg-red-100 p-2 rounded mb-4 overflow-auto">${error.message}</pre>
            <button onclick="window.location.reload()" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Refresh Page
            </button>
            </div>
        </div>
      `
    }
  }

  requiresAuth(path) {
    const publicRoutes = ["/", "/login", "/signup"]
    return !publicRoutes.includes(path)
  }

  executePageScripts() {
    // Re-execute any scripts that need to run after DOM update
    const event = new CustomEvent("pageRendered")
    document.dispatchEvent(event)
  }

  getParams() {
    return this.params
  }
}

export const router = new Router()

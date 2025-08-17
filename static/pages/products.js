import { db } from "../supa.js"
import { showToast, createModal } from "../ui.js"

let products = []

// Inline table component
function createProductTable(products) {
  if (products.length === 0) {
    return `
            <div class="p-8 text-center">
                <i class="fas fa-boxes text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 mb-2">No products yet</p>
                <p class="text-sm text-gray-400">Import your first product to get started</p>
            </div>
        `
  }

  return `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SEO Score</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${products
                      .map(
                        (product) => `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0 h-10 w-10">
                                        <div class="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white font-medium">
                                            ${product.title
                                              .charAt(0)
                                              .toUpperCase()}
                                        </div>
                                    </div>
                                    <div class="ml-4">
                                        <div class="text-sm font-medium text-gray-900">${
                                          product.title
                                        }</div>
                                        <div class="text-sm text-gray-500">${
                                          product.description
                                        }</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${
                              product.price
                            }</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  product.seo_score && product.seo_score >= 70
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }">
                                    ${product.seo_score || "N/A"}${
                          product.seo_score ? "%" : ""
                        }
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button class="text-primary hover:text-blue-700 mr-3" onclick="editProduct('${
                                  product.id
                                }')">Edit</button>
                                <button class="text-red-600 hover:text-red-900" onclick="deleteProduct('${
                                  product.id
                                }')">Delete</button>
                            </td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>
        </div>
    `
}

// Inline CSV upload modal
function createCSVUploadModal(onUpload) {
  const modalContent = `
        <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">Upload CSV File</h3>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input type="file" id="csv-file-input" accept=".csv" class="hidden" />
                <label for="csv-file-input" class="cursor-pointer">
                    <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                    <p class="text-lg font-medium text-gray-700 mb-2">Click to select CSV file</p>
                    <p class="text-sm text-gray-500">or drag and drop here</p>
                </label>
            </div>
            <div class="flex justify-end space-x-3">
                <button onclick="this.closest('.modal-overlay').remove()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                    Cancel
                </button>
                <button onclick="processCSVUpload()" class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-blue-700">
                    Upload
                </button>
            </div>
        </div>
    `

  const modal = createModal(modalContent)

  // Handle file selection
  const fileInput = document.getElementById("csv-file-input")
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (file) {
        onUpload(file)
        modal.close()
      }
    })
  }

  return modal
}

export async function renderProducts() {
  await loadProducts()

  return `
        <!-- Navigation -->
        <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <h1 class="text-xl font-bold text-gray-900" data-testid="text-app-title">TPT Seller Hub</h1>
                        </div>
                        <div class="hidden md:block ml-10">
                            <div class="flex items-baseline space-x-4">
                                <a href="#/dashboard" class="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700" data-testid="link-dashboard">Dashboard</a>
                                <a href="#/products" class="px-3 py-2 rounded-md text-sm font-medium bg-primary text-white" data-testid="link-products">Products</a>
                                <a href="#/rank" class="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700" data-testid="link-rank">Rank Tracker</a>
                                <a href="#/social" class="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700" data-testid="link-social">Social</a>
                                <a href="#/analytics" class="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700" data-testid="link-analytics">Analytics</a>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <button class="p-2 rounded-full text-gray-400 hover:text-gray-500" data-testid="button-notifications">
                            <i class="fas fa-bell text-lg"></i>
                        </button>
                        <div class="ml-3 relative">
                            <button class="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" onclick="toggleUserMenu()" data-testid="button-user-menu">
                                <div class="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    ${
                                      window.app
                                        .getCurrentUser()
                                        ?.email?.charAt(0)
                                        .toUpperCase() || "U"
                                    }
                                </div>
                            </button>
                            <div id="user-menu" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                <a href="#/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-testid="link-settings">Settings</a>
                                <button onclick="signOut()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-testid="button-signout">Sign Out</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900" data-testid="text-page-title">Import Your Products</h1>
                <p class="mt-2 text-gray-600" data-testid="text-page-description">Get started by importing your existing TPT products</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <!-- CSV Upload Card -->
                <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-csv-upload-title">
                        <i class="fas fa-file-csv text-primary mr-2"></i>
                        Upload CSV File
                    </h3>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors" data-testid="container-csv-dropzone">
                        <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                        <p class="text-lg font-medium text-gray-700 mb-2">Drop your CSV file here</p>
                        <p class="text-sm text-gray-500 mb-4">or click to browse</p>
                        <button class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" onclick="openCSVUploadModal()" data-testid="button-choose-file">
                            Choose File
                        </button>
                    </div>
                    <div class="mt-4">
                        <p class="text-sm text-gray-600 mb-2">Expected columns:</p>
                        <div class="flex flex-wrap gap-2">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">title</span>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">description</span>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">tags</span>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">tpt_url</span>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">price</span>
                        </div>
                    </div>
                </div>

                <!-- URL List Import -->
                <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-url-import-title">
                        <i class="fas fa-link text-primary mr-2"></i>
                        Paste Product URLs
                    </h3>
                    <textarea 
                        id="url-list"
                        placeholder="Paste your TPT product URLs, one per line..."
                        class="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        data-testid="textarea-url-list"
                    ></textarea>
                    <button class="mt-4 w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors" onclick="importFromURLs()" data-testid="button-import-urls">
                        Import from URLs
                    </button>
                    <p class="mt-2 text-xs text-gray-500">We'll automatically fetch product details for each URL</p>
                </div>
            </div>

            <!-- Sample Data -->
            <div class="mb-8 bg-blue-50 rounded-xl p-6">
                <h4 class="text-sm font-medium text-blue-900 mb-3" data-testid="text-sample-title">
                    <i class="fas fa-download mr-2"></i>
                    Sample CSV Format
                </h4>
                <div class="bg-white rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <div>title,description,tags,tpt_url,price</div>
                    <div class="text-gray-600">Algebra Task Cards,"40 printable cards covering linear equations",math;algebra,https://www.teacherspayteachers.com/Product/12345,6.99</div>
                </div>
                <button class="mt-3 text-sm text-primary hover:text-blue-700 font-medium" onclick="downloadSampleCSV()" data-testid="button-download-sample">
                    Download sample CSV
                </button>
            </div>

            <!-- Products Table -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-gray-900" data-testid="text-products-table-title">Your Products</h3>
                        <button class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm" onclick="addNewProduct()" data-testid="button-add-product">
                            <i class="fas fa-plus mr-2"></i>
                            Add Product
                        </button>
                    </div>
                </div>
                <div data-testid="container-products-table">
                    ${createProductTable(products)}
                </div>
            </div>
        </div>
    `
}

async function loadProducts() {
  if (!window.app.isAuthenticated()) return

  try {
    const user = window.app.getCurrentUser()
    products = await db.getProducts(user.id)
  } catch (error) {
    console.error("Error loading products:", error)
    showToast("Error loading products", "error")
    products = []
  }
}

window.openCSVUploadModal = function () {
  createCSVUploadModal(handleCSVUpload)
}

async function handleCSVUpload(file) {
  try {
    showToast("Processing CSV file...", "info")

    // Use PapaParse from CDN
    window.Papa.parse(file, {
      header: true,
      complete: async function (results) {
        if (results.errors.length > 0) {
          console.error("CSV parse errors:", results.errors)
          showToast("Error parsing CSV file", "error")
          return
        }

        const data = results.data.filter(
          (row) => row.title && row.title.trim() !== ""
        )

        if (data.length === 0) {
          showToast("No valid products found in CSV", "warning")
          return
        }

        await importProducts(data)
      },
      error: function (error) {
        console.error("CSV parse error:", error)
        showToast("Error reading CSV file", "error")
      },
    })
  } catch (error) {
    console.error("CSV upload error:", error)
    showToast("Error uploading CSV file", "error")
  }
}

async function importProducts(productsData) {
  if (!window.app.isAuthenticated()) {
    showToast("Please log in first", "error")
    return
  }

  try {
    const user = window.app.getCurrentUser()
    let successCount = 0

    for (const productData of productsData) {
      try {
        const product = {
          title: productData.title,
          description: productData.description || "",
          tags: productData.tags ? productData.tags.split(";") : [],
          tpt_url: productData.tpt_url || "",
          price: parseFloat(productData.price) || 0,
        }

        await db.createProduct(user.id, product)
        successCount++
      } catch (error) {
        console.error("Error creating product:", error)
      }
    }

    showToast(`Successfully imported ${successCount} products`, "success")

    // Reload products and refresh the page
    await loadProducts()
    window.router.render()
  } catch (error) {
    console.error("Import error:", error)
    showToast("Error importing products", "error")
  }
}

window.importFromURLs = async function () {
  const urlList = document.getElementById("url-list").value.trim()

  if (!urlList) {
    showToast("Please paste some product URLs first", "warning")
    return
  }

  const urls = urlList.split("\n").filter((url) => url.trim() !== "")

  if (urls.length === 0) {
    showToast("No valid URLs found", "warning")
    return
  }

  showToast(`Processing ${urls.length} URLs...`, "info")

  // For now, create placeholder products
  // TODO: Implement actual URL scraping
  const placeholderProducts = urls.map((url, index) => ({
    title: `Product from ${url.split("/").pop() || `URL ${index + 1}`}`,
    description: "Description will be fetched automatically",
    tags: [],
    tpt_url: url,
    price: 0,
  }))

  await importProducts(placeholderProducts)
}

window.downloadSampleCSV = function () {
  const csvContent = `title,description,tags,tpt_url,price
Algebra Task Cards,"40 printable cards covering linear equations",math;algebra,https://www.teacherspayteachers.com/Product/12345,6.99
Geometry Worksheets,"Complete geometry worksheet bundle for grades 6-8",math;geometry,https://www.teacherspayteachers.com/Product/67890,12.99
Fractions Activities,"Interactive fractions activities and games",math;fractions,https://www.teacherspayteachers.com/Product/11111,8.99`

  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "products_sample.csv"
  a.click()
  window.URL.revokeObjectURL(url)
}

window.addNewProduct = function () {
  // For now, just navigate to a placeholder
  showToast("Product creation form coming soon", "info")
}

window.deleteProduct = async function (productId) {
  if (!confirm("Are you sure you want to delete this product?")) {
    return
  }

  try {
    // TODO: Implement product deletion
    showToast("Product deletion coming soon", "info")
  } catch (error) {
    console.error("Error deleting product:", error)
    showToast("Error deleting product", "error")
  }
}

// Global functions for products page interactions
window.toggleUserMenu = function () {
  const menu = document.getElementById("user-menu")
  if (menu) {
    menu.classList.toggle("hidden")
  }
}

window.signOut = async function () {
  try {
    const { error } = await supa.auth.signOut()
    if (error) throw error
    showToast("Signed out successfully", "success")
  } catch (error) {
    console.error("Sign out error:", error)
    showToast("Error signing out", "error")
  }
}

// Close user menu when clicking outside
document.addEventListener("click", (e) => {
  const menu = document.getElementById("user-menu")
  const button = document.querySelector('[data-testid="button-user-menu"]')

  if (menu && !menu.contains(e.target) && !button?.contains(e.target)) {
    menu.classList.add("hidden")
  }
})

export function renderProductDetail(params) {
    return `
        <div class="min-h-screen bg-gray-50 py-8">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="mb-6">
                    <a href="#/products" class="text-primary hover:text-blue-700">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Back to Products
                    </a>
                </div>
                
                <div class="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">Product Details</h1>
                    <p class="text-gray-600">Product ID: ${params.id}</p>
                    <p class="text-gray-600 mt-4">Product detail page coming soon...</p>
                </div>
            </div>
        </div>
    `;
}

export function createKeywordTable(keywords) {
    if (!keywords || keywords.length === 0) {
        return `
            <div class="text-center py-8">
                <i class="fas fa-search text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">No keywords tracked yet</p>
                <p class="text-sm text-gray-400">Add your first keyword to start tracking rankings</p>
            </div>
        `;
    }

    return `
        <div class="overflow-x-auto">
            <table class="w-full" data-testid="table-keywords">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Rank</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${keywords.map(keyword => `
                        <tr class="hover:bg-gray-50" data-testid="row-keyword-${keyword.id}">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="text-sm font-medium text-gray-900" data-testid="text-keyword-phrase-${keyword.id}">${keyword.phrase}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="text-sm text-gray-600 truncate max-w-32" data-testid="text-product-title-${keyword.id}">${keyword.product_title || 'N/A'}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="text-sm font-bold text-gray-900" data-testid="text-current-rank-${keyword.id}">
                                    ${keyword.current_rank ? `#${keyword.current_rank}` : 'Not ranked'}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                ${keyword.rank_change ? `
                                    <span class="inline-flex items-center text-sm ${keyword.rank_change > 0 ? 'text-green-600' : 'text-red-600'}" data-testid="text-rank-change-${keyword.id}">
                                        <i class="fas fa-arrow-${keyword.rank_change > 0 ? 'up' : 'down'} mr-1"></i>
                                        ${Math.abs(keyword.rank_change)}
                                    </span>
                                ` : '<span class="text-sm text-gray-500">-</span>'}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <button class="text-primary hover:text-blue-700 text-sm font-medium" onclick="refreshKeywordRank(${keyword.id})" data-testid="button-refresh-${keyword.id}">
                                    <i class="fas fa-sync-alt mr-1"></i>
                                    Refresh
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

export function createProductTable(products) {
    if (!products || products.length === 0) {
        return `
            <div class="text-center py-8">
                <i class="fas fa-boxes text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">No products found</p>
                <p class="text-sm text-gray-400">Import your first product to get started</p>
            </div>
        `;
    }

    return `
        <div class="overflow-x-auto">
            <table class="w-full" data-testid="table-products">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SEO Score</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keywords</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${products.map(product => `
                        <tr class="hover:bg-gray-50" data-testid="row-product-${product.id}">
                            <td class="px-6 py-4">
                                <div>
                                    <div class="text-sm font-medium text-gray-900" data-testid="text-product-title-${product.id}">${product.title}</div>
                                    <div class="text-sm text-gray-500 truncate max-w-xs" data-testid="text-product-description-${product.id}">${product.description}</div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="text-sm text-gray-900" data-testid="text-product-price-${product.id}">$${product.price}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                ${product.seo_score ? `
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        product.seo_score >= 80 ? 'bg-green-100 text-green-800' :
                                        product.seo_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }" data-testid="text-seo-score-${product.id}">
                                        ${product.seo_score}%
                                    </span>
                                ` : '<span class="text-sm text-gray-500">Not analyzed</span>'}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="text-sm text-gray-900" data-testid="text-keywords-count-${product.id}">${product.keyword_count || 0}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button class="text-primary hover:text-blue-700 mr-3" onclick="window.router.navigate('/product/${product.id}')" data-testid="button-edit-${product.id}">
                                    Edit
                                </button>
                                <button class="text-red-600 hover:text-red-900" onclick="deleteProduct(${product.id})" data-testid="button-delete-${product.id}">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

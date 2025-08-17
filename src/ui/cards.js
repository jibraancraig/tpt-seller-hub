export function createProductCard(product) {
    return `
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer" data-testid="card-product-${product.id}">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 truncate" data-testid="text-title-${product.id}">${product.title}</h3>
                <div class="flex items-center space-x-2">
                    ${product.seo_score ? `<span class="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full" data-testid="text-seo-score-${product.id}">SEO: ${product.seo_score}%</span>` : ''}
                    <button class="text-gray-400 hover:text-gray-600" onclick="openProductMenu(${product.id})" data-testid="button-menu-${product.id}">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2" data-testid="text-description-${product.id}">${product.description}</p>
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <span class="text-sm text-gray-500" data-testid="text-price-${product.id}">$${product.price}</span>
                    ${product.avg_rank ? `<span class="text-sm text-gray-500" data-testid="text-rank-${product.id}">Rank #${product.avg_rank}</span>` : ''}
                </div>
                <button class="bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700" onclick="window.router.navigate('/product/${product.id}')" data-testid="button-view-${product.id}">
                    View Details
                </button>
            </div>
        </div>
    `;
}

export function createStatsCard(title, value, icon, color = 'blue') {
    const colorClasses = {
        blue: 'bg-blue-100 text-primary',
        green: 'bg-green-100 text-success',
        yellow: 'bg-yellow-100 text-warning',
        red: 'bg-red-100 text-red-500'
    };

    return `
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm" data-testid="card-stats-${title.toLowerCase().replace(/\s+/g, '-')}">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 ${colorClasses[color]} rounded-lg flex items-center justify-center">
                        <i class="fas fa-${icon}"></i>
                    </div>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500" data-testid="text-stats-title">${title}</p>
                    <p class="text-2xl font-bold text-gray-900" data-testid="text-stats-value">${value}</p>
                </div>
            </div>
        </div>
    `;
}

export function createActivityCard(activity) {
    return `
        <div class="flex items-start" data-testid="card-activity-${activity.id}">
            <div class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div class="min-w-0 flex-1">
                <p class="text-sm text-gray-900" data-testid="text-activity-message-${activity.id}">${activity.message}</p>
                <p class="text-xs text-gray-500" data-testid="text-activity-time-${activity.id}">${activity.time}</p>
            </div>
        </div>
    `;
}

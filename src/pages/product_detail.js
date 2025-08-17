import { db } from '../supa.js';
import { router } from '../router.js';
import { showToast } from '../ui/toasts.js';
import { generateSEOVariants } from '../services/seo.js';

let currentProduct = null;
let seoVariants = [];

export async function renderProductDetail(params) {
    const productId = params.id;
    
    if (!productId) {
        showToast('Product ID is required', 'error');
        router.navigate('/products');
        return '';
    }
    
    await loadProduct(productId);
    
    if (!currentProduct) {
        showToast('Product not found', 'error');
        router.navigate('/products');
        return '';
    }
    
    return `
        <!-- Navigation -->
        <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <button onclick="window.router.navigate('/products')" class="mr-4 p-2 text-gray-400 hover:text-gray-600" data-testid="button-back">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <div class="flex-shrink-0">
                            <h1 class="text-xl font-bold text-gray-900" data-testid="text-app-title">Product Details</h1>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <button class="p-2 rounded-full text-gray-400 hover:text-gray-500" data-testid="button-notifications">
                            <i class="fas fa-bell text-lg"></i>
                        </button>
                        <div class="ml-3 relative">
                            <button class="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" onclick="toggleUserMenu()" data-testid="button-user-menu">
                                <div class="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    ${window.app.getCurrentUser()?.email?.charAt(0).toUpperCase() || 'U'}
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
                <h1 class="text-3xl font-bold text-gray-900" data-testid="text-page-title">${currentProduct.title}</h1>
                <p class="mt-2 text-gray-600" data-testid="text-page-description">Optimize your product for better search rankings</p>
            </div>

            <!-- Tabs -->
            <div class="border-b border-gray-200 mb-8">
                <nav class="-mb-px flex space-x-8">
                    <button class="py-4 px-1 border-b-2 border-primary text-primary font-medium text-sm" onclick="switchTab('seo')" data-testid="button-tab-seo" id="tab-seo">
                        SEO Optimization
                    </button>
                    <button class="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm" onclick="switchTab('keywords')" data-testid="button-tab-keywords" id="tab-keywords">
                        Keywords
                    </button>
                    <button class="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm" onclick="switchTab('social')" data-testid="button-tab-social" id="tab-social">
                        Social
                    </button>
                </nav>
            </div>

            <!-- SEO Tab -->
            <div id="seo-content" class="tab-content">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Main SEO Editor -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Title Optimization -->
                        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-title-optimization">Title Optimization</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Current Title</label>
                                    <textarea 
                                        id="product-title" 
                                        class="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                                        placeholder="Enter your product title..."
                                        data-testid="textarea-product-title"
                                    >${currentProduct.seo_title || currentProduct.title}</textarea>
                                    <div class="flex items-center justify-between mt-2">
                                        <span class="text-sm text-gray-500" data-testid="text-title-length" id="title-length">${(currentProduct.seo_title || currentProduct.title).length} characters</span>
                                        <span class="text-sm" id="title-status" data-testid="text-title-status">
                                            ${getTitleStatus(currentProduct.seo_title || currentProduct.title)}
                                        </span>
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Target Keywords</label>
                                    <input 
                                        type="text" 
                                        id="target-keywords"
                                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                                        placeholder="e.g., algebra, linear equations, math activities"
                                        data-testid="input-target-keywords"
                                    >
                                </div>

                                <button class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" onclick="generateTitleVariants()" data-testid="button-generate-title-variants">
                                    <i class="fas fa-magic mr-2"></i>
                                    Generate AI Variants
                                </button>
                            </div>
                        </div>

                        <!-- Description Optimization -->
                        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-description-optimization">Description Optimization</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Current Description</label>
                                    <textarea 
                                        id="product-description"
                                        class="w-full border border-gray-300 rounded-lg px-3 py-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                                        placeholder="Enter your product description..."
                                        data-testid="textarea-product-description"
                                    >${currentProduct.seo_description || currentProduct.description}</textarea>
                                    <div class="flex items-center justify-between mt-2">
                                        <span class="text-sm text-gray-500" data-testid="text-description-length" id="description-length">${(currentProduct.seo_description || currentProduct.description).length} characters</span>
                                        <span class="text-sm" id="description-status" data-testid="text-description-status">
                                            ${getDescriptionStatus(currentProduct.seo_description || currentProduct.description)}
                                        </span>
                                    </div>
                                </div>

                                <button class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" onclick="generateDescriptionVariants()" data-testid="button-generate-description-variants">
                                    <i class="fas fa-magic mr-2"></i>
                                    Generate AI Variants
                                </button>
                            </div>
                        </div>

                        <!-- AI Variants -->
                        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm" id="variants-container" style="display: ${seoVariants.length > 0 ? 'block' : 'none'};">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-ai-variants">AI-Generated Variants</h3>
                            <div class="space-y-4" id="variants-list" data-testid="container-variants">
                                ${renderSEOVariants()}
                            </div>
                        </div>
                    </div>

                    <!-- SEO Score Panel -->
                    <div class="space-y-6">
                        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-seo-score-title">SEO Score</h3>
                            <div class="text-center mb-6">
                                <div class="relative w-24 h-24 mx-auto">
                                    <div class="absolute inset-0 flex items-center justify-center">
                                        <span class="text-2xl font-bold text-gray-900" data-testid="text-overall-score" id="overall-score">${currentProduct.seo_score || 0}</span>
                                    </div>
                                </div>
                                <p class="text-sm text-gray-600 mt-2">Overall Score</p>
                            </div>

                            <div class="space-y-4" id="seo-metrics" data-testid="container-seo-metrics">
                                ${renderSEOMetrics()}
                            </div>
                        </div>

                        <!-- Recommendations -->
                        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-recommendations">Recommendations</h3>
                            <div class="space-y-3" id="recommendations-list" data-testid="container-recommendations">
                                ${renderRecommendations()}
                            </div>
                        </div>

                        <!-- Publish Button -->
                        <button class="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium" onclick="publishOptimizedContent()" data-testid="button-publish">
                            <i class="fas fa-rocket mr-2"></i>
                            Publish Optimized Content
                        </button>
                    </div>
                </div>
            </div>

            <!-- Keywords Tab -->
            <div id="keywords-content" class="tab-content hidden">
                <div class="text-center py-8">
                    <i class="fas fa-search text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">Keyword tracking coming soon</p>
                </div>
            </div>

            <!-- Social Tab -->
            <div id="social-content" class="tab-content hidden">
                <div class="text-center py-8">
                    <i class="fas fa-share-alt text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">Social content generation coming soon</p>
                </div>
            </div>
        </div>
    `;
}

async function loadProduct(productId) {
    try {
        const user = window.app.getCurrentUser();
        const products = await db.getProducts(user.id);
        currentProduct = products.find(p => p.id.toString() === productId);
    } catch (error) {
        console.error('Error loading product:', error);
        currentProduct = null;
    }
}

function getTitleStatus(title) {
    const length = title.length;
    if (length >= 50 && length <= 70) {
        return '<span class="text-green-600">Optimal length ✓</span>';
    } else if (length < 50) {
        return '<span class="text-yellow-600">Too short</span>';
    } else {
        return '<span class="text-red-600">Too long</span>';
    }
}

function getDescriptionStatus(description) {
    const length = description.length;
    if (length >= 120 && length <= 300) {
        return '<span class="text-green-600">Good length ✓</span>';
    } else if (length < 120) {
        return '<span class="text-yellow-600">Consider expanding</span>';
    } else {
        return '<span class="text-red-600">Too long</span>';
    }
}

function renderSEOVariants() {
    return seoVariants.map((variant, index) => `
        <div class="border border-gray-200 rounded-lg p-4" data-testid="card-variant-${index}">
            <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-900" data-testid="text-variant-title-${index}">Variant ${index + 1}</h4>
                <button class="text-sm text-primary hover:text-blue-700 font-medium" onclick="selectVariant(${index})" data-testid="button-select-variant-${index}">Use This</button>
            </div>
            <p class="text-sm text-gray-700" data-testid="text-variant-content-${index}">${variant.text}</p>
            <div class="mt-2 flex items-center space-x-4">
                <span class="text-xs text-gray-500">${variant.text.length} chars</span>
                <span class="text-xs text-green-600">Keywords: ✓</span>
                <span class="text-xs text-green-600">Length: ✓</span>
            </div>
        </div>
    `).join('');
}

function renderSEOMetrics() {
    const title = currentProduct.seo_title || currentProduct.title;
    const description = currentProduct.seo_description || currentProduct.description;
    
    const titleScore = calculateTitleScore(title);
    const descriptionScore = calculateDescriptionScore(description);
    
    return `
        <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Title Length</span>
            <div class="flex items-center">
                <i class="fas fa-${titleScore >= 80 ? 'check text-green-500' : 'exclamation-triangle text-yellow-500'} mr-2"></i>
                <span class="text-sm font-medium text-gray-900">${titleScore}</span>
            </div>
        </div>
        <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Description Quality</span>
            <div class="flex items-center">
                <i class="fas fa-${descriptionScore >= 80 ? 'check text-green-500' : 'exclamation-triangle text-yellow-500'} mr-2"></i>
                <span class="text-sm font-medium text-gray-900">${descriptionScore}</span>
            </div>
        </div>
    `;
}

function renderRecommendations() {
    const recommendations = [];
    const title = currentProduct.seo_title || currentProduct.title;
    const description = currentProduct.seo_description || currentProduct.description;
    
    if (title.length < 50) {
        recommendations.push({
            type: 'warning',
            text: 'Consider expanding your title for better SEO'
        });
    }
    
    if (description.length < 120) {
        recommendations.push({
            type: 'warning',
            text: 'Expand your description to 150-300 words for better search visibility'
        });
    }
    
    if (recommendations.length === 0) {
        recommendations.push({
            type: 'success',
            text: 'Great! Your product is well optimized'
        });
    }
    
    return recommendations.map(rec => `
        <div class="flex items-start">
            <i class="fas fa-${rec.type === 'success' ? 'check text-green-500' : 'lightbulb text-yellow-500'} mt-1 mr-3"></i>
            <p class="text-sm text-gray-700">${rec.text}</p>
        </div>
    `).join('');
}

function calculateTitleScore(title) {
    let score = 0;
    const length = title.length;
    
    // Length score (0-40 points)
    if (length >= 50 && length <= 70) {
        score += 40;
    } else if (length >= 40 && length < 50) {
        score += 30;
    } else if (length > 70 && length <= 80) {
        score += 30;
    } else {
        score += 10;
    }
    
    // Basic quality indicators (0-60 points)
    if (title.includes(' ')) score += 20; // Has spaces
    if (title.match(/[A-Z]/)) score += 20; // Has uppercase
    if (!title.match(/[!@#$%^&*()]/)) score += 20; // No special chars
    
    return Math.min(100, score);
}

function calculateDescriptionScore(description) {
    let score = 0;
    const length = description.length;
    
    // Length score (0-50 points)
    if (length >= 120 && length <= 300) {
        score += 50;
    } else if (length >= 80 && length < 120) {
        score += 35;
    } else if (length > 300 && length <= 400) {
        score += 35;
    } else {
        score += 15;
    }
    
    // Quality indicators (0-50 points)
    if (description.includes('.')) score += 15; // Has sentences
    if (description.match(/\b(student|teacher|learn|educat|grade)\b/i)) score += 15; // Educational keywords
    if (description.split(' ').length > 20) score += 20; // Adequate word count
    
    return Math.min(100, score);
}

// Global functions
window.switchTab = function(tabName) {
    // Update tab buttons
    document.querySelectorAll('[id^="tab-"]').forEach(btn => {
        btn.className = 'py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm';
    });
    document.getElementById(`tab-${tabName}`).className = 'py-4 px-1 border-b-2 border-primary text-primary font-medium text-sm';
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`${tabName}-content`).classList.remove('hidden');
};

window.generateTitleVariants = async function() {
    const title = document.getElementById('product-title').value;
    const keywords = document.getElementById('target-keywords').value;
    
    if (!title.trim()) {
        showToast('Please enter a title first', 'warning');
        return;
    }
    
    try {
        showToast('Generating AI variants...', 'info');
        
        const variants = await generateSEOVariants('title', title, keywords);
        seoVariants = variants.map(variant => ({ text: variant, type: 'title' }));
        
        // Update variants display
        document.getElementById('variants-container').style.display = 'block';
        document.getElementById('variants-list').innerHTML = renderSEOVariants();
        
        showToast('AI variants generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating variants:', error);
        showToast('Error generating variants', 'error');
    }
};

window.generateDescriptionVariants = async function() {
    const description = document.getElementById('product-description').value;
    const keywords = document.getElementById('target-keywords').value;
    
    if (!description.trim()) {
        showToast('Please enter a description first', 'warning');
        return;
    }
    
    try {
        showToast('Generating AI variants...', 'info');
        
        const variants = await generateSEOVariants('description', description, keywords);
        seoVariants = variants.map(variant => ({ text: variant, type: 'description' }));
        
        // Update variants display
        document.getElementById('variants-container').style.display = 'block';
        document.getElementById('variants-list').innerHTML = renderSEOVariants();
        
        showToast('AI variants generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating variants:', error);
        showToast('Error generating variants', 'error');
    }
};

window.selectVariant = function(index) {
    if (index >= 0 && index < seoVariants.length) {
        const variant = seoVariants[index];
        
        if (variant.type === 'title') {
            document.getElementById('product-title').value = variant.text;
            updateTitleMetrics();
        } else if (variant.type === 'description') {
            document.getElementById('product-description').value = variant.text;
            updateDescriptionMetrics();
        }
        
        showToast('Variant applied!', 'success');
    }
};

window.publishOptimizedContent = async function() {
    const title = document.getElementById('product-title').value;
    const description = document.getElementById('product-description').value;
    
    if (!title.trim() || !description.trim()) {
        showToast('Please fill in both title and description', 'warning');
        return;
    }
    
    try {
        const updates = {
            seo_title: title,
            seo_description: description,
            seo_score: Math.round((calculateTitleScore(title) + calculateDescriptionScore(description)) / 2),
            updated_at: new Date().toISOString()
        };
        
        await db.updateProduct(currentProduct.id, updates);
        
        // Update current product
        Object.assign(currentProduct, updates);
        
        // Update UI
        document.getElementById('overall-score').textContent = updates.seo_score;
        document.getElementById('seo-metrics').innerHTML = renderSEOMetrics();
        document.getElementById('recommendations-list').innerHTML = renderRecommendations();
        
        showToast('Optimized content published successfully!', 'success');
        
    } catch (error) {
        console.error('Error publishing content:', error);
        showToast('Error publishing content', 'error');
    }
};

// Real-time character counting and status updates
document.addEventListener('pageRendered', () => {
    const titleTextarea = document.getElementById('product-title');
    const descriptionTextarea = document.getElementById('product-description');
    
    if (titleTextarea) {
        titleTextarea.addEventListener('input', updateTitleMetrics);
        updateTitleMetrics(); // Initial update
    }
    
    if (descriptionTextarea) {
        descriptionTextarea.addEventListener('input', updateDescriptionMetrics);
        updateDescriptionMetrics(); // Initial update
    }
});

function updateTitleMetrics() {
    const titleTextarea = document.getElementById('product-title');
    const lengthSpan = document.getElementById('title-length');
    const statusSpan = document.getElementById('title-status');
    
    if (titleTextarea && lengthSpan && statusSpan) {
        const title = titleTextarea.value;
        lengthSpan.textContent = `${title.length} characters`;
        statusSpan.innerHTML = getTitleStatus(title);
    }
}

function updateDescriptionMetrics() {
    const descriptionTextarea = document.getElementById('product-description');
    const lengthSpan = document.getElementById('description-length');
    const statusSpan = document.getElementById('description-status');
    
    if (descriptionTextarea && lengthSpan && statusSpan) {
        const description = descriptionTextarea.value;
        lengthSpan.textContent = `${description.length} characters`;
        statusSpan.innerHTML = getDescriptionStatus(description);
    }
}

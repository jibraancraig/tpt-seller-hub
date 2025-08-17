import { db } from '../supa.js';
import { showToast } from '../ui/toasts.js';
import { generateSocialContent } from '../services/social_gen.js';

let currentProduct = null;
let socialPosts = {
    pinterest: [],
    instagram: [],
    facebook: []
};
let activeTab = 'pinterest';

export async function renderSocial() {
    await loadProductsForSelect();
    
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
                                <a href="#/products" class="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700" data-testid="link-products">Products</a>
                                <a href="#/rank" class="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700" data-testid="link-rank">Rank Tracker</a>
                                <a href="#/social" class="px-3 py-2 rounded-md text-sm font-medium bg-primary text-white" data-testid="link-social">Social</a>
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
                <h1 class="text-3xl font-bold text-gray-900" data-testid="text-page-title">Social Content Generator</h1>
                <p class="mt-2 text-gray-600" data-testid="text-page-description">Create engaging social media content for your TPT products</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Content Generation -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Product Selection -->
                    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-product-selection">Select Product</h3>
                        <select class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-4" id="product-select" data-testid="select-product">
                            <option value="">Choose a product...</option>
                        </select>
                        <button class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors" onclick="generateAllContent()" data-testid="button-generate-all" id="generate-btn" disabled>
                            <i class="fas fa-magic mr-2"></i>
                            Generate All Content Types
                        </button>
                    </div>

                    <!-- Generated Content Tabs -->
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div class="border-b border-gray-200">
                            <nav class="-mb-px flex">
                                <button class="py-4 px-6 border-b-2 border-primary text-primary font-medium text-sm" onclick="switchSocialTab('pinterest')" data-testid="button-tab-pinterest" id="tab-pinterest">
                                    <i class="fab fa-pinterest mr-2"></i>
                                    Pinterest (${socialPosts.pinterest.length})
                                </button>
                                <button class="py-4 px-6 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm" onclick="switchSocialTab('instagram')" data-testid="button-tab-instagram" id="tab-instagram">
                                    <i class="fab fa-instagram mr-2"></i>
                                    Instagram (${socialPosts.instagram.length})
                                </button>
                                <button class="py-4 px-6 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm" onclick="switchSocialTab('facebook')" data-testid="button-tab-facebook" id="tab-facebook">
                                    <i class="fab fa-facebook mr-2"></i>
                                    Facebook (${socialPosts.facebook.length})
                                </button>
                            </nav>
                        </div>

                        <!-- Pinterest Tab -->
                        <div id="pinterest-content" class="p-6 social-tab-content">
                            ${renderSocialPosts('pinterest')}
                        </div>

                        <!-- Instagram Tab -->
                        <div id="instagram-content" class="p-6 social-tab-content hidden">
                            ${renderSocialPosts('instagram')}
                        </div>

                        <!-- Facebook Tab -->
                        <div id="facebook-content" class="p-6 social-tab-content hidden">
                            ${renderSocialPosts('facebook')}
                        </div>
                    </div>

                    <!-- Bulk Actions -->
                    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-bulk-actions">Bulk Actions</h3>
                        <div class="flex flex-wrap gap-3">
                            <button class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors" onclick="exportToCSV()" data-testid="button-export-csv">
                                <i class="fas fa-file-csv mr-2"></i>
                                Export to CSV
                            </button>
                            <button class="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors" onclick="scheduleWithBuffer()" data-testid="button-schedule-buffer">
                                <i class="fas fa-calendar-plus mr-2"></i>
                                Schedule with Buffer
                            </button>
                            <button class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors" onclick="copyAllContent()" data-testid="button-copy-all">
                                <i class="fas fa-copy mr-2"></i>
                                Copy All
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Content Settings -->
                <div class="space-y-6">
                    <!-- Content Style -->
                    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-content-style">Content Style</h3>
                        <div class="space-y-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                                <select class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" id="tone-select" data-testid="select-tone">
                                    <option value="professional">Professional</option>
                                    <option value="friendly">Friendly</option>
                                    <option value="energetic">Energetic</option>
                                    <option value="educational">Educational</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                                <select class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" id="audience-select" data-testid="select-audience">
                                    <option value="teachers">Teachers</option>
                                    <option value="parents">Parents</option>
                                    <option value="homeschoolers">Homeschoolers</option>
                                    <option value="tutors">Tutors</option>
                                </select>
                            </div>
                            <label class="flex items-center">
                                <input type="checkbox" class="rounded border-gray-300 text-primary focus:ring-primary" checked id="include-hashtags" data-testid="checkbox-hashtags">
                                <span class="ml-2 text-sm text-gray-700">Include hashtags</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" class="rounded border-gray-300 text-primary focus:ring-primary" checked id="include-cta" data-testid="checkbox-cta">
                                <span class="ml-2 text-sm text-gray-700">Add call-to-action</span>
                            </label>
                        </div>
                    </div>

                    <!-- Templates -->
                    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-templates">Custom Templates</h3>
                        <div class="space-y-3">
                            <button class="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" onclick="useTemplate('problem-solution')" data-testid="button-template-problem-solution">
                                <div class="font-medium text-gray-900 text-sm">Problem-Solution Template</div>
                                <div class="text-xs text-gray-500">Struggling with [topic]? Try [product]...</div>
                            </button>
                            <button class="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" onclick="useTemplate('feature-highlight')" data-testid="button-template-feature-highlight">
                                <div class="font-medium text-gray-900 text-sm">Feature Highlight</div>
                                <div class="text-xs text-gray-500">This [product] includes [features]...</div>
                            </button>
                            <button class="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" onclick="useTemplate('social-proof')" data-testid="button-template-social-proof">
                                <div class="font-medium text-gray-900 text-sm">Social Proof</div>
                                <div class="text-xs text-gray-500">Teachers love this resource because...</div>
                            </button>
                        </div>
                        <button class="mt-3 text-sm text-primary hover:text-blue-700 font-medium" onclick="createCustomTemplate()" data-testid="button-create-template">
                            + Create Custom Template
                        </button>
                    </div>

                    <!-- Analytics Preview -->
                    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4" data-testid="text-content-analytics">Content Analytics</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600">Posts Generated</span>
                                <span class="text-sm font-medium text-gray-900" data-testid="text-posts-generated" id="posts-generated">0</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600">This Month</span>
                                <span class="text-sm font-medium text-gray-900" data-testid="text-posts-this-month">0</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600">Most Popular Platform</span>
                                <span class="text-sm font-medium text-gray-900" data-testid="text-popular-platform">Pinterest</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function loadProductsForSelect() {
    if (!window.app.isAuthenticated()) return;
    
    try {
        const user = window.app.getCurrentUser();
        const products = await db.getProducts(user.id);
        
        // Populate product select after page renders
        setTimeout(() => {
            const select = document.getElementById('product-select');
            if (select) {
                select.innerHTML = '<option value="">Choose a product...</option>';
                products.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.id;
                    option.textContent = product.title;
                    select.appendChild(option);
                });
                
                select.onchange = handleProductSelect;
            }
        }, 100);
        
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error loading products', 'error');
    }
}

function handleProductSelect(e) {
    const productId = e.target.value;
    const generateBtn = document.getElementById('generate-btn');
    
    if (productId) {
        generateBtn.disabled = false;
        generateBtn.classList.remove('opacity-50');
        
        // Find selected product
        const select = e.target;
        const selectedOption = select.options[select.selectedIndex];
        currentProduct = {
            id: productId,
            title: selectedOption.textContent
        };
    } else {
        generateBtn.disabled = true;
        generateBtn.classList.add('opacity-50');
        currentProduct = null;
    }
}

function renderSocialPosts(platform) {
    const posts = socialPosts[platform];
    
    if (posts.length === 0) {
        return `
            <div class="text-center py-8">
                <i class="fab fa-${platform} text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">No ${platform} posts generated yet</p>
                <p class="text-sm text-gray-400">Select a product and generate content to get started</p>
            </div>
        `;
    }
    
    return `
        <div class="space-y-4" data-testid="container-${platform}-posts">
            ${posts.map((post, index) => `
                <div class="border border-gray-200 rounded-lg p-4" data-testid="card-${platform}-post-${index}">
                    <div class="flex justify-between items-start mb-3">
                        <h4 class="font-medium text-gray-900" data-testid="text-${platform}-title-${index}">${post.title || 'Pin Title'}</h4>
                        <button class="text-sm text-primary hover:text-blue-700 font-medium" onclick="copyContent(${index}, '${platform}')" data-testid="button-copy-${platform}-${index}">
                            <i class="fas fa-copy mr-1"></i>
                            Copy
                        </button>
                    </div>
                    <p class="text-sm text-gray-700 mb-3" data-testid="text-${platform}-description-${index}">${post.description}</p>
                    ${post.hashtags ? `
                        <div class="bg-gray-50 rounded-lg p-3">
                            <p class="text-xs text-gray-600 mb-2">Hashtags:</p>
                            <p class="text-sm text-blue-600" data-testid="text-${platform}-hashtags-${index}">${post.hashtags.join(' ')}</p>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

// Global functions for social content interactions
window.generateAllContent = async function() {
    if (!currentProduct) {
        showToast('Please select a product first', 'warning');
        return;
    }
    
    try {
        showToast('Generating social content...', 'info');
        
        const tone = document.getElementById('tone-select').value;
        const audience = document.getElementById('audience-select').value;
        const includeHashtags = document.getElementById('include-hashtags').checked;
        const includeCTA = document.getElementById('include-cta').checked;
        
        const options = {
            tone,
            audience,
            includeHashtags,
            includeCTA
        };
        
        // Generate content for all platforms
        const [pinterestPosts, instagramPosts, facebookPosts] = await Promise.all([
            generateSocialContent(currentProduct, 'pinterest', 5, options),
            generateSocialContent(currentProduct, 'instagram', 3, options),
            generateSocialContent(currentProduct, 'facebook', 3, options)
        ]);
        
        socialPosts = {
            pinterest: pinterestPosts,
            instagram: instagramPosts,
            facebook: facebookPosts
        };
        
        // Update tab counts
        document.getElementById('tab-pinterest').innerHTML = `<i class="fab fa-pinterest mr-2"></i>Pinterest (${pinterestPosts.length})`;
        document.getElementById('tab-instagram').innerHTML = `<i class="fab fa-instagram mr-2"></i>Instagram (${instagramPosts.length})`;
        document.getElementById('tab-facebook').innerHTML = `<i class="fab fa-facebook mr-2"></i>Facebook (${facebookPosts.length})`;
        
        // Update content
        document.getElementById('pinterest-content').innerHTML = renderSocialPosts('pinterest');
        document.getElementById('instagram-content').innerHTML = renderSocialPosts('instagram');
        document.getElementById('facebook-content').innerHTML = renderSocialPosts('facebook');
        
        // Update analytics
        const totalPosts = pinterestPosts.length + instagramPosts.length + facebookPosts.length;
        document.getElementById('posts-generated').textContent = totalPosts;
        
        showToast('Social content generated successfully!', 'success');
        
        // Save to database
        await saveSocialPosts();
        
    } catch (error) {
        console.error('Error generating social content:', error);
        showToast('Error generating social content', 'error');
    }
};

window.switchSocialTab = function(platform) {
    // Update tab buttons
    document.querySelectorAll('[id^="tab-"]').forEach(btn => {
        btn.className = 'py-4 px-6 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm';
    });
    document.getElementById(`tab-${platform}`).className = 'py-4 px-6 border-b-2 border-primary text-primary font-medium text-sm';
    
    // Update content
    document.querySelectorAll('.social-tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`${platform}-content`).classList.remove('hidden');
    
    activeTab = platform;
};

window.copyContent = function(index, platform) {
    const post = socialPosts[platform][index];
    if (!post) return;
    
    let content = post.title ? `${post.title}\n\n` : '';
    content += post.description;
    if (post.hashtags) {
        content += `\n\n${post.hashtags.join(' ')}`;
    }
    
    navigator.clipboard.writeText(content).then(() => {
        showToast('Content copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Error copying content:', err);
        showToast('Error copying content', 'error');
    });
};

window.exportToCSV = function() {
    if (getTotalPostsCount() === 0) {
        showToast('No content to export', 'warning');
        return;
    }
    
    let csvContent = 'Platform,Title,Description,Hashtags\n';
    
    ['pinterest', 'instagram', 'facebook'].forEach(platform => {
        socialPosts[platform].forEach(post => {
            const title = (post.title || '').replace(/"/g, '""');
            const description = post.description.replace(/"/g, '""');
            const hashtags = post.hashtags ? post.hashtags.join(' ') : '';
            
            csvContent += `"${platform}","${title}","${description}","${hashtags}"\n`;
        });
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-content-${currentProduct?.title?.replace(/[^a-zA-Z0-9]/g, '-') || 'export'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast('Content exported to CSV!', 'success');
};

window.scheduleWithBuffer = function() {
    const bufferWebhookUrl = import.meta.env.VITE_BUFFER_WEBHOOK_URL;
    
    if (!bufferWebhookUrl) {
        showToast('Buffer webhook URL not configured. Check Settings.', 'warning');
        return;
    }
    
    if (getTotalPostsCount() === 0) {
        showToast('No content to schedule', 'warning');
        return;
    }
    
    // TODO: Implement Buffer webhook integration
    showToast('Buffer integration coming soon!', 'info');
};

window.copyAllContent = function() {
    if (getTotalPostsCount() === 0) {
        showToast('No content to copy', 'warning');
        return;
    }
    
    let content = '';
    
    ['Pinterest', 'Instagram', 'Facebook'].forEach((platform, platformIndex) => {
        const platformKey = platform.toLowerCase();
        const posts = socialPosts[platformKey];
        
        if (posts.length > 0) {
            content += `=== ${platform.toUpperCase()} POSTS ===\n\n`;
            
            posts.forEach((post, index) => {
                content += `${platform} Post ${index + 1}:\n`;
                if (post.title) content += `${post.title}\n\n`;
                content += `${post.description}\n`;
                if (post.hashtags) content += `\n${post.hashtags.join(' ')}\n`;
                content += '\n---\n\n';
            });
        }
    });
    
    navigator.clipboard.writeText(content).then(() => {
        showToast('All content copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Error copying content:', err);
        showToast('Error copying content', 'error');
    });
};

window.useTemplate = function(templateType) {
    if (!currentProduct) {
        showToast('Please select a product first', 'warning');
        return;
    }
    
    // TODO: Implement template application
    showToast(`${templateType} template applied! Generate content to see results.`, 'info');
};

window.createCustomTemplate = function() {
    // TODO: Implement custom template creation modal
    showToast('Custom template creation coming soon!', 'info');
};

async function saveSocialPosts() {
    if (!currentProduct || !window.app.isAuthenticated()) return;
    
    try {
        const allPosts = [];
        
        ['pinterest', 'instagram', 'facebook'].forEach(platform => {
            socialPosts[platform].forEach(post => {
                allPosts.push({
                    product_id: currentProduct.id,
                    network: platform,
                    content: JSON.stringify(post),
                    status: 'generated',
                    created_at: new Date().toISOString()
                });
            });
        });
        
        for (const postData of allPosts) {
            await db.createSocialPost(postData);
        }
        
    } catch (error) {
        console.error('Error saving social posts:', error);
        // Don't show error to user as this is background save
    }
}

function getTotalPostsCount() {
    return socialPosts.pinterest.length + socialPosts.instagram.length + socialPosts.facebook.length;
}

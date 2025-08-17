import type { 
  Profile, 
  Product, 
  Keyword, 
  Rank, 
  SocialPost, 
  Sales,
  InsertProduct,
  InsertKeyword,
  InsertRank,
  InsertSocialPost,
  InsertSales
} from "../shared/schema";

// In-memory storage implementation
// In production, this would be replaced with a proper database
export interface IStorage {
  // Profile operations
  getProfile(userId: string): Promise<Profile | null>;
  updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile>;
  
  // Product operations
  getProducts(userId: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(product: InsertProduct): Promise<Product>;
  createProducts(products: InsertProduct[]): Promise<Product[]>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Keyword operations
  getKeywords(userId: string, productId?: string): Promise<Keyword[]>;
  createKeyword(keyword: InsertKeyword): Promise<Keyword>;
  
  // Rank operations
  createRank(rank: InsertRank): Promise<Rank>;
  
  // Social post operations
  getSocialPosts(userId: string, productId?: string): Promise<SocialPost[]>;
  createSocialPost(post: InsertSocialPost): Promise<SocialPost>;
  
  // Sales operations
  getSales(userId: string): Promise<Sales[]>;
  createSales(sales: InsertSales[]): Promise<Sales[]>;
}

class MemoryStorage implements IStorage {
  private profiles = new Map<string, Profile>();
  private products = new Map<string, Product>();
  private keywords = new Map<string, Keyword>();
  private ranks = new Map<string, Rank>();
  private socialPosts = new Map<string, SocialPost>();
  private sales = new Map<string, Sales>();

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async getProfile(userId: string): Promise<Profile | null> {
    return this.profiles.get(userId) || null;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const existing = this.profiles.get(userId) || {
      id: userId,
      email: '',
      plan: 'free' as const,
      rankAlerts: true,
      weeklyReports: true,
      productUpdates: false,
      productsCount: 0,
      aiGenerations: 0,
      rankChecks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.profiles.set(userId, updated);
    return updated;
  }

  async getProducts(userId: string): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getProduct(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const product: Product = {
      id: this.generateId(),
      ...productData,
      seoScore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.products.set(product.id, product);

    // Update products count
    const profile = await this.getProfile(productData.userId);
    if (profile) {
      await this.updateProfile(productData.userId, {
        productsCount: (profile.productsCount || 0) + 1
      });
    }

    return product;
  }

  async createProducts(products: InsertProduct[]): Promise<Product[]> {
    const created = [];
    for (const productData of products) {
      const product = await this.createProduct(productData);
      created.push(product);
    }
    return created;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const existing = this.products.get(id);
    if (!existing) {
      throw new Error('Product not found');
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = this.products.get(id);
    if (!product) {
      throw new Error('Product not found');
    }

    this.products.delete(id);

    // Delete related data
    const relatedKeywords = Array.from(this.keywords.values())
      .filter(keyword => keyword.productId === id);
    
    for (const keyword of relatedKeywords) {
      this.keywords.delete(keyword.id);
      
      // Delete related ranks
      const relatedRanks = Array.from(this.ranks.values())
        .filter(rank => rank.keywordId === keyword.id);
      
      for (const rank of relatedRanks) {
        this.ranks.delete(rank.id);
      }
    }

    // Delete related social posts
    const relatedPosts = Array.from(this.socialPosts.values())
      .filter(post => post.productId === id);
    
    for (const post of relatedPosts) {
      this.socialPosts.delete(post.id);
    }

    // Delete related sales
    const relatedSales = Array.from(this.sales.values())
      .filter(sale => sale.productId === id);
    
    for (const sale of relatedSales) {
      this.sales.delete(sale.id);
    }

    // Update products count
    const profile = await this.getProfile(product.userId);
    if (profile) {
      await this.updateProfile(product.userId, {
        productsCount: Math.max(0, (profile.productsCount || 0) - 1)
      });
    }
  }

  async getKeywords(userId: string, productId?: string): Promise<Keyword[]> {
    const userProducts = await this.getProducts(userId);
    const userProductIds = new Set(userProducts.map(p => p.id));

    return Array.from(this.keywords.values())
      .filter(keyword => {
        if (!userProductIds.has(keyword.productId)) return false;
        if (productId && keyword.productId !== productId) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createKeyword(keywordData: InsertKeyword): Promise<Keyword> {
    const keyword: Keyword = {
      id: this.generateId(),
      ...keywordData,
      createdAt: new Date().toISOString()
    };

    this.keywords.set(keyword.id, keyword);
    return keyword;
  }

  async createRank(rankData: InsertRank): Promise<Rank> {
    const rank: Rank = {
      id: this.generateId(),
      ...rankData,
      fetchedAt: new Date().toISOString()
    };

    this.ranks.set(rank.id, rank);

    // Update keyword with current rank
    const keyword = this.keywords.get(rankData.keywordId);
    if (keyword) {
      const updatedKeyword = {
        ...keyword,
        previousRank: keyword.currentRank,
        currentRank: rankData.position,
        lastChecked: rank.fetchedAt
      };
      this.keywords.set(keyword.id, updatedKeyword);
    }

    return rank;
  }

  async getSocialPosts(userId: string, productId?: string): Promise<SocialPost[]> {
    const userProducts = await this.getProducts(userId);
    const userProductIds = new Set(userProducts.map(p => p.id));

    return Array.from(this.socialPosts.values())
      .filter(post => {
        if (!userProductIds.has(post.productId)) return false;
        if (productId && post.productId !== productId) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createSocialPost(postData: InsertSocialPost): Promise<SocialPost> {
    const post: SocialPost = {
      id: this.generateId(),
      ...postData,
      status: 'generated',
      createdAt: new Date().toISOString()
    };

    this.socialPosts.set(post.id, post);
    return post;
  }

  async getSales(userId: string): Promise<Sales[]> {
    const userProducts = await this.getProducts(userId);
    const userProductIds = new Set(userProducts.map(p => p.id));

    return Array.from(this.sales.values())
      .filter(sale => userProductIds.has(sale.productId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createSales(salesData: InsertSales[]): Promise<Sales[]> {
    const created = [];
    for (const saleData of salesData) {
      const sale: Sales = {
        id: this.generateId(),
        ...saleData,
        createdAt: new Date().toISOString()
      };

      this.sales.set(sale.id, sale);
      created.push(sale);
    }
    return created;
  }
}

export const storage: IStorage = new MemoryStorage();

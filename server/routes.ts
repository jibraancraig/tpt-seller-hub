import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import Papa from "papaparse";
import { storage } from "./storage";
import { OpenAIService } from "./services/openai";
import { SerpAPIService } from "./services/serpapi";
import type { 
  InsertProduct, 
  InsertKeyword, 
  InsertSocialPost, 
  InsertSales,
  Product,
  Keyword,
  SocialPost,
  Sales
} from "../shared/schema";

// Request validation schemas
const createProductSchema = z.object({
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  tptUrl: z.string().url().optional(),
  price: z.number().optional()
});

const updateProductSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoScore: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional(),
  tptUrl: z.string().url().optional(),
  price: z.number().optional()
});

const createKeywordSchema = z.object({
  phrase: z.string(),
  productId: z.string(),
  country: z.string().default('us'),
  device: z.enum(['desktop', 'mobile', 'tablet']).default('desktop')
});

const createSocialPostSchema = z.object({
  productId: z.string(),
  network: z.enum(['pinterest', 'instagram', 'facebook']),
  content: z.object({
    title: z.string().optional(),
    content: z.string(),
    hashtags: z.array(z.string()).default([])
  })
});

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  tptStoreUrl: z.string().url().optional(),
  openaiKey: z.string().optional(),
  serpapiKey: z.string().optional(),
  bufferWebhook: z.string().url().optional(),
  rankAlerts: z.boolean().optional(),
  weeklyReports: z.boolean().optional(),
  productUpdates: z.boolean().optional()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to require authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    next();
  };

  // Profile routes
  app.get("/api/profile", requireAuth, async (req, res) => {
    try {
      const profile = await storage.getProfile(req.user.id);
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/profile", requireAuth, async (req, res) => {
    try {
      const updates = updateProfileSchema.parse(req.body);
      const profile = await storage.updateProfile(req.user.id, updates);
      res.json(profile);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Product routes
  app.get("/api/products", requireAuth, async (req, res) => {
    try {
      const products = await storage.getProducts(req.user.id);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products", requireAuth, async (req, res) => {
    try {
      const productData = createProductSchema.parse(req.body);
      
      // Ensure user can only create products for themselves
      if (productData.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const updates = updateProductSchema.parse(req.body);
      
      // Verify ownership
      const product = await storage.getProduct(req.params.id);
      if (!product || product.userId !== req.user.id) {
        return res.status(404).json({ error: "Product not found" });
      }

      const updatedProduct = await storage.updateProduct(req.params.id, updates);
      res.json(updatedProduct);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
      // Verify ownership
      const product = await storage.getProduct(req.params.id);
      if (!product || product.userId !== req.user.id) {
        return res.status(404).json({ error: "Product not found" });
      }

      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Import routes
  app.post("/api/import/csv", requireAuth, async (req, res) => {
    try {
      if (!req.files || !req.files.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;
      const csvData = file.data.toString('utf8');
      
      const parsed = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true
      });

      if (parsed.errors.length > 0) {
        return res.status(400).json({ error: "CSV parsing failed", details: parsed.errors });
      }

      const products: InsertProduct[] = [];
      for (const row of parsed.data as any[]) {
        if (row.title) {
          products.push({
            userId: req.user.id,
            title: row.title,
            description: row.description || '',
            tags: row.tags ? row.tags.split(';').map((tag: string) => tag.trim()) : [],
            tptUrl: row.tpt_url || undefined,
            price: row.price ? parseFloat(row.price) : undefined
          });
        }
      }

      const createdProducts = await storage.createProducts(products);
      res.json({ count: createdProducts.length, products: createdProducts });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/import/urls", requireAuth, async (req, res) => {
    try {
      const { urls } = req.body;
      
      if (!Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ error: "No URLs provided" });
      }

      // For now, create placeholder products from URLs
      // In a real implementation, you'd scrape the URLs for product data
      const products: InsertProduct[] = urls.map((url: string, index: number) => ({
        userId: req.user.id,
        title: `Product from URL ${index + 1}`,
        description: `Imported from ${url}`,
        tags: [],
        tptUrl: url
      }));

      const createdProducts = await storage.createProducts(products);
      res.json({ count: createdProducts.length, products: createdProducts });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Keyword routes
  app.get("/api/keywords", requireAuth, async (req, res) => {
    try {
      const keywords = await storage.getKeywords(req.user.id, req.query.productId as string);
      res.json(keywords);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/keywords", requireAuth, async (req, res) => {
    try {
      const keywordData = createKeywordSchema.parse(req.body);
      
      // Verify product ownership
      const product = await storage.getProduct(keywordData.productId);
      if (!product || product.userId !== req.user.id) {
        return res.status(403).json({ error: "Product not found or access denied" });
      }

      const keyword = await storage.createKeyword(keywordData);
      res.status(201).json(keyword);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Rank tracking routes
  app.post("/api/ranks/refresh", requireAuth, async (req, res) => {
    try {
      const { keywordIds } = req.body;
      
      // Get user profile for API keys
      const profile = await storage.getProfile(req.user.id);
      const serpApiKey = profile?.serpapiKey;
      
      if (!serpApiKey) {
        return res.status(400).json({ error: "SerpAPI key not configured" });
      }

      const serpService = new SerpAPIService(serpApiKey);
      const keywords = await storage.getKeywords(req.user.id);
      
      // Filter by specific keyword IDs if provided
      const keywordsToProcess = keywordIds ? 
        keywords.filter(k => keywordIds.includes(k.id)) : 
        keywords;

      let processedCount = 0;
      const results = [];

      for (const keyword of keywordsToProcess) {
        try {
          const rankData = await serpService.checkRank(keyword.phrase, keyword.country, keyword.device);
          
          await storage.createRank({
            keywordId: keyword.id,
            position: rankData.position,
            urlFound: rankData.urlFound,
            title: rankData.title,
            snippet: rankData.snippet
          });

          results.push({
            keywordId: keyword.id,
            phrase: keyword.phrase,
            success: true,
            position: rankData.position
          });
          
          processedCount++;
        } catch (error: any) {
          results.push({
            keywordId: keyword.id,
            phrase: keyword.phrase,
            success: false,
            error: error.message
          });
        }
      }

      res.json({
        processed: processedCount,
        total: keywordsToProcess.length,
        results
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Social post routes
  app.get("/api/social-posts", requireAuth, async (req, res) => {
    try {
      const posts = await storage.getSocialPosts(req.user.id, req.query.productId as string);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/social-posts", requireAuth, async (req, res) => {
    try {
      const postData = createSocialPostSchema.parse(req.body);
      
      // Verify product ownership
      const product = await storage.getProduct(postData.productId);
      if (!product || product.userId !== req.user.id) {
        return res.status(403).json({ error: "Product not found or access denied" });
      }

      const post = await storage.createSocialPost(postData);
      res.status(201).json(post);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Sales routes
  app.get("/api/sales", requireAuth, async (req, res) => {
    try {
      const sales = await storage.getSales(req.user.id);
      res.json(sales);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/sales/import", requireAuth, async (req, res) => {
    try {
      if (!req.files || !req.files.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;
      const csvData = file.data.toString('utf8');
      
      const parsed = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true
      });

      if (parsed.errors.length > 0) {
        return res.status(400).json({ error: "CSV parsing failed", details: parsed.errors });
      }

      // Get user's products to match titles
      const products = await storage.getProducts(req.user.id);
      const productMap = new Map(products.map(p => [p.title.toLowerCase(), p.id]));

      const sales: InsertSales[] = [];
      for (const row of parsed.data as any[]) {
        const productId = productMap.get(row.product_title?.toLowerCase());
        if (productId && row.date) {
          sales.push({
            productId,
            date: row.date,
            units: parseInt(row.units) || 0,
            revenue: parseFloat(row.revenue) || 0,
            views: parseInt(row.views) || 0
          });
        }
      }

      const createdSales = await storage.createSales(sales);
      res.json({ count: createdSales.length, sales: createdSales });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import { z } from "zod";

// Profile/User schema
export const profileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  plan: z.enum(['free', 'pro']).default('free'),
  tptStoreUrl: z.string().url().optional(),
  
  // API Keys
  openaiKey: z.string().optional(),
  serpapiKey: z.string().optional(),
  bufferWebhook: z.string().url().optional(),
  
  // Notification preferences
  rankAlerts: z.boolean().default(true),
  weeklyReports: z.boolean().default(true),
  productUpdates: z.boolean().default(false),
  
  // Usage tracking
  productsCount: z.number().default(0),
  aiGenerations: z.number().default(0),
  rankChecks: z.number().default(0),
  
  // Stripe integration
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  
  createdAt: z.string(),
  updatedAt: z.string()
});

export type Profile = z.infer<typeof profileSchema>;

// Product schema
export const productSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  tptUrl: z.string().url().optional(),
  price: z.number().optional(),
  
  // SEO optimized versions
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoScore: z.number().min(0).max(100).default(0),
  
  createdAt: z.string(),
  updatedAt: z.string()
});

export type Product = z.infer<typeof productSchema>;

export const insertProductSchema = productSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertProduct = z.infer<typeof insertProductSchema>;

// Keyword schema
export const keywordSchema = z.object({
  id: z.string(),
  productId: z.string(),
  phrase: z.string(),
  country: z.string().default('us'),
  device: z.enum(['desktop', 'mobile', 'tablet']).default('desktop'),
  currentRank: z.number().optional(),
  previousRank: z.number().optional(),
  lastChecked: z.string().optional(),
  createdAt: z.string()
});

export type Keyword = z.infer<typeof keywordSchema>;

export const insertKeywordSchema = keywordSchema.omit({
  id: true,
  createdAt: true
});

export type InsertKeyword = z.infer<typeof insertKeywordSchema>;

// Rank record schema
export const rankSchema = z.object({
  id: z.string(),
  keywordId: z.string(),
  position: z.number().optional(),
  urlFound: z.string().optional(),
  title: z.string().optional(),
  snippet: z.string().optional(),
  fetchedAt: z.string()
});

export type Rank = z.infer<typeof rankSchema>;

export const insertRankSchema = rankSchema.omit({
  id: true,
  fetchedAt: true
});

export type InsertRank = z.infer<typeof insertRankSchema>;

// Social post schema
export const socialPostSchema = z.object({
  id: z.string(),
  productId: z.string(),
  network: z.enum(['pinterest', 'instagram', 'facebook']),
  content: z.object({
    title: z.string(),
    description: z.string(),
    hashtags: z.array(z.string()).default([])
  }),
  status: z.enum(['generated', 'scheduled', 'published']).default('generated'),
  scheduledAt: z.string().optional(),
  publishedAt: z.string().optional(),
  createdAt: z.string()
});

export type SocialPost = z.infer<typeof socialPostSchema>;

export const insertSocialPostSchema = socialPostSchema.omit({
  id: true,
  createdAt: true
});

export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;

// Sales record schema
export const salesSchema = z.object({
  id: z.string(),
  productId: z.string(),
  date: z.string(),
  units: z.number().default(0),
  revenue: z.number().default(0),
  views: z.number().default(0),
  createdAt: z.string()
});

export type Sales = z.infer<typeof salesSchema>;

export const insertSalesSchema = salesSchema.omit({
  id: true,
  createdAt: true
});

export type InsertSales = z.infer<typeof insertSalesSchema>;

// API request/response schemas
export const seoAnalysisSchema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.string().optional()
});

export const seoVariantsSchema = z.object({
  variants: z.array(z.object({
    title: z.string(),
    description: z.string(),
    score: z.number()
  }))
});

export const socialContentRequestSchema = z.object({
  productId: z.string(),
  networks: z.array(z.enum(['pinterest', 'instagram', 'facebook']))
});

export const rankCheckRequestSchema = z.object({
  keywordIds: z.array(z.string()).optional()
});

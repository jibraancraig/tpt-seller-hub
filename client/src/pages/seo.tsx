import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/supabase';
import { createOpenAIService } from '@/lib/openai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function SEOPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [variants, setVariants] = useState<any[]>([]);
  const [seoScore, setSeoScore] = useState(0);

  const { data: products = [] } = useQuery({
    queryKey: ['products', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await db.getProducts(user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await db.getProfile(user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const generateVariantsMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.openaiKey) {
        throw new Error('OpenAI API key not configured. Please add it in Settings.');
      }
      
      const openaiService = createOpenAIService(profile.openaiKey);
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
      
      return await openaiService.generateSEOVariants(title, description, keywordList);
    },
    onSuccess: (data) => {
      setVariants(data.variants || []);
      toast({
        title: "Variants generated!",
        description: `Generated ${data.variants?.length || 0} SEO variants.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const publishMutation = useMutation({
    mutationFn: async ({ productId, seoTitle, seoDescription }: any) => {
      const response = await apiRequest('PATCH', `/api/products/${productId}`, {
        seoTitle,
        seoDescription,
        seoScore
      });
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "SEO content published!",
        description: "Product has been updated with optimized content.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Publish failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProductId(productId);
      setTitle(product.seoTitle || product.title || '');
      setDescription(product.seoDescription || product.description || '');
      setKeywords('');
      setVariants([]);
      
      // Calculate initial SEO score
      if (profile?.openaiKey) {
        const openaiService = createOpenAIService(profile.openaiKey);
        const score = openaiService.calculateSEOScore(
          product.title || '',
          product.description || ''
        );
        setSeoScore(score);
      }
    }
  };

  const handleUseVariant = (variant: any) => {
    setTitle(variant.title);
    setDescription(variant.description);
    setSeoScore(variant.score);
    toast({
      title: "Variant selected",
      description: "Content has been updated with the selected variant.",
    });
  };

  const calculateScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-red-500';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return 'fas fa-check text-success';
    if (score >= 60) return 'fas fa-exclamation-triangle text-warning';
    return 'fas fa-times text-red-500';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900" data-testid="text-page-title">SEO Optimizer</h1>
        <p className="mt-2 text-gray-600" data-testid="text-page-description">
          Optimize your product titles and descriptions for better search rankings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main SEO Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Selector */}
          <Card data-testid="card-product-selector">
            <CardHeader>
              <CardTitle>Select Product</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedProductId} onValueChange={handleProductSelect}>
                <SelectTrigger data-testid="select-product">
                  <SelectValue placeholder="Choose a product to optimize" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedProductId && (
            <>
              {/* Title Optimization */}
              <Card data-testid="card-title-optimization">
                <CardHeader>
                  <CardTitle>Title Optimization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Title</label>
                    <Textarea
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-20 resize-none"
                      placeholder="Enter your product title..."
                      data-testid="textarea-title"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">{title.length} characters</span>
                      <span className={`text-sm ${title.length >= 50 && title.length <= 70 ? 'text-success' : 'text-warning'}`}>
                        {title.length >= 50 && title.length <= 70 ? 'Optimal length ✓' : 'Consider 50-70 characters'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Keywords</label>
                    <Input
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="algebra, linear equations, math activities"
                      data-testid="input-keywords"
                    />
                  </div>

                  <Button
                    onClick={() => generateVariantsMutation.mutate()}
                    disabled={generateVariantsMutation.isPending || !profile?.openaiKey}
                    data-testid="button-generate-variants"
                  >
                    {generateVariantsMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Generating...
                      </div>
                    ) : (
                      <>
                        <i className="fas fa-magic mr-2"></i>
                        Generate AI Variants
                      </>
                    )}
                  </Button>
                  
                  {!profile?.openaiKey && (
                    <p className="text-sm text-warning">
                      <i className="fas fa-exclamation-triangle mr-1"></i>
                      OpenAI API key required. Configure in Settings.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Description Optimization */}
              <Card data-testid="card-description-optimization">
                <CardHeader>
                  <CardTitle>Description Optimization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Description</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="h-32 resize-none"
                      placeholder="Enter your product description..."
                      data-testid="textarea-description"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">{description.length} characters</span>
                      <span className={`text-sm ${description.length >= 150 && description.length <= 300 ? 'text-success' : 'text-warning'}`}>
                        {description.length >= 150 && description.length <= 300 ? 'Good length ✓' : 'Consider 150-300 characters'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Variants */}
              {variants.length > 0 && (
                <Card data-testid="card-ai-variants">
                  <CardHeader>
                    <CardTitle>AI-Generated Variants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {variants.map((variant, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4" data-testid={`variant-${index}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Variant {index + 1}</h4>
                            <Button
                              size="sm"
                              onClick={() => handleUseVariant(variant)}
                              data-testid={`button-use-variant-${index}`}
                            >
                              Use This
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Title:</p>
                              <p className="text-sm text-gray-700">{variant.title}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Description:</p>
                              <p className="text-sm text-gray-700">{variant.description}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center space-x-4">
                            <span className="text-xs text-gray-500">Score: {variant.score}%</span>
                            <span className="text-xs text-gray-500">{variant.title.length} chars</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* SEO Score Panel */}
        <div className="space-y-6">
          <Card data-testid="card-seo-score">
            <CardHeader>
              <CardTitle>SEO Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="seo-score-circle mx-auto mb-4">
                  <svg className="w-24 h-24">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#E5E7EB"
                      strokeWidth="4"
                      fill="transparent"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#10B981"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={`${2.51 * seoScore} 251`}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="score-text">
                    <span className={`text-2xl font-bold ${calculateScoreColor(seoScore)}`} data-testid="text-seo-score">
                      {seoScore}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Overall Score</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Title Length</span>
                  <div className="flex items-center">
                    <i className={getScoreIcon(title.length >= 50 && title.length <= 70 ? 85 : 60)}></i>
                    <span className="text-sm font-medium text-gray-900 ml-2">
                      {title.length >= 50 && title.length <= 70 ? '95' : '60'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Description Quality</span>
                  <div className="flex items-center">
                    <i className={getScoreIcon(description.length >= 150 ? 85 : 60)}></i>
                    <span className="text-sm font-medium text-gray-900 ml-2">
                      {description.length >= 150 ? '85' : '60'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Keyword Usage</span>
                  <div className="flex items-center">
                    <i className={getScoreIcon(keywords ? 85 : 40)}></i>
                    <span className="text-sm font-medium text-gray-900 ml-2">
                      {keywords ? '85' : '40'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publish Button */}
          {selectedProductId && (
            <Button
              className="w-full bg-success hover:bg-green-700"
              onClick={() => publishMutation.mutate({
                productId: selectedProductId,
                seoTitle: title,
                seoDescription: description
              })}
              disabled={publishMutation.isPending}
              data-testid="button-publish-seo"
            >
              {publishMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Publishing...
                </div>
              ) : (
                <>
                  <i className="fas fa-rocket mr-2"></i>
                  Publish Optimized Content
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

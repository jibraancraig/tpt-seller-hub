import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/supabase';
import { createOpenAIService } from '@/lib/openai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function SocialPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('pinterest');
  const [generatedContent, setGeneratedContent] = useState<any>({});

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

  const { data: socialPosts = [] } = useQuery({
    queryKey: ['social-posts', selectedProductId],
    queryFn: async () => {
      if (!selectedProductId) return [];
      const { data, error } = await db.getSocialPosts(selectedProductId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedProductId
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

  const generateContentMutation = useMutation({
    mutationFn: async (networks: string[]) => {
      if (!selectedProductId || !profile?.openaiKey) {
        throw new Error('Product selection and OpenAI API key required');
      }
      
      const product = products.find(p => p.id === selectedProductId);
      if (!product) throw new Error('Product not found');
      
      const openaiService = createOpenAIService(profile.openaiKey);
      const results: any = {};
      
      for (const network of networks) {
        try {
          const content = await openaiService.generateSocialContent(
            product.title,
            product.description || '',
            network
          );
          results[network] = content.posts || [];
        } catch (error) {
          console.error(`Failed to generate ${network} content:`, error);
          results[network] = [];
        }
      }
      
      return results;
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      toast({
        title: "Content generated!",
        description: "Social media content has been generated for all selected networks.",
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

  const saveContentMutation = useMutation({
    mutationFn: async ({ network, content }: any) => {
      const response = await apiRequest('POST', '/api/social-posts', {
        productId: selectedProductId,
        network,
        content
      });
      if (!response.ok) throw new Error('Failed to save content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast({
        title: "Content saved!",
        description: "Social media content has been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const exportToCSV = () => {
    if (!generatedContent || Object.keys(generatedContent).length === 0) {
      toast({
        title: "No content to export",
        description: "Generate content first before exporting.",
        variant: "destructive",
      });
      return;
    }

    let csvContent = 'Network,Title,Content,Hashtags\n';
    
    Object.entries(generatedContent).forEach(([network, posts]: [string, any]) => {
      posts.forEach((post: any) => {
        const hashtags = Array.isArray(post.hashtags) ? post.hashtags.join(' ') : '';
        const row = `"${network}","${post.title || ''}","${post.content || ''}","${hashtags}"\n`;
        csvContent += row;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-content-${selectedProductId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    });
  };

  const platforms = [
    { id: 'pinterest', name: 'Pinterest', icon: 'fab fa-pinterest', color: 'text-red-600' },
    { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram', color: 'text-pink-600' },
    { id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook', color: 'text-blue-600' }
  ];

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900" data-testid="text-page-title">Social Content Generator</h1>
        <p className="mt-2 text-gray-600" data-testid="text-page-description">
          Create engaging social media content for your TPT products
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content Generation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Selection */}
          <Card data-testid="card-product-selection">
            <CardHeader>
              <CardTitle>Select Product</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger data-testid="select-product">
                  <SelectValue placeholder="Choose a product to create content for" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedProduct && (
                <div className="mt-4">
                  <Button
                    onClick={() => generateContentMutation.mutate(['pinterest', 'instagram', 'facebook'])}
                    disabled={generateContentMutation.isPending || !profile?.openaiKey}
                    className="w-full"
                    data-testid="button-generate-all"
                  >
                    {generateContentMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Generating...
                      </div>
                    ) : (
                      <>
                        <i className="fas fa-magic mr-2"></i>
                        Generate All Content Types
                      </>
                    )}
                  </Button>
                  
                  {!profile?.openaiKey && (
                    <p className="text-sm text-warning mt-2">
                      <i className="fas fa-exclamation-triangle mr-1"></i>
                      OpenAI API key required. Configure in Settings.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Content Tabs */}
          {Object.keys(generatedContent).length > 0 && (
            <Card data-testid="card-generated-content">
              <CardHeader className="border-b border-gray-200">
                <CardTitle>Generated Content</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    {platforms.map((platform) => (
                      <TabsTrigger key={platform.id} value={platform.id} data-testid={`tab-${platform.id}`}>
                        <i className={`${platform.icon} ${platform.color} mr-2`}></i>
                        {platform.name} ({generatedContent[platform.id]?.length || 0})
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {platforms.map((platform) => (
                    <TabsContent key={platform.id} value={platform.id} className="p-6">
                      <div className="space-y-4">
                        {generatedContent[platform.id]?.map((post: any, index: number) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4" data-testid={`post-${platform.id}-${index}`}>
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-gray-900">Post {index + 1}</h4>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyContent(post.content)}
                                  data-testid={`button-copy-${platform.id}-${index}`}
                                >
                                  <i className="fas fa-copy mr-1"></i>
                                  Copy
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => saveContentMutation.mutate({
                                    network: platform.id,
                                    content: post
                                  })}
                                  disabled={saveContentMutation.isPending}
                                  data-testid={`button-save-${platform.id}-${index}`}
                                >
                                  <i className="fas fa-save mr-1"></i>
                                  Save
                                </Button>
                              </div>
                            </div>
                            
                            {post.title && (
                              <div className="mb-3">
                                <p className="text-xs text-gray-500 mb-1">Title:</p>
                                <p className="text-sm text-gray-700 font-medium">{post.title}</p>
                              </div>
                            )}
                            
                            <div className="mb-3">
                              <p className="text-xs text-gray-500 mb-1">Content:</p>
                              <p className="text-sm text-gray-700">{post.content}</p>
                            </div>
                            
                            {post.hashtags && post.hashtags.length > 0 && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Hashtags:</p>
                                <div className="flex flex-wrap gap-1">
                                  {post.hashtags.map((hashtag: string, hIndex: number) => (
                                    <span key={hIndex} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      #{hashtag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Bulk Actions */}
          {Object.keys(generatedContent).length > 0 && (
            <Card data-testid="card-bulk-actions">
              <CardHeader>
                <CardTitle>Bulk Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={exportToCSV}
                    className="bg-green-500 hover:bg-green-600"
                    data-testid="button-export-csv"
                  >
                    <i className="fas fa-file-csv mr-2"></i>
                    Export to CSV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const allContent = Object.values(generatedContent).flat()
                        .map((post: any) => post.content).join('\n\n');
                      copyContent(allContent);
                    }}
                    data-testid="button-copy-all"
                  >
                    <i className="fas fa-copy mr-2"></i>
                    Copy All Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Content Settings */}
        <div className="space-y-6">
          {/* Content Style */}
          <Card data-testid="card-content-style">
            <CardHeader>
              <CardTitle>Content Style</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                  <Select defaultValue="professional">
                    <SelectTrigger data-testid="select-tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="energetic">Energetic</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <Select defaultValue="teachers">
                    <SelectTrigger data-testid="select-audience">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teachers">Teachers</SelectItem>
                      <SelectItem value="parents">Parents</SelectItem>
                      <SelectItem value="homeschoolers">Homeschoolers</SelectItem>
                      <SelectItem value="tutors">Tutors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    defaultChecked
                    data-testid="checkbox-include-hashtags"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include hashtags</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    defaultChecked
                    data-testid="checkbox-add-cta"
                  />
                  <span className="ml-2 text-sm text-gray-700">Add call-to-action</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Saved Posts */}
          <Card data-testid="card-saved-posts">
            <CardHeader>
              <CardTitle>Saved Posts</CardTitle>
              <CardDescription>
                Previously generated content for this product
              </CardDescription>
            </CardHeader>
            <CardContent>
              {socialPosts.length > 0 ? (
                <div className="space-y-3">
                  {socialPosts.slice(0, 5).map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-3" data-testid={`saved-post-${post.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <i className={`fab fa-${post.network} ${
                            post.network === 'pinterest' ? 'text-red-600' :
                            post.network === 'instagram' ? 'text-pink-600' :
                            'text-blue-600'
                          } mr-2`}></i>
                          <span className="text-sm font-medium capitalize">{post.network}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{post.content.content}</p>
                    </div>
                  ))}
                  {socialPosts.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{socialPosts.length - 5} more posts
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center">No saved posts yet</p>
              )}
            </CardContent>
          </Card>

          {/* Content Analytics */}
          <Card data-testid="card-content-analytics">
            <CardHeader>
              <CardTitle>Content Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Posts Generated</span>
                  <span className="text-sm font-medium text-gray-900" data-testid="text-posts-generated">
                    {socialPosts.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-sm font-medium text-gray-900" data-testid="text-posts-this-month">
                    {socialPosts.filter(post => {
                      const postDate = new Date(post.createdAt);
                      const now = new Date();
                      return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear();
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Most Popular Platform</span>
                  <span className="text-sm font-medium text-gray-900" data-testid="text-popular-platform">
                    {socialPosts.length > 0 ? 'Pinterest' : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

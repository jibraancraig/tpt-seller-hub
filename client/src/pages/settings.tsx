import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState({
    openai: false,
    serpapi: false
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await db.getProfile(user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    tptStoreUrl: '',
    openaiKey: '',
    serpapiKey: '',
    bufferWebhook: '',
    rankAlerts: true,
    weeklyReports: true,
    productUpdates: false
  });

  // Update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        tptStoreUrl: profile.tptStoreUrl || '',
        openaiKey: profile.openaiKey || '',
        serpapiKey: profile.serpapiKey || '',
        bufferWebhook: profile.bufferWebhook || '',
        rankAlerts: profile.rankAlerts ?? true,
        weeklyReports: profile.weeklyReports ?? true,
        productUpdates: profile.productUpdates ?? false
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!user) throw new Error('User not authenticated');
      
      const response = await apiRequest('PATCH', '/api/profile', updates);
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Settings saved!",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      tptStoreUrl: formData.tptStoreUrl
    });
  };

  const handleApiKeysSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      openaiKey: formData.openaiKey,
      serpapiKey: formData.serpapiKey,
      bufferWebhook: formData.bufferWebhook
    });
  };

  const handleNotificationsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      rankAlerts: formData.rankAlerts,
      weeklyReports: formData.weeklyReports,
      productUpdates: formData.productUpdates
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleApiKeyVisibility = (key: 'openai' | 'serpapi') => {
    setShowApiKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Mock usage data (in real app, this would come from the profile)
  const usageStats = {
    productsTracked: profile?.productsCount || 0,
    aiGenerations: profile?.aiGenerations || 0,
    rankChecks: profile?.rankChecks || 0,
    plan: profile?.plan || 'free'
  };

  const planLimits = {
    free: { products: 3, ai: 50, ranks: 100 },
    pro: { products: Infinity, ai: Infinity, ranks: Infinity }
  };

  const currentLimits = planLimits[usageStats.plan as keyof typeof planLimits];

  if (profileLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900" data-testid="text-page-title">Settings</h1>
        <p className="mt-2 text-gray-600" data-testid="text-page-description">
          Manage your account, billing, and integrations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Settings */}
          <Card data-testid="card-account-settings">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    data-testid="input-email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tptStoreUrl">TPT Store URL</Label>
                  <Input
                    id="tptStoreUrl"
                    type="url"
                    placeholder="https://www.teacherspayteachers.com/Store/your-store"
                    value={formData.tptStoreUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, tptStoreUrl: e.target.value }))}
                    data-testid="input-tpt-url"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-account"
                >
                  {updateProfileMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card data-testid="card-api-keys">
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Configure your external service integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleApiKeysSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="openaiKey">
                    OpenAI API Key
                    <span className="text-xs text-gray-500 ml-2">(for AI content generation)</span>
                  </Label>
                  <div className="flex">
                    <Input
                      id="openaiKey"
                      type={showApiKeys.openai ? "text" : "password"}
                      placeholder="sk-..."
                      value={formData.openaiKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, openaiKey: e.target.value }))}
                      className="rounded-r-none"
                      data-testid="input-openai-key"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-l-none border-l-0"
                      onClick={() => toggleApiKeyVisibility('openai')}
                      data-testid="button-toggle-openai"
                    >
                      <i className={`fas fa-${showApiKeys.openai ? 'eye-slash' : 'eye'}`}></i>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="serpapiKey">
                    SerpAPI Key
                    <span className="text-xs text-gray-500 ml-2">(for rank tracking)</span>
                  </Label>
                  <div className="flex">
                    <Input
                      id="serpapiKey"
                      type={showApiKeys.serpapi ? "text" : "password"}
                      placeholder="Your SerpAPI key"
                      value={formData.serpapiKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, serpapiKey: e.target.value }))}
                      className="rounded-r-none"
                      data-testid="input-serpapi-key"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-l-none border-l-0"
                      onClick={() => toggleApiKeyVisibility('serpapi')}
                      data-testid="button-toggle-serpapi"
                    >
                      <i className={`fas fa-${showApiKeys.serpapi ? 'eye-slash' : 'eye'}`}></i>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bufferWebhook">
                    Buffer Webhook URL
                    <span className="text-xs text-gray-500 ml-2">(optional, for social scheduling)</span>
                  </Label>
                  <Input
                    id="bufferWebhook"
                    type="url"
                    placeholder="https://your-buffer-webhook-url"
                    value={formData.bufferWebhook}
                    onChange={(e) => setFormData(prev => ({ ...prev, bufferWebhook: e.target.value }))}
                    data-testid="input-buffer-webhook"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-api-keys"
                >
                  {updateProfileMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save API Keys'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card data-testid="card-notifications">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationsSubmit} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Rank Alerts</h4>
                    <p className="text-sm text-gray-500">Get notified when your rankings change significantly</p>
                  </div>
                  <Switch
                    checked={formData.rankAlerts}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rankAlerts: checked }))}
                    data-testid="switch-rank-alerts"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Weekly Reports</h4>
                    <p className="text-sm text-gray-500">Receive weekly performance summaries</p>
                  </div>
                  <Switch
                    checked={formData.weeklyReports}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, weeklyReports: checked }))}
                    data-testid="switch-weekly-reports"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Product Updates</h4>
                    <p className="text-sm text-gray-500">Notifications about new features and updates</p>
                  </div>
                  <Switch
                    checked={formData.productUpdates}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, productUpdates: checked }))}
                    data-testid="switch-product-updates"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-notifications"
                >
                  {updateProfileMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Preferences'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Billing & Plan */}
        <div className="space-y-6">
          {/* Current Plan */}
          <Card data-testid="card-current-plan">
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <i className={`fas fa-${usageStats.plan === 'pro' ? 'crown' : 'user'} text-primary text-2xl`}></i>
                </div>
                <h4 className="text-xl font-bold text-gray-900 capitalize" data-testid="text-plan-name">
                  {usageStats.plan} Plan
                </h4>
                <p className="text-gray-500" data-testid="text-plan-price">
                  {usageStats.plan === 'pro' ? '$29/month' : 'Free'}
                </p>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm">
                  <i className="fas fa-check text-success mr-2"></i>
                  <span>{usageStats.plan === 'pro' ? 'Unlimited' : 'Up to 3'} products</span>
                </div>
                <div className="flex items-center text-sm">
                  <i className="fas fa-check text-success mr-2"></i>
                  <span>{usageStats.plan === 'pro' ? 'Unlimited' : 'Limited'} keyword tracking</span>
                </div>
                <div className="flex items-center text-sm">
                  <i className="fas fa-check text-success mr-2"></i>
                  <span>AI content generation</span>
                </div>
                {usageStats.plan === 'pro' && (
                  <div className="flex items-center text-sm">
                    <i className="fas fa-check text-success mr-2"></i>
                    <span>Priority support</span>
                  </div>
                )}
              </div>
              
              {usageStats.plan === 'free' ? (
                <Button className="w-full" data-testid="button-upgrade">
                  Upgrade to Pro
                </Button>
              ) : (
                <Button variant="outline" className="w-full" data-testid="button-manage-billing">
                  Manage Billing
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card data-testid="card-usage-stats">
            <CardHeader>
              <CardTitle>Usage This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Products Tracked</span>
                    <span className="text-sm font-medium" data-testid="text-products-usage">
                      {usageStats.productsTracked} / {currentLimits.products === Infinity ? '∞' : currentLimits.products}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ 
                        width: currentLimits.products === Infinity ? '24%' : 
                               `${Math.min(100, (usageStats.productsTracked / currentLimits.products) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">AI Generations</span>
                    <span className="text-sm font-medium" data-testid="text-ai-usage">
                      {usageStats.aiGenerations} / {currentLimits.ai === Infinity ? '∞' : currentLimits.ai}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: currentLimits.ai === Infinity ? '42%' : 
                               `${Math.min(100, (usageStats.aiGenerations / currentLimits.ai) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Rank Checks</span>
                    <span className="text-sm font-medium" data-testid="text-ranks-usage">
                      {usageStats.rankChecks} / {currentLimits.ranks === Infinity ? '∞' : currentLimits.ranks}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ 
                        width: currentLimits.ranks === Infinity ? '65%' : 
                               `${Math.min(100, (usageStats.rankChecks / currentLimits.ranks) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card data-testid="card-support">
            <CardHeader>
              <CardTitle>Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" data-testid="button-documentation">
                  <div className="flex items-center">
                    <i className="fas fa-book text-primary mr-3"></i>
                    <div>
                      <div className="font-medium text-sm">Documentation</div>
                      <div className="text-xs text-gray-500">Learn how to use all features</div>
                    </div>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" data-testid="button-contact-support">
                  <div className="flex items-center">
                    <i className="fas fa-comments text-primary mr-3"></i>
                    <div>
                      <div className="font-medium text-sm">Contact Support</div>
                      <div className="text-xs text-gray-500">Get help from our team</div>
                    </div>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" data-testid="button-report-bug">
                  <div className="flex items-center">
                    <i className="fas fa-bug text-primary mr-3"></i>
                    <div>
                      <div className="font-medium text-sm">Report Bug</div>
                      <div className="text-xs text-gray-500">Help us improve the platform</div>
                    </div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Card data-testid="card-sign-out">
            <CardContent className="pt-6">
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={handleSignOut}
                data-testid="button-sign-out"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

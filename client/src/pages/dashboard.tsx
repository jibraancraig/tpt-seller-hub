import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/supabase';
import StatsCard from '@/components/ui/stats-card';
import ProductCard from '@/components/ui/product-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await db.getProducts(user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const { data: keywords = [], isLoading: keywordsLoading } = useQuery({
    queryKey: ['keywords', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await db.getKeywords();
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['sales', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await db.getSales(user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Calculate stats
  const stats = {
    totalProducts: products.length,
    trackedKeywords: keywords.length,
    avgRankChange: keywords.length > 0 ? 
      keywords.reduce((acc, k) => acc + (k.rank_change || 0), 0) / keywords.length : 0,
    revenue: sales.reduce((acc, s) => acc + (s.revenue || 0), 0)
  };

  const recentProducts = products.slice(0, 5);

  const quickActions = [
    {
      title: 'Add New Product',
      icon: 'fas fa-plus',
      action: () => navigate('/import'),
      testId: 'button-add-product'
    },
    {
      title: 'Generate Social Content',
      icon: 'fas fa-magic',
      action: () => navigate('/social'),
      testId: 'button-generate-social'
    },
    {
      title: 'Check Rankings',
      icon: 'fas fa-chart-line',
      action: () => navigate('/rank'),
      testId: 'button-check-rankings'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      message: 'SEO score improved for "Math Worksheets"',
      time: '2 hours ago'
    },
    {
      id: 2,
      message: 'New keyword "algebra activities" added',
      time: '4 hours ago'
    },
    {
      id: 3,
      message: 'Social content generated for 3 products',
      time: '1 day ago'
    },
    {
      id: 4,
      message: 'Rank improved for "geometry worksheets"',
      time: '2 days ago'
    }
  ];

  if (productsLoading || keywordsLoading || salesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900" data-testid="text-page-title">Dashboard</h1>
        <p className="mt-2 text-gray-600" data-testid="text-page-description">Overview of your TPT optimization progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Products"
          value={stats.totalProducts.toString()}
          icon="boxes"
          color="blue"
          testId="stats-products"
        />
        <StatsCard
          title="Tracked Keywords"
          value={stats.trackedKeywords.toString()}
          icon="search"
          color="green"
          testId="stats-keywords"
        />
        <StatsCard
          title="Avg Rank Δ7"
          value={stats.avgRankChange >= 0 ? `+${stats.avgRankChange.toFixed(1)}` : stats.avgRankChange.toFixed(1)}
          icon="chart-line"
          color={stats.avgRankChange >= 0 ? "green" : "red"}
          testId="stats-rank-change"
        />
        <StatsCard
          title="Revenue (Last 30d)"
          value={`$${stats.revenue.toFixed(0)}`}
          icon="dollar-sign"
          color="green"
          testId="stats-revenue"
        />
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Products */}
        <div className="lg:col-span-2">
          <Card data-testid="card-recent-products">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Products</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/import')}
                  data-testid="button-view-all-products"
                >
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentProducts.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <i className="fas fa-boxes text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500 mb-2">No products yet</p>
                  <p className="text-sm text-gray-400 mb-4">Import your first product to get started</p>
                  <Button onClick={() => navigate('/import')} data-testid="button-import-first-product">
                    Import Products
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white" data-testid="card-quick-actions">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-none"
                  onClick={action.action}
                  data-testid={action.testId}
                >
                  <i className={`${action.icon} mr-2`}></i>
                  {action.title}
                </Button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card data-testid="card-recent-activity">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start" data-testid={`activity-${activity.id}`}>
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

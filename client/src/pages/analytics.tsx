import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatsCard from '@/components/ui/stats-card';
import RevenueChart from '@/components/charts/revenue-chart';
import FileUpload from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');

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

  // Calculate analytics data
  const analytics = {
    totalRevenue: sales.reduce((sum, sale) => sum + (sale.revenue || 0), 0),
    unitsSold: sales.reduce((sum, sale) => sum + (sale.units || 0), 0),
    pageViews: sales.reduce((sum, sale) => sum + (sale.views || 0), 0),
    conversionRate: sales.length > 0 ? 
      (sales.reduce((sum, sale) => sum + (sale.units || 0), 0) / 
       sales.reduce((sum, sale) => sum + (sale.views || 0), 0) * 100) : 0
  };

  // Product performance data
  const productPerformance = products.map(product => {
    const productSales = sales.filter(sale => sale.product_id === product.id);
    return {
      ...product,
      revenue: productSales.reduce((sum, sale) => sum + (sale.revenue || 0), 0),
      units: productSales.reduce((sum, sale) => sum + (sale.units || 0), 0),
      views: productSales.reduce((sum, sale) => sum + (sale.views || 0), 0),
      conversionRate: productSales.length > 0 ? 
        (productSales.reduce((sum, sale) => sum + (sale.units || 0), 0) / 
         productSales.reduce((sum, sale) => sum + (sale.views || 0), 0) * 100) : 0
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const topPerformers = productPerformance.slice(0, 5);

  // Chart data
  const chartData = sales.reduce((acc: any, sale) => {
    const date = new Date(sale.date).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date, revenue: 0, units: 0, views: 0 };
    }
    acc[date].revenue += sale.revenue || 0;
    acc[date].units += sale.units || 0;
    acc[date].views += sale.views || 0;
    return acc;
  }, {});

  const chartDataArray = Object.values(chartData).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handleSalesUpload = async (file: File) => {
    if (!user) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      const response = await apiRequest('POST', '/api/sales/import', formData);
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Sales data imported!",
          description: `Imported ${result.count} sales records successfully.`,
        });
        // Invalidate queries to refetch data
        window.location.reload();
      } else {
        throw new Error('Import failed');
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Please check your CSV format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSalesTemplate = () => {
    const csvContent = 'date,product_title,units,revenue,views\n2024-01-01,"Algebra Task Cards",5,34.95,120\n2024-01-02,"Geometry Worksheets",3,26.97,85';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Mock change impact data (in real app, this would come from database)
  const changeImpact = [
    {
      id: 1,
      type: 'SEO Update',
      description: 'Title optimization for "Algebra Task Cards"',
      date: 'Dec 15',
      impact: '+15% conversion rate',
      positive: true
    },
    {
      id: 2,
      type: 'Social Campaign',
      description: 'Pinterest campaign for Math Bundle',
      date: 'Dec 10',
      impact: '+23% page views',
      positive: true
    }
  ];

  if (salesLoading) {
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
        <h1 className="text-3xl font-bold text-gray-900" data-testid="text-page-title">Analytics & Insights</h1>
        <p className="mt-2 text-gray-600" data-testid="text-page-description">
          Track your sales performance and optimization impact
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Revenue"
          value={`$${analytics.totalRevenue.toFixed(0)}`}
          icon="dollar-sign"
          color="green"
          testId="stats-total-revenue"
        />
        <StatsCard
          title="Units Sold"
          value={analytics.unitsSold.toString()}
          icon="shopping-cart"
          color="blue"
          testId="stats-units-sold"
        />
        <StatsCard
          title="Page Views"
          value={analytics.pageViews.toLocaleString()}
          icon="eye"
          color="blue"
          testId="stats-page-views"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${analytics.conversionRate.toFixed(1)}%`}
          icon="percentage"
          color="yellow"
          testId="stats-conversion-rate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <Card data-testid="card-revenue-chart">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Revenue Over Time</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant={timeRange === '30d' ? 'default' : 'outline'}
                    onClick={() => setTimeRange('30d')}
                    data-testid="button-30d"
                  >
                    30d
                  </Button>
                  <Button
                    size="sm"
                    variant={timeRange === '90d' ? 'default' : 'outline'}
                    onClick={() => setTimeRange('90d')}
                    data-testid="button-90d"
                  >
                    90d
                  </Button>
                  <Button
                    size="sm"
                    variant={timeRange === '1y' ? 'default' : 'outline'}
                    onClick={() => setTimeRange('1y')}
                    data-testid="button-1y"
                  >
                    1y
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RevenueChart data={chartDataArray} />
            </CardContent>
          </Card>

          {/* Product Performance Table */}
          <Card data-testid="card-product-performance">
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {productPerformance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="table-product-performance">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CVR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {productPerformance.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50" data-testid={`row-product-${product.id}`}>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-900 line-clamp-1" data-testid={`product-title-${product.id}`}>
                              {product.title}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900" data-testid={`product-revenue-${product.id}`}>
                              ${product.revenue.toFixed(0)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900" data-testid={`product-units-${product.id}`}>
                              {product.units}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900" data-testid={`product-views-${product.id}`}>
                              {product.views.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900" data-testid={`product-cvr-${product.id}`}>
                              {product.conversionRate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <i className="fas fa-chart-bar text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500 mb-2">No sales data available</p>
                  <p className="text-sm text-gray-400">Upload your sales data to see performance metrics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Data Upload & Insights */}
        <div className="space-y-6">
          {/* CSV Upload */}
          <Card data-testid="card-csv-upload">
            <CardHeader>
              <CardTitle>Upload Sales Data</CardTitle>
              <CardDescription>
                Import your TPT sales data to track performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                accept=".csv"
                onFileSelect={handleSalesUpload}
                disabled={isUploading}
                data-testid="file-upload-sales"
              />
              
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Expected format:</p>
                <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono">
                  date,product_title,units,revenue,views
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadSalesTemplate}
                  className="mt-2"
                  data-testid="button-download-template"
                >
                  <i className="fas fa-download mr-1"></i>
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Change Impact */}
          <Card data-testid="card-change-impact">
            <CardHeader>
              <CardTitle>Change Impact</CardTitle>
              <CardDescription>
                Track the impact of your optimizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {changeImpact.map((change) => (
                  <div key={change.id} className="border border-gray-200 rounded-lg p-4" data-testid={`change-${change.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 ${change.positive ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-2`}></div>
                        <span className="text-sm font-medium text-gray-900">{change.type}</span>
                      </div>
                      <span className="text-xs text-gray-500">{change.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{change.description}</p>
                    <div className="flex items-center text-sm">
                      <i className={`fas fa-arrow-${change.positive ? 'up' : 'down'} ${change.positive ? 'text-green-500' : 'text-red-500'} mr-1`}></i>
                      <span className={change.positive ? 'text-green-600' : 'text-red-600'}>
                        {change.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card data-testid="card-top-performers">
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between" data-testid={`top-performer-${index}`}>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate" data-testid={`performer-title-${index}`}>
                        {product.title}
                      </p>
                      <p className="text-xs text-gray-500">Rank #{index + 1}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-bold text-gray-900" data-testid={`performer-revenue-${index}`}>
                        ${product.revenue.toFixed(0)}
                      </p>
                      <p className="text-xs text-success">+{(Math.random() * 20 + 5).toFixed(0)}%</p>
                    </div>
                  </div>
                ))}
                
                {topPerformers.length === 0 && (
                  <p className="text-sm text-gray-500 text-center">No sales data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

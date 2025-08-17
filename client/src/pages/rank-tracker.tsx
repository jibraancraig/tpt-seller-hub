import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import StatsCard from '@/components/ui/stats-card';
import RankChart from '@/components/charts/rank-chart';
import { apiRequest } from '@/lib/queryClient';

export default function RankTrackerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('us');
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [searchTerm, setSearchTerm] = useState('');

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

  const { data: keywords = [], isLoading: keywordsLoading } = useQuery({
    queryKey: ['keywords'],
    queryFn: async () => {
      const { data, error } = await db.getKeywords();
      if (error) throw error;
      return data || [];
    }
  });

  const addKeywordMutation = useMutation({
    mutationFn: async () => {
      if (!newKeyword.trim() || !selectedProductId) {
        throw new Error('Please fill in all fields');
      }
      
      const response = await apiRequest('POST', '/api/keywords', {
        phrase: newKeyword.trim(),
        productId: selectedProductId,
        country: selectedCountry,
        device: selectedDevice
      });
      
      if (!response.ok) throw new Error('Failed to add keyword');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      setNewKeyword('');
      toast({
        title: "Keyword added!",
        description: "New keyword is now being tracked.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add keyword",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const refreshRanksMutation = useMutation({
    mutationFn: async (keywordIds?: string[]) => {
      const response = await apiRequest('POST', '/api/ranks/refresh', {
        keywordIds
      });
      
      if (!response.ok) throw new Error('Failed to refresh ranks');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      toast({
        title: "Ranks updated!",
        description: `Refreshed ${data.processed} keyword rankings.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Refresh failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter keywords based on search
  const filteredKeywords = keywords.filter(keyword =>
    keyword.phrase.toLowerCase().includes(searchTerm.toLowerCase()) ||
    keyword.product?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const stats = {
    totalKeywords: keywords.length,
    improved: keywords.filter(k => k.rank_change > 0).length,
    declined: keywords.filter(k => k.rank_change < 0).length,
    topTen: keywords.filter(k => k.current_rank && k.current_rank <= 10).length
  };

  const countries = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'gb', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' }
  ];

  const devices = [
    { value: 'desktop', label: 'Desktop' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'tablet', label: 'Tablet' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900" data-testid="text-page-title">Keyword & Rank Tracker</h1>
        <p className="mt-2 text-gray-600" data-testid="text-page-description">
          Monitor your product rankings and keyword performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Keywords"
          value={stats.totalKeywords.toString()}
          icon="search"
          color="blue"
          testId="stats-total-keywords"
        />
        <StatsCard
          title="Improved"
          value={stats.improved.toString()}
          icon="arrow-up"
          color="green"
          testId="stats-improved"
        />
        <StatsCard
          title="Declined"
          value={stats.declined.toString()}
          icon="arrow-down"
          color="red"
          testId="stats-declined"
        />
        <StatsCard
          title="Top 10"
          value={stats.topTen.toString()}
          icon="trophy"
          color="yellow"
          testId="stats-top-ten"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Keyword Table */}
        <div className="lg:col-span-2">
          <Card data-testid="card-keyword-table">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle>Keyword Rankings</CardTitle>
                <div className="flex items-center space-x-3">
                  <Input
                    placeholder="Search keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-48"
                    data-testid="input-search-keywords"
                  />
                  <Button
                    onClick={() => refreshRanksMutation.mutate()}
                    disabled={refreshRanksMutation.isPending}
                    data-testid="button-refresh-all"
                  >
                    {refreshRanksMutation.isPending ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    ) : (
                      <i className="fas fa-sync-alt mr-2"></i>
                    )}
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {keywordsLoading ? (
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : filteredKeywords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="table-keywords">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Keyword
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Change
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredKeywords.map((keyword) => (
                        <tr key={keyword.id} className="hover:bg-gray-50" data-testid={`row-keyword-${keyword.id}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900" data-testid={`keyword-phrase-${keyword.id}`}>
                              {keyword.phrase}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600 truncate max-w-32" data-testid={`product-title-${keyword.id}`}>
                              {keyword.product?.title || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900" data-testid={`current-rank-${keyword.id}`}>
                              {keyword.current_rank ? `#${keyword.current_rank}` : 'Not ranked'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {keyword.rank_change ? (
                              <span className={`inline-flex items-center text-sm ${
                                keyword.rank_change > 0 ? 'text-green-600' : 'text-red-600'
                              }`} data-testid={`rank-change-${keyword.id}`}>
                                <i className={`fas fa-arrow-${keyword.rank_change > 0 ? 'up' : 'down'} mr-1`}></i>
                                {Math.abs(keyword.rank_change)}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => refreshRanksMutation.mutate([keyword.id])}
                              disabled={refreshRanksMutation.isPending}
                              data-testid={`button-refresh-${keyword.id}`}
                            >
                              <i className="fas fa-sync-alt mr-1"></i>
                              Refresh
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500 mb-2">No keywords tracked yet</p>
                  <p className="text-sm text-gray-400">Add your first keyword to start tracking rankings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add Keyword & Controls */}
        <div className="space-y-6">
          <Card data-testid="card-add-keyword">
            <CardHeader>
              <CardTitle>Add New Keyword</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                addKeywordMutation.mutate();
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keyword Phrase</label>
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="math worksheets"
                    data-testid="input-new-keyword"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger data-testid="select-product">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger data-testid="select-country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Device</label>
                    <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                      <SelectTrigger data-testid="select-device">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.map((device) => (
                          <SelectItem key={device.value} value={device.value}>
                            {device.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={addKeywordMutation.isPending || !newKeyword.trim() || !selectedProductId}
                  data-testid="button-add-keyword"
                >
                  {addKeywordMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    'Track Keyword'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Rank History Chart */}
          <Card data-testid="card-rank-history">
            <CardHeader>
              <CardTitle>Rank History</CardTitle>
            </CardHeader>
            <CardContent>
              <RankChart keywords={keywords.slice(0, 5)} />
            </CardContent>
          </Card>

          {/* Alert Settings */}
          <Card data-testid="card-alert-settings">
            <CardHeader>
              <CardTitle>Alert Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    defaultChecked
                    data-testid="checkbox-rank-improvements"
                  />
                  <span className="ml-2 text-sm text-gray-700">Rank improvements</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    defaultChecked
                    data-testid="checkbox-significant-drops"
                  />
                  <span className="ml-2 text-sm text-gray-700">Significant drops</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    data-testid="checkbox-weekly-reports"
                  />
                  <span className="ml-2 text-sm text-gray-700">Weekly reports</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

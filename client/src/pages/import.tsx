import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import FileUpload from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

export default function ImportPage() {
  const [, navigate] = useLocation();
  const [urls, setUrls] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCSVUpload = async (file: File) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      const response = await apiRequest('POST', '/api/import/csv', formData);
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Import successful!",
          description: `Imported ${result.count} products successfully.`,
        });
        navigate('/dashboard');
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
      setIsLoading(false);
    }
  };

  const handleURLImport = async () => {
    if (!user || !urls.trim()) return;
    
    setIsLoading(true);
    try {
      const urlList = urls.split('\n').filter(url => url.trim());
      
      const response = await apiRequest('POST', '/api/import/urls', {
        urls: urlList,
        userId: user.id
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Import successful!",
          description: `Imported ${result.count} products from URLs.`,
        });
        navigate('/dashboard');
      } else {
        throw new Error('Import failed');
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Please check your URLs and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = 'title,description,tags,tpt_url,price\n"Algebra Task Cards","40 printable cards covering linear equations","math;algebra",https://www.teacherspayteachers.com/Product/12345,6.99\n"Geometry Worksheets","Comprehensive geometry practice sheets","math;geometry",https://www.teacherspayteachers.com/Product/67890,8.99';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900" data-testid="text-page-title">Import Your Products</h1>
        <p className="mt-2 text-gray-600" data-testid="text-page-description">Get started by importing your existing TPT products</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CSV Upload Card */}
        <Card data-testid="card-csv-upload">
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-file-csv text-primary mr-2"></i>
              Upload CSV File
            </CardTitle>
            <CardDescription>
              Import multiple products at once from a CSV file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              accept=".csv"
              onFileSelect={handleCSVUpload}
              disabled={isLoading}
              data-testid="file-upload-csv"
            />
            
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Expected columns:</p>
              <div className="flex flex-wrap gap-2">
                {['title', 'description', 'tags', 'tpt_url', 'price'].map(column => (
                  <span key={column} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {column}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* URL List Import */}
        <Card data-testid="card-url-import">
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-link text-primary mr-2"></i>
              Paste Product URLs
            </CardTitle>
            <CardDescription>
              Import products by pasting TPT URLs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your TPT product URLs, one per line..."
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              className="h-32 resize-none"
              data-testid="textarea-urls"
            />
            <Button
              onClick={handleURLImport}
              disabled={!urls.trim() || isLoading}
              className="mt-4 w-full"
              data-testid="button-import-urls"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Importing...
                </div>
              ) : (
                'Import from URLs'
              )}
            </Button>
            <p className="mt-2 text-xs text-gray-500">
              We'll automatically fetch product details for each URL
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sample Data */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6" data-testid="section-sample-data">
        <h4 className="text-sm font-medium text-blue-900 mb-3">
          <i className="fas fa-download mr-2"></i>
          Sample CSV Format
        </h4>
        <div className="bg-white rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <div>title,description,tags,tpt_url,price</div>
          <div className="text-gray-600">
            "Algebra Task Cards","40 printable cards covering linear equations","math;algebra",https://www.teacherspayteachers.com/Product/12345,6.99
          </div>
        </div>
        <Button
          variant="outline"
          onClick={downloadSampleCSV}
          className="mt-3 text-sm"
          data-testid="button-download-sample"
        >
          Download sample CSV
        </Button>
      </div>

      {/* Skip for now option */}
      <div className="mt-8 text-center">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          data-testid="button-skip-import"
        >
          Skip for now and explore dashboard
        </Button>
      </div>
    </div>
  );
}

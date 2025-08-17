import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description?: string;
    price?: number;
    seoScore?: number;
    avgRank?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [, navigate] = useLocation();

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors" data-testid={`product-card-${product.id}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate" data-testid={`product-title-${product.id}`}>
            {product.title}
          </h4>
          <p className="text-sm text-gray-500 truncate" data-testid={`product-description-${product.id}`}>
            {product.description || 'No description available'}
          </p>
          <div className="flex items-center mt-2 space-x-4">
            {product.seoScore && (
              <div className="flex items-center">
                <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
                <span className="text-xs text-gray-600" data-testid={`product-seo-score-${product.id}`}>
                  SEO: {product.seoScore}%
                </span>
              </div>
            )}
            {product.avgRank && (
              <div className="flex items-center">
                <span className="text-xs text-gray-600">Rank #</span>
                <span className="text-xs font-medium text-gray-900 ml-1" data-testid={`product-rank-${product.id}`}>
                  {product.avgRank}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="ml-4 flex items-center space-x-4">
          {product.price && (
            <span className="text-sm font-medium text-gray-900" data-testid={`product-price-${product.id}`}>
              ${product.price}
            </span>
          )}
          <Button
            size="sm"
            onClick={() => navigate(`/product/${product.id}`)}
            data-testid={`button-view-product-${product.id}`}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}

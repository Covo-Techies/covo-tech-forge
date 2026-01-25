import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/currency';
import { ShoppingCart, Clock } from 'lucide-react';

interface RecentlyViewedProductsProps {
  excludeProductId?: string;
  maxItems?: number;
}

export default function RecentlyViewedProducts({ excludeProductId, maxItems = 4 }: RecentlyViewedProductsProps) {
  const { products, loading, hasRecentlyViewed } = useRecentlyViewed();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const filteredProducts = excludeProductId
    ? products.filter(p => p.id !== excludeProductId).slice(0, maxItems)
    : products.slice(0, maxItems);

  const handleAddToCart = async (product: { id: string; name: string }) => {
    try {
      await addToCart(product.id, 1);
      toast({
        title: "Added to Cart",
        description: `${product.name} added to cart`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return null;
  }

  if (!hasRecentlyViewed || filteredProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Recently Viewed</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
            <Link to={`/product/${product.id}`}>
              <div className="relative aspect-square">
                <img
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
            <CardContent className="p-4">
              <Link to={`/product/${product.id}`}>
                <h3 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center justify-between">
                <span className="font-bold">{formatCurrency(product.price)}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

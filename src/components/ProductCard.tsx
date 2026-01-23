import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock_quantity: number;
  featured: boolean;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product.id);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  return (
    <Card className="group hover-lift transition-all duration-300 animate-fade-in relative">
      <CardHeader className="p-0">
        <Link to={`/product/${product.id}`}>
          <div className="aspect-square overflow-hidden rounded-t-lg">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
        {product.featured && (
          <Badge className="absolute top-2 left-2" variant="secondary">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background",
            inWishlist && "text-red-500 hover:text-red-600"
          )}
          onClick={handleWishlistToggle}
        >
          <Heart className={cn("w-5 h-5", inWishlist && "fill-current")} />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <Link to={`/product/${product.id}`} className="story-link">
          <CardTitle className="text-lg mb-2 hover:text-primary transition-colors">{product.name}</CardTitle>
        </Link>
        <p className="text-muted-foreground text-sm mb-3">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">KSH {product.price.toFixed(2)}</span>
          <Badge variant="outline">{product.category}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0}
          className="w-full hover-scale"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardFooter>
    </Card>
  );
}
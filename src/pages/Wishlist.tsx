import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import SEO from '@/components/SEO';

export default function Wishlist() {
  const { items, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId);
    await removeFromWishlist(productId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Wishlist" description="Your saved products" />
        <div className="container mx-auto px-4 py-16 text-center">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Sign in to view your wishlist</h1>
          <p className="text-muted-foreground mb-6">
            Create an account or sign in to save your favorite products
          </p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Wishlist" description="Your saved products" />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Wishlist" description="Your saved products" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding products you love to your wishlist
            </p>
            <Button asChild>
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <Link to={`/product/${item.product_id}`}>
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                </CardHeader>
                <CardContent className="p-4">
                  <Link to={`/product/${item.product_id}`}>
                    <h3 className="font-semibold hover:text-primary transition-colors line-clamp-2">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.product.category}
                  </p>
                  <p className="text-lg font-bold mt-2">
                    KSH {item.product.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.product.stock_quantity > 0 
                      ? `${item.product.stock_quantity} in stock` 
                      : 'Out of stock'}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex gap-2">
                  <Button
                    onClick={() => handleAddToCart(item.product_id)}
                    disabled={item.product.stock_quantity === 0}
                    className="flex-1"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeFromWishlist(item.product_id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/currency';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  discount?: number;
}

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'inStock' | 'onSale'>('all');
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Mock data - In a real app, this would come from an API or local storage
  useEffect(() => {
    const mockWishlist: WishlistItem[] = [
      {
        id: '1',
        name: 'MacBook Pro 16-inch',
        price: 299999,
        image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400',
        category: 'Laptops',
        inStock: true,
        discount: 10
      },
      {
        id: '2',
        name: 'iPhone 15 Pro',
        price: 149999,
        image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400',
        category: 'Phones',
        inStock: true
      },
      {
        id: '3',
        name: 'AirPods Pro',
        price: 29999,
        image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400',
        category: 'Accessories',
        inStock: false
      },
      {
        id: '4',
        name: 'iPad Air',
        price: 79999,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
        category: 'Tablets',
        inStock: true,
        discount: 5
      }
    ];

    setTimeout(() => {
      setWishlistItems(mockWishlist);
      setLoading(false);
    }, 1000);
  }, []);

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(items => items.filter(item => item.id !== itemId));
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist.",
    });
  };

  const handleAddToCart = async (item: WishlistItem) => {
    if (!item.inStock) {
      toast({
        title: "Out of stock",
        description: "This item is currently out of stock.",
        variant: "destructive"
      });
      return;
    }

    await addToCart(item.id, 1);

    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const filteredItems = wishlistItems.filter(item => {
    if (filter === 'inStock') return item.inStock;
    if (filter === 'onSale') return item.discount && item.discount > 0;
    return true;
  });

  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price * (1 - discount / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
            <p className="text-muted-foreground">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'inStock' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('inStock')}
            >
              In Stock
            </Button>
            <Button
              variant={filter === 'onSale' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('onSale')}
            >
              On Sale
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding items you love to your wishlist
            </p>
            <Button asChild>
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Items Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {filteredItems.map((item) => (
                <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0 relative">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Discount Badge */}
                    {item.discount && (
                      <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                        -{item.discount}%
                      </Badge>
                    )}

                    {/* Stock Status */}
                    <Badge 
                      variant={item.inStock ? "secondary" : "destructive"}
                      className="absolute top-2 right-2"
                    >
                      {item.inStock ? 'In Stock' : 'Out of Stock'}
                    </Badge>

                    {/* Remove Button */}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>

                  <CardContent className="p-4">
                    <Badge variant="outline" className="mb-2">
                      {item.category}
                    </Badge>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {item.discount ? (
                        <>
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(calculateDiscountedPrice(item.price, item.discount))}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            {formatCurrency(item.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(item.price)}
                        </span>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.inStock}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link to={`/product/${item.id}`}>
                        <Filter className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Wishlist Summary</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {wishlistItems.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {wishlistItems.filter(item => item.inStock).length}
                  </div>
                  <div className="text-sm text-muted-foreground">In Stock</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {wishlistItems.filter(item => item.discount).length}
                  </div>
                  <div className="text-sm text-muted-foreground">On Sale</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
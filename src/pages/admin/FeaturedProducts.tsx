import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Star, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock_quantity: number;
  featured: boolean;
  active: boolean;
}

export default function FeaturedProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      
      const allProducts = data || [];
      setProducts(allProducts);
      setFeaturedProducts(allProducts.filter(p => p.featured));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({ 
        title: "Error", 
        description: "Failed to fetch products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (productId: string, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ featured })
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, featured } : p
      ));
      
      if (featured) {
        const product = products.find(p => p.id === productId);
        if (product) {
          setFeaturedProducts(prev => [...prev, { ...product, featured: true }]);
        }
      } else {
        setFeaturedProducts(prev => prev.filter(p => p.id !== productId));
      }

      toast({ 
        title: "Success", 
        description: `Product ${featured ? 'added to' : 'removed from'} featured products`
      });
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast({ 
        title: "Error", 
        description: "Failed to update product",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="fade-in-up">
          <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
          <p className="text-muted-foreground">Manage which products appear as featured on your homepage.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded mb-3" />
                <div className="h-6 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="fade-in-up">
        <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
        <p className="text-muted-foreground">Manage which products appear as featured on your homepage.</p>
      </div>

      {/* Featured Products */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Currently Featured ({featuredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {featuredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No featured products yet. Add some from the list below!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="group hover-scale">
                  <div className="relative">
                    <img 
                      src={product.image_url || "/placeholder.svg"} 
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 left-2" variant="secondary">
                      Featured
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{formatCurrency(product.price)}</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toggleFeatured(product.id, false)}
                        className="hover-scale"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Products */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            All Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="group hover-scale">
                <div className="relative">
                  <img 
                    src={product.image_url || "/placeholder.svg"} 
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  {product.featured && (
                    <Badge className="absolute top-2 left-2" variant="secondary">
                      Featured
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3">
                  <h4 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{formatCurrency(product.price)}</span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.featured}
                        onCheckedChange={(checked) => toggleFeatured(product.id, checked)}
                      />
                      <span className="text-xs">Featured</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
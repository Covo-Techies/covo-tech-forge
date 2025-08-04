import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/currency';
import { 
  Star, 
  ShoppingCart, 
  Heart,
  Truck,
  Shield,
  Headphones,
  ArrowRight,
  Laptop,
  Smartphone,
  Watch
} from 'lucide-react';

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

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .eq('featured', true)
        .limit(4);

      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: "Laptops", icon: Laptop, count: "120+ products", href: "/products?category=Laptops" },
    { name: "Smartphones", icon: Smartphone, count: "85+ products", href: "/products?category=Phones" },
    { name: "Accessories", icon: Headphones, count: "200+ products", href: "/products?category=Accessories" },
    { name: "Tablets", icon: Watch, count: "45+ products", href: "/products?category=Tablets" }
  ];

  const features = [
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick & reliable shipping"
    },
    {
      icon: Shield,
      title: "2-Year Warranty",
      description: "On all our products"
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Expert tech assistance"
    }
  ];

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Latest Tech, 
                <span className="block">Best Prices</span>
              </h1>
              <p className="text-xl mb-8 text-primary-foreground/90">
                Discover cutting-edge technology with unbeatable deals. From laptops to accessories, we've got everything you need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/products">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  View Deals
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="/placeholder.svg" 
                alt="Latest tech products" 
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link key={index} to={category.href}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <category.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                    <p className="text-muted-foreground text-sm">{category.count}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Button variant="outline" asChild>
              <Link to="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No featured products available at the moment.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover-scale">
                  <div className="relative">
                    <img 
                      src={product.image_url || "/placeholder.svg"} 
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-2 left-2" variant="secondary">
                      Featured
                    </Badge>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <CardContent className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
                      </div>
                      <Button size="sm" className="hover-scale">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Get the latest tech news and exclusive deals delivered to your inbox
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-md text-foreground"
            />
            <Button variant="secondary">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">COVO Technologies</h3>
              <p className="text-muted-foreground">Your trusted partner for cutting-edge technology solutions.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/products" className="block text-muted-foreground hover:text-foreground">Shop</Link>
                <Link to="/about" className="block text-muted-foreground hover:text-foreground">About</Link>
                <Link to="/contact" className="block text-muted-foreground hover:text-foreground">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <div className="space-y-2">
                <Link to="/products?category=Laptops" className="block text-muted-foreground hover:text-foreground">Laptops</Link>
                <Link to="/products?category=Phones" className="block text-muted-foreground hover:text-foreground">Phones</Link>
                <Link to="/products?category=Accessories" className="block text-muted-foreground hover:text-foreground">Accessories</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <Link to="/help" className="block text-muted-foreground hover:text-foreground">Help Center</Link>
                <Link to="/returns" className="block text-muted-foreground hover:text-foreground">Returns</Link>
                <Link to="/warranty" className="block text-muted-foreground hover:text-foreground">Warranty</Link>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 COVO Technologies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

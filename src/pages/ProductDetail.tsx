import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ShoppingCart, ZoomIn, Minus, Plus } from 'lucide-react';

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

interface Review {
  id: string;
  rating: number;
  comment: string;
  customer_name: string;
  created_at: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  // Mock data for demo - in real app, fetch from database
  const mockReviews: Review[] = [
    {
      id: '1',
      rating: 5,
      comment: 'Excellent quality product! Highly recommended.',
      customer_name: 'John Doe',
      created_at: '2024-01-15'
    },
    {
      id: '2',
      rating: 4,
      comment: 'Good value for money. Fast delivery.',
      customer_name: 'Jane Smith',
      created_at: '2024-01-10'
    },
    {
      id: '3',
      rating: 5,
      comment: 'Amazing product! Exceeded my expectations.',
      customer_name: 'Mike Johnson',
      created_at: '2024-01-05'
    }
  ];

  const mockSpecs = {
    'Weight': '1.2 kg',
    'Dimensions': '30 x 20 x 10 cm',
    'Material': 'High-quality plastic',
    'Warranty': '2 years',
    'Color': 'Multiple options available'
  };

  // Mock multiple images - in real app, store in database
  const mockImages = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800'
  ];

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive"
      });
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart(product.id, quantity);
      toast({
        title: "Added to Cart",
        description: `${quantity} x ${product.name} added to cart`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive"
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZooming) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const averageRating = mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length;
  const currentImage = product.image_url || mockImages[selectedImage];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div 
              className="relative aspect-square overflow-hidden rounded-lg border cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
            >
              <img
                src={currentImage}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-200 ${
                  isZooming ? 'scale-150' : 'scale-100'
                }`}
                style={
                  isZooming
                    ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }
                    : {}
                }
              />
              {isZooming && (
                <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded">
                  <ZoomIn className="h-4 w-4" />
                </div>
              )}
            </div>
            
            {/* Image thumbnails */}
            <div className="flex gap-2 overflow-x-auto">
              {mockImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                    selectedImage === index ? 'border-primary' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {renderStars(Math.floor(averageRating))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({mockReviews.length} reviews)
                  </span>
                </div>
                {product.featured && <Badge variant="secondary">Featured</Badge>}
              </div>
              <p className="text-2xl font-bold text-primary">KSH {product.price.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-muted-foreground mb-4">{product.description}</p>
              <Badge variant="outline">{product.category}</Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Quantity:</label>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {product.stock_quantity > 0 ? (
                  <span className="text-green-600">{product.stock_quantity} in stock</span>
                ) : (
                  <span className="text-red-600">Out of stock</span>
                )}
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-4">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-2">Product Description</h3>
                  <p className="text-muted-foreground">
                    {product.description || 'No detailed description available.'}
                  </p>
                  <p className="text-muted-foreground mt-4">
                    This high-quality product is designed to meet your needs with excellent craftsmanship 
                    and attention to detail. Whether you're a professional or an enthusiast, this product 
                    will exceed your expectations.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="specifications" className="mt-4">
                <h3 className="text-lg font-semibold mb-4">Product Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(mockSpecs).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b">
                      <span className="font-medium">{key}:</span>
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-4">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Customer Reviews</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(Math.floor(averageRating))}</div>
                      <span className="text-sm text-muted-foreground">
                        {averageRating.toFixed(1)} out of 5
                      </span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    {mockReviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.customer_name}</span>
                            <div className="flex">{renderStars(review.rating)}</div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
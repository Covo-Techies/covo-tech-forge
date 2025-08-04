import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Star, ShoppingCart, ZoomIn, Minus, Plus, ThumbsUp, ThumbsDown, ImageIcon, Upload, Link2, Shield } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock_quantity: number;
  featured: boolean;
  specifications: any;
}

interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string;
  view_angle: string;
  display_order: number;
  is_primary: boolean;
}

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  verified_purchase: boolean;
  helpful_count: number;
  total_votes: number;
  user_id: string;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [reviewSortBy, setReviewSortBy] = useState('most_recent');
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  
  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: [] as string[]
  });

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const fetchProductData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Fetch product details
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (productError) throw productError;
      setProduct(productData);

      // Fetch product images
      const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id)
        .order('display_order', { ascending: true });

      if (!imagesError && imagesData) {
        setProductImages(imagesData);
      }

      // Fetch reviews with profile data
      let reviewsQuery = supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .eq('product_id', id)
        .eq('moderation_status', 'approved');

      // Apply sorting
      if (reviewSortBy === 'most_recent') {
        reviewsQuery = reviewsQuery.order('created_at', { ascending: false });
      } else if (reviewSortBy === 'most_helpful') {
        reviewsQuery = reviewsQuery.order('helpful_count', { ascending: false });
      } else if (reviewSortBy === 'highest_rated') {
        reviewsQuery = reviewsQuery.order('rating', { ascending: false });
      }

      const { data: reviewsData, error: reviewsError } = await reviewsQuery;

      if (!reviewsError && reviewsData) {
        // Transform the data to match our Review interface
        const transformedReviews = reviewsData.map(review => ({
          id: review.id,
          rating: review.rating || 5,
          title: review.title || '',
          comment: review.comment || '',
          images: Array.isArray(review.images) ? review.images.filter((img): img is string => typeof img === 'string') : [],
          verified_purchase: review.verified_purchase || false,
          helpful_count: review.helpful_count || 0,
          total_votes: review.total_votes || 0,
          user_id: review.user_id,
          created_at: review.created_at,
          profiles: review.profiles && !('error' in review.profiles) ? review.profiles : undefined
        }));
        setReviews(transformedReviews);
      }

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

  const handleSubmitReview = async () => {
    if (!user || !product) {
      toast({
        title: "Error", 
        description: "Please log in to leave a review",
        variant: "destructive"
      });
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast({
        title: "Error",
        description: "Please write a review comment",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if user has purchased this product (simplified check)
      const { data: orderData } = await supabase
        .from('order_items')
        .select('id, orders!inner(*)')
        .eq('product_id', product.id)
        .eq('orders.user_id', user.id)
        .limit(1);

      const verified_purchase = orderData && orderData.length > 0;

      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: product.id,
          user_id: user.id,
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
          images: reviewForm.images,
          verified_purchase,
          moderation_status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Your review has been submitted for moderation"
      });

      setShowReviewDialog(false);
      setReviewForm({ rating: 5, title: '', comment: '', images: [] });
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    }
  };

  const handleReviewVote = async (reviewId: string, helpful: boolean) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to vote",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('review_votes')
        .select('id, helpful')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        if (existingVote.helpful === helpful) {
          // Remove vote if clicking same button
          await supabase
            .from('review_votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          // Update vote if clicking different button
          await supabase
            .from('review_votes')
            .update({ helpful })
            .eq('id', existingVote.id);
        }
      } else {
        // Insert new vote
        await supabase
          .from('review_votes')
          .insert({
            review_id: reviewId,
            user_id: user.id,
            helpful
          });
      }

      // Refresh reviews to show updated counts
      fetchProductData();
      
    } catch (error) {
      console.error('Error voting on review:', error);
      toast({
        title: "Error",
        description: "Failed to vote",
        variant: "destructive"
      });
    }
  };

  const addImageToReview = (imageUrl: string) => {
    if (reviewForm.images.length >= 5) {
      toast({
        title: "Limit Reached",
        description: "Maximum 5 images allowed per review",
        variant: "destructive"
      });
      return;
    }
    
    setReviewForm(prev => ({
      ...prev,
      images: [...prev.images, imageUrl]
    }));
  };

  const removeImageFromReview = (index: number) => {
    setReviewForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZooming) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${interactive ? 'cursor-pointer' : ''} ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
        onClick={interactive && onRatingChange ? () => onRatingChange(i + 1) : undefined}
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

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;

  const displayImages = productImages.length > 0 ? productImages : [{ 
    id: 'default', 
    image_url: product.image_url, 
    alt_text: product.name,
    view_angle: 'main',
    display_order: 0,
    is_primary: true 
  }];

  const currentImage = displayImages[selectedImage]?.image_url || product.image_url;

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
                alt={displayImages[selectedImage]?.alt_text || product.name}
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
            
            {/* Image thumbnails with view angles */}
            {displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {displayImages.map((image, index) => (
                  <div key={image.id} className="flex-shrink-0">
                    <button
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded border-2 overflow-hidden ${
                        selectedImage === index ? 'border-primary' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image.image_url}
                        alt={image.alt_text}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <p className="text-xs text-center mt-1 text-muted-foreground">
                      {image.view_angle}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {renderStars(Math.floor(averageRating))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({reviews.length} reviews)
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
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-4">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-2">Product Description</h3>
                  <p className="text-muted-foreground">
                    {product.description || 'No detailed description available.'}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="specifications" className="mt-4">
                <h3 className="text-lg font-semibold mb-4">Product Specifications</h3>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b">
                        <span className="font-medium">{key}:</span>
                        <span className="text-muted-foreground">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No specifications available.</p>
                )}
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-4">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Customer Reviews</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(Math.floor(averageRating))}</div>
                        <span className="text-sm text-muted-foreground">
                          {averageRating.toFixed(1)} out of 5
                        </span>
                      </div>
                      
                      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline">Write Review</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Write a Review</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Rating</Label>
                              <div className="flex items-center gap-2">
                                {renderStars(reviewForm.rating, true, (rating) => 
                                  setReviewForm(prev => ({ ...prev, rating }))
                                )}
                                <span className="text-sm text-muted-foreground">
                                  ({reviewForm.rating}/5)
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="review-title">Title (Optional)</Label>
                              <Input
                                id="review-title"
                                value={reviewForm.title}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Brief summary of your review"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="review-comment">Review *</Label>
                              <Textarea
                                id="review-comment"
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                placeholder="Share your experience with this product..."
                                rows={4}
                              />
                            </div>
                            
                            <div>
                              <Label>Images (Optional)</Label>
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Paste image URL..."
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        const input = e.target as HTMLInputElement;
                                        if (input.value.trim()) {
                                          addImageToReview(input.value.trim());
                                          input.value = '';
                                        }
                                      }
                                    }}
                                  />
                                  <Button type="button" variant="outline" size="sm">
                                    <Link2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                {reviewForm.images.length > 0 && (
                                  <div className="flex gap-2 flex-wrap">
                                    {reviewForm.images.map((img, index) => (
                                      <div key={index} className="relative">
                                        <img
                                          src={img}
                                          alt={`Review image ${index + 1}`}
                                          className="w-16 h-16 object-cover rounded border"
                                        />
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                          onClick={() => removeImageFromReview(index)}
                                        >
                                          ×
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button onClick={handleSubmitReview} className="flex-1">
                                Submit Review
                              </Button>
                              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Label>Sort by:</Label>
                    <Select value={reviewSortBy} onValueChange={(value) => {
                      setReviewSortBy(value);
                      fetchProductData();
                    }}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="most_recent">Most Recent</SelectItem>
                        <SelectItem value="most_helpful">Most Helpful</SelectItem>
                        <SelectItem value="highest_rated">Highest Rated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    {reviews.length > 0 ? reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {review.profiles?.first_name && review.profiles?.last_name 
                                  ? `${review.profiles.first_name} ${review.profiles.last_name}` 
                                  : 'Anonymous User'}
                              </span>
                              {review.verified_purchase && (
                                <Badge variant="secondary" className="text-xs">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Verified Purchase
                                </Badge>
                              )}
                            </div>
                            <div className="flex">{renderStars(review.rating)}</div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {review.title && (
                          <h4 className="font-medium">{review.title}</h4>
                        )}
                        
                        <p className="text-muted-foreground">{review.comment}</p>
                        
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {review.images.map((img, index) => (
                              <img
                                key={index}
                                src={img}
                                alt={`Review image ${index + 1}`}
                                className="w-20 h-20 object-cover rounded border cursor-pointer"
                                onClick={() => window.open(img, '_blank')}
                              />
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 pt-2">
                          <span className="text-sm text-muted-foreground">
                            Was this helpful?
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReviewVote(review.id, true)}
                              className="flex items-center gap-1"
                            >
                              <ThumbsUp className="h-4 w-4" />
                              {review.helpful_count}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReviewVote(review.id, false)}
                              className="flex items-center gap-1"
                            >
                              <ThumbsDown className="h-4 w-4" />
                              {review.total_votes - review.helpful_count}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No reviews yet. Be the first to review this product!</p>
                      </div>
                    )}
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
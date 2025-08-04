import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import Header from '@/components/layout/Header';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock_quantity: number;
  featured: boolean;
  brand: string | null;
  specifications: any;
  created_at?: string;
  updated_at?: string;
}

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Derived state for filter options
  const availableBrands = Array.from(new Set(products.filter(p => p.brand).map(p => p.brand))).sort();
  const availableSpecs = products.reduce((acc, product) => {
    if (product.specifications) {
      Object.entries(product.specifications).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          if (!acc[key]) acc[key] = new Set();
          acc[key].add(value);
        }
      });
    }
    return acc;
  }, {} as Record<string, Set<string>>);
  
  const availableSpecsArray = Object.fromEntries(
    Object.entries(availableSpecs).map(([key, valueSet]) => [key, Array.from(valueSet).sort()])
  );

  const maxPrice = Math.max(...products.map(p => p.price), 1000000);
  const minPrice = Math.min(...products.map(p => p.price), 0);

  useEffect(() => {
    fetchProducts();
    
    // Handle URL params
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [products, minPrice, maxPrice]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, selectedBrands, priceRange, selectedSpecs, sortBy]);

  const getImageUrl = (image: any): string => {
    if (image?.storage_path) {
      return supabase.storage.from('product-images').getPublicUrl(image.storage_path).data.publicUrl;
    }
    return image?.image_url || '';
  };

  const fetchProducts = async () => {
    try {
      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true);

      if (error) throw error;
      
      // Get primary images for all products
      const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('product_id, image_url, storage_path, is_primary, display_order')
        .eq('is_primary', true);

      if (imagesError) {
        console.error('Error fetching images:', imagesError);
      }

      // Transform the data to include proper image URLs
      const transformedProducts = (productsData || []).map(product => {
        const primaryImage = imagesData?.find(img => img.product_id === product.id);
        
        return {
          ...product,
          image_url: primaryImage ? getImageUrl(primaryImage) : product.image_url
        };
      });
      
      setProducts(transformedProducts as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => 
        product.brand && selectedBrands.includes(product.brand)
      );
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Filter by specifications
    if (Object.keys(selectedSpecs).length > 0) {
      filtered = filtered.filter(product => {
        if (!product.specifications) return false;
        
        return Object.entries(selectedSpecs).every(([specType, values]) => {
          if (values.length === 0) return true;
          const productSpecValue = product.specifications[specType];
          return productSpecValue && values.includes(productSpecValue);
        });
      });
    }

    // Sort products
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'featured':
          return b.featured ? 1 : -1;
        case 'newest':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  if (loading) {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={`${searchParams.get('category') ? `${searchParams.get('category')} - ` : ''}Products - Covo Tech Forge`}
        description="Browse our extensive collection of electronics, laptops, smartphones, and tech accessories. Find the perfect technology products at competitive prices."
        keywords="buy electronics online, laptop prices Kenya, smartphone deals, tech accessories, computer hardware, gadgets store"
      />
      <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={`${searchParams.get('category') ? `${searchParams.get('category')} - ` : ''}Products - Covo Tech Forge`}
        description="Browse our extensive collection of electronics, laptops, smartphones, and tech accessories. Find the perfect technology products at competitive prices."
        keywords="buy electronics online, laptop prices Kenya, smartphone deals, tech accessories, computer hardware, gadgets store"
      />
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block w-80 shrink-0">
            <ProductFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedBrands={selectedBrands}
              onBrandsChange={setSelectedBrands}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              selectedSpecs={selectedSpecs}
              onSpecsChange={setSelectedSpecs}
              availableBrands={availableBrands}
              availableSpecs={availableSpecsArray}
              maxPrice={maxPrice}
              minPrice={minPrice}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-8 animate-fade-in">
              <h1 className="text-3xl font-bold mb-6">Products</h1>
              
              {/* Mobile Filters & Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Mobile Filter Button */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filters
                      {(selectedBrands.length + Object.values(selectedSpecs).flat().length + 
                        (selectedCategory !== 'all' ? 1 : 0) + 
                        (priceRange[0] !== minPrice || priceRange[1] !== maxPrice ? 1 : 0)) > 0 && (
                        <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {selectedBrands.length + Object.values(selectedSpecs).flat().length + 
                           (selectedCategory !== 'all' ? 1 : 0) + 
                           (priceRange[0] !== minPrice || priceRange[1] !== maxPrice ? 1 : 0)}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <div className="mt-6">
                      <ProductFilters
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        selectedBrands={selectedBrands}
                        onBrandsChange={setSelectedBrands}
                        priceRange={priceRange}
                        onPriceRangeChange={setPriceRange}
                        selectedSpecs={selectedSpecs}
                        onSpecsChange={setSelectedSpecs}
                        availableBrands={availableBrands}
                        availableSpecs={availableSpecsArray}
                        maxPrice={maxPrice}
                        minPrice={minPrice}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort and View Controls */}
                <div className="flex gap-4 flex-1 justify-between">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="featured">Featured First</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Mode Toggle */}
                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-r-none"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-l-none"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Results count and active filters */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <Badge variant="outline" className="animate-fade-in">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                </Badge>
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="animate-fade-in">
                    {selectedCategory}
                  </Badge>
                )}
                {selectedBrands.map(brand => (
                  <Badge key={brand} variant="secondary" className="animate-fade-in">
                    {brand}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Products Grid/List */}
            {filteredProducts.length === 0 ? (
              <Card className="animate-fade-in">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold">No products found</h3>
                    <p className="text-muted-foreground max-w-md">
                      We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className={`animate-fade-in ${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                  : 'space-y-4'
              }`}>
                {filteredProducts.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
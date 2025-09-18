import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  brand: string | null;
}

interface LiveSearchBarProps {
  placeholder?: string;
  className?: string;
  onMobileClose?: () => void;
}

export default function LiveSearchBar({ 
  placeholder = "Search for products...", 
  className,
  onMobileClose 
}: LiveSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const getImageUrl = (image: any): string => {
    if (image?.storage_path) {
      return supabase.storage.from('product-images').getPublicUrl(image.storage_path).data.publicUrl;
    }
    return image?.image_url || '';
  };

  const fetchSuggestions = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      const { data: productsData, error } = await supabase
        .from('products')
        .select('id, name, description, price, image_url, category, brand')
        .eq('active', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
        .limit(8);

      if (error) throw error;

      // Get primary images for suggestions
      const productIds = productsData?.map(p => p.id) || [];
      const { data: imagesData } = await supabase
        .from('product_images')
        .select('product_id, image_url, storage_path')
        .eq('is_primary', true)
        .in('product_id', productIds);

      const transformedProducts = (productsData || []).map(product => {
        const primaryImage = imagesData?.find(img => img.product_id === product.id);
        return {
          ...product,
          image_url: primaryImage ? getImageUrl(primaryImage) : product.image_url || '/placeholder.svg'
        };
      });

      setSuggestions(transformedProducts);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
      onMobileClose?.();
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setShowSuggestions(false);
    onMobileClose?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleProductClick(suggestions[selectedIndex].id);
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          className="pl-10 pr-4 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-96 overflow-y-auto">
          {suggestions.map((product, index) => (
            <button
              key={product.id}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 border-b border-border/50 last:border-b-0",
                selectedIndex === index && "bg-muted"
              )}
              onClick={() => handleProductClick(product.id)}
            >
              <div className="w-12 h-12 bg-muted rounded-md overflow-hidden shrink-0">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{product.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-primary font-semibold text-sm">
                    {formatPrice(product.price)}
                  </span>
                  {product.brand && (
                    <Badge variant="outline" className="text-xs">
                      {product.brand}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {product.category}
                </p>
              </div>
            </button>
          ))}
          
          {searchTerm.trim() && (
            <button
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 border-t border-border",
                selectedIndex === -1 && "bg-muted"
              )}
              onClick={handleSearch}
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Search for "<span className="font-medium">{searchTerm}</span>"
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
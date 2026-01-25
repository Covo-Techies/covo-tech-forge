import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock_quantity: number;
}

const STORAGE_KEY = 'recently_viewed_products';
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const ids = JSON.parse(stored);
        setRecentlyViewedIds(ids);
      } catch (e) {
        console.error('Error parsing recently viewed:', e);
      }
    }
    setLoading(false);
  }, []);

  // Fetch products when IDs change
  useEffect(() => {
    const fetchProducts = async () => {
      if (recentlyViewedIds.length === 0) {
        setProducts([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, description, price, image_url, category, stock_quantity')
          .eq('active', true)
          .in('id', recentlyViewedIds);

        if (error) throw error;

        // Sort products to match the order in recentlyViewedIds (most recent first)
        const sortedProducts = recentlyViewedIds
          .map(id => data?.find(p => p.id === id))
          .filter((p): p is Product => p !== undefined);

        setProducts(sortedProducts);
      } catch (error) {
        console.error('Error fetching recently viewed products:', error);
      }
    };

    fetchProducts();
  }, [recentlyViewedIds]);

  const addToRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewedIds(prevIds => {
      // Remove if already exists
      const filtered = prevIds.filter(id => id !== productId);
      // Add to front of list
      const newIds = [productId, ...filtered].slice(0, MAX_ITEMS);
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
      return newIds;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewedIds([]);
    setProducts([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    products,
    loading,
    addToRecentlyViewed,
    clearRecentlyViewed,
    hasRecentlyViewed: products.length > 0
  };
}

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_order_amount: number;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  active: boolean;
}

export const useCoupon = () => {
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateCoupon = async (code: string, orderTotal: number): Promise<Coupon | null> => {
    if (!code || code.trim() === '') {
      toast({
        title: "Invalid Coupon",
        description: "Please enter a coupon code",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Invalid Coupon",
          description: "This coupon code does not exist or has expired",
          variant: "destructive"
        });
        return null;
      }

      // Check if coupon has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast({
          title: "Coupon Expired",
          description: "This coupon has expired",
          variant: "destructive"
        });
        return null;
      }

      // Check usage limit
      if (data.usage_limit !== null && data.used_count >= data.usage_limit) {
        toast({
          title: "Coupon Unavailable",
          description: "This coupon has reached its usage limit",
          variant: "destructive"
        });
        return null;
      }

      // Check minimum order amount
      if (data.minimum_order_amount && orderTotal < data.minimum_order_amount) {
        toast({
          title: "Minimum Order Not Met",
          description: `This coupon requires a minimum order of KSH ${data.minimum_order_amount.toFixed(2)}`,
          variant: "destructive"
        });
        return null;
      }

      const coupon: Coupon = {
        ...data,
        discount_type: data.discount_type as 'percentage' | 'fixed'
      };

      toast({
        title: "Coupon Applied!",
        description: `You saved ${coupon.discount_type === 'percentage' ? coupon.discount_value + '%' : 'KSH ' + coupon.discount_value}`,
      });

      setAppliedCoupon(coupon);
      return coupon;
    } catch (error) {
      console.error('Coupon validation error:', error);
      toast({
        title: "Error",
        description: "Failed to validate coupon. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = (subtotal: number): number => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.discount_type === 'percentage') {
      return (subtotal * appliedCoupon.discount_value) / 100;
    } else {
      return Math.min(appliedCoupon.discount_value, subtotal);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast({
      title: "Coupon Removed",
      description: "The coupon has been removed from your order",
    });
  };

  return {
    appliedCoupon,
    loading,
    validateCoupon,
    calculateDiscount,
    removeCoupon
  };
};

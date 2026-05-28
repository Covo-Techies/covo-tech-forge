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
      const { data: result, error } = await supabase.functions.invoke('validate-coupon', {
        body: { code: code.trim().toUpperCase(), orderTotal },
      });

      if (error || !result || (result as any).error) {
        toast({
          title: "Invalid Coupon",
          description: (result as any)?.error || "Unable to validate coupon",
          variant: "destructive",
        });
        return null;
      }

      const data = (result as any).coupon;

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

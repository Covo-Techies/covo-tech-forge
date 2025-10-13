-- Add coupon tracking fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.coupons(id),
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_coupon_id ON public.orders(coupon_id);
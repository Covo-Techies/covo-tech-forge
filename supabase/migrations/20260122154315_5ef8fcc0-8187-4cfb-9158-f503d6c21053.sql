-- Add coupon tracking columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS coupon_id uuid REFERENCES public.coupons(id),
ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0;

-- Create index for coupon lookups
CREATE INDEX IF NOT EXISTS idx_orders_coupon_id ON public.orders(coupon_id);

-- Add foreign key from reviews.user_id to profiles.user_id for join queries
ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);
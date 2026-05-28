
-- 1. Coupons: restrict SELECT to admins only
DROP POLICY IF EXISTS "Everyone can view active coupons" ON public.coupons;
CREATE POLICY "Admins can view coupons"
ON public.coupons FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- 2. Reviews: prevent self-certifying verified_purchase and forcing approved status
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
CREATE POLICY "Users can insert their own reviews"
ON public.reviews FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND COALESCE(verified_purchase, false) = false
  AND COALESCE(moderation_status, 'pending') = 'pending'
);

-- 3. Storage: remove public listing on product-images bucket (public URLs still work)
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
CREATE POLICY "Admins can list product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

-- 4. Lock down internal trigger/helper functions from being executed by clients
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_review_helpfulness() FROM PUBLIC, anon, authenticated;

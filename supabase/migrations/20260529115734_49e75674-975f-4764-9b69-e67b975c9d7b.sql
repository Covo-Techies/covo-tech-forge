DROP POLICY IF EXISTS "Users can update their own pending reviews" ON public.reviews;

CREATE POLICY "Users can update their own pending reviews"
ON public.reviews
FOR UPDATE
USING ((auth.uid() = user_id) AND (moderation_status = 'pending'))
WITH CHECK (
  auth.uid() = user_id
  AND moderation_status = 'pending'
  AND COALESCE(verified_purchase, false) = false
);
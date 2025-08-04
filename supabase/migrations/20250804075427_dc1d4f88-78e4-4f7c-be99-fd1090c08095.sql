-- Create reviews table with comprehensive features
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderation_notes TEXT,
  incentive_given TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create review votes table for helpfulness tracking
CREATE TABLE public.review_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL,
  user_id UUID NOT NULL,
  helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Create product images table for multiple view angles
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  view_angle TEXT, -- 'front', 'side', 'back', 'detail', 'in-use', etc.
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Everyone can view approved reviews" ON public.reviews
FOR SELECT USING (moderation_status = 'approved');

CREATE POLICY "Users can insert their own reviews" ON public.reviews
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending reviews" ON public.reviews
FOR UPDATE USING (auth.uid() = user_id AND moderation_status = 'pending');

CREATE POLICY "Admins can manage all reviews" ON public.reviews
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- RLS Policies for review votes
CREATE POLICY "Users can view all review votes" ON public.review_votes
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own votes" ON public.review_votes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON public.review_votes
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON public.review_votes
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for product images
CREATE POLICY "Everyone can view product images" ON public.product_images
FOR SELECT USING (true);

CREATE POLICY "Admins can manage product images" ON public.product_images
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_images_updated_at
BEFORE UPDATE ON public.product_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update review helpfulness scores
CREATE OR REPLACE FUNCTION public.update_review_helpfulness()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.reviews 
    SET 
      helpful_count = (
        SELECT COUNT(*) FROM public.review_votes 
        WHERE review_id = NEW.review_id AND helpful = true
      ),
      total_votes = (
        SELECT COUNT(*) FROM public.review_votes 
        WHERE review_id = NEW.review_id
      )
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews 
    SET 
      helpful_count = (
        SELECT COUNT(*) FROM public.review_votes 
        WHERE review_id = OLD.review_id AND helpful = true
      ),
      total_votes = (
        SELECT COUNT(*) FROM public.review_votes 
        WHERE review_id = OLD.review_id
      )
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_review_helpfulness_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.review_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_review_helpfulness();

-- Add specifications column to products if it doesn't exist (it already exists according to schema)
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb;
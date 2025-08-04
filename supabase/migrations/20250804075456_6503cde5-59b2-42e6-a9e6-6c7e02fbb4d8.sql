-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.update_review_helpfulness()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;
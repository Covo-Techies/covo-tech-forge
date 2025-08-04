-- Create product-images storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Create storage policies for product images
CREATE POLICY "Product images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update product images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete product images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Add storage_path column to product_images table to track Supabase Storage files
ALTER TABLE public.product_images 
ADD COLUMN storage_path TEXT NULL,
ADD COLUMN file_size INTEGER NULL,
ADD COLUMN content_type TEXT NULL;

-- Create index for better performance
CREATE INDEX idx_product_images_storage_path ON public.product_images(storage_path);

-- Add constraint to ensure either image_url or storage_path is provided
ALTER TABLE public.product_images 
ADD CONSTRAINT check_image_source 
CHECK (
  (image_url IS NOT NULL AND storage_path IS NULL) OR 
  (image_url IS NULL AND storage_path IS NOT NULL) OR
  (image_url IS NOT NULL AND storage_path IS NOT NULL)
);
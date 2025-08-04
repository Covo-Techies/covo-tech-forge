-- Make image_url column nullable to support storage_path uploads
ALTER TABLE public.product_images 
ALTER COLUMN image_url DROP NOT NULL;
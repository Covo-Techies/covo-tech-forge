-- Add brand and specifications columns to products table
ALTER TABLE public.products 
ADD COLUMN brand TEXT,
ADD COLUMN specifications JSONB DEFAULT '{}';

-- Create indexes for better performance
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_specifications ON public.products USING GIN(specifications);

-- Update some sample data for testing (you can remove this if not needed)
UPDATE public.products SET brand = 'Apple' WHERE category = 'Phones' AND name ILIKE '%iphone%';
UPDATE public.products SET brand = 'Samsung' WHERE category = 'Phones' AND name ILIKE '%samsung%';
UPDATE public.products SET brand = 'HP' WHERE category = 'Laptops' AND name ILIKE '%hp%';
UPDATE public.products SET brand = 'Dell' WHERE category = 'Laptops' AND name ILIKE '%dell%';
UPDATE public.products SET brand = 'Lenovo' WHERE category = 'Laptops' AND name ILIKE '%lenovo%';
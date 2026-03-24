

# Product Variants System Implementation

## Overview
Add size/color variants per product with individual stock tracking and price adjustments. Products without variants continue working unchanged.

## Step 1: Database Migration

Create `product_variants` table and add `variant_id` to `cart_items` and `order_items`:

```sql
-- product_variants table
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  size text,
  color text,
  sku text UNIQUE,
  price_adjustment numeric DEFAULT 0,
  stock_quantity integer NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- RLS: public read, admin write
CREATE POLICY "Everyone can view active variants" ON public.product_variants
  FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage variants" ON public.product_variants
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Add nullable variant_id to cart_items and order_items
ALTER TABLE public.cart_items ADD COLUMN variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL;
ALTER TABLE public.order_items ADD COLUMN variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL;

-- Update cart_items unique constraint to include variant
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_user_id_product_id_variant_id_key 
  UNIQUE (user_id, product_id, variant_id);

-- Trigger for updated_at
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

## Step 2: Update `useCart` Hook

- Add `variant_id` (optional) to `CartItem` interface and `addToCart` signature
- Include `variant_id` in cart queries, upserts, updates, and deletes
- Update unique conflict key to `user_id, product_id, variant_id`
- Fetch variant details alongside cart items for display

## Step 3: Update `ProductDetail.tsx`

- Fetch `product_variants` for the current product
- Show size/color dropdown selectors when variants exist
- Update displayed price to include `price_adjustment` of selected variant
- Use variant `stock_quantity` for availability and quantity limits
- Pass `variant_id` to `addToCart()`

## Step 4: Update Cart Component

- Display selected size/color next to each cart item name
- Use variant stock for quantity limits when variant is present

## Step 5: Admin Variant Management

Add a "Manage Variants" section to `ProductManagement.tsx`:

- A "Variants" button per product row that opens a dialog
- Dialog lists existing variants in a table (size, color, SKU, price adjustment, stock, active toggle)
- Form to add/edit variants with fields: size, color, SKU, price adjustment, stock quantity, active
- Delete variant button

## Step 6: Update `create-payment` Edge Function

- When `variant_id` is present on a cart/order item, validate stock against `product_variants.stock_quantity` instead of `products.stock_quantity`
- Deduct stock from the variant record after payment

## Files Changed

| File | Change |
|------|--------|
| `supabase/migrations/` | New migration for `product_variants` table and `cart_items`/`order_items` columns |
| `src/hooks/useCart.tsx` | Add variant support to cart operations |
| `src/pages/ProductDetail.tsx` | Variant selectors and dynamic pricing |
| `src/components/Cart.tsx` | Display variant info per item |
| `src/pages/admin/ProductManagement.tsx` | Variant CRUD management UI |
| `supabase/functions/create-payment/index.ts` | Variant-level stock validation |
| `src/integrations/supabase/types.ts` | Auto-updated after migration |


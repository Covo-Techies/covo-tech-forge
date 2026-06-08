## Plan: finish security fixes and verify admin flows

### 1. Restrict `app_settings` to admins/staff (security warning)
Currently any anonymous visitor can read store config (emails, tax, admin UUIDs). The only consumer in the codebase is `src/pages/admin/Settings.tsx`, so locking it down has no public-site impact.

Migration:
- Drop the `Anyone can view app settings` SELECT policy.
- Add a new SELECT policy allowing only users with `admin` or `staff` role (via `has_role`).
- Tighten the broken INSERT policy (currently has no `WITH CHECK`) to require admin role.
- Revoke `SELECT` from `anon` on `public.app_settings`.

### 2. Move inline base64 product image to storage (security warning)
Scan of `public.products` shows exactly 1 row whose `image_url` is a `data:` base64 blob. Plan:
- One-off script run via the migration/insert tools: fetch that row, decode the base64, upload to the existing public `product-images` bucket at `products/{product_id}.{ext}`, then update `image_url` to the public URL.
- Add a lightweight client-side guard in the admin Product form (if it allows direct base64 paste) so future uploads go through Storage — only touched if the existing form is the source of the base64. Quick audit first; if uploads already go through Storage, no UI change needed.

### 3. Verify role management & Settings end-to-end
- Sign in as admin, open `/admin/roles`: confirm listing, search, and assigning admin/staff/finance/customer all persist and the self-demotion + last-admin guards still trigger.
- Open `/admin/settings`: save each of the five tabs and reload to confirm values round-trip through `app_settings`.
- After step 1's RLS change, re-run the Supabase security scan and mark the two findings as fixed.

### Technical notes
- Settings page already uses `useAuth` and upserts with `updated_by`, so RLS will allow admins to keep writing.
- `product-images` bucket is already public; no bucket changes needed.
- No frontend code changes required for step 1 beyond what already exists.

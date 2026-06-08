DROP POLICY IF EXISTS "Anyone can view app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can insert app settings" ON public.app_settings;

CREATE POLICY "Admins and staff can view app settings"
ON public.app_settings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Admins can insert app settings"
ON public.app_settings FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

REVOKE SELECT ON public.app_settings FROM anon;
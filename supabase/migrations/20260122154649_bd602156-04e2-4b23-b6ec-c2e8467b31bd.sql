-- Drop existing policies and recreate them properly as PERMISSIVE
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view all contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;

-- Allow anyone to submit contact messages (INSERT only, no read access)
CREATE POLICY "Anyone can submit contact messages" 
ON public.contact_messages 
FOR INSERT 
TO public
WITH CHECK (true);

-- Only admins and staff can view contact messages
CREATE POLICY "Admins can view all contact messages" 
ON public.contact_messages 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Only admins and staff can update contact messages
CREATE POLICY "Admins can update contact messages" 
ON public.contact_messages 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));
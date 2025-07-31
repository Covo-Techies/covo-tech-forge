-- Insert admin role for the first user to enable admin dashboard access
INSERT INTO public.user_roles (user_id, role) 
VALUES ('1df994c9-1add-450d-a26c-20a8ac8fcde9', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;
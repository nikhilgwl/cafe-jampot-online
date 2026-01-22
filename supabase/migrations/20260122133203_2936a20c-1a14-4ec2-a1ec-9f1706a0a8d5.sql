-- Fix 1: Update get_pending_users to require admin role (server-side check)
CREATE OR REPLACE FUNCTION public.get_pending_users()
 RETURNS TABLE(user_id uuid, email text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    au.id as user_id,
    au.email,
    au.created_at
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = au.id
  )
  -- Server-side admin authorization check
  AND EXISTS (
    SELECT 1 FROM public.user_roles check_role
    WHERE check_role.user_id = auth.uid() 
    AND check_role.role = 'admin'
  )
  ORDER BY au.created_at DESC;
$function$;

-- Fix 2: Update get_all_users_with_roles to require admin role (server-side check)
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
 RETURNS TABLE(user_id uuid, email text, role app_role, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    au.id as user_id,
    au.email,
    ur.role,
    au.created_at
  FROM auth.users au
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id
  -- Server-side admin authorization check
  WHERE EXISTS (
    SELECT 1 FROM public.user_roles check_role
    WHERE check_role.user_id = auth.uid() 
    AND check_role.role = 'admin'
  )
  ORDER BY au.created_at DESC;
$function$;

-- Fix 3 & 4: Add user_id column to orders table for customer tracking
ALTER TABLE public.orders ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Drop existing INSERT policy that allows anyone to create orders
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create new INSERT policy requiring authentication
CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR auth.uid() = user_id));

-- Add SELECT policy for customers to view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'staff'::app_role)
);
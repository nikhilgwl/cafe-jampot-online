-- Create a function to list users who don't have any roles (pending approval)
CREATE OR REPLACE FUNCTION public.get_pending_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    au.id as user_id,
    au.email,
    au.created_at
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = au.id
  )
  ORDER BY au.created_at DESC;
$$;

-- Create a function to list all users with their roles
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE (
  user_id uuid,
  email text,
  role app_role,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    au.id as user_id,
    au.email,
    ur.role,
    au.created_at
  FROM auth.users au
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id
  ORDER BY au.created_at DESC;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_pending_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users_with_roles() TO authenticated;
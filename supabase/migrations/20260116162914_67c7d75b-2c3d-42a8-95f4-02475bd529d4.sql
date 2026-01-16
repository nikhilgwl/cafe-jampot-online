-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy for user_roles - authenticated users can read their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create delivery_settings table for open/closed status
CREATE TABLE public.delivery_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_open BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on delivery_settings
ALTER TABLE public.delivery_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read delivery settings (for the badge on main page)
CREATE POLICY "Anyone can read delivery settings"
ON public.delivery_settings
FOR SELECT
USING (true);

-- Only staff/admin can update delivery settings
CREATE POLICY "Staff can update delivery settings"
ON public.delivery_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Insert default delivery settings
INSERT INTO public.delivery_settings (is_open) VALUES (true);

-- Create stock_status table for out of stock items
CREATE TABLE public.stock_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id TEXT NOT NULL UNIQUE,
    item_name TEXT NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on stock_status
ALTER TABLE public.stock_status ENABLE ROW LEVEL SECURITY;

-- Everyone can read stock status (for main menu)
CREATE POLICY "Anyone can read stock status"
ON public.stock_status
FOR SELECT
USING (true);

-- Only staff/admin can update stock status
CREATE POLICY "Staff can update stock status"
ON public.stock_status
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Staff can insert stock status
CREATE POLICY "Staff can insert stock status"
ON public.stock_status
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Create orders table for tracking sales
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostel_name TEXT NOT NULL,
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Staff/admin can read all orders (for dashboard)
CREATE POLICY "Staff can view all orders"
ON public.orders
FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Anyone can insert orders (for customers placing orders)
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
WITH CHECK (true);

-- Staff can update orders
CREATE POLICY "Staff can update orders"
ON public.orders
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_delivery_settings_updated_at
BEFORE UPDATE ON public.delivery_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stock_status_updated_at
BEFORE UPDATE ON public.stock_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
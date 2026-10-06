-- Migration: Add Admin RLS Policies

-- Create a helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Admins can do anything
CREATE POLICY "Admins can manage profiles" ON public.profiles
  FOR ALL USING (is_admin());

-- Menu Categories: Admins can do anything
CREATE POLICY "Admins can manage menu categories" ON public.menu_categories
  FOR ALL USING (is_admin());

-- Menu Items: Admins can do anything
CREATE POLICY "Admins can manage menu items" ON public.menu_items
  FOR ALL USING (is_admin());

-- Orders: Admins can do anything
CREATE POLICY "Admins can manage orders" ON public.orders
  FOR ALL USING (is_admin());

-- Order Items: Admins can do anything
CREATE POLICY "Admins can manage order items" ON public.order_items
  FOR ALL USING (is_admin());

-- Delivery Details: Admins can do anything
CREATE POLICY "Admins can manage delivery details" ON public.delivery_details
  FOR ALL USING (is_admin());

-- Reservations: Admins can do anything
CREATE POLICY "Admins can manage reservations" ON public.reservations
  FOR ALL USING (is_admin());

-- Catering Requests: Admins can do anything
CREATE POLICY "Admins can manage catering requests" ON public.catering_requests
  FOR ALL USING (is_admin());

-- NOTE: If you haven't created an admin user yet, manually run this SQL in Supabase SQL editor:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your_admin_email@example.com';

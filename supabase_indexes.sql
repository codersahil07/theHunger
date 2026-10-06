-- Performance Optimization Indexes for The Hunger Admin Portal

-- 1. Orders
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);

-- 2. Reservations
CREATE INDEX IF NOT EXISTS idx_reservations_reservation_date ON reservations (reservation_date DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations (status);

-- 3. Catering
CREATE INDEX IF NOT EXISTS idx_catering_event_date ON catering_requests (event_date DESC);
CREATE INDEX IF NOT EXISTS idx_catering_status ON catering_requests (status);

-- 4. Menu Items
CREATE INDEX IF NOT EXISTS idx_menu_items_display_order ON menu_items (display_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items (category_id);

-- 5. Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles (role);

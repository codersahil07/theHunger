-- ==========================================
-- THE HUNGER - DATABASE FOUNDATION
-- ==========================================

-- Drop existing tables if they exist to avoid conflict (only dropping old schema tables)
DROP TABLE IF EXISTS public.table_bookings CASCADE;
DROP TABLE IF EXISTS public.catering_enquiries CASCADE;
DROP TABLE IF EXISTS public.delivery_details CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.catering_requests CASCADE;
DROP TABLE IF EXISTS public.reservations CASCADE;
DROP TABLE IF EXISTS public.menu_items CASCADE;
DROP TABLE IF EXISTS public.menu_categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  phone text,
  address text,
  city text,
  state text,
  pincode text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('user', 'admin'))
);

-- 2. MENU CATEGORIES
CREATE TABLE public.menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  display_order integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. MENU ITEMS
CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  half_price numeric NULL,
  full_price numeric NULL,
  diet text NOT NULL,
  image_url text,
  is_available boolean DEFAULT true,
  display_order integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_diet CHECK (diet IN ('veg', 'non-veg'))
);

-- 4. ORDERS
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL,
  total_amount numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. ORDER ITEMS
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL,
  portion text NULL,
  unit_price numeric NOT NULL,
  subtotal numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 6. DELIVERY DETAILS
CREATE TABLE public.delivery_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text,
  state text,
  pincode text,
  instructions text,
  created_at timestamptz DEFAULT now()
);

-- 7. RESERVATIONS
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  reservation_date date NOT NULL,
  reservation_time time NOT NULL,
  guests integer NOT NULL,
  special_request text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. CATERING REQUESTS
CREATE TABLE public.catering_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  event_date date NOT NULL,
  guests integer NOT NULL,
  venue text NOT NULL,
  event_details text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX idx_menu_items_diet ON public.menu_items(diet);
CREATE INDEX idx_menu_items_is_available ON public.menu_items(is_available);
CREATE INDEX idx_menu_items_display_order ON public.menu_items(display_order);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX idx_reservations_reservation_date ON public.reservations(reservation_date);
CREATE INDEX idx_catering_requests_user_id ON public.catering_requests(user_id);
CREATE INDEX idx_catering_requests_event_date ON public.catering_requests(event_date);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Insert Categories
INSERT INTO public.menu_categories (id, name, slug, display_order) VALUES
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Starters', 'starters', 1),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Main Course', 'main-course', 2),
  ('a8c7202a-9cc0-4546-b390-59fd0f812517', 'Biryani', 'biryani', 3),
  ('d4d3e3c6-b56a-4a99-82a4-156ca44a32e1', 'Breads', 'breads', 4),
  ('34173045-10ec-4dd7-a442-7ccb7b08ddae', 'South Indian', 'south-indian', 5),
  ('59fdd91a-1ecf-4801-bc5f-b6d04f121337', 'Desserts', 'desserts', 6),
  ('507b25c8-5366-4b9f-9d2f-2980fcdfc589', 'Beverages', 'beverages', 7);

-- Insert Menu Items
INSERT INTO public.menu_items (category_id, name, description, price, half_price, full_price, diet, image_url, display_order) VALUES
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Paneer Tikka', 'Char-grilled paneer marinated in spiced yogurt, herbs and aromatic tandoori masala for a smoky, succulent bite.', 299, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1599487405250-127448dcc27f?auto=format&fit=crop&q=80', 1),
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Hara Bhara Kebab', 'Crispy golden vegetarian kebabs made with spinach, green peas, herbs and aromatic Indian spices.', 249, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80', 2),
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Dahi Ke Kebab', 'Delicate golden kebabs made with hung yogurt, herbs and mild spices, crisp outside and creamy within.', 269, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80', 3),
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Tandoori Malai Chaap', 'Soft soya chaap marinated in creamy malai, yogurt and delicate spices, then roasted to smoky perfection.', 299, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?auto=format&fit=crop&q=80', 4),
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Tandoori Mushroom', 'Juicy mushrooms marinated in aromatic tandoori spices and yogurt, char-grilled for a smoky finish.', 249, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80', 5),
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Veg Seekh Kebab', 'Flavorful minced vegetable kebabs seasoned with aromatic herbs and spices, grilled until perfectly charred.', 249, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80', 6),
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Paneer Malai Tikka', 'Tender paneer marinated in creamy malai, cheese, yogurt and mild spices, finished with a delicate tandoori char.', 329, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80', 7),
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Chicken Tikka', 'Juicy boneless chicken marinated in spiced yogurt and roasted in the tandoor for a smoky, tender finish.', 349, NULL, NULL, 'non-veg', 'https://images.unsplash.com/photo-1628296582103-62b21b06606a?auto=format&fit=crop&q=80', 8),
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Tandoori Chicken', 'Classic bone-in chicken marinated with yogurt and aromatic spices, roasted in the tandoor until beautifully charred.', 399, NULL, NULL, 'non-veg', 'https://images.unsplash.com/photo-1603894584373-5ac82b6ae398?auto=format&fit=crop&q=80', 9),
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Murgh Malai Tikka', 'Succulent chicken pieces marinated in creamy malai, cheese, herbs and mild spices for a rich melt-in-the-mouth texture.', 379, NULL, NULL, 'non-veg', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80', 10),
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Galouti Kebab', 'Delicately spiced melt-in-the-mouth kebab inspired by the royal Awadhi culinary tradition.', 399, NULL, NULL, 'non-veg', 'https://images.unsplash.com/photo-1544025805-0994cc535546?auto=format&fit=crop&q=80', 11),
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Chicken Seekh Kebab', 'Juicy minced chicken seasoned with herbs and aromatic spices, skewered and grilled over high heat.', 379, NULL, NULL, 'non-veg', 'https://images.unsplash.com/photo-1589302168068-964664d93cb0?auto=format&fit=crop&q=80', 12),
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Mutton Seekh Kebab', 'Succulent minced mutton blended with fragrant spices and herbs, grilled on skewers for a smoky finish.', 429, NULL, NULL, 'non-veg', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80', 13),
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Amritsari Fish Tikka', 'Tender fish marinated with aromatic spices and herbs, coated lightly and grilled to a crisp golden finish.', 399, NULL, NULL, 'non-veg', 'https://images.unsplash.com/photo-1610191754023-deea018335b2?auto=format&fit=crop&q=80', 14),
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Tangdi Kebab', 'Juicy chicken drumsticks marinated in yogurt and aromatic spices, roasted until smoky and tender.', 379, NULL, NULL, 'non-veg', 'https://images.unsplash.com/photo-1628296582103-62b21b06606a?auto=format&fit=crop&q=80', 15),
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Shami Kebab', 'Soft and succulent minced meat kebabs blended with lentils, herbs and traditional Indian spices.', 349, NULL, NULL, 'non-veg', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80', 16),
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Chicken Reshmi Kebab', 'Silky tender chicken kebabs marinated with cream, yogurt, cheese and mild spices for a rich delicate flavour.', 379, NULL, NULL, 'non-veg', 'https://images.unsplash.com/photo-1603894584373-5ac82b6ae398?auto=format&fit=crop&q=80', 17),
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Bhatti Ka Murgh', 'Char-grilled chicken marinated in robust Indian spices and roasted in the bhatti for a deep smoky flavour.', 399, NULL, NULL, 'non-veg', 'https://images.unsplash.com/photo-1599487405250-127448dcc27f?auto=format&fit=crop&q=80', 18),
  ('66edf05f-c568-4c4b-a7f6-cf400adcbcc8', 'Samosa', 'Crisp golden pastry filled with spiced potatoes, peas and aromatic Indian herbs.', 149, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80', 19),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Paneer Butter Masala', 'Soft paneer cooked in a rich tomato, butter and cream gravy finished with aromatic Indian spices.', 329, 197, 329, 'veg', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?auto=format&fit=crop&q=80', 20),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Dal Makhani', 'Slow-cooked black lentils simmered with butter and cream for a rich, smoky North Indian classic.', 279, 167, 279, 'veg', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80', 21),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Butter Chicken (Murgh Makhani)', 'Tender tandoori chicken simmered in a creamy tomato-butter gravy with delicate aromatic spices.', 399, 239, 399, 'non-veg', 'https://images.unsplash.com/photo-1603894584373-5ac82b6ae398?auto=format&fit=crop&q=80', 22),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Shahi Paneer', 'Soft paneer cooked in a luxurious creamy gravy of cashews, tomatoes and fragrant royal spices.', 329, 197, 329, 'veg', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80', 23),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Kadhai Chicken', 'Succulent chicken cooked with roasted peppers, onions, tomatoes and freshly ground kadhai spices.', 399, 239, 399, 'non-veg', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80', 24),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Rogan Josh', 'Tender mutton slow-cooked in a rich Kashmiri gravy with aromatic whole spices and traditional seasoning.', 449, 269, 449, 'non-veg', 'https://images.unsplash.com/photo-1544025805-0994cc535546?auto=format&fit=crop&q=80', 25),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Palak Paneer', 'Soft paneer cubes simmered in a smooth, vibrant spinach gravy with mild Indian spices.', 319, 191, 319, 'veg', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80', 26),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Chole Masala', 'Hearty chickpeas slow-cooked in a bold onion-tomato gravy with fragrant Punjabi spices.', 249, 149, 249, 'veg', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80', 27),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Paneer Lababdar', 'Paneer cooked in a rich tomato gravy with cream, onions and aromatic spices for a deeply satisfying flavour.', 339, 203, 339, 'veg', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?auto=format&fit=crop&q=80', 28),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Dal Tadka', 'Comforting yellow lentils finished with a sizzling tempering of garlic, cumin, chilli and ghee.', 229, 137, 229, 'veg', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80', 29),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Malai Kofta', 'Soft vegetable and paneer dumplings served in a creamy, mildly spiced tomato and cashew gravy.', 349, 209, 349, 'veg', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80', 30),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Kadhai Paneer', 'Paneer tossed with onions, peppers and tomatoes in a fragrant freshly ground kadhai masala.', 329, 197, 329, 'veg', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?auto=format&fit=crop&q=80', 31),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Chicken Tikka Masala', 'Char-grilled chicken tikka simmered in a creamy, spiced tomato gravy with rich Indian flavours.', 399, 239, 399, 'non-veg', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80', 32),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Dum Aloo (Kashmiri / Banarasi)', 'Baby potatoes slow-cooked in a rich aromatic gravy inspired by traditional Kashmiri and Banarasi flavours.', 299, 179, 299, 'veg', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80', 33),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Rajma Masala', 'Slow-cooked kidney beans simmered in a hearty tomato-onion gravy with warm North Indian spices.', 249, 149, 249, 'veg', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80', 34),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Bhindi Do Pyaza', 'Tender okra sautéed with generous onions, tomatoes and aromatic Indian spices.', 249, 149, 249, 'veg', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80', 35),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Mutton Korma', 'Tender mutton slow-cooked in a luxurious creamy gravy enriched with yogurt, nuts and aromatic spices.', 449, 269, 449, 'non-veg', 'https://images.unsplash.com/photo-1544025805-0994cc535546?auto=format&fit=crop&q=80', 36),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Methi Malai Matar', 'Green peas and fragrant fenugreek leaves cooked in a creamy, mildly spiced gravy.', 299, 179, 299, 'veg', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80', 37),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Baingan Bharta', 'Smoky roasted eggplant mashed and cooked with onions, tomatoes, garlic and traditional Indian spices.', 269, 161, 269, 'veg', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80', 38),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Sarson Ka Saag', 'Traditional Punjabi mustard greens slow-cooked with spinach, herbs and rustic Indian spices.', 299, 179, 299, 'veg', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80', 39),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Paneer Do Pyaza', 'Soft paneer cooked with double the onions, tomatoes and aromatic spices for a rich and balanced flavour.', 319, 191, 319, 'veg', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?auto=format&fit=crop&q=80', 40),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Aloo Gobi', 'Classic combination of potatoes and cauliflower tossed with turmeric, cumin and fragrant Indian spices.', 249, 149, 249, 'veg', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80', 41),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Saag Gosht', 'Tender mutton slow-cooked with fresh greens and aromatic spices for a rich, hearty North Indian flavour.', 449, 269, 449, 'non-veg', 'https://images.unsplash.com/photo-1544025805-0994cc535546?auto=format&fit=crop&q=80', 42),
  ('e2648ee4-f389-413d-b727-53fdbbead659', 'Matar Paneer', 'Soft paneer and sweet green peas simmered in a comforting tomato-onion gravy with aromatic spices.', 319, 191, 319, 'veg', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?auto=format&fit=crop&q=80', 43),
  ('a8c7202a-9cc0-4546-b390-59fd0f812517', 'Chicken Biryani', 'Fragrant basmati rice layered with succulent chicken, saffron, fried onions and aromatic spices.', 379, NULL, NULL, 'non-veg', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80', 44),
  ('a8c7202a-9cc0-4546-b390-59fd0f812517', 'Mutton Biryani', 'Slow-cooked mutton layered with long-grain basmati rice, saffron and rich biryani spices.', 449, NULL, NULL, 'non-veg', 'https://images.unsplash.com/photo-1589302168068-964664d93cb0?auto=format&fit=crop&q=80', 45),
  ('a8c7202a-9cc0-4546-b390-59fd0f812517', 'Veg Biryani', 'Fragrant basmati rice cooked with seasonal vegetables, saffron and a delicate blend of Indian spices.', 299, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&q=80', 46),
  ('a8c7202a-9cc0-4546-b390-59fd0f812517', 'Paneer Biryani', 'Fragrant basmati rice layered with tender paneer, saffron, fried onions and aromatic biryani spices.', 329, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80', 47),
  ('a8c7202a-9cc0-4546-b390-59fd0f812517', 'Chicken Hyderabadi Biryani', 'Authentic Hyderabadi-style biryani layered with succulent chicken, basmati rice, saffron and rich spices.', 399, NULL, NULL, 'non-veg', 'https://images.unsplash.com/photo-1589302168068-964664d93cb0?auto=format&fit=crop&q=80', 48),
  ('a8c7202a-9cc0-4546-b390-59fd0f812517', 'Special Kolkata Biryani', 'Fragrant Kolkata-style biryani with delicate spices, tender meat, potato and aromatic basmati rice.', 399, NULL, NULL, 'non-veg', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80', 49),
  ('a8c7202a-9cc0-4546-b390-59fd0f812517', 'The Hunger Special Biryani', 'Our signature biryani layered with fragrant basmati rice, tender meat, saffron, fried onions and The Hunger''s special spice blend.', 499, NULL, NULL, 'non-veg', 'https://images.unsplash.com/photo-1589302168068-964664d93cb0?auto=format&fit=crop&q=80', 50),
  ('d4d3e3c6-b56a-4a99-82a4-156ca44a32e1', 'Tandoori Roti', 'Traditional whole-wheat roti freshly baked in the tandoor with a light smoky aroma and rustic char.', 49, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1610191754023-deea018335b2?auto=format&fit=crop&q=80', 51),
  ('d4d3e3c6-b56a-4a99-82a4-156ca44a32e1', 'Tandoori Butter Roti', 'Freshly baked tandoori roti brushed with melted butter for a rich, soft and smoky finish.', 59, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1610191754023-deea018335b2?auto=format&fit=crop&q=80', 52),
  ('d4d3e3c6-b56a-4a99-82a4-156ca44a32e1', 'Plain Naan', 'Soft and fluffy tandoor-baked naan, perfect for soaking up rich Indian gravies.', 69, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80', 53),
  ('d4d3e3c6-b56a-4a99-82a4-156ca44a32e1', 'Garlic Naan', 'Soft tandoori naan topped with fragrant garlic, fresh coriander and a touch of butter.', 99, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80', 54),
  ('d4d3e3c6-b56a-4a99-82a4-156ca44a32e1', 'Butter Naan', 'Fluffy tandoor-baked naan generously brushed with melted butter for a rich finish.', 89, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1610191754023-deea018335b2?auto=format&fit=crop&q=80', 55),
  ('d4d3e3c6-b56a-4a99-82a4-156ca44a32e1', 'Rumali Roti', 'Ultra-thin, soft handkerchief-style bread cooked fresh on the tandoor and served warm.', 69, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1610191754023-deea018335b2?auto=format&fit=crop&q=80', 56),
  ('d4d3e3c6-b56a-4a99-82a4-156ca44a32e1', 'Laccha Paratha', 'Flaky, layered whole-wheat paratha cooked with butter for a crisp exterior and soft centre.', 99, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80', 57),
  ('34173045-10ec-4dd7-a442-7ccb7b08ddae', 'Idli', 'Soft and fluffy steamed rice cakes served fresh with classic South Indian flavours.', 99, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80', 58),
  ('34173045-10ec-4dd7-a442-7ccb7b08ddae', 'Rava Dosa', 'Thin and crispy semolina dosa with a delicate golden texture and aromatic South Indian seasoning.', 149, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1610191754023-deea018335b2?auto=format&fit=crop&q=80', 59),
  ('34173045-10ec-4dd7-a442-7ccb7b08ddae', 'Medu Vada', 'Crispy golden lentil fritters with a soft, fluffy centre, served as a South Indian classic.', 129, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80', 60),
  ('34173045-10ec-4dd7-a442-7ccb7b08ddae', 'Cheese Masala Dosa', 'Crispy dosa filled with spiced potato masala and melted cheese for a rich, indulgent twist.', 199, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80', 61),
  ('34173045-10ec-4dd7-a442-7ccb7b08ddae', 'Mysore Dosa', 'Crispy dosa spread with spicy Mysore chutney and filled with a comforting potato masala.', 179, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1610191754023-deea018335b2?auto=format&fit=crop&q=80', 62),
  ('34173045-10ec-4dd7-a442-7ccb7b08ddae', 'Benne Dosa', 'Golden, crisp dosa generously cooked with butter for a rich and irresistible South Indian flavour.', 169, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80', 63),
  ('34173045-10ec-4dd7-a442-7ccb7b08ddae', 'Masala Uttapam', 'Thick and soft South Indian pancake topped with vegetables, herbs and aromatic spices.', 159, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?auto=format&fit=crop&q=80', 64),
  ('34173045-10ec-4dd7-a442-7ccb7b08ddae', 'Plain Uttapam', 'Soft, fluffy and lightly crisp South Indian uttapam prepared fresh on the griddle.', 129, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?auto=format&fit=crop&q=80', 65),
  ('34173045-10ec-4dd7-a442-7ccb7b08ddae', 'Fried Idli', 'Crispy golden pieces of idli tossed with aromatic South Indian spices for a delicious twist.', 139, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80', 66),
  ('34173045-10ec-4dd7-a442-7ccb7b08ddae', 'Onion Rava Masala Dosa', 'Thin and crispy rava dosa layered with spiced potato masala and generously topped with onions.', 189, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1610191754023-deea018335b2?auto=format&fit=crop&q=80', 67),
  ('59fdd91a-1ecf-4801-bc5f-b6d04f121337', 'Gulab Jamun', 'Warm, soft milk dumplings soaked in fragrant sugar syrup with delicate notes of cardamom and saffron.', 129, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80', 68),
  ('59fdd91a-1ecf-4801-bc5f-b6d04f121337', 'Rasgulla', 'Soft and spongy cottage-cheese dumplings soaked in light, refreshing sugar syrup.', 129, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1551024506-0baa27396181?auto=format&fit=crop&q=80', 69),
  ('59fdd91a-1ecf-4801-bc5f-b6d04f121337', 'Rasmalai', 'Delicate cottage-cheese dumplings served chilled in creamy saffron-cardamom milk.', 159, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1551024506-0baa27396181?auto=format&fit=crop&q=80', 70),
  ('59fdd91a-1ecf-4801-bc5f-b6d04f121337', 'Gajar Ka Halwa', 'Traditional slow-cooked grated carrots enriched with milk, khoya, cardamom and crunchy nuts.', 179, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80', 71),
  ('59fdd91a-1ecf-4801-bc5f-b6d04f121337', 'Moong Dal Halwa', 'Rich and aromatic moong dal halwa slow-roasted with ghee, milk, cardamom and premium nuts.', 189, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80', 72),
  ('59fdd91a-1ecf-4801-bc5f-b6d04f121337', 'Jalebi with Rabri', 'Golden, crisp jalebi soaked in fragrant syrup and served with chilled, creamy rabri.', 179, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1551024506-0baa27396181?auto=format&fit=crop&q=80', 73),
  ('59fdd91a-1ecf-4801-bc5f-b6d04f121337', 'Phirni', 'Creamy ground-rice pudding delicately flavoured with saffron, cardamom and crushed nuts.', 149, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1551024506-0baa27396181?auto=format&fit=crop&q=80', 74),
  ('59fdd91a-1ecf-4801-bc5f-b6d04f121337', 'Shahi Tukda', 'Golden fried bread soaked in fragrant milk and saffron, finished with nuts for a royal Indian dessert.', 179, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80', 75),
  ('59fdd91a-1ecf-4801-bc5f-b6d04f121337', 'Kulfi — Kesar Pista', 'Rich and creamy traditional kulfi infused with saffron and generously finished with pistachios.', 159, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1551024506-0baa27396181?auto=format&fit=crop&q=80', 76),
  ('59fdd91a-1ecf-4801-bc5f-b6d04f121337', 'Kulfi — Malai', 'Classic slow-frozen Indian malai kulfi with a rich, creamy texture and delicate cardamom notes.', 149, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1551024506-0baa27396181?auto=format&fit=crop&q=80', 77),
  ('59fdd91a-1ecf-4801-bc5f-b6d04f121337', 'Rajasthani Ghevar', 'Traditional Rajasthani honeycomb-style sweet soaked in fragrant syrup and finished with creamy rabri and nuts.', 199, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80', 78),
  ('59fdd91a-1ecf-4801-bc5f-b6d04f121337', 'Apple Pie', 'Warm, buttery pastry filled with cinnamon-spiced apples for a comforting dessert with a classic finish.', 199, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80', 79),
  ('507b25c8-5366-4b9f-9d2f-2980fcdfc589', 'Masala Chai', 'Traditional Indian tea brewed with milk, aromatic spices, ginger, and cardamom.', 99, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1576092762791-dd9e2220c4c7?auto=format&fit=crop&q=80', 80),
  ('507b25c8-5366-4b9f-9d2f-2980fcdfc589', 'Sweet Lassi', 'Thick, creamy yogurt-based drink lightly sweetened and served chilled.', 129, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?auto=format&fit=crop&q=80', 81),
  ('507b25c8-5366-4b9f-9d2f-2980fcdfc589', 'Masala Chaas', 'Refreshing spiced buttermilk blended with roasted cumin, herbs, and Indian spices.', 99, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80', 82),
  ('507b25c8-5366-4b9f-9d2f-2980fcdfc589', 'Shikanji', 'Refreshing Indian-style lemonade with lemon, chilled water, sugar, and a hint of spice.', 99, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80', 83),
  ('507b25c8-5366-4b9f-9d2f-2980fcdfc589', 'Mango Lassi', 'Rich and creamy yogurt drink blended with ripe mango for a smooth tropical flavor.', 149, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1546898160-b6f753c155de?auto=format&fit=crop&q=80', 84),
  ('507b25c8-5366-4b9f-9d2f-2980fcdfc589', 'Filter Coffee', 'South Indian-style filter coffee made with strong brewed coffee and creamy milk.', 129, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80', 85),
  ('507b25c8-5366-4b9f-9d2f-2980fcdfc589', 'Aam Panna', 'Refreshing raw-mango cooler with roasted cumin, mint, black salt, and subtle spices.', 119, NULL, NULL, 'veg', 'https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?auto=format&fit=crop&q=80', 86);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catering_requests ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. MENU CATEGORIES
CREATE POLICY "Anyone can read active categories" ON public.menu_categories FOR SELECT USING (is_active = true);

-- 3. MENU ITEMS
CREATE POLICY "Anyone can read available menu items" ON public.menu_items FOR SELECT USING (is_available = true);

-- 4. ORDERS
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. ORDER ITEMS
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create own order items" ON public.order_items FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
);

-- 6. DELIVERY DETAILS
CREATE POLICY "Users can view own delivery details" ON public.delivery_details FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create own delivery details" ON public.delivery_details FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
);

-- 7. RESERVATIONS
CREATE POLICY "Users can view own reservations" ON public.reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reservations" ON public.reservations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. CATERING REQUESTS
CREATE POLICY "Users can view own catering requests" ON public.catering_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own catering requests" ON public.catering_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- PROFILE TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

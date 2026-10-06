-- Table for Table Bookings
CREATE TABLE IF NOT EXISTS public.table_bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  booking_date text NOT NULL,
  booking_time text NOT NULL,
  guests integer NOT NULL,
  seating_preference text,
  special_request text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for table_bookings
ALTER TABLE public.table_bookings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anon users to insert (depending on your auth setup)
CREATE POLICY "Enable insert for all users" ON public.table_bookings
  FOR INSERT WITH CHECK (true);


-- Table for Catering Enquiries
CREATE TABLE IF NOT EXISTS public.catering_enquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  event_type text NOT NULL,
  guests integer NOT NULL,
  event_date text NOT NULL,
  start_time text,
  venue_name text NOT NULL,
  venue_address text NOT NULL,
  city text NOT NULL,
  catering_requirements text,
  dietary_requirements text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for catering_enquiries
ALTER TABLE public.catering_enquiries ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anon users to insert
CREATE POLICY "Enable insert for all users" ON public.catering_enquiries
  FOR INSERT WITH CHECK (true);

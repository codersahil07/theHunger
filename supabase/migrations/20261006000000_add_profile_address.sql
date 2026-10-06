-- Add address fields to profiles
ALTER TABLE public.profiles ADD COLUMN address text;
ALTER TABLE public.profiles ADD COLUMN city text;
ALTER TABLE public.profiles ADD COLUMN state text;
ALTER TABLE public.profiles ADD COLUMN pincode text;

-- AirBear PWA Database Schema for Supabase (Idempotent Version)
-- Run this in your Supabase SQL Editor - Safe to run multiple times

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean slate)
DROP TABLE IF EXISTS public.airbear_inventory CASCADE;
DROP TABLE IF EXISTS public.bodega_items CASCADE;
DROP TABLE IF EXISTS public.rides CASCADE;
DROP TABLE IF EXISTS public.airbears CASCADE;
DROP TABLE IF EXISTS public.spots CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop and recreate enums (idempotent approach)
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS ride_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Create enums
CREATE TYPE user_role AS ENUM ('user', 'driver', 'admin');
CREATE TYPE ride_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('stripe', 'apple_pay', 'google_pay', 'cash');

-- Users table (matches application code with camelCase columns)
CREATE TABLE IF NOT EXISTS public.users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatarUrl TEXT,
  role user_role NOT NULL DEFAULT 'user',
  stripeCustomerId TEXT,
  stripeSubscriptionId TEXT,
  ecoPoints INTEGER NOT NULL DEFAULT 0,
  totalRides INTEGER NOT NULL DEFAULT 0,
  co2Saved DECIMAL(10, 2) NOT NULL DEFAULT 0,
  hasCeoTshirt BOOLEAN NOT NULL DEFAULT false,
  tshirtPurchaseDate TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spots table (matches schema.ts with camelCase columns)
CREATE TABLE IF NOT EXISTS public.spots (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  description TEXT,
  amenities TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Airbears table (matches application code with camelCase columns)
CREATE TABLE IF NOT EXISTS public.airbears (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  driverId VARCHAR REFERENCES public.users(id),
  currentSpotId VARCHAR REFERENCES public.spots(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  heading DECIMAL(5, 2) DEFAULT 0,
  batteryLevel INTEGER NOT NULL DEFAULT 100,
  isAvailable BOOLEAN NOT NULL DEFAULT true,
  isCharging BOOLEAN NOT NULL DEFAULT false,
  totalDistance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  maintenanceStatus TEXT NOT NULL DEFAULT 'good',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rides table (matches application code with camelCase columns)
CREATE TABLE IF NOT EXISTS public.rides (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  userId VARCHAR NOT NULL REFERENCES public.users(id),
  driverId VARCHAR REFERENCES public.users(id),
  airbearId VARCHAR REFERENCES public.airbears(id),
  pickupSpotId VARCHAR NOT NULL REFERENCES public.spots(id),
  dropoffSpotId VARCHAR NOT NULL REFERENCES public.spots(id),
  status ride_status NOT NULL DEFAULT 'pending',
  estimatedDuration INTEGER, -- minutes
  actualDuration INTEGER, -- minutes
  distance DECIMAL(8, 2), -- km
  co2Saved DECIMAL(8, 2), -- kg
  fare DECIMAL(8, 2) NOT NULL,
  isFreeTshirtRide BOOLEAN NOT NULL DEFAULT false,
  requestedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acceptedAt TIMESTAMP WITH TIME ZONE,
  startedAt TIMESTAMP WITH TIME ZONE,
  completedAt TIMESTAMP WITH TIME ZONE
);

-- Bodega items table (matches application code with camelCase columns)
CREATE TABLE IF NOT EXISTS public.bodega_items (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(8, 2) NOT NULL,
  imageUrl TEXT,
  category TEXT NOT NULL,
  isEcoFriendly BOOLEAN NOT NULL DEFAULT false,
  isAvailable BOOLEAN NOT NULL DEFAULT true,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Airbear inventory table (many-to-many between airbears and bodega items)
CREATE TABLE IF NOT EXISTS public.airbear_inventory (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  airbearId VARCHAR NOT NULL REFERENCES public.airbears(id),
  itemId VARCHAR NOT NULL REFERENCES public.bodega_items(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  lastRestocked TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert all 17 locations from spots.ts
INSERT INTO public.spots (id, name, latitude, longitude, description, amenities) VALUES
('court-street-downtown', 'Court Street Downtown', 42.099118, -75.917538, 'Heart of downtown Binghamton with shopping and dining', ARRAY['Restaurants', 'Shopping', 'Banks', 'Government Buildings']),
('riverwalk-bu-center', 'Riverwalk BU Center', 42.098765, -75.916543, 'Beautiful riverside walkway and community center', ARRAY['River Views', 'Walking Trails', 'Community Center', 'Parks']),
('confluence-park', 'Confluence Park', 42.090123, -75.912345, 'Scenic park at the confluence of rivers', ARRAY['Park', 'River Access', 'Picnic Areas', 'Nature Trails']),
('southside-walking-bridge', 'Southside Walking Bridge', 42.091409, -75.914568, 'Pedestrian bridge connecting communities', ARRAY['Bridge Access', 'River Views', 'Walking Path']),
('general-hospital', 'General Hospital', 42.086741, -75.915711, 'Major healthcare facility', ARRAY['Hospital', 'Medical Services', 'Emergency Care']),
('mcarthur-park', 'McArthur Park', 42.086165, -75.926153, 'Community park with recreational facilities', ARRAY['Playground', 'Sports Fields', 'Picnic Areas', 'Walking Trails']),
('greenway-path', 'Greenway Path', 42.086678, -75.932483, 'Scenic greenway for walking and cycling', ARRAY['Bike Path', 'Walking Trail', 'Nature Views', 'Exercise Stations']),
('vestal-center', 'Vestal Center', 42.091851, -75.951729, 'Commercial and community hub in Vestal', ARRAY['Shopping', 'Restaurants', 'Services', 'Parking']),
('innovation-park', 'Innovation Park', 42.093877, -75.958331, 'Technology and business innovation center', ARRAY['Business Center', 'Technology Hub', 'Conference Facilities']),
('bu-east-gym', 'BU East Gym', 42.091695, -75.963590, 'Binghamton University East Campus Recreation Center', ARRAY['Gym', 'Fitness Center', 'Sports Facilities', 'Student Services']),
('bu-fine-arts-building', 'BU Fine Arts Building', 42.089282, -75.967441, 'Arts and culture center at Binghamton University', ARRAY['Art Galleries', 'Performance Spaces', 'Studios', 'Cultural Events']),
('whitney-hall', 'Whitney Hall', 42.088456, -75.965432, 'Academic building at Binghamton University', ARRAY['Classrooms', 'Lecture Halls', 'Study Spaces', 'Academic Services']),
('student-union', 'Student Union', 42.086903, -75.966704, 'Central hub of student life at Binghamton University', ARRAY['Food Court', 'Student Services', 'Meeting Rooms', 'Study Spaces']),
('appalachian-dining', 'Appalachian Dining', 42.084523, -75.971264, 'Dining hall serving the Appalachian community', ARRAY['Dining Hall', 'Food Services', 'Residential Area']),
('hinman-dining-hall', 'Hinman Dining Hall', 42.086314, -75.973292, 'Main dining facility in Hinman community', ARRAY['Dining Hall', 'Food Services', 'Student Housing Area']),
('bu-science-building', 'BU Science Building', 42.090227, -75.972315, 'Science and research facilities at Binghamton University', ARRAY['Laboratories', 'Research Facilities', 'Classrooms', 'Science Library']);

INSERT INTO public.airbears (id, currentSpotId, latitude, longitude, batteryLevel, isAvailable, heading, maintenanceStatus) VALUES
('8508dd0f-06e6-408c-ac1b-234c7bd422a5', 'court-street-downtown', 42.099118, -75.917538, 85, true, 45.0, 'good');

INSERT INTO public.bodega_items (id, name, description, price, category, imageUrl, isEcoFriendly, stock) VALUES
('e0df07e3-4690-4310-a00e-8dec897cfd02', 'Cold Brew Coffee', 'Smooth, cold-brewed coffee served over ice with a hint of vanilla', 4.50, 'beverages', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop', true, 25),
('048afb99-4e8a-4f4a-a922-466bb90c4888', 'Green Smoothie Bowl', 'Organic spinach, banana, almond milk, topped with granola and berries', 8.75, 'food', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop', true, 15),
('061110f2-211a-466b-bf51-7aecb19f9ba4', 'Avocado Toast', 'Sourdough bread with smashed avocado, cherry tomatoes, and microgreens', 7.25, 'food', 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=400&fit=crop', true, 20),
('ee53c4db-b9ec-4b56-974a-e9f15e5e2430', 'Sparkling Water', 'Naturally carbonated spring water in recyclable glass bottles', 2.50, 'beverages', 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400&h=400&fit=crop', true, 30);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_spots_location ON public.spots USING GIST (point(longitude, latitude));
CREATE INDEX IF NOT EXISTS idx_airbears_location ON public.airbears USING GIST (point(longitude, latitude));
CREATE INDEX IF NOT EXISTS idx_airbears_available ON public.airbears(isAvailable);
CREATE INDEX IF NOT EXISTS idx_rides_user ON public.rides(userId);
CREATE INDEX IF NOT EXISTS idx_rides_status ON public.rides(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Enable Row Level Security (RLS)
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airbears ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bodega_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airbear_inventory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Spots - Everyone can read, only authenticated can write
CREATE POLICY "Spots are viewable by everyone" ON public.spots FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can insert spots" ON public.spots FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update spots" ON public.spots FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete spots" ON public.spots FOR DELETE USING (auth.role() = 'authenticated');

-- Airbears - Everyone can read, only authenticated can write
CREATE POLICY "Airbears are viewable by everyone" ON public.airbears FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can insert airbears" ON public.airbears FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update airbears" ON public.airbears FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete airbears" ON public.airbears FOR DELETE USING (auth.role() = 'authenticated');

-- Users - Users can read their own data, authenticated can read all
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Authenticated users can view all users" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid()::text = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Only authenticated users can delete users" ON public.users FOR DELETE USING (auth.role() = 'authenticated');

-- Rides - Users can read their own rides, drivers can read assigned rides
CREATE POLICY "Users can view their own rides" ON public.rides FOR SELECT USING (auth.uid()::text = userId);
CREATE POLICY "Drivers can view assigned rides" ON public.rides FOR SELECT USING (auth.uid()::text = driverId);
CREATE POLICY "Users can create rides" ON public.rides FOR INSERT WITH CHECK (auth.uid()::text = userId);
CREATE POLICY "Users can update their own rides" ON public.rides FOR UPDATE USING (auth.uid()::text = userId OR auth.uid()::text = driverId);

-- Bodega Items - Everyone can read, only authenticated can write
CREATE POLICY "Bodega items are viewable by everyone" ON public.bodega_items FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can manage bodega items" ON public.bodega_items FOR ALL USING (auth.role() = 'authenticated');

-- Airbear Inventory - Everyone can read, only authenticated can write
CREATE POLICY "Airbear inventory is viewable by everyone" ON public.airbear_inventory FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can manage airbear inventory" ON public.airbear_inventory FOR ALL USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Set up realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.spots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.airbears;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;

-- Create functions for timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_airbears_updated_at BEFORE UPDATE ON public.airbears FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

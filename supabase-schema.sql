-- AirBear PWA Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Spots Table
CREATE TABLE IF NOT EXISTS public.spots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  description TEXT,
  amenities TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Airbears (Rickshaws) Table
CREATE TABLE IF NOT EXISTS public.airbears (
  id TEXT PRIMARY KEY,
  current_spot_id TEXT REFERENCES public.spots(id),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  battery_level INTEGER DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
  is_available BOOLEAN DEFAULT true,
  is_charging BOOLEAN DEFAULT false,
  heading DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'driver', 'admin')),
  eco_points INTEGER DEFAULT 0,
  total_rides INTEGER DEFAULT 0,
  co2_saved DECIMAL(10, 2) DEFAULT 0,
  has_ceo_tshirt BOOLEAN DEFAULT false,
  assigned_airbear_id TEXT REFERENCES public.airbears(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rides Table
CREATE TABLE IF NOT EXISTS public.rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  pickup_spot_id TEXT REFERENCES public.spots(id),
  dropoff_spot_id TEXT REFERENCES public.spots(id),
  airbear_id TEXT REFERENCES public.airbears(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'booked', 'in_progress', 'completed', 'cancelled')),
  fare DECIMAL(10, 2),
  distance_km DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID REFERENCES public.rides(id),
  user_id UUID REFERENCES public.users(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  payment_method TEXT CHECK (payment_method IN ('stripe', 'apple_pay', 'google_pay', 'cash')),
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airbears ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Spots (Public Read)
CREATE POLICY "Spots are viewable by everyone" ON public.spots
  FOR SELECT USING (true);

-- RLS Policies for Airbears (Public Read)
CREATE POLICY "Airbears are viewable by everyone" ON public.airbears
  FOR SELECT USING (true);

-- RLS Policy for Drivers to update their assigned airbear
CREATE POLICY "Drivers can update their assigned airbear" ON public.airbears
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'driver' 
      AND users.assigned_airbear_id = airbears.id
    )
  );

-- RLS Policies for Users
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for Rides
CREATE POLICY "Users can view their own rides" ON public.rides
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rides" ON public.rides
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Payments
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Insert Initial Spot Data (Binghamton locations)
INSERT INTO public.spots (id, name, latitude, longitude, description, amenities, is_active) VALUES
('court-street-downtown', 'Court Street Downtown', 42.099118, -75.917538, 'Heart of downtown Binghamton', ARRAY['Restaurants', 'Shopping'], true),
('riverwalk-bu-center', 'Riverwalk BU Center', 42.098765, -75.916543, 'Riverside walkway', ARRAY['Parks', 'Walking Trails'], true),
('confluence-park', 'Confluence Park', 42.090123, -75.912345, 'Scenic park', ARRAY['Park', 'Nature'], true),
('southside-walking-bridge', 'Southside Walking Bridge', 42.091409, -75.914568, 'Pedestrian bridge', ARRAY['Bridge', 'Views'], true),
('general-hospital', 'General Hospital', 42.086741, -75.915711, 'Healthcare facility', ARRAY['Hospital'], true),
('mcarthur-park', 'McArthur Park', 42.086165, -75.926153, 'Community park', ARRAY['Playground', 'Sports'], true),
('greenway-path', 'Greenway Path', 42.086678, -75.932483, 'Scenic greenway', ARRAY['Bike Path', 'Walking'], true),
('vestal-center', 'Vestal Center', 42.091851, -75.951729, 'Commercial hub', ARRAY['Shopping', 'Dining'], true),
('innovation-park', 'Innovation Park', 42.093877, -75.958331, 'Tech center', ARRAY['Business'], true),
('bu-east-gym', 'BU East Gym', 42.091695, -75.963590, 'Recreation center', ARRAY['Gym', 'Fitness'], true),
('bu-fine-arts-building', 'BU Fine Arts Building', 42.089282, -75.967441, 'Arts center', ARRAY['Art', 'Culture'], true),
('whitney-hall', 'Whitney Hall', 42.088456, -75.965432, 'Academic building', ARRAY['Classrooms'], true),
('student-union', 'Student Union', 42.086903, -75.966704, 'Student hub', ARRAY['Food', 'Services'], true),
('appalachian-dining', 'Appalachian Dining', 42.084523, -75.971264, 'Dining hall', ARRAY['Food'], true),
('hinman-dining-hall', 'Hinman Dining Hall', 42.086314, -75.973292, 'Dining facility', ARRAY['Food'], true),
('bu-science-building', 'BU Science Building', 42.090227, -75.972315, 'Science labs', ARRAY['Labs', 'Research'], true)
ON CONFLICT (id) DO NOTHING;

-- Insert Initial Airbear Data (Currently 1 vehicle in operation)
INSERT INTO public.airbears (id, current_spot_id, latitude, longitude, battery_level, is_available, is_charging, heading) VALUES
('airbear-001', 'court-street-downtown', 42.099118, -75.917538, 95, true, false, 0)
ON CONFLICT (id) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_airbears_updated_at BEFORE UPDATE ON public.airbears
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'AirBear database schema created successfully!';
  RAISE NOTICE 'Tables: spots (16 locations), airbears (1 vehicle), users, rides, payments';
  RAISE NOTICE 'RLS policies enabled for security';
  RAISE NOTICE 'Real-time tracking ready!';
END $$;

-- ============================================================================
-- REALTIME SETUP (Run these separately after schema creation)
-- ============================================================================

-- Enable Realtime for airbears table (for live location updates)
-- Go to: Database → Replication → Enable for 'airbears' table
-- Or run this if you have the extension:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.airbears;

-- ============================================================================
-- HELPER COMMANDS (Use these to manage your system)
-- ============================================================================

-- Create a driver account (run after a user signs up):
-- UPDATE public.users 
-- SET role = 'driver', assigned_airbear_id = 'airbear-001'
-- WHERE email = 'your-driver-email@example.com';

-- Add more airbears when you expand:
-- INSERT INTO public.airbears (id, current_spot_id, latitude, longitude, battery_level, is_available) 
-- VALUES ('airbear-002', 'vestal-center', 42.091851, -75.951729, 100, true);

-- View all active rides:
-- SELECT r.*, u.username, s1.name as pickup, s2.name as dropoff
-- FROM public.rides r
-- JOIN public.users u ON r.user_id = u.id
-- JOIN public.spots s1 ON r.pickup_spot_id = s1.id
-- JOIN public.spots s2 ON r.dropoff_spot_id = s2.id
-- WHERE r.status != 'completed';

-- Check airbear locations:
-- SELECT id, current_spot_id, latitude, longitude, battery_level, is_available, 
--        updated_at
-- FROM public.airbears
-- ORDER BY updated_at DESC;

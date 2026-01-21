-- AirBear PWA Database Schema for Supabase (Fixed)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean slate)
DROP TABLE IF EXISTS public.rides CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.bodega_items CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.airbears CASCADE;
DROP TABLE IF EXISTS public.spots CASCADE;

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
  maintenance_status TEXT DEFAULT 'good',
  total_distance DECIMAL(10, 2) DEFAULT 0,
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
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tshirt_purchase_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rides Table
CREATE TABLE IF NOT EXISTS public.rides (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  pickup_spot_id TEXT REFERENCES public.spots(id),
  dropoff_spot_id TEXT REFERENCES public.spots(id),
  driver_id UUID REFERENCES public.users(id),
  airbear_id TEXT REFERENCES public.airbears(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'booked', 'in_progress', 'completed', 'cancelled')),
  estimated_fare DECIMAL(10, 2) NOT NULL,
  estimated_time INTEGER NOT NULL,
  actual_fare DECIMAL(10, 2),
  actual_time INTEGER,
  pickup_time TIMESTAMP WITH TIME ZONE,
  dropoff_time TIMESTAMP WITH TIME ZONE,
  distance_km DECIMAL(8, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bodega Items Table
CREATE TABLE IF NOT EXISTS public.bodega_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  is_eco_friendly BOOLEAN DEFAULT true,
  stock INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  ride_id TEXT REFERENCES public.rides(id),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  delivery_location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  ride_id TEXT REFERENCES public.rides(id),
  order_id TEXT REFERENCES public.orders(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
  payment_method TEXT DEFAULT 'stripe' CHECK (payment_method IN ('stripe', 'cash', 'crypto')),
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO public.spots (id, name, latitude, longitude, description, amenities) VALUES
('db0ccef3-f6ee-4b8c-b6d6-3d4bc22891ac', 'Court Street Downtown', 42.099118, -75.917538, 'Main downtown pickup location', ARRAY['wifi', 'shelter', 'bench']),
('d38f2ea6-9ef8-4ce3-baaf-0ca7dbee4b07', 'Riverwalk BU Center', 42.098765, -75.916543, 'Binghamton University area', ARRAY['wifi', 'charging', 'food']),
('07e41f8e-f96c-48be-be90-107c9bbee4c5', 'Confluence Park', 42.090123, -75.912345, 'Scenic park location', ARRAY['parking', 'shelter', 'bike_rack']);

INSERT INTO public.airbears (id, current_spot_id, latitude, longitude, battery_level, is_available, heading, maintenance_status) VALUES
('8508dd0f-06e6-408c-ac1b-234c7bd422a5', 'db0ccef3-f6ee-4b8c-b6d6-3d4bc22891ac', 42.099118, -75.917538, 85, true, 45.0, 'good');

INSERT INTO public.bodega_items (id, name, description, price, category, image_url, is_eco_friendly, stock) VALUES
('e0df07e3-4690-4310-a00e-8dec897cfd02', 'Cold Brew Coffee', 'Smooth, cold-brewed coffee served over ice with a hint of vanilla', 4.50, 'beverages', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop', true, 25),
('048afb99-4e8a-4f4a-a922-466bb90c4888', 'Green Smoothie Bowl', 'Organic spinach, banana, almond milk, topped with granola and berries', 8.75, 'food', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop', true, 15),
('061110f2-211a-466b-bf51-7aecb19f9ba4', 'Avocado Toast', 'Sourdough bread with smashed avocado, cherry tomatoes, and microgreens', 7.25, 'food', 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=400&fit=crop', true, 20),
('ee53c4db-b9ec-4b56-974a-e9f15e5e2430', 'Sparkling Water', 'Naturally carbonated spring water in recyclable glass bottles', 2.50, 'beverages', 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400&h=400&fit=crop', true, 30);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_spots_location ON public.spots USING GIST (point(longitude, latitude));
CREATE INDEX IF NOT EXISTS idx_airbears_location ON public.airbears USING GIST (point(longitude, latitude));
CREATE INDEX IF NOT EXISTS idx_airbears_available ON public.airbears(is_available);
CREATE INDEX IF NOT EXISTS idx_rides_user ON public.rides(user_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON public.rides(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Enable Row Level Security (RLS)
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airbears ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bodega_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

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
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Authenticated users can view all users" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Only authenticated users can delete users" ON public.users FOR DELETE USING (auth.role() = 'authenticated');

-- Rides - Users can read their own rides, drivers can read assigned rides
CREATE POLICY "Users can view their own rides" ON public.rides FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Drivers can view assigned rides" ON public.rides FOR SELECT USING (auth.uid() = driver_id);
CREATE POLICY "Users can create rides" ON public.rides FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own rides" ON public.rides FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = driver_id);

-- Bodega Items - Everyone can read, only authenticated can write
CREATE POLICY "Bodega items are viewable by everyone" ON public.bodega_items FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can manage bodega items" ON public.bodega_items FOR ALL USING (auth.role() = 'authenticated');

-- Orders - Users can read their own orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);

-- Payments - Users can read their own payments
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Set up realtime subscriptions
-- Uncomment these lines if you want to enable realtime for specific tables
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.spots;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.airbears;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;

-- Create functions for timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_spots_updated_at BEFORE UPDATE ON public.spots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_airbears_updated_at BEFORE UPDATE ON public.airbears FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON public.rides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

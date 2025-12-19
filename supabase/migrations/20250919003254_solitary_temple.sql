/*
  # AirBear Database Schema Setup

  1. New Tables
    - `users` - User accounts with role-based access (user, driver, admin)
    - `spots` - Binghamton pickup/dropoff locations from CSV data
    - `airbears` - Solar-powered vehicle fleet management
    - `rides` - Ride booking and tracking system
    - `bodega_items` - Mobile bodega inventory including CEO T-shirts
    - `airbear_inventory` - Vehicle-specific inventory tracking
    - `orders` - Bodega purchase orders
    - `payments` - Stripe payment processing records
    - `advertising_packages` - Silver/Gold/Platinum ad hosting

  2. Security
    - Enable RLS on all tables
    - User-specific access policies
    - Driver and admin role permissions
    - Public read access for spots and bodega items

  3. Special Features
    - Real-time subscriptions for ride updates
    - Inventory management for mobile bodegas
    - CEO T-shirt promo integration
    - Advertising package management
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE user_role AS ENUM ('user', 'driver', 'admin');
CREATE TYPE ride_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('stripe', 'apple_pay', 'google_pay', 'cash');
CREATE TYPE maintenance_status AS ENUM ('excellent', 'good', 'needs_service', 'out_of_service');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role user_role NOT NULL DEFAULT 'user',
  stripe_customer_id text,
  stripe_subscription_id text,
  eco_points integer NOT NULL DEFAULT 0,
  total_rides integer NOT NULL DEFAULT 0,
  co2_saved decimal(10,2) NOT NULL DEFAULT 0,
  has_ceo_tshirt boolean NOT NULL DEFAULT false,
  tshirt_purchase_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Spots table (from CSV data)
CREATE TABLE IF NOT EXISTS spots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  latitude decimal(10,8) NOT NULL,
  longitude decimal(11,8) NOT NULL,
  description text,
  amenities text[],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Airbears table (renamed from rickshaws)
CREATE TABLE IF NOT EXISTS airbears (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id uuid REFERENCES users(id),
  current_spot_id uuid REFERENCES spots(id),
  battery_level integer NOT NULL DEFAULT 100,
  is_available boolean NOT NULL DEFAULT true,
  is_charging boolean NOT NULL DEFAULT false,
  total_distance decimal(10,2) NOT NULL DEFAULT 0,
  maintenance_status maintenance_status NOT NULL DEFAULT 'good',
  solar_panel_efficiency decimal(5,2) NOT NULL DEFAULT 95.0,
  last_maintenance timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Rides table
CREATE TABLE IF NOT EXISTS rides (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id),
  driver_id uuid REFERENCES users(id),
  airbear_id uuid REFERENCES airbears(id),
  pickup_spot_id uuid NOT NULL REFERENCES spots(id),
  destination_spot_id uuid NOT NULL REFERENCES spots(id),
  status ride_status NOT NULL DEFAULT 'pending',
  estimated_duration integer, -- minutes
  actual_duration integer, -- minutes
  distance decimal(8,2), -- km
  co2_saved decimal(8,2), -- kg
  fare decimal(8,2) NOT NULL,
  is_free_tshirt_ride boolean NOT NULL DEFAULT false,
  requested_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz
);

-- Bodega items table (including CEO T-shirts)
CREATE TABLE IF NOT EXISTS bodega_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  price decimal(8,2) NOT NULL,
  image_url text,
  category text NOT NULL,
  is_eco_friendly boolean NOT NULL DEFAULT false,
  is_available boolean NOT NULL DEFAULT true,
  is_ceo_special boolean NOT NULL DEFAULT false,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Airbear inventory table (many-to-many between airbears and bodega items)
CREATE TABLE IF NOT EXISTS airbear_inventory (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  airbear_id uuid NOT NULL REFERENCES airbears(id),
  item_id uuid NOT NULL REFERENCES bodega_items(id),
  quantity integer NOT NULL DEFAULT 0,
  last_restocked timestamptz DEFAULT now(),
  UNIQUE(airbear_id, item_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id),
  ride_id uuid REFERENCES rides(id),
  airbear_id uuid REFERENCES airbears(id),
  items jsonb NOT NULL, -- Array of {itemId, quantity, price}
  total_amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id),
  order_id uuid REFERENCES orders(id),
  ride_id uuid REFERENCES rides(id),
  stripe_payment_intent_id text,
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method payment_method NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Advertising packages table
CREATE TABLE IF NOT EXISTS advertising_packages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL, -- Silver, Gold, Platinum
  description text,
  price decimal(8,2) NOT NULL,
  features text[],
  includes_led_banner boolean NOT NULL DEFAULT false,
  includes_screen_ads boolean NOT NULL DEFAULT false,
  includes_website_ads boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE airbears ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE bodega_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE airbear_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertising_packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for spots (public read)
CREATE POLICY "Anyone can read active spots" ON spots
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- RLS Policies for airbears
CREATE POLICY "Anyone can read available airbears" ON airbears
  FOR SELECT TO anon, authenticated
  USING (is_available = true);

CREATE POLICY "Drivers can manage their airbears" ON airbears
  FOR ALL TO authenticated
  USING (driver_id = auth.uid());

-- RLS Policies for rides
CREATE POLICY "Users can read own rides" ON rides
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR driver_id = auth.uid());

CREATE POLICY "Users can create rides" ON rides
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Drivers can update assigned rides" ON rides
  FOR UPDATE TO authenticated
  USING (driver_id = auth.uid());

-- RLS Policies for bodega items (public read)
CREATE POLICY "Anyone can read available items" ON bodega_items
  FOR SELECT TO anon, authenticated
  USING (is_available = true);

-- RLS Policies for orders
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for payments
CREATE POLICY "Users can read own payments" ON payments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for advertising packages (public read)
CREATE POLICY "Anyone can read advertising packages" ON advertising_packages
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Insert Binghamton spots from CSV data
INSERT INTO spots (name, latitude, longitude, description, amenities) VALUES
('Court Street Downtown', 42.099118, -75.917538, 'Heart of downtown Binghamton with shopping and dining', ARRAY['Restaurants', 'Shopping', 'Banks', 'Government Buildings']),
('Riverwalk BU Center', 42.098765, -75.916543, 'Beautiful riverside walkway and community center', ARRAY['River Views', 'Walking Trails', 'Community Center', 'Parks']),
('Confluence Park', 42.090123, -75.912345, 'Scenic park at the confluence of rivers', ARRAY['Park', 'River Access', 'Picnic Areas', 'Nature Trails']),
('Southside Walking Bridge', 42.091409, -75.914568, 'Pedestrian bridge connecting communities', ARRAY['Bridge Access', 'River Views', 'Walking Path']),
('General Hospital', 42.086741, -75.915711, 'Major healthcare facility', ARRAY['Hospital', 'Medical Services', 'Emergency Care']),
('McArthur Park', 42.086165, -75.926153, 'Community park with recreational facilities', ARRAY['Playground', 'Sports Fields', 'Picnic Areas', 'Walking Trails']),
('Greenway Path', 42.086678, -75.932483, 'Scenic greenway for walking and cycling', ARRAY['Bike Path', 'Walking Trail', 'Nature Views', 'Exercise Stations']),
('Vestal Center', 42.091851, -75.951729, 'Commercial and community hub in Vestal', ARRAY['Shopping', 'Restaurants', 'Services', 'Parking']),
('Innovation Park', 42.093877, -75.958331, 'Technology and business innovation center', ARRAY['Business Center', 'Technology Hub', 'Conference Facilities']),
('BU East Gym', 42.091695, -75.963590, 'Binghamton University East Campus Recreation Center', ARRAY['Gym', 'Fitness Center', 'Sports Facilities', 'Student Services']),
('BU Fine Arts Building', 42.089282, -75.967441, 'Arts and culture center at Binghamton University', ARRAY['Art Galleries', 'Performance Spaces', 'Studios', 'Cultural Events']),
('Whitney Hall', 42.088456, -75.965432, 'Academic building at Binghamton University', ARRAY['Classrooms', 'Lecture Halls', 'Study Spaces', 'Academic Services']),
('Student Union', 42.086903, -75.966704, 'Central hub of student life at Binghamton University', ARRAY['Food Court', 'Student Services', 'Meeting Rooms', 'Study Spaces']),
('Appalachian Dining', 42.084523, -75.971264, 'Dining hall serving the Appalachian community', ARRAY['Dining Hall', 'Food Services', 'Residential Area']),
('Hinman Dining Hall', 42.086314, -75.973292, 'Main dining facility in Hinman community', ARRAY['Dining Hall', 'Food Services', 'Student Housing Area']),
('BU Science Building', 42.090227, -75.972315, 'Science and research facilities at Binghamton University', ARRAY['Laboratories', 'Research Facilities', 'Classrooms', 'Science Library']);

-- Insert CEO T-shirts and bodega items
INSERT INTO bodega_items (name, description, price, category, is_eco_friendly, is_ceo_special, stock) VALUES
-- CEO T-Shirts (100 units)
('CEO-Signed AirBear T-Shirt - Size XS', 'Authentic CEO-signed organic cotton t-shirt with unlimited daily rides for life. Non-transferable premium membership.', 100.00, 'apparel', true, true, 10),
('CEO-Signed AirBear T-Shirt - Size S', 'Authentic CEO-signed organic cotton t-shirt with unlimited daily rides for life. Non-transferable premium membership.', 100.00, 'apparel', true, true, 15),
('CEO-Signed AirBear T-Shirt - Size M', 'Authentic CEO-signed organic cotton t-shirt with unlimited daily rides for life. Non-transferable premium membership.', 100.00, 'apparel', true, true, 25),
('CEO-Signed AirBear T-Shirt - Size L', 'Authentic CEO-signed organic cotton t-shirt with unlimited daily rides for life. Non-transferable premium membership.', 100.00, 'apparel', true, true, 25),
('CEO-Signed AirBear T-Shirt - Size XL', 'Authentic CEO-signed organic cotton t-shirt with unlimited daily rides for life. Non-transferable premium membership.', 100.00, 'apparel', true, true, 15),
('CEO-Signed AirBear T-Shirt - Size XXL', 'Authentic CEO-signed organic cotton t-shirt with unlimited daily rides for life. Non-transferable premium membership.', 100.00, 'apparel', true, true, 10),

-- Regular bodega items
('Local Coffee Blend', 'Binghamton roasted, eco-friendly packaging', 12.99, 'beverages', true, false, 50),
('Fresh Produce Box', 'Locally sourced, seasonal selection', 24.99, 'food', true, false, 30),
('Eco Water Bottle', 'Bamboo fiber, BPA-free, 500ml', 18.99, 'accessories', true, false, 40),
('Energy Snack Mix', 'Locally made, organic ingredients', 8.99, 'snacks', true, false, 60),
('Solar Power Bank', 'Portable solar charger for devices', 45.99, 'accessories', true, false, 20),
('Organic Granola Bar', 'Locally sourced nuts and fruits', 3.99, 'snacks', true, false, 80),
('Binghamton Honey', 'Pure local wildflower honey', 15.99, 'food', true, false, 25),
('Eco-Friendly Phone Case', 'Biodegradable bamboo phone protection', 22.99, 'accessories', true, false, 35),
('Herbal Tea Blend', 'Locally foraged healing herbs', 9.99, 'beverages', true, false, 45),
('Sustainable Notebook', 'Recycled paper with seed-embedded cover', 12.99, 'accessories', true, false, 30);

-- Insert advertising packages
INSERT INTO advertising_packages (name, description, price, features, includes_led_banner, includes_screen_ads, includes_website_ads) VALUES
('Silver Package', 'Basic website banner advertisements with standard placement', 299.99, ARRAY['Website banner ads', 'Basic analytics', 'Monthly reporting'], false, false, true),
('Gold Package', 'Premium website placement plus AirBear LED banner advertisements', 599.99, ARRAY['Premium website placement', 'LED banner ads', 'Advanced analytics', 'Bi-weekly reporting', 'Social media mentions'], true, false, true),
('Platinum Package', 'Full integration with website, LED banners, and 35+ inch screen advertisements', 999.99, ARRAY['Full website integration', 'LED banner ads', 'Screen advertisements', 'Real-time analytics', 'Weekly reporting', 'Social media campaign', 'Priority support'], true, true, true);

-- Seed a test AirBear
INSERT INTO airbears (id, battery_level, is_available, maintenance_status)
VALUES ('00000000-0000-0000-0000-000000000001', 100, true, 'excellent')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_spots_active ON spots(is_active);
CREATE INDEX IF NOT EXISTS idx_airbears_available ON airbears(is_available);
CREATE INDEX IF NOT EXISTS idx_airbears_driver ON airbears(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_user ON rides(user_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_bodega_items_category ON bodega_items(category);
CREATE INDEX IF NOT EXISTS idx_bodega_items_available ON bodega_items(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);

-- Functions for real-time updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate ride distance and CO2 savings
CREATE OR REPLACE FUNCTION calculate_ride_metrics()
RETURNS TRIGGER AS $$
DECLARE
  pickup_lat decimal;
  pickup_lng decimal;
  dest_lat decimal;
  dest_lng decimal;
  calculated_distance decimal;
  calculated_co2 decimal;
BEGIN
  -- Get coordinates
  SELECT latitude, longitude INTO pickup_lat, pickup_lng 
  FROM spots WHERE id = NEW.pickup_spot_id;
  
  SELECT latitude, longitude INTO dest_lat, dest_lng 
  FROM spots WHERE id = NEW.destination_spot_id;
  
  -- Calculate distance using Haversine formula (simplified)
  calculated_distance = 6371 * acos(
    cos(radians(pickup_lat)) * cos(radians(dest_lat)) * 
    cos(radians(dest_lng) - radians(pickup_lng)) + 
    sin(radians(pickup_lat)) * sin(radians(dest_lat))
  );
  
  -- Calculate CO2 saved (average car emits 0.21 kg CO2 per km)
  calculated_co2 = calculated_distance * 0.21;
  
  NEW.distance = calculated_distance;
  NEW.co2_saved = calculated_co2;
  NEW.estimated_duration = (calculated_distance / 15) * 60; -- 15 km/h average speed
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for ride calculations
CREATE TRIGGER calculate_ride_metrics_trigger BEFORE INSERT OR UPDATE ON rides
  FOR EACH ROW EXECUTE FUNCTION calculate_ride_metrics();
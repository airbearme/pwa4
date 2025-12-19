-- Migration to add real-time tracking columns and standardize names
-- Date: 2025-12-19

-- Add columns to airbears table
ALTER TABLE IF EXISTS airbears 
ADD COLUMN IF NOT EXISTS latitude decimal(10,8),
ADD COLUMN IF NOT EXISTS longitude decimal(11,8),
ADD COLUMN IF NOT EXISTS heading decimal(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Rename destination_spot_id to dropoff_spot_id in rides table for consistency if it exists
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rides' AND column_name='destination_spot_id') THEN
    ALTER TABLE rides RENAME COLUMN destination_spot_id TO dropoff_spot_id;
  END IF;
END $$;

-- Ensure dropoff_spot_id exists if it wasn't renamed
ALTER TABLE IF EXISTS rides 
ADD COLUMN IF NOT EXISTS dropoff_spot_id uuid REFERENCES spots(id);

-- Enable Realtime for airbears table
-- Note: This is a Supabase specific command usually run in the SQL editor
-- ALTER PUBLICATION supabase_realtime ADD TABLE airbears;

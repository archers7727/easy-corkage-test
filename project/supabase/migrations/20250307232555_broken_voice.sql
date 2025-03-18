/*
  # Add RLS policies for restaurants table

  1. Security
    - Enable RLS on restaurants table
    - Add policies for:
      - Public read access to all restaurants
      - Admin users can manage all restaurants
      - Authenticated users can view all restaurants
*/

-- Enable RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all restaurants
CREATE POLICY "Anyone can view restaurants"
ON restaurants
FOR SELECT
TO public
USING (true);

-- Allow admin users to manage all restaurants
CREATE POLICY "Admins can manage all restaurants"
ON restaurants
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow authenticated users to view all restaurants
CREATE POLICY "Authenticated users can view all restaurants"
ON restaurants
FOR SELECT
TO authenticated
USING (true);
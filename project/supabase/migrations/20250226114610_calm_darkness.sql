/*
  # Restaurant Submissions Schema

  1. New Tables
    - `restaurant_submissions`
      - `id` (uuid, primary key)
      - `name` (text, restaurant name)
      - `location1` (text, primary location)
      - `location2` (text, secondary location)
      - `address` (text, full address)
      - `lat` (float8, latitude)
      - `lng` (float8, longitude)
      - `corkage_type` (text, either 'free' or 'paid')
      - `corkage_fee` (int, fee amount)
      - `corkage_info` (text, additional info)
      - `description` (text, restaurant description)
      - `phone` (text, contact number)
      - `website` (text, website URL)
      - `business_hours` (text, operating hours)
      - `hashtags` (text[], tags)
      - `images` (text[], image URLs)
      - `thumbnail` (text, main image URL)
      - `status` (text, submission status)
      - `submitted_by` (uuid, reference to profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `reviewed_at` (timestamptz)
      - `reviewed_by` (uuid, reference to profiles)
      - `review_notes` (text, admin notes)

  2. Security
    - Enable RLS
    - Add policies for:
      - Users can create submissions
      - Users can view their own submissions
      - Admins can view and update all submissions

  3. Triggers
    - Auto-update updated_at timestamp
*/

-- Create restaurant_submissions table
CREATE TABLE IF NOT EXISTS restaurant_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location1 text NOT NULL,
  location2 text NOT NULL,
  address text NOT NULL,
  lat float8 NOT NULL,
  lng float8 NOT NULL,
  corkage_type text NOT NULL CHECK (corkage_type IN ('free', 'paid')),
  corkage_fee integer NOT NULL DEFAULT 0,
  corkage_info text NOT NULL,
  description text,
  phone text,
  website text,
  business_hours text,
  hashtags text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  thumbnail text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES profiles(id),
  review_notes text,

  CONSTRAINT valid_corkage_fee CHECK (
    (corkage_type = 'free' AND corkage_fee = 0) OR
    (corkage_type = 'paid' AND corkage_fee > 0)
  )
);

-- Enable RLS
ALTER TABLE restaurant_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create submissions"
  ON restaurant_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can view their own submissions"
  ON restaurant_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = submitted_by);

CREATE POLICY "Admins can view all submissions"
  ON restaurant_submissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_restaurant_submissions_updated_at
  BEFORE UPDATE
  ON restaurant_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
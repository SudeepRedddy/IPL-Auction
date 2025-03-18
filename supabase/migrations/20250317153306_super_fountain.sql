/*
  # Create tables for IPL Auction Website

  1. New Tables
    - `teams`
      - `id` (uuid, primary key)
      - `name` (text)
      - `purse_given` (integer)
      - `purse_remaining` (integer)
      - `current_purchase` (integer)
      - `total_purchase` (integer)
      - `players` (jsonb array)
      - `created_at` (timestamp)

    - `players`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text)
      - `base_price` (integer)
      - `sold_price` (integer)
      - `status` (text)
      - `team_id` (uuid, references teams)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create teams table
CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  purse_given integer NOT NULL,
  purse_remaining integer NOT NULL,
  current_purchase integer DEFAULT 0,
  total_purchase integer DEFAULT 0,
  players jsonb[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create players table
CREATE TABLE players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  base_price integer NOT NULL,
  sold_price integer,
  status text NOT NULL DEFAULT 'unsold',
  team_id uuid REFERENCES teams(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON teams
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON teams
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users" ON teams
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Enable read access for all users" ON players
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON players
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON players
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users" ON players
  FOR DELETE
  TO authenticated
  USING (true);
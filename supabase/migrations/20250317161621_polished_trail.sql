/*
  # Fix RLS Policies for Players and Teams Tables

  1. Changes
    - Drop existing policies
    - Create new, more permissive policies for public access
    - Enable full access for authenticated users
    - Enable read-only access for public users

  2. Security
    - Maintains basic security while allowing necessary operations
    - Ensures public can view data
    - Allows authenticated users to perform CRUD operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON players;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON players;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON players;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON players;

DROP POLICY IF EXISTS "Enable read access for all users" ON teams;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON teams;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON teams;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON teams;

-- Create new policies for players table
CREATE POLICY "Enable read access for all users" ON players
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable all access for authenticated users" ON players
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create new policies for teams table
CREATE POLICY "Enable read access for all users" ON teams
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable all access for authenticated users" ON teams
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
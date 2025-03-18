/*
  # Fix RLS Policies for Basic Data Access

  1. Changes
    - Drop existing policies
    - Create simple policies for basic CRUD operations
    - Enable public access for essential operations

  2. Security
    - Allow basic operations without authentication
    - Maintain minimal security while ensuring functionality
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON players;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON players;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON players;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON players;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON players;

DROP POLICY IF EXISTS "Enable read access for all users" ON teams;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON teams;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON teams;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON teams;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON teams;

-- Create simplified policies for players
CREATE POLICY "Enable all operations for players"
ON players FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create simplified policies for teams
CREATE POLICY "Enable all operations for teams"
ON teams FOR ALL
TO public
USING (true)
WITH CHECK (true);
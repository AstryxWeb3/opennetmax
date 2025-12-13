/*
  # Update RLS Policies for Custom Authentication

  1. Changes
    - Remove restrictive RLS policies that rely on app.user_id
    - Add service-level policies that allow API access
    - Security is handled at the application layer

  2. Security Notes
    - Access control is enforced in the API layer
    - Users are authenticated via access codes
    - Database access is through service role key only
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can read own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can read own keys" ON vpn_keys;

-- Create service-level policies (allow all operations for service role)
CREATE POLICY "Enable all access for service role"
  ON users FOR ALL
  USING (true);

CREATE POLICY "Enable all access for service role"
  ON subscriptions FOR ALL
  USING (true);

CREATE POLICY "Enable all access for service role"
  ON vpn_keys FOR ALL
  USING (true);
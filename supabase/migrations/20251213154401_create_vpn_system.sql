/*
  # Create VPN System Database

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `access_code` (text, unique) - Format: XXXX-XXXX-XXXX-XXXX
      - `access_code_hash` (text) - Hashed version for security
      - `created_at` (timestamptz)
    
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `plan` (text) - Plan name (e.g., "1 Month", "6 Months")
      - `expires_at` (timestamptz)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
    
    - `vpn_keys`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `key_type` (text) - VLESS, VMess, or Shadowsocks
      - `config` (text) - Full configuration string
      - `location` (text) - Server location
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Users can only access their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code text UNIQUE NOT NULL,
  access_code_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (id::text = current_setting('app.user_id', true));

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan text NOT NULL,
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (user_id::text = current_setting('app.user_id', true));

-- Create vpn_keys table
CREATE TABLE IF NOT EXISTS vpn_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_type text NOT NULL,
  config text NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vpn_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own keys"
  ON vpn_keys FOR SELECT
  USING (user_id::text = current_setting('app.user_id', true));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_access_code ON users(access_code);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_vpn_keys_user_id ON vpn_keys(user_id);
/*
  # Add VPN Key Generation Function

  1. Functions
    - `generate_vpn_keys_for_user` - Generates VPN keys for a user
    
  2. Notes
    - Automatically generates 3 keys (VLESS, VMess, Shadowsocks) for each location
    - Called when a subscription is activated
*/

-- Function to generate VPN keys for a user
CREATE OR REPLACE FUNCTION generate_vpn_keys_for_user(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_user_access_code text;
  v_locations text[] := ARRAY['🇷🇴 Румыния', '🇩🇪 Германия', '🇳🇱 Нидерланды'];
  v_location text;
BEGIN
  -- Get user's access code
  SELECT access_code INTO v_user_access_code FROM users WHERE id = p_user_id;
  
  -- Delete existing keys for this user
  DELETE FROM vpn_keys WHERE user_id = p_user_id;
  
  -- Generate keys for each location
  FOREACH v_location IN ARRAY v_locations
  LOOP
    -- VLESS key
    INSERT INTO vpn_keys (user_id, key_type, config, location)
    VALUES (
      p_user_id,
      'VLESS',
      'vless://' || gen_random_uuid()::text || '@server1.opennetvpn.com:443?encryption=none&security=tls&type=ws&host=server1.opennetvpn.com&path=/vless#OpenNet-' || v_user_access_code || '-' || v_location,
      v_location
    );
    
    -- VMess key
    INSERT INTO vpn_keys (user_id, key_type, config, location)
    VALUES (
      p_user_id,
      'VMess',
      'vmess://' || encode(
        convert_to(
          '{"v":"2","ps":"OpenNet-' || v_user_access_code || '-' || v_location || '","add":"server2.opennetvpn.com","port":444,"type":"none","id":"' || gen_random_uuid()::text || '","aid":0,"net":"ws","path":"/vmess","host":"server2.opennetvpn.com","tls":"tls"}',
          'UTF8'
        ),
        'base64'
      ),
      v_location
    );
    
    -- Shadowsocks key
    INSERT INTO vpn_keys (user_id, key_type, config, location)
    VALUES (
      p_user_id,
      'Shadowsocks',
      'ss://' || encode(
        convert_to('chacha20-ietf-poly1305:' || substring(md5(gen_random_uuid()::text) from 1 for 16), 'UTF8'),
        'base64'
      ) || '@server3.opennetvpn.com:445#OpenNet-' || v_user_access_code || '-' || v_location,
      v_location
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to generate keys when subscription is created
CREATE OR REPLACE FUNCTION trigger_generate_keys()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    PERFORM generate_vpn_keys_for_user(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_keys_on_subscription ON subscriptions;
CREATE TRIGGER generate_keys_on_subscription
  AFTER INSERT OR UPDATE OF is_active ON subscriptions
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION trigger_generate_keys();

-- Visitor fingerprint logs table
CREATE TABLE public.visitor_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid DEFAULT NULL,
  ip_address text DEFAULT NULL,
  
  -- Browser & System
  user_agent text DEFAULT NULL,
  browser text DEFAULT NULL,
  browser_version text DEFAULT NULL,
  os text DEFAULT NULL,
  platform text DEFAULT NULL,
  language text DEFAULT NULL,
  languages text[] DEFAULT NULL,
  timezone text DEFAULT NULL,
  tz_offset integer DEFAULT NULL,
  cookies_enabled boolean DEFAULT NULL,
  online boolean DEFAULT NULL,
  pdf_viewer boolean DEFAULT NULL,
  
  -- Screen & Display
  screen_width integer DEFAULT NULL,
  screen_height integer DEFAULT NULL,
  available_width integer DEFAULT NULL,
  available_height integer DEFAULT NULL,
  viewport_width integer DEFAULT NULL,
  viewport_height integer DEFAULT NULL,
  pixel_ratio numeric DEFAULT NULL,
  color_depth integer DEFAULT NULL,
  orientation text DEFAULT NULL,
  
  -- Hardware
  device_memory numeric DEFAULT NULL,
  cpu_cores integer DEFAULT NULL,
  gpu_vendor text DEFAULT NULL,
  gpu_renderer text DEFAULT NULL,
  
  -- Network & Battery
  connection_type text DEFAULT NULL,
  downlink numeric DEFAULT NULL,
  rtt integer DEFAULT NULL,
  battery_level numeric DEFAULT NULL,
  battery_charging boolean DEFAULT NULL,
  
  -- Behavior
  time_on_page integer DEFAULT NULL,
  total_clicks integer DEFAULT NULL,
  mouse_moves integer DEFAULT NULL,
  scroll_distance integer DEFAULT NULL,
  max_scroll_percent numeric DEFAULT NULL,
  sections_viewed text[] DEFAULT NULL,
  entry_url text DEFAULT NULL,
  page_load_ms integer DEFAULT NULL,
  dom_loaded_ms integer DEFAULT NULL,
  nav_type text DEFAULT NULL,
  
  -- Geo (from server)
  country_code text DEFAULT NULL,
  country_name text DEFAULT NULL,
  city text DEFAULT NULL,
  latitude numeric DEFAULT NULL,
  longitude numeric DEFAULT NULL,
  
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (visitors may not be authenticated)
CREATE POLICY "Anyone can insert visitor logs" ON public.visitor_logs
  FOR INSERT WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can view visitor logs" ON public.visitor_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for visitor_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_logs;

-- Anomaly detection function: detect unusual login locations
CREATE OR REPLACE FUNCTION public.detect_login_anomalies(_user_id uuid)
RETURNS TABLE(
  session_id uuid,
  ip_address text,
  country_name text,
  city text,
  created_at timestamptz,
  is_anomaly boolean,
  reason text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _usual_countries text[];
  _usual_cities text[];
BEGIN
  -- Get user's usual locations (top countries and cities from history)
  SELECT ARRAY(
    SELECT s.country_name FROM user_sessions s 
    WHERE s.user_id = _user_id AND s.country_name IS NOT NULL
    GROUP BY s.country_name ORDER BY count(*) DESC LIMIT 3
  ) INTO _usual_countries;
  
  SELECT ARRAY(
    SELECT s.city FROM user_sessions s 
    WHERE s.user_id = _user_id AND s.city IS NOT NULL
    GROUP BY s.city ORDER BY count(*) DESC LIMIT 5
  ) INTO _usual_cities;

  RETURN QUERY
  SELECT 
    s.id as session_id,
    s.ip_address::text,
    s.country_name,
    s.city,
    s.created_at,
    CASE 
      WHEN array_length(_usual_countries, 1) >= 2 AND s.country_name IS NOT NULL 
           AND NOT (s.country_name = ANY(_usual_countries)) THEN true
      WHEN array_length(_usual_cities, 1) >= 3 AND s.city IS NOT NULL
           AND NOT (s.city = ANY(_usual_cities)) 
           AND (s.country_name = ANY(_usual_countries)) THEN true
      ELSE false
    END as is_anomaly,
    CASE
      WHEN array_length(_usual_countries, 1) >= 2 AND s.country_name IS NOT NULL 
           AND NOT (s.country_name = ANY(_usual_countries)) THEN 'Login from unusual country: ' || s.country_name
      WHEN array_length(_usual_cities, 1) >= 3 AND s.city IS NOT NULL
           AND NOT (s.city = ANY(_usual_cities))
           AND (s.country_name = ANY(_usual_countries)) THEN 'Login from unusual city: ' || s.city
      ELSE NULL
    END as reason
  FROM user_sessions s
  WHERE s.user_id = _user_id
  ORDER BY s.created_at DESC
  LIMIT 50;
END;
$$;

-- Get all anomalies across all users (admin function)
CREATE OR REPLACE FUNCTION public.get_all_login_anomalies()
RETURNS TABLE(
  session_id uuid,
  user_id uuid,
  username text,
  ip_address text,
  country_name text,
  city text,
  created_at timestamptz,
  reason text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH user_usual AS (
    SELECT 
      s.user_id,
      ARRAY(
        SELECT s2.country_name FROM user_sessions s2 
        WHERE s2.user_id = s.user_id AND s2.country_name IS NOT NULL
        GROUP BY s2.country_name ORDER BY count(*) DESC LIMIT 3
      ) as usual_countries,
      ARRAY(
        SELECT s2.city FROM user_sessions s2 
        WHERE s2.user_id = s.user_id AND s2.city IS NOT NULL
        GROUP BY s2.city ORDER BY count(*) DESC LIMIT 5
      ) as usual_cities
    FROM user_sessions s
    GROUP BY s.user_id
    HAVING count(*) >= 3
  )
  SELECT 
    s.id as session_id,
    s.user_id,
    p.username,
    s.ip_address::text,
    s.country_name,
    s.city,
    s.created_at,
    CASE
      WHEN s.country_name IS NOT NULL AND NOT (s.country_name = ANY(uu.usual_countries)) 
        THEN 'Unusual country: ' || s.country_name
      WHEN s.city IS NOT NULL AND NOT (s.city = ANY(uu.usual_cities)) AND (s.country_name = ANY(uu.usual_countries))
        THEN 'Unusual city: ' || s.city
    END as reason
  FROM user_sessions s
  JOIN user_usual uu ON uu.user_id = s.user_id
  JOIN profiles p ON p.user_id = s.user_id
  WHERE s.created_at >= now() - interval '7 days'
    AND (
      (s.country_name IS NOT NULL AND NOT (s.country_name = ANY(uu.usual_countries)))
      OR (s.city IS NOT NULL AND NOT (s.city = ANY(uu.usual_cities)) AND (s.country_name = ANY(uu.usual_countries)))
    )
  ORDER BY s.created_at DESC
  LIMIT 100;
END;
$$;

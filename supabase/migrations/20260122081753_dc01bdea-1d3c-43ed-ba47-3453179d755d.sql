-- Create a public view for teams that excludes the invite_code
CREATE VIEW public.teams_public
WITH (security_invoker=on) AS
SELECT id, name, description, avatar_url, captain_id, total_points, created_at, updated_at
FROM public.teams;

-- Create a secure function to validate team invite codes
-- This returns team info only if the code is valid, without exposing codes
CREATE OR REPLACE FUNCTION public.validate_team_invite_code(_code text)
RETURNS TABLE(team_id uuid, team_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name FROM public.teams WHERE invite_code = _code;
$$;

-- Create a function to get team with invite code (only for team members)
CREATE OR REPLACE FUNCTION public.get_my_team_invite_code(_team_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.invite_code 
  FROM public.teams t
  INNER JOIN public.profiles p ON p.team_id = t.id
  WHERE t.id = _team_id 
    AND p.user_id = auth.uid();
$$;

-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON public.teams;

-- Create restrictive SELECT policy - only team members can see their own team's full data
-- (including invite_code), others see nothing directly from teams table
CREATE POLICY "Team members can view their own team"
ON public.teams
FOR SELECT
USING (
  id IN (
    SELECT team_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Admins can also see all teams
CREATE POLICY "Admins can view all teams"
ON public.teams
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Grant SELECT on the public view to authenticated and anon users
GRANT SELECT ON public.teams_public TO authenticated, anon;
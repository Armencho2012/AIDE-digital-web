-- Remediate Supabase security findings from the application security scan.

UPDATE storage.buckets
SET public = false
WHERE id = 'podcasts';

DROP POLICY IF EXISTS "Users can upload podcasts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view podcasts" ON storage.objects;
DROP POLICY IF EXISTS "Public can view podcasts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view podcasts" ON storage.objects;
DROP POLICY IF EXISTS "Podcasts are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for podcasts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own podcasts" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload podcasts to their own folder" ON storage.objects;

CREATE POLICY "Users can view their own podcasts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'podcasts'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload podcasts to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'podcasts'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE OR REPLACE FUNCTION public.get_user_plan(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan text;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' AND (auth.uid() IS NULL OR auth.uid() <> p_user_id) THEN
    RETURN 'free';
  END IF;

  SELECT plan_type INTO v_plan
  FROM public.subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY
    CASE plan_type
      WHEN 'class' THEN 1
      WHEN 'pro' THEN 2
      ELSE 3
    END
  LIMIT 1;

  RETURN COALESCE(v_plan, 'free');
END;
$$;

CREATE OR REPLACE FUNCTION public.get_daily_usage_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' AND (auth.uid() IS NULL OR auth.uid() <> p_user_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN (
    SELECT COUNT(*)
    FROM public.usage_logs
    WHERE user_id = p_user_id
      AND created_at >= CURRENT_DATE
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_pro_user(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' AND (auth.uid() IS NULL OR auth.uid() <> p_user_id) THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
      AND plan_type IN ('pro', 'class')
      AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  p_user_id uuid,
  p_email text,
  p_full_name text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' AND (auth.uid() IS NULL OR auth.uid() <> p_user_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (p_user_id, p_email, p_full_name)
  ON CONFLICT (user_id)
  DO UPDATE SET
    email = COALESCE(NULLIF(EXCLUDED.email, ''), profiles.email),
    full_name = CASE
      WHEN EXCLUDED.full_name IS NOT NULL AND EXCLUDED.full_name <> ''
      THEN EXCLUDED.full_name
      ELSE profiles.full_name
    END;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_user_plan(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_pro_user(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_daily_usage_count(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.ensure_user_profile(uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  IF to_regprocedure('public.test_profile_access()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.test_profile_access() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

GRANT EXECUTE ON FUNCTION public.get_user_plan(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_pro_user(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_daily_usage_count(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(uuid, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

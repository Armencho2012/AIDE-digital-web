
DROP POLICY IF EXISTS "Users can upload podcasts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view podcasts" ON storage.objects;
DROP POLICY IF EXISTS "Public can view podcasts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view podcasts" ON storage.objects;
DROP POLICY IF EXISTS "Podcasts are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for podcasts" ON storage.objects;

DROP POLICY IF EXISTS "Users can view their own podcasts" ON storage.objects;
CREATE POLICY "Users can view their own podcasts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'podcasts'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can upload podcasts to their own folder" ON storage.objects;
CREATE POLICY "Users can upload podcasts to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'podcasts'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

REVOKE EXECUTE ON FUNCTION public.get_user_plan(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_pro_user(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_daily_usage_count(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_user_plan(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_pro_user(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_daily_usage_count(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO service_role;

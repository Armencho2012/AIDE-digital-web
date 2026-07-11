
-- Drop overly permissive public SELECT policy on podcasts bucket
DROP POLICY IF EXISTS "Podcast files are publicly accessible" ON storage.objects;

-- Revoke anon EXECUTE on SECURITY DEFINER function (only if function exists)
DO $$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, PUBLIC;
  END IF;
END $$;

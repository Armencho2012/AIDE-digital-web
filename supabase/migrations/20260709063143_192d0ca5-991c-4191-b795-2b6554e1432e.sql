
-- 1. Drop overly permissive service_role ALL policy on subscriptions.
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.subscriptions;

-- 2. Add restrictive policy: block UPDATE from regular authenticated users.
--    Only service_role (which bypasses RLS) can update subscription rows.
DROP POLICY IF EXISTS "Users cannot update their own subscription" ON public.subscriptions;
CREATE POLICY "Users cannot update their own subscription"
ON public.subscriptions
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- 3. Also block DELETE from regular authenticated users on subscriptions.
DROP POLICY IF EXISTS "Users cannot delete their own subscription" ON public.subscriptions;
CREATE POLICY "Users cannot delete their own subscription"
ON public.subscriptions
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (false);

-- 4. Defense-in-depth for profiles email: revoke anon access.
REVOKE ALL ON public.profiles FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

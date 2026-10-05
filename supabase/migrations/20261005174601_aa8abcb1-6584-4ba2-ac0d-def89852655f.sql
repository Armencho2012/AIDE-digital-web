DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;
REVOKE INSERT ON public.subscriptions FROM anon, authenticated;
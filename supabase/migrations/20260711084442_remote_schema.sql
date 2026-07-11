drop trigger if exists "on_profiles_updated" on "public"."profiles";

drop trigger if exists "update_subscriptions_updated_at" on "public"."subscriptions";

CREATE TRIGGER on_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();



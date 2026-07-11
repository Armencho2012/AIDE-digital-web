drop extension if exists "pg_net";

drop trigger if exists "set_updated_at" on "public"."profiles";

drop trigger if exists "set_user_content_updated_at" on "public"."user_content";

drop trigger if exists "update_subscriptions_updated_at" on "public"."subscriptions";

drop policy "Service role can manage subscriptions" on "public"."subscriptions";

drop policy "Users can view their own content" on "public"."user_content";

alter table "public"."profiles" drop constraint "profiles_user_id_fkey";

alter table "public"."profiles" drop constraint "profiles_user_id_key";

alter table "public"."usage_logs" drop constraint "usage_logs_user_id_fkey";

alter table "public"."user_content" drop constraint "user_content_user_id_fkey";

drop function if exists "public"."ensure_user_profile"(p_user_id uuid, p_email text, p_full_name text);

drop function if exists "public"."handle_new_user"();

drop function if exists "public"."test_profile_access"();

drop index if exists "public"."idx_user_content_created_at";

drop index if exists "public"."profiles_user_id_key";

alter table "public"."user_content" drop column "updated_at";

alter table "public"."user_content" alter column "analysis_data" drop not null;

alter table "public"."user_content" alter column "created_at" drop not null;

alter table "public"."user_content" alter column "created_at" set data type timestamp without time zone using "created_at"::timestamp without time zone;

alter table "public"."user_content" alter column "language" drop default;

alter table "public"."user_content" alter column "original_text" set not null;

alter table "public"."user_content" add constraint "user_content_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."user_content" validate constraint "user_content_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_daily_usage_count(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Enforce that users can only check their own usage
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot access other users data';
  END IF;

  RETURN (
    SELECT COUNT(*)
    FROM public.usage_logs
    WHERE user_id = p_user_id
    AND created_at >= CURRENT_DATE
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_plan(p_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_plan TEXT;
BEGIN
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
$function$
;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_pro_user(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Enforce that users can only check their own subscription status
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RETURN FALSE;
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
$function$
;

grant delete on table "public"."subscriptions" to "anon";

grant insert on table "public"."subscriptions" to "anon";

grant select on table "public"."subscriptions" to "anon";

grant update on table "public"."subscriptions" to "anon";

grant delete on table "public"."subscriptions" to "authenticated";

grant insert on table "public"."subscriptions" to "authenticated";

grant select on table "public"."subscriptions" to "authenticated";

grant update on table "public"."subscriptions" to "authenticated";

grant delete on table "public"."subscriptions" to "service_role";

grant insert on table "public"."subscriptions" to "service_role";

grant select on table "public"."subscriptions" to "service_role";

grant update on table "public"."subscriptions" to "service_role";

grant delete on table "public"."usage_logs" to "anon";

grant insert on table "public"."usage_logs" to "anon";

grant select on table "public"."usage_logs" to "anon";

grant update on table "public"."usage_logs" to "anon";

grant delete on table "public"."usage_logs" to "authenticated";

grant insert on table "public"."usage_logs" to "authenticated";

grant select on table "public"."usage_logs" to "authenticated";

grant update on table "public"."usage_logs" to "authenticated";

grant delete on table "public"."usage_logs" to "service_role";

grant insert on table "public"."usage_logs" to "service_role";

grant select on table "public"."usage_logs" to "service_role";

grant update on table "public"."usage_logs" to "service_role";

grant delete on table "public"."user_content" to "anon";

grant insert on table "public"."user_content" to "anon";

grant select on table "public"."user_content" to "anon";

grant update on table "public"."user_content" to "anon";

grant delete on table "public"."user_content" to "authenticated";

grant insert on table "public"."user_content" to "authenticated";

grant select on table "public"."user_content" to "authenticated";

grant update on table "public"."user_content" to "authenticated";

grant delete on table "public"."user_content" to "service_role";

grant insert on table "public"."user_content" to "service_role";

grant select on table "public"."user_content" to "service_role";

grant update on table "public"."user_content" to "service_role";

CREATE TRIGGER on_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

drop trigger if exists "on_auth_user_created" on "auth"."users";


  create policy "Users can delete their own podcasts"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'podcasts'::text) AND ((( SELECT auth.uid() AS uid))::text = (storage.foldername(name))[1])));




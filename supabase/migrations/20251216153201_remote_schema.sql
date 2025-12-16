set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_owner()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select exists (
    select 1
    from employees e
    join roles r on r.id = e.role_id
    where e.user_id = auth.uid()
    and r.name = 'OWNER'
  );
$function$
;



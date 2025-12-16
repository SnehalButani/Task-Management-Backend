alter table "public"."employees" add column "deleted_at" timestamp without time zone;

alter table "public"."tasks" add column "deleted_at" timestamp without time zone;


  create policy "Owner can update organization"
  on "public"."organizations"
  as permissive
  for update
  to public
using ((owner_id = auth.uid()))
with check ((owner_id = auth.uid()));



  create policy "Allow Select"
  on "public"."user_roles"
  as permissive
  for select
  to public
using (true);



  create policy "Users can insert their own user roles"
  on "public"."user_roles"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = user_id));




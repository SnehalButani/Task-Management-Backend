alter table "public"."organizations" add column "deleted_at" timestamp without time zone;

alter table "public"."organizations" add column "is_active" boolean default true;


  create policy "Allow select"
  on "public"."organizations"
  as permissive
  for select
  to public
using (true);




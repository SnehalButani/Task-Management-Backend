
  create policy "Allow Select"
  on "public"."employees"
  as permissive
  for select
  to public
using (true);




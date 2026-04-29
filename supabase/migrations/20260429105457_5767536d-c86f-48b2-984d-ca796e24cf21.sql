
create or replace function public.parents_this_week()
returns integer
language sql
stable
security invoker
set search_path = public
as $$
  select count(distinct id)::int from public.sessions where created_at > now() - interval '7 days';
$$;

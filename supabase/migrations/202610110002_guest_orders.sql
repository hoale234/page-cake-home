begin;

drop table if exists public.addresses cascade;
drop table if exists public.profiles cascade;

alter table public.orders
  drop column if exists user_id cascade;

create index if not exists orders_phone_idx on public.orders (phone);

create or replace function public.admin_order_customer_counts(customer_phones text[])
returns table (phone text, order_count bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select o.phone, count(*)
  from public.orders as o
  where o.phone = any(coalesce(customer_phones, array[]::text[]))
  group by o.phone;
$$;

grant execute on function public.admin_order_customer_counts(text[]) to authenticated;
revoke execute on function public.admin_order_customer_counts(text[]) from public, anon;

commit;

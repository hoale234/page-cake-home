begin;

update public.orders
set status = 'confirmed'
where status not in ('new', 'confirmed');

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in ('new', 'confirmed'));

drop function if exists public.admin_dashboard_summary();

create function public.admin_dashboard_summary()
returns table (
  new_today bigint,
  revenue bigint,
  new_count bigint,
  confirmed_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    count(*) filter (
      where created_at >= (
        date_trunc('day', now() at time zone 'Asia/Ho_Chi_Minh')
        at time zone 'Asia/Ho_Chi_Minh'
      )
      and status = 'new'
    ),
    coalesce(sum(total) filter (where status = 'confirmed'), 0),
    count(*) filter (where status = 'new'),
    count(*) filter (where status = 'confirmed')
  from public.orders;
$$;

grant execute on function public.admin_dashboard_summary() to authenticated;
revoke execute on function public.admin_dashboard_summary() from public, anon;

commit;

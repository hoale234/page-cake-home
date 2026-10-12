create extension if not exists pgcrypto;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price integer not null check (price >= 0),
  unit text not null default '500g',
  image_url text not null default '/images/banh-tai-placeholder.svg',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  customer_name text not null,
  phone text not null,
  address text not null,
  note text not null default '',
  payment_method text not null check (payment_method in ('cod', 'bank_transfer')),
  subtotal integer not null check (subtotal >= 0),
  shipping_fee integer not null default 15000 check (shipping_fee >= 0),
  total integer not null check (total = subtotal + shipping_fee),
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'shipping', 'done', 'cancelled')),
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0)
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index orders_created_at_idx on public.orders (created_at desc);
create index orders_status_created_at_idx on public.orders (status, created_at desc);
create index orders_phone_idx on public.orders (phone);
create index order_items_order_id_idx on public.order_items (order_id);
create index contacts_created_at_idx on public.contacts (created_at desc);

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select, update on public.orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;
grant select, update on public.contacts to authenticated;
grant all privileges on public.products, public.orders, public.order_items, public.contacts
  to service_role;

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.contacts enable row level security;

create policy "Anyone can read active products"
  on public.products for select
  using (is_active = true);

create policy "Admins can manage products"
  on public.products for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can read orders"
  on public.orders for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update orders"
  on public.orders for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.admin_dashboard_summary()
returns table (
  new_today bigint,
  revenue bigint,
  new_count bigint,
  confirmed_count bigint,
  shipping_count bigint,
  done_count bigint,
  cancelled_count bigint
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
    coalesce(sum(total) filter (where status in ('confirmed', 'shipping', 'done')), 0),
    count(*) filter (where status = 'new'),
    count(*) filter (where status = 'confirmed'),
    count(*) filter (where status = 'shipping'),
    count(*) filter (where status = 'done'),
    count(*) filter (where status = 'cancelled')
  from public.orders;
$$;

grant execute on function public.admin_dashboard_summary() to authenticated;
revoke execute on function public.admin_dashboard_summary() from public, anon;

create policy "Admins can read order items"
  on public.order_items for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can manage order items"
  on public.order_items for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can read contacts"
  on public.contacts for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update contacts"
  on public.contacts for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into public.products (name, slug, description, price, unit, image_url, sort_order)
values
  (
    'Bánh tai có đường',
    'banh-tai-duong-gung',
    'Bánh tai truyền thống thơm vị gừng, ngọt dịu vừa ăn.',
    60000,
    '500g',
    '/images/banh-tai-san-pham-tam.png',
    1
  ),
  (
    'Bánh tai không đường',
    'banh-tai-khong-duong',
    'Bánh tai không đường, thơm béo.',
    60000,
    '500g',
    '/images/banh-tai-san-pham-tam.png',
    2
  );

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Anyone can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admins can update product images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    bucket_id = 'product-images'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admins can delete product images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

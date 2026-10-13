alter table public.order_items
  add column if not exists unit text not null default '500g';

update public.products
set unit = case
  when slug = 'banh-tai-khong-duong' then '400g'
  else '500g'
end
where slug in ('banh-tai-duong-gung', 'banh-tai-khong-duong');

update public.order_items as order_item
set unit = product.unit
from public.products as product
where order_item.product_id = product.id;

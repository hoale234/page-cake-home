alter table public.order_items
  add column if not exists unit text not null default '500g';

update public.order_items as order_item
set unit = product.unit
from public.products as product
where order_item.product_id = product.id;

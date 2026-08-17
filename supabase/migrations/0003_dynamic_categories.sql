-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Moves the site's menu categories off the old fixed 5-value system (which
-- included an unused "Energy Drinks") and onto square_categories directly —
-- its real name becomes the site's category label, with an optional emoji +
-- color the admin can set per category (falls back to an auto-assigned style
-- in the app when unset).

alter table square_categories add column if not exists emoji text;
alter table square_categories add column if not exists color text;

-- Visibility is now purely: category-level is_visible + item-level is_available.
-- No longer requires menu_items.category to be set/mapped.
create or replace view visible_menu_items as
select
  mi.*,
  sc.square_category_name as category_name,
  sc.emoji as category_emoji,
  sc.color as category_color
from menu_items mi
join square_categories sc on sc.square_category_id = mi.square_category_id
where sc.is_visible = true
  and mi.is_available = true;

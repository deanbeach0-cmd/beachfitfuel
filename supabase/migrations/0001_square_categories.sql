-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Adds a site-owned mapping from Square's real catalog categories to BeachFit's
-- 5-value menu taxonomy, plus a per-category visibility switch that hides items
-- from the website without touching anything in Square.

-- One row per Square category. New categories land here via /api/square/sync
-- with site_category = null and is_visible = false ("hidden until mapped").
create table if not exists square_categories (
  square_category_id   text primary key,
  square_category_name text not null,
  site_category         text check (site_category in ('beach_bomb', 'protein_shake', 'blender', 'energy_drink', 'food')),
  is_visible            boolean not null default false,
  updated_at            timestamptz not null default now()
);

alter table menu_items
  add column if not exists square_category_id text references square_categories(square_category_id);

alter table menu_items
  alter column category drop not null;

-- Items are visible on the site only when their Square category has been
-- explicitly mapped + made visible, and the item itself is still available.
create or replace view visible_menu_items as
select mi.*
from menu_items mi
join square_categories sc on sc.square_category_id = mi.square_category_id
where sc.is_visible = true
  and mi.category is not null
  and mi.is_available = true;

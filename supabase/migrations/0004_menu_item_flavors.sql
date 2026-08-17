-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Adds flavor picking for items like the to-go pack bundles, where a customer
-- must choose a combination of flavors (with repeats allowed) totaling a
-- required count before the item can be added to their order.

-- Raw Square modifier lists (e.g. "To Go Pack Flavors") and their options —
-- synced data, mirrors square_categories.
create table if not exists square_modifier_lists (
  square_modifier_list_id text primary key,
  name text not null,
  updated_at timestamptz not null default now()
);

create table if not exists square_modifiers (
  square_modifier_id text primary key,
  square_modifier_list_id text not null references square_modifier_lists(square_modifier_list_id) on delete cascade,
  name text not null,
  price_cents integer not null default 0,
  display_order integer not null default 0
);

-- Which modifier lists Square has attached to which item — lets the admin
-- pick "which of this item's modifier lists is the flavor list" without
-- having to know Square's internal IDs.
create table if not exists menu_item_modifier_lists (
  menu_item_id uuid not null references menu_items(id) on delete cascade,
  square_modifier_list_id text not null references square_modifier_lists(square_modifier_list_id) on delete cascade,
  primary key (menu_item_id, square_modifier_list_id)
);

-- For items where each flavor is its own Square *variation* rather than a
-- modifier (e.g. the $5 single-flavor to-go item, 24 variations = 24 flavors).
create table if not exists square_item_variations (
  square_variation_id text primary key,
  menu_item_id uuid not null references menu_items(id) on delete cascade,
  name text not null,
  price_cents integer not null,
  display_order integer not null default 0
);

-- Per-item flavor config — explicit admin opt-in only. Nothing here is
-- auto-detected: many items have multiple Square variations for unrelated
-- reasons (sizes, apparel color/size, etc.), so treating "has variations" as
-- "needs a flavor picker" would be wrong. The admin designates it per item.
alter table menu_items add column if not exists flavor_source_type text
  check (flavor_source_type in ('modifier', 'variation'));
alter table menu_items add column if not exists flavor_modifier_list_id text
  references square_modifier_lists(square_modifier_list_id);
alter table menu_items add column if not exists required_flavor_count integer;

-- Expose the flavor requirement to the public menu view so the grid/card
-- knows to route to the detail page's picker instead of a one-click add.
-- (Dropped and recreated rather than CREATE OR REPLACE — the new menu_items
-- columns above shift where mi.* columns land, which Postgres won't allow
-- via REPLACE since it treats that as renaming an existing view column.)
drop view if exists visible_menu_items;
create view visible_menu_items as
select
  mi.*,
  sc.square_category_name as category_name,
  sc.emoji as category_emoji,
  sc.color as category_color
from menu_items mi
join square_categories sc on sc.square_category_id = mi.square_category_id
where sc.is_visible = true
  and mi.is_available = true;

-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- square_modifiers / square_item_variations are RLS-locked from direct public
-- reads (same as square_categories) — the item detail page needs a view to
-- read flavor options, the same pattern visible_menu_items already uses.

create or replace view menu_item_flavor_options as
select
  mi.id as menu_item_id,
  sm.square_modifier_id as option_id,
  sm.name,
  sm.price_cents,
  sm.display_order
from menu_items mi
join square_modifiers sm on sm.square_modifier_list_id = mi.flavor_modifier_list_id
where mi.flavor_source_type = 'modifier'
union all
select
  mi.id as menu_item_id,
  siv.square_variation_id as option_id,
  siv.name,
  siv.price_cents,
  siv.display_order
from menu_items mi
join square_item_variations siv on siv.menu_item_id = mi.id
where mi.flavor_source_type = 'variation';

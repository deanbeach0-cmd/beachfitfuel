-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Battle Creek activation: menu_items now gets one row per (item, location)
-- pair instead of one row per item globally, so each location can carry its
-- own availability/visibility. The old single-column uniqueness on
-- square_item_id blocks that — replace it with a composite uniqueness on
-- (square_item_id, location_id).

alter table menu_items
  drop constraint if exists menu_items_square_item_id_key;

alter table menu_items
  add constraint menu_items_square_item_id_location_id_key unique (square_item_id, location_id);

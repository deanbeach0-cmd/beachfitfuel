-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Same issue as 0006, one table over: square_item_variations was keyed by
-- square_variation_id alone, but that ID is now inserted once per
-- menu_items row (one per location), so it collides on the second location.
-- Key it by (menu_item_id, square_variation_id) instead — variations already
-- belong to one menu_items row, so this is the correct natural key.

alter table square_item_variations
  drop constraint if exists square_item_variations_pkey;

alter table square_item_variations
  add primary key (menu_item_id, square_variation_id);

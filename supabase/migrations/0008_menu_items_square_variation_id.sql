-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Stores each item's "regular"/pricing Square catalog variation ID, so online
-- orders can link their line items to a real Square catalog object instead
-- of ad-hoc name+price pairs. Square's sales-by-category reporting can only
-- categorize line items tied to a real catalog object — ad-hoc ones show up
-- as "Uncategorized".

alter table menu_items
  add column if not exists square_variation_id text;

-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Captures the extra photos Square already has for some items (ecomImageUris)
-- which the sync route previously discarded past the first image.

alter table menu_items add column if not exists image_urls text[];

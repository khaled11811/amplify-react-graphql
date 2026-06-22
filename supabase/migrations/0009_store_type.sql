-- Add store_type enum and column to stores table.
-- Existing stores default to 'paid_shop' (current behaviour unchanged).

CREATE TYPE store_type AS ENUM ('paid_shop', 'display_shop');

ALTER TABLE stores
  ADD COLUMN store_type store_type NOT NULL DEFAULT 'paid_shop';

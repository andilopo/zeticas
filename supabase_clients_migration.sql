-- Migration: add missing columns to clients table
-- Run this in Supabase SQL Editor

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS city         TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_name TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS id_type      TEXT DEFAULT 'NIT',
  ADD COLUMN IF NOT EXISTS sub_type     TEXT DEFAULT 'B2B';

-- Backfill sub_type from existing type column
UPDATE clients
SET sub_type = CASE
  WHEN type = 'Natural' THEN 'B2C'
  ELSE 'B2B'
END
WHERE sub_type IS NULL OR sub_type = '';

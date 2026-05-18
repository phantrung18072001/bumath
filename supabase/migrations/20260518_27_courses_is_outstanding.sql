-- Phase 19: Add is_outstanding boolean to courses table
-- Required for Tứ trụ filter in CataloguePage (NAV-02)
-- DEFAULT false is safe — all existing courses are non-Tứ trụ

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS is_outstanding boolean NOT NULL DEFAULT false;

-- Migration: Add slug columns to courses and chapters for human-readable URLs
-- Uses unaccent extension to normalize Vietnamese diacritics during backfill.
-- Client-side slugify handles all future inserts/updates.

CREATE EXTENSION IF NOT EXISTS unaccent;

-- ── COURSES ──────────────────────────────────────────────────────────────────

ALTER TABLE courses ADD COLUMN IF NOT EXISTS slug text;

-- Backfill: replace đ/Đ → d, run unaccent, lowercase, collapse non-alphanumeric to dashes
UPDATE courses
SET slug = trim('-' FROM regexp_replace(
  lower(unaccent(regexp_replace(title, '[đĐ]', 'd', 'g'))),
  '[^a-z0-9]+', '-', 'g'
));

ALTER TABLE courses ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS courses_slug_unique ON courses(slug);

-- ── CHAPTERS ─────────────────────────────────────────────────────────────────

ALTER TABLE chapters ADD COLUMN IF NOT EXISTS slug text;

UPDATE chapters
SET slug = trim('-' FROM regexp_replace(
  lower(unaccent(regexp_replace(title, '[đĐ]', 'd', 'g'))),
  '[^a-z0-9]+', '-', 'g'
));

ALTER TABLE chapters ALTER COLUMN slug SET NOT NULL;
-- Slug only needs to be unique within a course (not globally)
CREATE UNIQUE INDEX IF NOT EXISTS chapters_course_slug_unique ON chapters(course_id, slug);

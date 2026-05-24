-- Phase 21 follow-up: support optional thumbnail for standalone study materials
ALTER TABLE public.study_materials
  ADD COLUMN IF NOT EXISTS thumbnail_path text;

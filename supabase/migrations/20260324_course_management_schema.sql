-- Course management schema: courses, chapters, lessons, enrollments

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  description  text,
  grade        smallint,           -- 7, 8, 9, or NULL for ôn chuyên
  thumbnail_url text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title        text NOT NULL,
  description  text,
  order_index  integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id    uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  video_url     text,              -- YouTube embed URL
  order_index   integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Enrollments table (links students to courses)
CREATE TABLE IF NOT EXISTS enrollments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS chapters_course_id_idx ON chapters(course_id);
CREATE INDEX IF NOT EXISTS chapters_order_idx ON chapters(course_id, order_index);
CREATE INDEX IF NOT EXISTS lessons_chapter_id_idx ON lessons(chapter_id);
CREATE INDEX IF NOT EXISTS lessons_order_idx ON lessons(chapter_id, order_index);
CREATE INDEX IF NOT EXISTS enrollments_user_id_idx ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS enrollments_course_id_idx ON enrollments(course_id);

-- Auto-update updated_at trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Attach trigger to courses
CREATE TRIGGER courses_set_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Attach trigger to chapters
CREATE TRIGGER chapters_set_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Attach trigger to lessons
CREATE TRIGGER lessons_set_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
-- UAT Seed Data — Phase 03: Course Management
-- Chạy trong Supabase Dashboard > SQL Editor
-- =============================================================
-- Tạo 2 khóa học, mỗi khóa có 1 chương, 2 bài học
-- Bài học 1 của Course X có YouTube URL và PDF attachment (mock path)
-- Sau khi chạy script này, làm thêm 2 bước thủ công (xem hướng dẫn)
-- =============================================================

-- ── Bước 1: Tạo 2 khóa học ──────────────────────────────────
INSERT INTO courses (id, title, description, target_grade) VALUES
  ('aaaaaaaa-0001-0001-0001-000000000001', 'Toán lớp 8 — Phương trình', 'Khóa học thử nghiệm A (UAT)', 'grade_8'),
  ('aaaaaaaa-0002-0002-0002-000000000002', 'Toán chuyên — Bất đẳng thức', 'Khóa học thử nghiệm B (UAT)', 'advanced')
ON CONFLICT (id) DO NOTHING;

-- ── Bước 2: Tạo chương cho mỗi khóa ────────────────────────
INSERT INTO chapters (id, course_id, title, order_index) VALUES
  ('bbbbbbbb-0001-0001-0001-000000000001', 'aaaaaaaa-0001-0001-0001-000000000001', 'Chương 1 — Phương trình bậc nhất', 0),
  ('bbbbbbbb-0002-0002-0002-000000000002', 'aaaaaaaa-0002-0002-0002-000000000002', 'Chương 1 — BĐT cơ bản', 0)
ON CONFLICT (id) DO NOTHING;

-- ── Bước 3: Tạo bài học ──────────────────────────────────────
-- Course X, Chương 1: 2 bài học
--   Bài 1: có YouTube URL (để test thumbnail column)
--   Bài 2: không có video (để test em dash fallback)
INSERT INTO lessons (id, chapter_id, title, description, video_url, assignment_path, order_index) VALUES
  (
    'cccccccc-0001-0001-0001-000000000001',
    'bbbbbbbb-0001-0001-0001-000000000001',
    'Bài 1 — Khái niệm phương trình',
    'Giới thiệu phương trình bậc nhất một ẩn',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',  -- YouTube embed URL
    null,  -- sẽ upload file sau để test
    0
  ),
  (
    'cccccccc-0001-0001-0001-000000000002',
    'bbbbbbbb-0001-0001-0001-000000000001',
    'Bài 2 — Giải phương trình',
    'Phương pháp giải phương trình bậc nhất',
    null,  -- không có video → test em dash
    null,
    1
  )
ON CONFLICT (id) DO NOTHING;

-- Course Y, Chương 1: 1 bài học (không có video, không có attachment)
INSERT INTO lessons (id, chapter_id, title, description, video_url, assignment_path, order_index) VALUES
  (
    'cccccccc-0002-0002-0002-000000000001',
    'bbbbbbbb-0002-0002-0002-000000000002',
    'Bài 1 — BĐT Cauchy-Schwarz',
    'Bất đẳng thức Cauchy-Schwarz và ứng dụng',
    null,
    null,
    0
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- KẾT QUẢ SAU KHI CHẠY:
-- Course X (grade_8): 1 chương, 2 bài học (bài 1 có thumbnail)
-- Course Y (advanced): 1 chương, 1 bài học (không video)
--
-- TIẾP THEO — Làm thủ công trong Supabase Dashboard:
--   1. Tạo 2 user test (xem hướng dẫn trong file UAT_GUIDE.md)
--   2. Chạy đoạn SQL enroll bên dưới (sau khi có user ID)
-- =============================================================

-- ── Bước 4 (chạy SAU khi tạo user): Enroll ──────────────────
-- Thay <USER_A_ID> bằng UUID của học sinh A
-- Chỉ enroll học sinh A vào Course X, KHÔNG enroll vào Course Y

-- INSERT INTO enrollments (user_id, course_id) VALUES
--   ('<USER_A_ID>', 'aaaaaaaa-0001-0001-0001-000000000001');

-- Học sinh B KHÔNG được enroll vào khóa nào (để test RLS deny)

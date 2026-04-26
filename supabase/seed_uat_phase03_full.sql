-- =============================================================
-- UAT Full Seed — Phase 03: Course Management
-- Import vào: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================
-- Script này tạo đầy đủ:
--   • 2 user test (Học sinh A và B)
--   • Profiles đã approved
--   • 2 khóa học, chương, bài học (có YouTube + không có video)
--   • Enrollment: chỉ học sinh A được vào Course X
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- PHẦN 1: TẠO USER TEST
-- ─────────────────────────────────────────────────────────────
-- Tạo trực tiếp vào auth.users (cần chạy trong SQL Editor của Supabase)
-- Trigger handle_new_user sẽ tự động tạo profile tương ứng

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  phone,
  phone_confirmed_at,
  encrypted_password,
  raw_user_meta_data,
  raw_app_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES
  -- Học sinh A: sẽ được enroll vào Course X
  (
    'dddddddd-aaaa-aaaa-aaaa-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    '+84900000001@bumath.local',
    '+84900000001',
    now(),
    crypt('Test@12345', gen_salt('bf', 10)),
    '{"full_name": "Học sinh A (UAT)", "phone": "0900000001", "year_of_birth": 2010, "address": "Hà Nội"}',
    '{"provider": "phone", "providers": ["phone"]}',
    false,
    now(),
    now(),
    '', '', '', ''
  ),
  -- Học sinh B: KHÔNG được enroll vào đâu → test RLS deny
  (
    'dddddddd-bbbb-bbbb-bbbb-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    '+84900000002@bumath.local',
    '+84900000002',
    now(),
    crypt('Test@12345', gen_salt('bf', 10)),
    '{"full_name": "Học sinh B (UAT)", "phone": "0900000002", "year_of_birth": 2010, "address": "Hồ Chí Minh"}',
    '{"provider": "phone", "providers": ["phone"]}',
    false,
    now(),
    now(),
    '', '', '', ''
  )
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- PHẦN 2: APPROVE CẢ 2 HỌC SINH
-- (trigger tạo profile với approval_status = 'pending' mặc định)
-- ─────────────────────────────────────────────────────────────

UPDATE profiles
SET approval_status = 'approved'
WHERE id IN (
  'dddddddd-aaaa-aaaa-aaaa-000000000001',
  'dddddddd-bbbb-bbbb-bbbb-000000000002'
);

-- ─────────────────────────────────────────────────────────────
-- PHẦN 3: TẠO KHÓA HỌC
-- ─────────────────────────────────────────────────────────────

INSERT INTO courses (id, title, description, target_grade) VALUES
  (
    'aaaaaaaa-0001-0001-0001-000000000001',
    '[UAT] Toán lớp 8 — Phương trình',
    'Khóa học thử nghiệm A dùng để UAT Phase 03',
    'grade_8'
  ),
  (
    'aaaaaaaa-0002-0002-0002-000000000002',
    '[UAT] Toán chuyên — Bất đẳng thức',
    'Khóa học thử nghiệm B dùng để UAT Phase 03',
    'advanced'
  )
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- PHẦN 4: TẠO CHƯƠNG
-- ─────────────────────────────────────────────────────────────

INSERT INTO chapters (id, course_id, title, order_index) VALUES
  (
    'bbbbbbbb-0001-0001-0001-000000000001',
    'aaaaaaaa-0001-0001-0001-000000000001',
    'Chương 1 — Phương trình bậc nhất',
    0
  ),
  (
    'bbbbbbbb-0002-0002-0002-000000000002',
    'aaaaaaaa-0002-0002-0002-000000000002',
    'Chương 1 — Bất đẳng thức cơ bản',
    0
  )
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- PHẦN 5: TẠO BÀI HỌC
-- ─────────────────────────────────────────────────────────────
-- Course X — Chương 1:
--   Bài 1: có YouTube URL → test thumbnail column
--   Bài 2: không có video → test em dash fallback

INSERT INTO lessons (id, chapter_id, title, description, video_url, assignment_path, order_index) VALUES
  (
    'cccccccc-0001-0001-0001-000000000001',
    'bbbbbbbb-0001-0001-0001-000000000001',
    'Bài 1 — Khái niệm phương trình',
    'Giới thiệu phương trình bậc nhất một ẩn',
    -- URL YouTube hợp lệ lưu dạng embed (như app đang dùng)
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    null,
    0
  ),
  (
    'cccccccc-0001-0001-0001-000000000002',
    'bbbbbbbb-0001-0001-0001-000000000001',
    'Bài 2 — Giải phương trình',
    'Phương pháp giải phương trình bậc nhất',
    null,   -- không có video → cột Video hiển thị "—"
    null,
    1
  )
ON CONFLICT (id) DO NOTHING;

-- Course Y — Chương 1:
--   1 bài học, không video, không attachment

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

-- ─────────────────────────────────────────────────────────────
-- PHẦN 6: ENROLLMENT
-- Học sinh A → Course X (được phép đọc lessons)
-- Học sinh B → không enroll → RLS deny
-- ─────────────────────────────────────────────────────────────

INSERT INTO enrollments (user_id, course_id) VALUES
  (
    'dddddddd-aaaa-aaaa-aaaa-000000000001',  -- Học sinh A
    'aaaaaaaa-0001-0001-0001-000000000001'   -- Course X
  )
ON CONFLICT (user_id, course_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- KIỂM TRA KẾT QUẢ (chạy sau khi import)
-- ─────────────────────────────────────────────────────────────
SELECT 'users' AS table_name, count(*)::text AS inserted FROM auth.users
  WHERE id IN ('dddddddd-aaaa-aaaa-aaaa-000000000001', 'dddddddd-bbbb-bbbb-bbbb-000000000002')
UNION ALL
SELECT 'profiles approved', count(*)::text FROM profiles
  WHERE id IN ('dddddddd-aaaa-aaaa-aaaa-000000000001', 'dddddddd-bbbb-bbbb-bbbb-000000000002')
    AND approval_status = 'approved'
UNION ALL
SELECT 'courses', count(*)::text FROM courses
  WHERE id LIKE 'aaaaaaaa-%'
UNION ALL
SELECT 'lessons', count(*)::text FROM lessons
  WHERE id LIKE 'cccccccc-%'
UNION ALL
SELECT 'enrollments', count(*)::text FROM enrollments
  WHERE user_id = 'dddddddd-aaaa-aaaa-aaaa-000000000001';

-- Kết quả mong đợi:
--   users            | 2
--   profiles approved| 2
--   courses          | 2
--   lessons          | 3
--   enrollments      | 1

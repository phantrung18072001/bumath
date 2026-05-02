-- =============================================================
-- UAT Seed Data — Phase 11: Admin List Pages (Pagination Test)
-- Chạy trong Supabase Dashboard > SQL Editor
-- Tạo 30 user giả để test phân trang (> 25 rows)
-- Xóa bằng: DELETE FROM auth.users WHERE id LIKE 'eeeeeeee-%';
-- =============================================================

DO $$
DECLARE
  names TEXT[] := ARRAY[
    'Nguyễn Văn An',    'Trần Thị Bình',   'Lê Văn Cường',    'Phạm Thị Dung',
    'Hoàng Văn Em',     'Vũ Thị Phương',   'Đặng Văn Giang',  'Bùi Thị Hoa',
    'Ngô Văn Hùng',     'Đinh Thị Lan',    'Lý Văn Minh',     'Mai Thị Ngọc',
    'Trịnh Văn Phú',    'Cao Thị Quỳnh',   'Dương Văn Rộng',  'Lưu Thị Sương',
    'Phan Văn Tâm',     'Tô Thị Uyên',     'Hồ Văn Vinh',     'Đỗ Thị Xuân',
    'Võ Văn Yên',       'Chu Thị Zung',    'Đinh Văn Bảo',    'Lê Thị Cẩm',
    'Trần Văn Đức',     'Nguyễn Thị Gia',  'Phạm Văn Hải',    'Vũ Thị Ích',
    'Hoàng Văn Khánh',  'Bùi Thị Long'
  ];
  -- Mix +84 and 0 prefix for phone normalization UAT
  phones TEXT[] := ARRAY[
    '+84901000001', '0901000002',    '+84901000003', '0901000004',
    '+84901000005', '0901000006',    '+84901000007', '0901000008',
    '+84901000009', '0901000010',    '+84901000011', '0901000012',
    '+84901000013', '0901000014',    '+84901000015', '0901000016',
    '+84901000017', '0901000018',    '+84901000019', '0901000020',
    '+84901000021', '0901000022',    '+84901000023', '0901000024',
    '+84901000025', '0901000026',    '+84901000027', '0901000028',
    '+84901000029', '0901000030'
  ];
  roles TEXT[] := ARRAY[
    'student','student','student','student','student',
    'student','student','student','student','student',
    'student','student','student','student','student',
    'student','student','student','student','student',
    'teacher','teacher','teacher','teacher','teacher',
    'teacher','teacher','admin',  'admin',  'admin'
  ];
  uid UUID;
  i   INT;
BEGIN
  FOR i IN 1..30 LOOP
    uid := ('eeeeeeee-0000-0000-0000-' || LPAD(i::TEXT, 12, '0'))::UUID;

    -- Insert into auth.users (bypasses trigger — safe in SQL editor)
    INSERT INTO auth.users (
      id, instance_id, aud, role,
      email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, confirmation_token, recovery_token,
      email_change, email_change_token_new
    ) VALUES (
      uid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'uat_phase11_' || LPAD(i::TEXT, 3, '0') || '@bumath.test',
      '$2a$10$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',  -- dummy hash
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', names[i], 'year_of_birth', 2005 + (i % 5)),
      false, '', '', '', ''
    )
    ON CONFLICT (id) DO NOTHING;

    -- Upsert profile (trigger may already have created it)
    INSERT INTO public.profiles (id, full_name, phone, year_of_birth, address, role)
    VALUES (
      uid,
      names[i],
      phones[i],
      2005 + (i % 5),
      'Hà Nội',
      roles[i]
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name    = EXCLUDED.full_name,
      phone        = EXCLUDED.phone,
      year_of_birth = EXCLUDED.year_of_birth,
      role         = EXCLUDED.role;

  END LOOP;

  RAISE NOTICE 'Đã tạo 30 users UAT phase 11 (IDs: eeeeeeee-0000-0000-0000-000000000001 → ...000000000030)';
END $$;

-- Kiểm tra kết quả
SELECT role, count(*) FROM public.profiles
WHERE id::TEXT LIKE 'eeeeeeee-%'
GROUP BY role ORDER BY role;

-- Seed initial packages for BuMath
-- Run once via Supabase Dashboard SQL Editor

DO $$
DECLARE
  pkg7_id   uuid := gen_random_uuid();
  pkg8_id   uuid := gen_random_uuid();
  pkg9_id   uuid := gen_random_uuid();
  pkgchuyen_id uuid := gen_random_uuid();
  pkgtutu_id   uuid := gen_random_uuid();
  pkgall_id    uuid := gen_random_uuid();
BEGIN

  INSERT INTO packages (id, name, description, price_vnd) VALUES
    (pkg7_id,      'Toàn bộ lớp 7',                        'Trọn bộ bài giảng Toán lớp 7.',                                              1500000),
    (pkg8_id,      'Toàn bộ lớp 8',                        'Trọn bộ bài giảng Toán lớp 8.',                                              1500000),
    (pkg9_id,      'Ôn cấp tốc lớp 9',                     'Ôn thi tốt nghiệp THCS và tuyển sinh lớp 10.',                               2000000),
    (pkgchuyen_id, 'Ôn chuyên Toán',                        'Luyện đề chuyên sâu cho kỳ thi tuyển sinh trường chuyên.',                   3000000),
    (pkgtutu_id,   'Ôn toán điều kiện tứ trụ trường chuyên','Chương trình elite hướng tới 4 trường chuyên hàng đầu.',                     2500000),
    (pkgall_id,    'Mua toàn bộ',                           'Truy cập tất cả khóa học từ lớp 7 đến ôn chuyên — tiết kiệm nhất.',         4000000);

  INSERT INTO package_grades (package_id, grade) VALUES
    (pkg7_id,       'grade_7'),
    (pkg8_id,       'grade_8'),
    (pkg9_id,       'grade_9'),
    (pkgchuyen_id,  'advanced'),
    (pkgtutu_id,    'advanced'),
    (pkgall_id,     'grade_7'),
    (pkgall_id,     'grade_8'),
    (pkgall_id,     'grade_9'),
    (pkgall_id,     'advanced');

END $$;

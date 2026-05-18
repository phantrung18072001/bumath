---
phase: 21-tai-lieu-page
verified: 2026-05-18T17:30:00Z
status: human_needed
score: 11/12 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Truy cập /tai-lieu không cần đăng nhập — kiểm tra grid card và grade filter pills hiển thị đúng"
    expected: "Trang render đủ Header, hero section, 5 filter pills (Tất cả / Lớp 7 / Lớp 8 / Lớp 9 / Ôn thi chuyên), card grid khi có dữ liệu; empty state khi chưa có tài liệu"
    why_human: "Phụ thuộc dữ liệu thực từ Supabase production và visual rendering — không thể kiểm tra bằng grep/static analysis"
  - test: "Truy cập /quan-tri/tai-lieu bằng tài khoản teacher — kiểm tra form upload và bảng danh sách"
    expected: "Upload form hiển thị với 3 fields (Tiêu đề, Khối lớp, File PDF); bảng danh sách render đúng sau khi upload; nút Xóa mở AlertDialog confirm"
    why_human: "Cần tài khoản teacher và flow upload/delete thực tế với Supabase storage"
  - test: "Sidebar admin hiển thị 'Tài liệu' cho tài khoản teacher (không chỉ admin)"
    expected: "Nav item 'Tài liệu' xuất hiện trong sidebar khi đăng nhập bằng teacher role; không xuất hiện khi đăng nhập bằng student role"
    why_human: "Kiểm tra adminOnly filtering logic ở runtime với các role khác nhau"
---

# Phase 21: Tài liệu Page — Báo Cáo Xác Minh

**Phase Goal:** Trang `/tai-lieu` công khai — browse và download tài liệu PDF theo grade. Trang admin `/quan-tri/tai-lieu` cho giáo viên upload/xóa tài liệu standalone.
**Verified:** 2026-05-18T17:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Migration file tồn tại với RLS policies + storage policies đúng | ✓ VERIFIED | `20260518_28_study_materials_public.sql` — 8 statements: ALTER lesson_id nullable, ALTER grade check (adds 'advanced'), ALTER category nullable, 4 RLS policies (anon SELECT, teacher INSERT/DELETE storage, teacher ALL table) |
| 2 | `fetchStandaloneStudyMaterials` tồn tại và query Supabase với `lesson_id IS NULL` | ✓ VERIFIED | `src/lib/api/study-materials.ts` dòng 139–158: `.is('lesson_id', null)`, `.order('created_at', { ascending: false })`, optional grade filter |
| 3 | `uploadStandaloneStudyMaterial` tồn tại và upload vào path `standalone/` | ✓ VERIFIED | `src/lib/api/study-materials.ts` dòng 162–196: path `standalone/{ts}-{rnd}.{ext}`, `lesson_id: null, category: null`, rollback storage nếu DB lỗi |
| 4 | `getStudyMaterialSignedUrl` tồn tại và tạo signed URL TTL 1h | ✓ VERIFIED | `src/lib/api/study-materials.ts` dòng 199–205: `createSignedUrl(filePath, 3600)` |
| 5 | `TaiLieuPage.tsx` render grade filter pills + card grid + download button | ✓ VERIFIED | File 176 dòng, substantive — 5 GRADE_FILTERS, `useQuery → fetchStandaloneStudyMaterials`, client-side `.filter()`, `handleDownload → getStudyMaterialSignedUrl → window.open`, skeleton loading, error state, empty states |
| 6 | `TaiLieuAdminPage.tsx` có upload form + bảng danh sách + xóa với confirm dialog | ✓ VERIFIED | File 235 dòng, substantive — form với title/grade/file, `useMutation → uploadStandaloneStudyMaterial`, bảng `useQuery → fetchStandaloneStudyMaterials`, nút Xóa → `AlertDialog` confirm → `deleteMutation` |
| 7 | Route `/tai-lieu` là public (không có ProtectedRoute) | ✓ VERIFIED | `App.tsx` dòng 49: `<Route path="/tai-lieu" element={<TaiLieuPage />} />` — KHÔNG có ProtectedRoute wrapper |
| 8 | Route `/quan-tri/tai-lieu` được bảo vệ bởi ProtectedRoute allowedRoles admin+teacher | ✓ VERIFIED | `App.tsx` dòng 58: `<ProtectedRoute allowedRoles={['admin', 'teacher']}>` |
| 9 | AdminLayout sidebar có nav item 'Tài liệu' → `/quan-tri/tai-lieu` | ✓ VERIFIED | `AdminLayout.tsx` dòng 21: `{ label: 'Tài liệu', to: '/quan-tri/tai-lieu', icon: FileText }` |
| 10 | Nav item 'Tài liệu' KHÔNG có flag `adminOnly` — teacher thấy được | ✓ VERIFIED | Dòng 21 không có `adminOnly: true`; chỉ dòng 16-18 (nguoi-dung, khoa-hoc, goi-hoc) mới có flag này |
| 11 | `yarn build` exits 0 (zero TypeScript errors) | ✓ VERIFIED | Build chạy thành công: `✓ built in 9.26s` — tsc + vite build clean |
| 12 | `yarn lint` exits 0 (zero lint errors) | ✗ FAILED | `yarn lint` toàn project exits 1 với 89 problems (20 errors, 69 warnings) trong các file **không thuộc Phase 21**. Lint chỉ chạy trên 5 file Phase 21 → exits 0 (zero errors). Lỗi pre-existing ở `AuthContext.test.tsx` (prefer-const) và UI components (react-refresh). |

**Score:** 11/12 truths verified

---

### Phân tích Truth #12 (yarn lint toàn project)

**Thực tế:** `npx eslint src/pages/TaiLieuPage.tsx src/pages/admin/TaiLieuAdminPage.tsx src/lib/api/study-materials.ts src/App.tsx src/components/admin/AdminLayout.tsx` → exit 0, zero errors.

**Nguyên nhân fail global lint:** 89 lỗi pre-existing trong các file KHÔNG phải do Phase 21 tạo ra:
- `src/contexts/AuthContext.test.tsx` — prefer-const (đã tồn tại trước Phase 21)
- Nhiều UI components — react-refresh/only-export-components warnings

**P04-SUMMARY.md đã ghi nhận:** "Pre-existing lint errors (89 problems in unrelated files) are out-of-scope per SCOPE BOUNDARY rule".

Đây là PARTIAL fail — Phase 21 code clean, nhưng project-wide lint check vẫn fail.

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/20260518_28_study_materials_public.sql` | RLS + storage policies cho standalone materials | ✓ VERIFIED | 8 SQL statements, đầy đủ: anon SELECT, teacher INSERT/DELETE storage, teacher ALL table |
| `src/lib/api/study-materials.ts` | `fetchStandaloneStudyMaterials`, `uploadStandaloneStudyMaterial`, `getStudyMaterialSignedUrl` | ✓ VERIFIED | Cả 3 functions tồn tại và có implementation thực (Supabase queries) |
| `src/pages/TaiLieuPage.tsx` | Public page, grade filter, card grid, download | ✓ VERIFIED | 176 dòng, substantive — full implementation |
| `src/pages/admin/TaiLieuAdminPage.tsx` | Upload form, list table, delete confirm | ✓ VERIFIED | 235 dòng, substantive — full implementation |
| `src/App.tsx` | Routes `/tai-lieu` và `/quan-tri/tai-lieu` | ✓ VERIFIED | Cả 2 routes hiện diện với wiring đúng |
| `src/components/admin/AdminLayout.tsx` | Nav item "Tài liệu" | ✓ VERIFIED | Dòng 21, không có adminOnly |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `App.tsx` route `/tai-lieu` | `TaiLieuPage.tsx` | `element={<TaiLieuPage />}` | ✓ WIRED | Import dòng 30 + Route dòng 49 |
| `App.tsx` route `/quan-tri/tai-lieu` | `TaiLieuAdminPage.tsx` | `element={<TaiLieuAdminPage />}` | ✓ WIRED | Import dòng 31 + Route dòng 58 |
| `AdminLayout.tsx` navItems | `/quan-tri/tai-lieu` | `{ to: '/quan-tri/tai-lieu', icon: FileText }` | ✓ WIRED | Dòng 21 |
| `TaiLieuPage.tsx` | `study-materials.ts` | `fetchStandaloneStudyMaterials`, `getStudyMaterialSignedUrl` | ✓ WIRED | Import dòng 12-17, sử dụng trong useQuery và handleDownload |
| `TaiLieuAdminPage.tsx` | `study-materials.ts` | `fetchStandaloneStudyMaterials`, `uploadStandaloneStudyMaterial`, `deleteStudyMaterial` | ✓ WIRED | Import dòng 37-43, sử dụng trong useQuery + 2 useMutation |
| `study-materials.ts` API | Supabase DB | `.from('study_materials').select()` | ✓ WIRED | Real DB queries, không return static/empty arrays |
| `study-materials.ts` storage | Supabase Storage bucket `study-materials` | `.storage.from(BUCKET).upload/createSignedUrl` | ✓ WIRED | Real storage calls |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `TaiLieuPage.tsx` | `materials` | `useQuery → fetchStandaloneStudyMaterials()` → Supabase `.is('lesson_id', null)` | ✓ Real DB query | ✓ FLOWING |
| `TaiLieuAdminPage.tsx` | `materials` | `useQuery → fetchStandaloneStudyMaterials()` → Supabase | ✓ Real DB query | ✓ FLOWING |
| `TaiLieuAdminPage.tsx` | upload form | `useMutation → uploadStandaloneStudyMaterial(file, meta)` → Supabase storage + DB insert | ✓ Real storage + DB | ✓ FLOWING |
| `TaiLieuAdminPage.tsx` | delete action | `useMutation → deleteStudyMaterial(id, filePath)` → Supabase DB delete + storage remove | ✓ Real DB + storage | ✓ FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| TypeScript compile clean | `npx tsc --noEmit` | Exit 0, no output | ✓ PASS |
| Vite build clean | `yarn build` | Exit 0, `✓ built in 9.26s` | ✓ PASS |
| Phase 21 files lint clean | `npx eslint [5 phase files]` | Exit 0 | ✓ PASS |
| Route `/tai-lieu` là public | `grep 'path="/tai-lieu"' App.tsx \| grep -c ProtectedRoute` | 0 | ✓ PASS |
| Route admin dùng allowedRoles | `grep 'tai-lieu' App.tsx \| grep allowedRoles` | 1 match | ✓ PASS |
| Nav item không có adminOnly | `grep 'tai-lieu' AdminLayout.tsx \| grep adminOnly` | 0 matches | ✓ PASS |
| Git commits tồn tại | `git show 49cf5e0, be7054c, 3e19d2c` | 3 commits valid | ✓ PASS |
| Global `yarn lint` | `yarn lint` toàn project | Exit 1, 89 problems (pre-existing) | ⚠️ WARNING |

---

### Requirements Coverage

| Requirement | Plan | Description | Status | Evidence |
|-------------|------|-------------|--------|---------|
| MAT-01 | P03, P04 | Admin có thể upload tài liệu PDF với category và grade | ✓ SATISFIED (với deviation) | `TaiLieuAdminPage` có upload form với grade selector; category là null cho standalone materials — architectural decision |
| MAT-02 | P02 | Tất cả học sinh đã approved có thể xem và tải tài liệu | ✓ SATISFIED (và hơn) | `/tai-lieu` là PUBLIC — thậm chí anonymous user cũng xem được (per D-01: decision standalone materials are fully public) |
| MAT-03 | P02 | Trang tài liệu có filter theo category và grade | ⚠️ PARTIAL | Filter theo grade ✓ (5 pills); filter theo category ✗ — nhưng standalone materials không có category (null), nên chỉ grade filter có ý nghĩa |

**Lưu ý:** REQUIREMENTS.md mapping MAT-01/02/03 → Phase 16 (Pending) là outdated. Phase 21 đã thực hiện các requirements này. Cần cập nhật REQUIREMENTS.md.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `study-materials.ts` | 18 | `Record<StudyMaterialCategory, string>` với `StudyMaterialCategory` bao gồm `null` — CATEGORY_LABELS thiếu key `null` | ℹ️ Info | TypeScript không raise error (build passes), nhưng type definition không chính xác. Không ảnh hưởng runtime vì `null` category chỉ dùng cho standalone materials và không được render qua CATEGORY_LABELS |
| (multiple) | — | `yarn lint` pre-existing 89 errors/warnings trong unrelated files | ⚠️ Warning | Không phải do Phase 21; cần cleanup riêng |

---

### Human Verification Required

#### 1. Public /tai-lieu Page — Visual & Functional Check

**Test:** Mở trình duyệt, truy cập `/tai-lieu` không cần đăng nhập (hoặc ở chế độ ẩn danh)
**Expected:**
- Trang render với Header và Footer
- Hero section: "Tài liệu học tập" + subtitle
- 5 grade filter pills: Tất cả / Lớp 7 / Lớp 8 / Lớp 9 / Ôn thi chuyên
- Nếu có dữ liệu trong DB: card grid với PDF icon + title + grade badge + nút "Tải xuống"
- Nếu chưa có dữ liệu: empty state message "Chưa có tài liệu nào"
- Click grade pill → filter hoạt động (chỉ hiện card của grade đó)
- Click "Tải xuống" → mở file PDF trên tab mới (signed URL)

**Why human:** Phụ thuộc dữ liệu Supabase production; visual rendering; Supabase storage signed URL resolution

---

#### 2. Admin /quan-tri/tai-lieu Page — Upload & Delete Flow

**Test:** Đăng nhập bằng tài khoản teacher, truy cập `/quan-tri/tai-lieu`
**Expected:**
- Upload form hiển thị với 3 fields: Tiêu đề (Input), Khối lớp (Select), File PDF (file input)
- Nút "Tải lên" disabled khi thiếu field
- Upload thành công → toast "Tải lên thành công!" + form reset + tài liệu xuất hiện trong bảng
- Bảng hiển thị: cột Tiêu đề, Khối lớp (badge màu), Ngày tải, Hành động
- Nút Xóa → AlertDialog: "Xóa tài liệu? Hành động này không thể hoàn tác..."
- Confirm xóa → toast "Đã xóa tài liệu." + hàng biến mất khỏi bảng

**Why human:** Cần Supabase storage write permission thực tế; upload flow với file binary; real-time mutation feedback

---

#### 3. Admin Sidebar — Role-based Visibility

**Test:** Đăng nhập lần lượt bằng teacher, admin, student
**Expected:**
- teacher: thấy "Tài liệu" trong sidebar (cùng "Chấm bài", "Đề thi thử")
- admin: thấy "Tài liệu" + tất cả nav items khác
- student: KHÔNG thấy sidebar admin (redirect về trang học sinh)

**Why human:** Runtime role check từ AuthContext; `visibleItems = navItems.filter(item => !item.adminOnly || isAdmin)` — cần verify logic với account thực

---

### Gaps Summary

Không có BLOCKER gap. Tất cả artifacts tồn tại, substantive, wired, và data flows real.

**Warning duy nhất:** `yarn lint` toàn project exits 1 do 89 pre-existing errors/warnings trong các file KHÔNG thuộc Phase 21. Phase 21 files riêng có 0 lint errors. P04-SUMMARY đã acknowledge và classify là out-of-scope.

**REQUIREMENTS.md outdated:** MAT-01/02/03 vẫn mapped → Phase 16 (Pending) nhưng đã được implement trong Phase 21. Cần update tracking.

---

_Verified: 2026-05-18T17:30:00Z_
_Verifier: gsd-verifier (automated)_

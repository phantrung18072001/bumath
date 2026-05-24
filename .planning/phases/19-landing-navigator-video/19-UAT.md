---
status: complete
phase: 19-landing-navigator-video
source:
  - 19-PLAN-SUMMARY.md
started: 2026-05-18T20:30:00Z
updated: 2026-05-25T00:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. DB Migration — Cold Start Check
expected: File supabase/migrations/20260518_27_courses_is_outstanding.sql exists and contains correct ALTER TABLE statement. Apply via Supabase Dashboard SQL Editor before testing catalog filter.
result: pass

### 2. Landing Page — Tứ trụ text block
expected: Visit `/`. Scroll to the "Intensive / Ôn chuyên" section. Below the existing feature cards, a card-style box appears with an orange badge "Tứ trụ trường chuyên TPHCM" and text mentioning PTNK, CNN, CSP, KHTN in bold within a muted sentence.
result: pass

### 3. Landing Page — PricingSection
expected: Continuing on `/`, scroll past the Tứ trụ block. A "Học phí minh bạch" section appears with 6 pricing cards in a grid (1-col on mobile → 2-col → 3-col on desktop). Cards: Lớp 7 (1,5M đ), Lớp 8 (1,5M đ), Cấp tốc (2M đ), Ôn chuyên (3M đ), Tứ trụ (2,5M đ), Toàn bộ (4M đ). "Toàn bộ" card has an orange border and "Phổ biến" badge.
result: pass

### 4. PricingSection CTA scroll
expected: Click "Đăng ký tư vấn" on any pricing card. The page smoothly scrolls down to the consultation form section (the form with the tư vấn / contact fields).
result: pass

### 5. VideoPlayer — YouTube lesson
expected: Open any lesson with a video (e.g., navigate to a course → chapter → lesson with video_url set). The video renders as an embedded player (iframe). In browser DevTools Network tab, the iframe src should use youtube-nocookie.com (not youtube.com). Video plays normally.
result: pass

### 6. VideoPlayer — Error state
expected: If a lesson has a malformed or missing video URL, the player area shows a gradient background, an alert circle icon, and the text "Không thể tải video" with a subtitle. No blank white box or raw iframe error.
result: pass

### 7. CataloguePage — Tứ trụ filter hidden by default
expected: Visit `/danh-muc`. With any grade selected OTHER than "Ôn chuyên 9→10" (e.g., "Tất cả" or "Lớp 7"), no secondary filter row for "Tứ trụ" appears below the grade pills.
result: pass

### 8. CataloguePage — Tứ trụ filter visible when grade=advanced
expected: On `/danh-muc`, click the "Ôn chuyên 9→10" grade pill. A second row of pills appears: "Tất cả" and "Tứ trụ" — using orange color (distinct from indigo grade pills). Both pills are at least 44px tall (touchable).
result: pass

### 9. CataloguePage — Tứ trụ filter resets on grade change
expected: With "Ôn chuyên 9→10" selected and the "Tứ trụ" sub-pill active, click a different grade (e.g., "Lớp 8"). The Tứ trụ filter row disappears and the course list resets to show all Lớp 8 courses (no Tứ trụ filtering carries over).
result: pass

## Summary

total: 9
passed: 9
issues: 0
skipped: 0
pending: 0
blocked: 0

## Gaps

[none yet]

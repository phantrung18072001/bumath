# Phase 16: Lesson Tabs + Study Materials Library - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-04
**Phase:** 16-Lesson Tabs + Study Materials Library
**Areas discussed:** Tab & URL, Tab 3 / thi thử, Phạm vi bài học vs landing, Mô hình tài liệu + filter, Admin upload, Quyền tải (RLS)

---

## Tab state & URL

| Option | Description | Selected |
|--------|-------------|----------|
| Sync to query param | ?tab=… bookmark, Phase 17 friendly | |
| React state only | URL unchanged | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| Keep tab when switching lesson | Stay on same tab | |
| Reset to tab 1 | Bài giảng on lesson change | ✓ |

**User's choice:** Không đồng bộ URL; đổi bài → về tab 1.
**Notes:** User requested questions in Vietnamese on first pass.

---

## Tab 3 vs mock exam

| Option | Description | Selected |
|--------|-------------|----------|
| Hide exam block | Materials only until Phase 18 | ✓ (intent) |
| "Sắp có" empty state | Placeholder | |
| Static stub link | Layout only | |

**User's choice (free text):** Giữ nguyên như hiện tại; phần thi thử là phần khác. Chỉ tách tab, giữ logic hiện tại.
**Notes:** No mock-exam UI in Phase 16; defer to Phase 18.

---

## Scope: lesson page vs landing

**User's choice:** Phase 16 chỉ trang bài học; landing là phần khác / phase khác.
**Notes:** User clarified two material audiences; Phase 16 implements lesson-attached only.

---

## Materials model & filters

| Option | Description | Selected |
|--------|-------------|----------|
| Global library | Course-grade filter in tab | |
| lesson_id | Per-lesson attachments | ✓ |
| course-level | Per-course | |

**Filter grade in tab:** User did not want a separate "grade filter" concept inside the lesson tab — materials are **of that lesson**; category filter still aligned with MAT-01. Documented as optional UI for category, grade implicit.

---

## Admin upload

| Option | Description | Selected |
|--------|-------------|----------|
| Admin lesson edit page | Upload alongside lesson content | ✓ |
| Dedicated /quan-tri/tai-lieu | Separate nav page | |
| Both | | |

**User's choice:** Admin lesson page.

---

## Download / RLS

**User's choice (free text):** Tài liệu **bài học** → học sinh theo **package / đăng ký** (access như nội dung bài). Tài liệu **landing** → toàn bộ học sinh — **không** trong Phase 16.

**Notes:** Lesson materials use stricter access than "all approved"; landing pattern deferred.

---

## Claude's Discretion

- Schema details, exact RLS policy wording, bucket policy files, UI component breakdown inside `LessonContent`.

## Deferred Ideas

- Landing/global materials library (MAT-02 broad interpretation).
- Mock exam surfaces (LESSON-03 exam portion).
- Optional future URL tab sync.

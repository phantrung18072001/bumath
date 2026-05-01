# Phase 10: Auth Pages UI - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-01
**Phase:** 10-auth-pages-ui
**Areas discussed:** Background, Logo & Branding, Register Form Layout, Pending Page

---

## Background

| Option | Description | Selected |
|--------|-------------|----------|
| Decorative background | Floating math symbols (π, √, +/-) at low opacity | ✓ |
| Gradient mềm | Sóng teal-to-white nền | |
| Solid background | Giữ nguyên màu nền thuần #F0FDFA | |

**User's choice:** Decorative background với math symbols
**Notes:** User muốn trải nghiệm giáo dục, nhiều app giáo dục dùng pattern này

---

## Logo & Branding

| Option | Description | Selected |
|--------|-------------|----------|
| Logo text nổi bật | BuMath text Baloo 2, gradient teal-to-orange | |
| Icon + Text | Dùng brand image bumath.jpeg + text BuMath | ✓ |
| Text-only minimal | Chỉ có text, gọn, không icon | |

**User's choice:** Brand image `bumath.jpeg` (tại project root) + "BuMath" text
**Notes:** User xác nhận đã có file brand icon riêng tại `/home/trungpd-teko-pro/Desktop/BumathX/bumath/bumath.jpeg`

---

## Register Form Layout

| Option | Description | Selected |
|--------|-------------|----------|
| 2-column desktop | phone+name / year+address / password full-width | ✓ |
| Single column | Giữ nguyên, scroll ít | |
| Multi-step card | Step 1: thông tin, Step 2: mật khẩu | |

**User's choice:** 2-column trên desktop, collapse về 1-col trên mobile

---

## Pending Page (/cho-duyet)

| Option | Description | Selected |
|--------|-------------|----------|
| Xây dựng lại | Có approval flow, add vào phase 10 | |
| Bỏ hoàn toàn | Không có pending flow, user đăng ký là có quyền luôn | ✓ |

**User's choice:** Bỏ hoàn toàn — không implement `/cho-duyet`
**Notes:** User xác nhận route này không còn tồn tại và không cần nữa. Sau đăng ký, user vào `/khoa-hoc` trực tiếp.

---

## Agent's Discretion

- Card Claymorphism styling (border thickness, shadow depth, radius)
- Math symbol animation (keyframe timing, opacity values)
- CTA button màu orange per design system

## Deferred Ideas

- Pending approval page — bỏ hoàn toàn khỏi product
- Social login — tương lai nếu cần
- Forgot password — ngoài scope phase 10

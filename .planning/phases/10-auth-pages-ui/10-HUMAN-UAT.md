---
status: partial
phase: 10-auth-pages-ui
source: [10-VERIFICATION.md]
started: 2026-05-01T12:30:00Z
updated: 2026-05-01T12:30:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Claymorphism card visual
expected: White card with 3px teal border + clay double-shadow visible at /dang-nhap
result: [pending]

### 2. Float symbol animation
expected: π √ ± × ÷ ∑ gently floating at 0.08 opacity on desktop (≥640px)
result: [pending]

### 3. Mobile symbol hide
expected: hidden sm:block hides float symbols at 375px — no horizontal scroll
result: [pending]

### 4. Register 2-column grid
expected: Side-by-side field pairs at ≥640px, single-column below 640px at /dang-ky
result: [pending]

### 5. Auth logic end-to-end
expected: Login redirects by role after signIn; Register calls supabase.auth.signUp (requires live Supabase)
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps

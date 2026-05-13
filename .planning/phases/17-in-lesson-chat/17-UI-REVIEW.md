# Phase 17 — UI Review: In-Lesson Chat

**Audited:** 2026-05-09
**Baseline:** 17-UI-SPEC.md (approved design contract)
**Screenshots:** Not captured (no dev server running on ports 3000 or 5173)
**Audit method:** Source code review of implemented components

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | "Giữ" vs spec "Giữ lại"; error-load body copy mismatch; teacher empty state not in spec |
| 2. Visuals | 2/4 | Avatars added (spec: no avatars); no bubble max-width; skeleton dimensions wrong; off-spec "Trực tuyến" indicator |
| 3. Color | 2/4 | Student/teacher bubble backgrounds inverted from spec; tab trigger unread badge entirely missing |
| 4. Typography | 2/4 | Undeclared `font-bold` and `font-medium` weights; sender name at 14px not 12px; arbitrary 10px/11px sizes |
| 5. Spacing | 2/4 | Reply indent `ml-10` (40px) vs spec `ml-6` (24px); send button 28px touch target violates 44px minimum |
| 6. Experience Design | 2/4 | Tab trigger unread badge not implemented; animations lack `motion-safe:` prefix; delete tooltip absent |

**Overall: 13/24**

---

## Top 3 Priority Fixes

1. **Send button touch target 28px** — On mobile, `w-7 h-7` (28px) is unreachable by average thumbs; spec mandates min 44px inherited from BellNotification pattern. Wrap button in a `min-w-[44px] min-h-[44px] flex items-center justify-center` container while keeping the visual 28px icon circle inside. — **BLOCKER** (breaks mobile task completion)

2. **Student/teacher bubble color scheme inverted** — Spec: student bubble `bg-muted` (warm grey), teacher bubble `bg-white border border-[#F97316]/20`. Impl: student bubble is `bg-white border border-slate-100`, teacher bubble is `bg-gradient-to-br from-orange-50 to-amber-50`. The visual differentiation exists but is contrary to the spec, and the teacher bubble's gradient is undeclared. Change `ChatMessage.tsx` line 132-133: student → `bg-muted`, teacher → `bg-white border border-orange-200/20`. — **WARNING**

3. **Tab trigger unread badge missing** — `LessonContent.tsx` renders `Thảo luận` without any `<Badge>` component or unread count indicator. The spec's entire `<TabsTrigger>` + `<Badge>` pattern (lines 154-162 of UI-SPEC.md) was not implemented. ChatPanel must pass an `unreadCount` prop up to LessonContent, or LessonContent must query `['lesson-chat-unread']` directly, then render the orange badge. — **BLOCKER** (CHAT-03 incomplete — bell notification works but in-tab signal is missing)

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**What passed:**
- Empty state heading: "Chưa có câu hỏi nào" ✓ (matches spec exactly)
- Input placeholders: "Đặt câu hỏi về bài học này…" / "Trả lời câu hỏi của học sinh…" ✓
- Error send toast: "Không gửi được tin nhắn. Kiểm tra kết nối và thử lại." ✓
- Delete confirm prompt: "Xoá tin nhắn này?" ✓
- Delete button: "Xoá" ✓
- aria-labels: all three textarea, send button, and delete button aria-labels present ✓
- Loading aria-label: "Đang tải tin nhắn…" ✓
- Teacher role label: "Giảng viên" / "Quản trị" ✓
- Bell dropdown section: "Câu hỏi chưa trả lời" ✓

**Deviations:**

- **WARNING** `ChatMessage.tsx:163` — Cancel-delete button reads `"Giữ"`. Spec declares `"Giữ lại"`. The truncated copy loses clarity when the confirm row is cramped.
- **WARNING** `ChatPanel.tsx:160` — Student empty state body: impl `"Hãy đặt câu hỏi đầu tiên cho giảng viên về bài học này."` vs spec `"Hãy đặt câu hỏi cho giảng viên về bài học này."` (extra word "đầu tiên" — diverges from contract without a design decision recorded).
- **WARNING** `ChatPanel.tsx:142-143` — Error-load state is split across two elements: heading `"Không tải được tin nhắn"` + body `"Kiểm tra kết nối và thử lại"`. Spec declares a single sentence: `"Không tải được tin nhắn. Thử lại sau."`. Different second clause changes guidance given to user.
- **INFO** `ChatPanel.tsx:111` — Unspecced panel header label `"Thảo luận bài học"` added. Not a contract violation but introduces copy not reviewed in spec.
- **INFO** `ChatPanel.tsx:118` — `"Trực tuyến"` label added with no spec entry. May create false confidence when channel is actually subscribing.
- **INFO** Role label format: spec declares inline `"• Giảng viên"` suffix in muted text after sender name. Impl uses a pill badge `bg-orange-100 text-orange-700`. Pattern change is defensible UX but departs from spec without a recorded decision.

---

### Pillar 2: Visuals (2/4)

**What passed:**
- Reply threading with visual left-border indent ✓
- Inline delete confirm (no modal) ✓
- Skeleton loading with distinct avatar + content skeleton ✓
- Empty state: icon + heading + body layout ✓
- Error state: icon + copy ✓
- Message entry animation (fade + slide) ✓
- Delete hover reveal pattern ✓
- Send button visually distinct orange vs disabled grey ✓

**Deviations:**

- **BLOCKER** `ChatMessage.tsx:78-87` — Avatars with initials circles added. Spec explicitly states `"No avatar; role label not shown for students"`. Avatar circles add visual noise not in the layout contract and push message content 44px right, compressing text width on narrow screens.
- **WARNING** `ChatMessage.tsx:73-74` — Reply indent `ml-10` (40px) vs spec `ml-6` (24px). Deeper indent causes two-level text alignment confusion and reduces available bubble width on mobile.
- **WARNING** No `max-w-[90%]` / `max-w-[80%]` / `max-w-[70%]` on message bubbles. Spec declares responsive max-width: 90% mobile, 80% tablet, 70% desktop. Bubbles currently stretch full container width.
- **WARNING** Skeleton rows: spec says `48px height each, rounded-lg`. Impl: `h-10` (40px) bubble skeleton, `rounded-2xl`. Height wrong (-8px), shape undeclared.
- **WARNING** `ChatPanel.tsx:108-119` — Unspecced panel header bar added with green ping "Trực tuyến" indicator. Not in layout contract. Reduces message list vertical real estate.
- **WARNING** `ChatMessage.tsx:73` — `animate-in fade-in-0 slide-in-from-bottom-1 duration-200` lacks `motion-safe:` prefix. Spec mandates: _"All animations respect `prefers-reduced-motion: reduce` — wrap animation classes with `motion-safe:` prefix"_.

---

### Pillar 3: Color (2/4)

**Accent usage count:**
- Send button: `bg-orange-500` (≡ #F97316) ✓ — correct single focal point
- Teacher avatar: `bg-gradient-to-br from-orange-500 to-orange-600` — accent overuse on decorative avatar, not in spec
- Teacher bubble background: `from-orange-50 to-amber-50` — off-spec (should be `bg-white`)
- Empty state icon wrapper: `bg-orange-50 border-2 border-orange-100` — decorative, not in spec
- Reply border: `border-orange-200` vs spec `border-[#F97316]/30` — close, not exact
- BellNotification dropdown: `bg-[#F97316]/5` — hardcoded hex, should use CSS variable

**Specific deviations:**

- **BLOCKER** `ChatMessage.tsx:131-133` — Student/teacher bubble colors **inverted from spec**:
  - Spec student: `bg-muted` (warm grey). Actual: `bg-white border border-slate-100`
  - Spec teacher: `bg-white border border-[#F97316]/20`. Actual: `bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/60`
  - The visual differentiation direction is correct (lighter vs warmer), but it violates the contract and uses an undeclared gradient not in the design system.
- **BLOCKER** Tab trigger unread badge not rendered in `LessonContent.tsx`. Spec prescribes `<Badge className="ml-1.5 bg-[#F97316] text-white ...">`. Zero lines of unread Badge code exist in LessonContent.tsx — the entire orange unread indicator for Tab 3 is absent.
- **WARNING** `ChatMessage.tsx:82-83` — Teacher avatar uses `bg-gradient-to-br from-orange-500 to-orange-600` (solid orange fill). This is an undeclared use of the accent color outside the permitted list (send button, badge, tab underline, reply stripe). Breaks 60/30/10 distribution.
- **WARNING** `ChatPanel.tsx:115-116` — Green `bg-green-400 / bg-green-500` for "Trực tuyến" pulse. Green is not in the Phase 17 or Phase 13 color palette. Introduces an undeclared color.
- **INFO** `BellNotification.tsx:64` — `bg-[#F97316]/5` hardcoded hex. Should reference `--bm-primary` CSS variable for consistency.

---

### Pillar 4: Typography (2/4)

**Declared weights (spec):** 400 (body, timestamp), 600 (sender name, role badge)
**Actual weights in use:** `font-normal` (implicit), `font-medium` (500), `font-semibold` (600), `font-bold` (700) — **4 weights vs 2 declared**

**Declared sizes (spec):** 14px body, 12px label/timestamp
**Actual sizes:** text-xs (12px), text-sm (14px), text-[10px] (10px), text-[11px] (11px)

**Deviations:**

- **WARNING** `ChatMessage.tsx:80` — Avatar initials use `font-bold` (700). Spec permits only 400 and 600. Undeclared weight.
- **WARNING** `ChatMessage.tsx:152, 160` — Delete confirm buttons use `font-medium` (500). Undeclared weight.
- **WARNING** `ChatMessage.tsx:93` — Sender name renders at `text-sm` (14px). Spec defines sender name (Label role) at **12px weight 600**. Implementation is 14px — 2px over spec.
- **WARNING** `ChatPanel.tsx:118` — `text-[11px]` for "Trực tuyến". Arbitrary size not in typography scale.
- **WARNING** `ChatMessage.tsx:97`, `ChatInput.tsx:105,131`, `ChatPanel.tsx:152` — `text-[10px]` used for role badge, keyboard hint, and "?" badge. 10px text is below minimum accessible font size (12px per WCAG guidance) and below the smallest declared token (12px).
- **INFO** `ChatMessage.tsx:130` — Message text uses `leading-relaxed` (1.625). Spec declares line-height 1.5. Minor deviation but measurable.
- **INFO** `ChatMessage.tsx:97` — Role label rendered as orange pill badge (font-semibold 600 ✓) at 10px. Spec places it inline after name at 12px muted.

---

### Pillar 5: Spacing (2/4)

**Declared scale:** 4px multiples only (4, 8, 16, 24, 32, 48px)
**Undeclared fractional values found:** `px-1.5` (6px), `py-0.5` (2px), `px-2.5` (10px), `py-2.5` (10px), `px-3.5` (14px), `py-3.5` (14px), `gap-1.5` (6px), `space-y-1.5` (6px), `py-0.5` (2px), `px-0.5` (2px)

**Deviations:**

- **BLOCKER** `ChatInput.tsx:117` — Send button `w-7 h-7` = 28px × 28px. Spec states: _"touch targets inherit the existing minimum 44px touch target pattern from `BellNotification.tsx` (`min-h-[48px]`)"_. At 28px, the send button fails the minimum touch target on all breakpoints. Fix: wrap in `min-w-[44px] min-h-[44px]` flex container.
- **WARNING** `ChatMessage.tsx:74` — Reply indent `ml-10` (40px). Spec declares `ml-6` (24px = lg). Over-indented by 16px, compressing reply text width on mobile.
- **WARNING** Pervasive `.5` fractional spacing: ChatMessage uses `px-1.5 py-0.5 px-3.5 py-2.5`; ChatInput uses `px-2.5 py-1.5 gap-1.5`; ChatPanel uses `gap-1.5`. These values (6px, 10px, 14px) are not in the declared 4px-multiple scale.
- **WARNING** `ChatPanel.tsx:132` — Skeleton message bubble `h-10` (40px). Spec declares skeleton rows at 48px height. 8px short, resulting in denser-than-designed loading skeleton.
- **INFO** `ChatPanel.tsx:146` — Empty state `py-16` (64px). `3xl` token (64px) is explicitly declared as "Not used in this phase". Minor divergence.

---

### Pillar 6: Experience Design (2/4)

**State coverage matrix:**

| State | Spec | Implemented | Status |
|-------|------|-------------|--------|
| Loading | 3 Skeleton rows, 48px, rounded-lg | 3 avatar+content skeletons, 40px, rounded-2xl | Partial |
| Empty | Icon + heading + body | Icon + heading + body (different body copy) | ✓ |
| Has messages | Scrollable list | Scrollable list with Realtime | ✓ |
| Sending | Loader2 spinner, input disabled | Loader2, disabled state | ✓ |
| Send error | Toast (Sonner) error | toast.error() | ✓ |
| Delete confirm | Inline row (no modal) | Inline row | ✓ |
| Tab unread badge | Badge on TabsTrigger | **Not implemented** | ✗ |

**Deviations:**

- **BLOCKER** `LessonContent.tsx:146-151` — Tab trigger unread badge entirely absent. The spec's `<Badge>` component with orange background + count was a key CHAT-03 deliverable visible on the lesson page. Students and teachers cannot see at a glance that a lesson has chat activity without opening the bell. ChatPanel.tsx would need to expose its message count, or LessonContent needs to query the unread count independently.
- **BLOCKER** `ChatInput.tsx:117` — 28px send button touch target (see Spacing, repeated as UX impact). On mobile 375px width this is the primary CTA and it's well below the 44px minimum.
- **WARNING** `ChatMessage.tsx:73` — `animate-in fade-in-0 slide-in-from-bottom-1 duration-200` without `motion-safe:` prefix. Spec: _"All animations respect `prefers-reduced-motion: reduce` — wrap animation classes with `motion-safe:` prefix"_. Fix: `motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1`.
- **WARNING** Delete button: spec says tooltip on hover. No `<Tooltip>` or `title` attribute on the Trash2 button (`ChatMessage.tsx:115-124`). aria-label exists but sighted users get no visual affordance of what the icon does before clicking.
- **INFO** `ChatMessage.tsx:86` — `parentId = replyTo?.parent_id || replyTo?.id` — this flattens replies to replies to the grandparent, matching spec D-04. ✓
- **INFO** `ChatPanel.tsx:49-53` — `markChatRead` fires on mount for staff. Correct per D-12. ✓
- **INFO** Realtime dedup by UUID: `prev.some(m => m.id === incoming.id)`. ✓ Handles React StrictMode D-07.
- **INFO** `BellNotification.tsx:29` — `totalCount = items.length + chatUnread` with 9+ cap. ✓ CHAT-03 bell badge works.

---

## Registry Safety

No third-party shadcn registries declared in 17-UI-SPEC.md. Only official shadcn components (`ScrollArea`, `Textarea`, `Button`, `Badge`, `Skeleton`, `Tabs`) were specified. Registry audit: 0 third-party blocks — not applicable.

---

## Files Audited

| File | Phase | Role |
|------|-------|------|
| `src/components/student/ChatPanel.tsx` | 17-03 | Container + Realtime + state management |
| `src/components/student/ChatMessage.tsx` | 17-03 | Message bubble (student/teacher variants) |
| `src/components/student/ChatInput.tsx` | 17-03 | Textarea + send button |
| `src/components/student/BellNotification.tsx` | 17-04 | Merged unread badge |
| `src/components/student/LessonContent.tsx` | 17-03 | Tab 3 integration host |
| `src/lib/api/lesson-chat.ts` | 17-02 | API module (referenced) |
| `.planning/phases/17-in-lesson-chat/17-UI-SPEC.md` | — | Design contract baseline |
| `.planning/phases/17-in-lesson-chat/17-CONTEXT.md` | — | Decisions |
| `.planning/phases/17-in-lesson-chat/17-03-SUMMARY.md` | — | Execution record |
| `.planning/phases/17-in-lesson-chat/17-04-SUMMARY.md` | — | Execution record |

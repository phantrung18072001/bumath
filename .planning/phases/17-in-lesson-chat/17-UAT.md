---
status: testing
phase: 17-in-lesson-chat
source:
  - 17-01-SUMMARY.md
  - 17-02-SUMMARY.md
  - 17-03-SUMMARY.md
  - 17-04-SUMMARY.md
started: 2026-05-09T00:03:00+07:00
updated: 2026-05-09T00:03:00+07:00
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 9
name: Bell Notification Shows Unread Chat Count (Teacher/Admin)
expected: |
  As a teacher or admin, when a student sends a message you haven't read,
  the bell icon in the header should show a badge count that includes unread
  chat messages (merged with graded-unviewed). Badge shows "9+" when total > 9.
awaiting: user response

## Tests

### 1. Tab 3 "Thảo luận" Visible to All Roles
expected: Navigate to any lesson as a student. On the lesson page, you should see a "Thảo luận" (Discussion) tab — Tab 3. Clicking it should open the chat panel (not a "Coming soon" placeholder). The tab should also be visible when logged in as teacher or admin.
result: pass

### 2. Send a Chat Message (Student)
expected: As a student, open Tab 3 (Thảo luận) in a lesson. Type a message in the textarea and press Enter (or click the orange Send button). The message should appear in the chat immediately with a "muted" bubble style. The input field should clear and refocus after sending.
result: pass

### 3. Shift+Enter Creates Newline (No Send)
expected: In the chat input textarea, press Shift+Enter. The cursor should move to a new line inside the textarea — the message should NOT be sent.
result: pass

### 4. Send Button Disabled on Empty Input
expected: With the chat input textarea empty (or containing only whitespace), the orange Send button should be disabled (grayed out / not clickable).
result: pass

### 5. Teacher/Admin Message Bubble Styling
expected: When a teacher or admin sends a message (or you view a lesson chat as teacher/admin), teacher/admin messages should appear with a white bubble and an orange left border, and show a role suffix (e.g., "Giảng viên" or "Admin"). Student messages should have the muted background style with no left border.
result: pass

### 6. Reply Indent (Threaded Message)
expected: If a message is a reply (has a parent), it should appear visually indented (ml-6 left margin + left border line) below the parent message, indicating it's part of a thread.
result: issue
reported: "UI có chỗ nào để reply đâu?"
severity: major

### 7. Delete Message (Teacher/Admin only)
expected: As a teacher or admin viewing the chat, hover over a message. A trash (🗑) icon should appear. Clicking it shows an inline confirm prompt ("Xoá tin nhắn này?"). Confirming deletes the message (soft-delete). The message should disappear or be marked as deleted in the UI.
result: pass

### 8. Realtime: New Message Appears Without Refresh
expected: Open Tab 3 in a lesson in two browser windows (or two accounts). Send a message from one window. The other window should receive and display the new message automatically — without a page refresh.
result: pass

### 9. Bell Notification Shows Unread Chat Count (Teacher/Admin)
expected: As a teacher or admin, when a student sends a message you haven't read yet, the bell notification icon in the header should show a badge count that includes the unread chat messages (merged with graded-unviewed count). The badge should show "9+" when the total exceeds 9.
result: [pending]

### 10. Bell Badge Clears After Reading Chat
expected: As a teacher or admin, open Tab 3 ("Thảo luận") for a lesson that has unread student messages. After opening the tab (which triggers markChatRead), the bell badge count should decrease (removing the chat unread count) within ~60 seconds (next poll cycle).
result: [pending]

### 11. "Câu hỏi chưa trả lời" Section in Bell Dropdown
expected: As a teacher or admin with unread student chat messages, click the bell icon in the header. The dropdown should show a "Câu hỏi chưa trả lời" section displaying the unread chat message count. This section should NOT appear for students.
result: [pending]

### 12. Student Cannot See Bell Chat Section
expected: Log in as a student. Click the bell icon. The "Câu hỏi chưa trả lời" section should NOT appear in the dropdown — the chat unread query is gated to teacher/admin roles only.
result: [pending]

## Summary

total: 12
passed: 7
issues: 1
skipped: 0
blocked: 0
pending: 4

## Gaps

- truth: "Chat messages with parent_id should be visually indented as replies"
  status: failed
  reason: "User reported: UI có chỗ nào để reply đâu? — No reply button exists in ChatMessage or ChatPanel UI. DB schema supports parent_id and ChatMessage renders isReply prop, but there is no UI affordance (button/gesture) to set parent_id when sending a message."
  severity: major
  test: 6
  artifacts: [src/components/student/ChatMessage.tsx, src/components/student/ChatPanel.tsx]
  missing: [Reply button on ChatMessage hover, parent_id wiring in ChatPanel.handleSend]

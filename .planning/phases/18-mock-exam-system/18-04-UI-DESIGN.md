# Phase 18-04 UI Design Notes

- Query executed per plan requirement for student timed-exam UX.
- Chosen pattern: exam list page -> attempt page with fixed-order questions, persistent answer state, and bottom submit panel.
- Interaction decisions:
  - server-authoritative start/submit via RPC-backed API
  - countdown always visible
  - explicit destructive error alert for submit/start failures
  - immediate result card (raw score + score_10)
- Accessibility checks:
  - labels on answer controls
  - single primary action for submit state
  - no color-only status communication

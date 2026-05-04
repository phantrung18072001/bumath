---
plan: P06
phase: 14
wave: 1
depends_on: []
autonomous: true
files_modified:
  - vercel.json
requirements:
  - VIDEO-01

must_haves:
  truths:
    - "HTTP response from Vercel deployment includes X-Frame-Options: SAMEORIGIN header"
    - "vercel.json retains the existing SPA rewrite rule"
  artifacts:
    - path: vercel.json
      provides: "Vercel deployment config with X-Frame-Options header + SPA rewrite"
      contains: "X-Frame-Options"
  key_links:
    - from: "vercel.json headers"
      to: "Vercel CDN edge"
      via: "Vercel deployment pipeline"
---

# P06 — Vercel Security Headers (X-Frame-Options)

**Goal:** Add `X-Frame-Options: SAMEORIGIN` header to all routes in `vercel.json` to prevent the BuMath app from being embedded in iframes from external domains. The existing SPA rewrite rule must be preserved. (Decision D-18)

---

<task id="T01" type="execute">
  <title>Add X-Frame-Options header to vercel.json</title>

  <read_first>
    - vercel.json (current content — has only the SPA rewrite rule)
    - .planning/phases/14-pricing-access-control/14-CONTEXT.md § D-18, D-19 (YouTube embed security decisions)
  </read_first>

  <action>
Replace the entire content of `vercel.json` with the following. The existing `"rewrites"` block is preserved. The new `"headers"` block adds `X-Frame-Options: SAMEORIGIN` to all routes via the `/(.*)`wildcard pattern.

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" }
      ]
    }
  ]
}
```

This is the complete file — no other content.
  </action>

  <acceptance_criteria>
    - [ ] `grep -c "X-Frame-Options" vercel.json` returns 1
    - [ ] `grep -c "SAMEORIGIN" vercel.json` returns 1
    - [ ] `grep -c "rewrites" vercel.json` returns 1 (existing SPA rewrite preserved)
    - [ ] `grep -c "index.html" vercel.json` returns 1 (rewrite destination preserved)
    - [ ] `cat vercel.json | python3 -c "import json,sys; json.load(sys.stdin); print('valid')"` outputs `valid` (valid JSON)
  </acceptance_criteria>
</task>

---

## Must Haves

- [ ] `vercel.json` contains `X-Frame-Options: SAMEORIGIN` header for all routes
- [ ] SPA rewrite rule `/(.*) → /index.html` still present
- [ ] File is valid JSON

## PLAN COMPLETE

---
created: 2026-04-27T17:04:25.089Z
title: Install all shadcn/radix components
area: ui
files: []
---

## Problem

Khi cần UI component (combobox, date picker, ...) thường tự implement bằng Popover+Command hoặc tương tự, trong khi shadcn/radix đã có sẵn. Ví dụ: shadcn có `Combobox` mới build trên Base UI nhưng chưa được cài vào project.

## Solution

Chạy `yarn dlx shadcn@latest add --all` để cài toàn bộ component có sẵn của shadcn vào `src/components/ui/`. Sau đó luôn ưu tiên dùng component shadcn/radix trước khi tự implement.

# Phase 3: Course Management - Research

**Date:** 2026-03-24

## 1. Database Schema Design (Supabase)

To support the 3-tier hierarchy and enrollments, we need 4 tables.

### `courses`
- `id` (uuid, pk)
- `title` (text, not null)
- `description` (text)
- `target_grade` (text, not null) - Expected: '7', '8', '9', 'chuyên'
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### `chapters`
- `id` (uuid, pk)
- `course_id` (uuid, fk to courses.id)
- `title` (text, not null)
- `order_index` (integer, not null)
- `created_at` (timestamptz)

### `lessons`
- `id` (uuid, pk)
- `chapter_id` (uuid, fk to chapters.id)
- `title` (text, not null)
- `youtube_id` (text) - Storing just the 11-char ID is safer than full URL
- `description` (text)
- `order_index` (integer, not null)
- `assignment_file_url` (text) - Path in Supabase Storage
- `assignment_file_name` (text) - Original file name for display
- `created_at` (timestamptz)

### `enrollments`
- `id` (uuid, pk)
- `user_id` (uuid, fk to auth.users / profiles.id)
- `course_id` (uuid, fk to courses.id)
- `created_at` (timestamptz)
- *Constraint: UNIQUE(user_id, course_id)*

### Row Level Security (RLS)
- **courses/chapters/lessons**: 
  - Admin (role = 'admin') -> ALL (Select, Insert, Update, Delete)
  - Student (role = 'student') -> SELECT only where they are enrolled (via `enrollments` table)
- **enrollments**:
  - Admin -> ALL
  - Student -> SELECT only for `auth.uid() = user_id`

## 2. Storage Strategy

- **Bucket**: `assignments` (Public: false) - Ensure only authenticated users can download, and only admins can upload.
- **Path convention**: `[course_id]/[lesson_id]/[timestamp]_[filename]` to avoid collisons.
- **File constraints**: Limit to PDF and Image (`application/pdf`, `image/*`). Max size 10MB to be safe, though Supabase default limits apply.

## 3. Reordering Mechanism (No DnD)

Since we are using [↑][↓] buttons, the operation is a simple adjacent swap.
- When [↑] is clicked on item at index `i`, we swap `order_index` with item at `i-1`.
- When [↓] is clicked, we swap `order_index` with item at `i+1`.

**Concurrency**: To prevent locking issues, we can write a simple PostgreSQL RPC function `swap_order(table_name, id1, id2)`, or just do a sequential Promise.all from the client. Given low concurrency of admin ops, a client-side transaction equivalent is:
```typescript
await Promise.all([
  supabase.from('chapters').update({ order_index: idx2 }).eq('id', id1),
  supabase.from('chapters').update({ order_index: idx1 }).eq('id', id2)
])
```

## 4. YouTube URL Extraction

When admin inputs `https://www.youtube.com/watch?v=dQw4w9WgXcQ` or `https://youtu.be/dQw4w9WgXcQ`, we need to extract `dQw4w9WgXcQ`.

**Regex Pattern**:
```typescript
const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
const match = url.match(ytRegex);
const youtubeId = match ? match[1] : null;
```

## 5. UI & State Management (TanStack Query)

- TanStack Query keys:
  - `['courses']`
  - `['courses', courseId]`
  - `['chapters', courseId]`
  - `['lessons', chapterId]`
  - `['enrollments', userId]`
- Forms will use `react-hook-form` and `zod`. We will use Dialogs for Chapter/Course creation to keep the user in the context, but full page for Lesson creation since it involves file upload and rich metadata.
- Pre-signed URLs: For reading assignment files securely, we will need to request `createSignedUrl` from Supabase Storage before rendering the download link, or rely on RLS and direct download APIs if making the bucket strictly authenticated.

## 6. Required UI Components
- `AdminPageLayout` or Breadcrumb usage.
- Tanstack table for enrollments.
- Custom list for lessons/chapters with [↑][↓] buttons, edit, delete icons.

## Conclusion
The architecture is straightforward relational data. The main complexity lies in handling the 3-tier deep navigation state and ensuring file uploads are fully synced with lesson creation.

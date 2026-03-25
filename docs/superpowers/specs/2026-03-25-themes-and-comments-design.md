# Design: Color Themes + Comments

## 1. Color Themes

**Scope:** Global accent color setting for all MD files, persisted in Vercel KV.

**Themes (5 predefined):**

| Name   | Accent classes                                      |
|--------|-----------------------------------------------------|
| orange | orange-600, orange-400 (výchozí, dnešní stav)      |
| blue   | blue-600, blue-400                                  |
| green  | emerald-600, emerald-400                            |
| purple | violet-600, violet-400                              |
| gray   | gray-600, gray-400                                  |

**Storage:** KV key `settings` → `{ theme: "orange" }`

**Changes:**
- `src/types/index.ts` — add `AppSettings` type, `ThemeName` union type
- `src/lib/storage.ts` — add `getSettings()`, `updateSettings()` functions
- `src/components/MarkdownRenderer.tsx` — accept `theme` prop, dynamic class map
- `src/app/admin/page.tsx` — theme dropdown in header area
- `src/app/api/settings/route.ts` — GET/PUT endpoint (admin key auth)
- `src/app/[slug]/page.tsx` — fetch settings, pass theme to MarkdownRenderer

## 2. Comments

**Scope:** Per-file toggle, visitor sidebar with comment form.

**Data model:**
```ts
interface Comment {
  id: string;
  author: string;  // empty = "Anonymní"
  text: string;
  createdAt: string;
}
```

**Storage:**
- Toggle: `MarkdownFile.commentsEnabled: boolean` (in KV hash `markdown-files`)
- Comments: KV key `comments:{slug}` → JSON array

**API endpoints:**
- `GET /api/comments/[slug]` — public, returns comments
- `POST /api/comments/[slug]` — public, body `{ author: string, text: string }`
- `DELETE /api/comments/[slug]?id=xxx` — admin only (X-Admin-Key header)

**Changes:**
- `src/types/index.ts` — add `Comment` type, add `commentsEnabled` to `MarkdownFile`
- `src/lib/storage.ts` — add `getComments()`, `addComment()`, `deleteComment()`, `toggleComments()`
- `src/app/api/comments/[slug]/route.ts` — GET/POST/DELETE handlers
- `src/app/api/files/[slug]/route.ts` — add PATCH for toggle commentsEnabled
- `src/components/CommentSidebar.tsx` — sidebar component (toggle, form, list)
- `src/app/[slug]/page.tsx` — conditionally render CommentSidebar
- `src/components/FileList.tsx` — add comments toggle per row

**UI behavior:**
- Toggle button in page header opens/closes sidebar
- Sidebar slides in from right, ~320px wide
- Markdown content shrinks when sidebar open
- Comment form at top of sidebar, list below
- Client-side fetch on open + after submit

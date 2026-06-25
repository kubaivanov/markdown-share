import { getCloudflareContext } from '@opennextjs/cloudflare';
import { nanoid } from 'nanoid';
import slugify from 'slugify';
import { MarkdownFile, AppSettings, Comment } from '@/types';

const SETTINGS_KEY = 'settings';

type FileRow = {
  slug: string;
  id: string;
  filename: string;
  object_key: string;
  created_at: string;
  updated_at: string;
  is_active: number;
  type: 'md' | 'html';
  comments_enabled: number;
};

type CommentRow = {
  id: string;
  author: string;
  text: string;
  selection: string | null;
  done: number;
  created_at: string;
};

function getBindings() {
  const env = getCloudflareContext().env;

  if (!env.DB) {
    throw new Error('Cloudflare D1 binding DB is not configured');
  }

  if (!env.FILES) {
    throw new Error('Cloudflare R2 binding FILES is not configured');
  }

  return { db: env.DB, bucket: env.FILES };
}

function rowToFile(row: FileRow): MarkdownFile {
  return {
    id: row.id,
    slug: row.slug,
    filename: row.filename,
    blobUrl: row.object_key,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isActive: row.is_active === 1,
    type: row.type,
    commentsEnabled: row.comments_enabled === 1,
  };
}

function rowToComment(row: CommentRow): Comment {
  return {
    id: row.id,
    author: row.author,
    text: row.text,
    selection: row.selection || undefined,
    done: row.done === 1,
    createdAt: row.created_at,
  };
}

async function getAnyFileBySlug(slug: string): Promise<MarkdownFile | null> {
  const { db } = getBindings();
  const row = await db
    .prepare(
      `SELECT slug, id, filename, object_key, created_at, updated_at, is_active, type, comments_enabled
       FROM files
       WHERE slug = ?`
    )
    .bind(slug)
    .first<FileRow>();

  return row ? rowToFile(row) : null;
}

export async function getAllFiles(): Promise<MarkdownFile[]> {
  const { db } = getBindings();
  const result = await db
    .prepare(
      `SELECT slug, id, filename, object_key, created_at, updated_at, is_active, type, comments_enabled
       FROM files
       WHERE is_active = 1
       ORDER BY updated_at DESC`
    )
    .all<FileRow>();

  return result.results.map(rowToFile);
}

export async function getFileBySlug(slug: string): Promise<MarkdownFile | null> {
  const file = await getAnyFileBySlug(slug);
  return file && file.isActive ? file : null;
}

export async function uploadFile(file: File, customSlug?: string): Promise<MarkdownFile> {
  const { db, bucket } = getBindings();
  const filename = file.name;
  const isHtml = filename.toLowerCase().endsWith('.html') || filename.toLowerCase().endsWith('.htm');
  const type = isHtml ? 'html' : 'md';
  const extension = isHtml ? 'html' : 'md';

  const baseSlug = customSlug || filename.replace(/\.(md|html|htm)$/i, '');
  let slug = slugify(baseSlug, { lower: true, strict: true });

  if (!slug) {
    slug = nanoid(10);
  }

  const existingFile = await getAnyFileBySlug(slug);

  if (existingFile?.blobUrl) {
    try {
      await bucket.delete(existingFile.blobUrl);
    } catch (error) {
      console.error('Failed to delete old R2 object:', error);
    }
  }

  const objectKey = `markdown/${slug}.${extension}`;
  await bucket.put(objectKey, file.stream(), {
    httpMetadata: {
      contentType: isHtml ? 'text/html; charset=utf-8' : 'text/markdown; charset=utf-8',
    },
  });

  const now = new Date().toISOString();
  const markdownFile: MarkdownFile = {
    id: existingFile?.id || nanoid(),
    slug,
    filename,
    blobUrl: objectKey,
    createdAt: existingFile?.createdAt || now,
    updatedAt: now,
    isActive: true,
    type,
    commentsEnabled: existingFile?.commentsEnabled || false,
  };

  await db
    .prepare(
      `INSERT INTO files (slug, id, filename, object_key, created_at, updated_at, is_active, type, comments_enabled)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         id = excluded.id,
         filename = excluded.filename,
         object_key = excluded.object_key,
         created_at = excluded.created_at,
         updated_at = excluded.updated_at,
         is_active = 1,
         type = excluded.type,
         comments_enabled = excluded.comments_enabled`
    )
    .bind(
      markdownFile.slug,
      markdownFile.id,
      markdownFile.filename,
      markdownFile.blobUrl,
      markdownFile.createdAt,
      markdownFile.updatedAt,
      markdownFile.type,
      markdownFile.commentsEnabled ? 1 : 0
    )
    .run();

  return markdownFile;
}

export async function deleteFile(slug: string): Promise<boolean> {
  const { db, bucket } = getBindings();
  const file = await getAnyFileBySlug(slug);

  if (!file) {
    return false;
  }

  await db
    .prepare('UPDATE files SET is_active = 0, updated_at = ? WHERE slug = ?')
    .bind(new Date().toISOString(), slug)
    .run();

  try {
    await bucket.delete(file.blobUrl);
  } catch (error) {
    console.error('Failed to delete R2 object:', error);
  }

  return true;
}

export async function getFileContent(objectKey: string): Promise<string> {
  const { bucket } = getBindings();
  const object = await bucket.get(objectKey);

  if (!object) {
    throw new Error('Failed to fetch file content');
  }

  return object.text();
}

export async function getSettings(): Promise<AppSettings> {
  const { db } = getBindings();
  const row = await db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .bind(SETTINGS_KEY)
    .first<{ value: string }>();

  if (!row) {
    return { theme: 'blue' };
  }

  return JSON.parse(row.value) as AppSettings;
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const { db } = getBindings();
  const current = await getSettings();
  const updated: AppSettings = { ...current };

  if (settings.theme !== undefined) {
    updated.theme = settings.theme;
  }

  await db
    .prepare(
      `INSERT INTO settings (key, value)
       VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    )
    .bind(SETTINGS_KEY, JSON.stringify(updated))
    .run();

  return updated;
}

export async function toggleCommentsEnabled(slug: string): Promise<boolean> {
  const { db } = getBindings();
  const file = await getAnyFileBySlug(slug);

  if (!file) return false;

  const commentsEnabled = !file.commentsEnabled;
  await db
    .prepare('UPDATE files SET comments_enabled = ?, updated_at = ? WHERE slug = ?')
    .bind(commentsEnabled ? 1 : 0, new Date().toISOString(), slug)
    .run();

  return commentsEnabled;
}

export async function getComments(slug: string): Promise<Comment[]> {
  const { db } = getBindings();
  const result = await db
    .prepare(
      `SELECT id, author, text, selection, done, created_at
       FROM comments
       WHERE slug = ?
       ORDER BY created_at ASC`
    )
    .bind(slug)
    .all<CommentRow>();

  return result.results.map(rowToComment);
}

export async function addComment(slug: string, author: string, text: string, selection?: string): Promise<Comment> {
  const { db } = getBindings();
  const comment: Comment = {
    id: nanoid(),
    author: author.trim() || '',
    text: text.trim(),
    selection: selection?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  await db
    .prepare(
      `INSERT INTO comments (slug, id, author, text, selection, done, created_at)
       VALUES (?, ?, ?, ?, ?, 0, ?)`
    )
    .bind(slug, comment.id, comment.author, comment.text, comment.selection || null, comment.createdAt)
    .run();

  return comment;
}

export async function deleteComment(slug: string, commentId: string): Promise<boolean> {
  const { db } = getBindings();
  const result = await db
    .prepare('DELETE FROM comments WHERE slug = ? AND id = ?')
    .bind(slug, commentId)
    .run();

  return result.meta.changes > 0;
}

export async function editComment(slug: string, commentId: string, text: string): Promise<Comment | null> {
  const { db } = getBindings();
  const result = await db
    .prepare('UPDATE comments SET text = ? WHERE slug = ? AND id = ?')
    .bind(text.trim(), slug, commentId)
    .run();

  if (result.meta.changes === 0) return null;

  const row = await db
    .prepare('SELECT id, author, text, selection, done, created_at FROM comments WHERE slug = ? AND id = ?')
    .bind(slug, commentId)
    .first<CommentRow>();

  return row ? rowToComment(row) : null;
}

export async function toggleCommentDone(slug: string, commentId: string): Promise<Comment | null> {
  const { db } = getBindings();
  const current = await db
    .prepare('SELECT id, author, text, selection, done, created_at FROM comments WHERE slug = ? AND id = ?')
    .bind(slug, commentId)
    .first<CommentRow>();

  if (!current) return null;

  await db
    .prepare('UPDATE comments SET done = ? WHERE slug = ? AND id = ?')
    .bind(current.done === 1 ? 0 : 1, slug, commentId)
    .run();

  return rowToComment({ ...current, done: current.done === 1 ? 0 : 1 });
}

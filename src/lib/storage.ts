import { put, del } from '@vercel/blob';
import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';
import slugify from 'slugify';
import { MarkdownFile, AppSettings, Comment } from '@/types';

const FILES_KEY = 'markdown-files';
const SETTINGS_KEY = 'settings';
const COMMENTS_PREFIX = 'comments:';

export async function getAllFiles(): Promise<MarkdownFile[]> {
  const files = await kv.hgetall<Record<string, MarkdownFile>>(FILES_KEY);
  
  if (!files) {
    return [];
  }

  return Object.values(files)
    .filter(file => file.isActive)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getFileBySlug(slug: string): Promise<MarkdownFile | null> {
  const file = await kv.hget<MarkdownFile>(FILES_KEY, slug);
  
  if (!file || !file.isActive) {
    return null;
  }

  return file;
}

export async function uploadFile(file: File, customSlug?: string): Promise<MarkdownFile> {
  const filename = file.name;
  const isHtml = filename.toLowerCase().endsWith('.html') || filename.toLowerCase().endsWith('.htm');
  const type = isHtml ? 'html' : 'md';
  const extension = isHtml ? 'html' : 'md';
  
  const baseSlug = customSlug || filename.replace(/\.(md|html|htm)$/i, '');
  let slug = slugify(baseSlug, { lower: true, strict: true });
  
  // Fallback to random ID if slugify returns an empty string (e.g., for filenames with only special chars)
  if (!slug) {
    slug = nanoid(10);
  }
  
  // Check if file with same slug already exists
  const existingFile = await kv.hget<MarkdownFile>(FILES_KEY, slug);
  
  // If file exists, delete old blob first
  if (existingFile && existingFile.blobUrl) {
    try {
      await del(existingFile.blobUrl);
    } catch (error) {
      console.error('Failed to delete old blob:', error);
    }
  }

  // Upload to Vercel Blob
  const blob = await put(`markdown/${slug}.${extension}`, file, {
    access: 'public',
    addRandomSuffix: false,
  });

  const now = new Date().toISOString();
  const markdownFile: MarkdownFile = {
    // Keep original ID if updating, otherwise create new
    id: existingFile?.id || nanoid(),
    slug,
    filename,
    blobUrl: blob.url,
    // Keep original creation date if updating
    createdAt: existingFile?.createdAt || now,
    updatedAt: now,
    isActive: true,
    type,
  };

  // Save metadata to KV
  await kv.hset(FILES_KEY, { [slug]: markdownFile });

  return markdownFile;
}

export async function deleteFile(slug: string): Promise<boolean> {
  const file = await kv.hget<MarkdownFile>(FILES_KEY, slug);
  
  if (!file) {
    return false;
  }

  // Soft delete - mark as inactive
  const updatedFile: MarkdownFile = {
    ...file,
    isActive: false,
    updatedAt: new Date().toISOString(),
  };

  await kv.hset(FILES_KEY, { [slug]: updatedFile });

  // Optionally delete from Blob storage
  try {
    await del(file.blobUrl);
  } catch (error) {
    console.error('Failed to delete blob:', error);
  }

  return true;
}

export async function getFileContent(blobUrl: string): Promise<string> {
  const response = await fetch(blobUrl, { cache: 'no-store' });
  
  if (!response.ok) {
    throw new Error('Failed to fetch file content');
  }

  return response.text();
}

export async function getSettings(): Promise<AppSettings> {
  const settings = await kv.get<AppSettings>(SETTINGS_KEY);
  return settings || { theme: 'orange' };
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await kv.set(SETTINGS_KEY, updated);
  return updated;
}

export async function toggleCommentsEnabled(slug: string): Promise<boolean> {
  const file = await kv.hget<MarkdownFile>(FILES_KEY, slug);
  if (!file) return false;

  const updatedFile: MarkdownFile = {
    ...file,
    commentsEnabled: !file.commentsEnabled,
    updatedAt: new Date().toISOString(),
  };

  await kv.hset(FILES_KEY, { [slug]: updatedFile });
  return updatedFile.commentsEnabled || false;
}

export async function getComments(slug: string): Promise<Comment[]> {
  const comments = await kv.get<Comment[]>(`${COMMENTS_PREFIX}${slug}`);
  return comments || [];
}

export async function addComment(slug: string, author: string, text: string, selection?: string): Promise<Comment> {
  const comment: Comment = {
    id: nanoid(),
    author: author.trim() || '',
    text: text.trim(),
    selection: selection?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  const comments = await getComments(slug);
  comments.push(comment);
  await kv.set(`${COMMENTS_PREFIX}${slug}`, comments);

  return comment;
}

export async function deleteComment(slug: string, commentId: string): Promise<boolean> {
  const comments = await getComments(slug);
  const filtered = comments.filter(c => c.id !== commentId);

  if (filtered.length === comments.length) return false;

  await kv.set(`${COMMENTS_PREFIX}${slug}`, filtered);
  return true;
}


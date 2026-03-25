export type ThemeName = 'orange' | 'blue' | 'green' | 'purple' | 'gray';

export interface AppSettings {
  theme: ThemeName;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  selection?: string;
  createdAt: string;
}

export interface MarkdownFile {
  id: string;
  slug: string;
  filename: string;
  blobUrl: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  type?: 'md' | 'html';
  commentsEnabled?: boolean;
}

export interface FileMetadata {
  files: Record<string, MarkdownFile>;
}

export interface UploadResponse {
  success: boolean;
  url?: string;
  slug?: string;
  error?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}


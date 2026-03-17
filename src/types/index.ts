export interface MarkdownFile {
  id: string;
  slug: string;
  filename: string;
  blobUrl: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  type?: 'md' | 'html';
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


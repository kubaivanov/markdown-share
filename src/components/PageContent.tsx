'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import MarkdownWithAnnotations from './MarkdownWithAnnotations';
import ShareButtons from './ShareButtons';
import CommentSidebar from './CommentSidebar';
import { ThemeName } from '@/types';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

interface PageContentProps {
  content: string;
  filename: string;
  slug: string;
  createdAt: string;
  theme: ThemeName;
  commentsEnabled: boolean;
}

export default function PageContent({
  content,
  filename,
  slug,
  createdAt,
  theme,
  commentsEnabled,
}: PageContentProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSelection, setActiveSelection] = useState('');
  const [highlightCommentId, setHighlightCommentId] = useState<string>();

  const handleSelectionAdd = useCallback((selection: string) => {
    setActiveSelection(selection);
    setSidebarOpen(true);
    setHighlightCommentId(undefined);
  }, []);

  const handleHighlightClick = useCallback((commentId: string) => {
    setHighlightCommentId(commentId);
    setSidebarOpen(true);
  }, []);

  const handleSelectionUsed = useCallback(() => {
    setActiveSelection('');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-8 py-16">
        <div className="mb-12">
          <div className="flex items-center gap-3 text-sm text-on-surface-variant mb-6">
            <Link href="/admin" className="flex items-center gap-2 hover:text-on-surface transition-colors font-medium">
              <div className="w-6 h-6 bg-primary flex items-center justify-center rounded-md">
                <span className="material-symbols-outlined text-on-primary text-sm">description</span>
              </div>
              <span>MD Share</span>
            </Link>
            <span className="text-outline-variant">·</span>
            <span>{format(new Date(createdAt), "d. MMMM yyyy", { locale: cs })}</span>
          </div>

          <ShareButtons content={content} filename={filename} slug={slug} />
        </div>

        <MarkdownWithAnnotations
          content={content}
          theme={theme}
          slug={slug}
          commentsEnabled={commentsEnabled}
          onSelectionAdd={handleSelectionAdd}
          onHighlightClick={handleHighlightClick}
        />

        <div className="mt-20 pt-8 text-center text-on-surface-variant/50 text-xs font-medium uppercase tracking-[0.15em]">
          Sdíleno přes{' '}
          <Link href="/admin" className="text-secondary hover:text-on-surface transition-colors">
            MD Share
          </Link>
        </div>
      </div>

      {commentsEnabled && (
        <CommentSidebar
          slug={slug}
          isOpen={sidebarOpen}
          onOpenChange={setSidebarOpen}
          selection={activeSelection}
          onSelectionUsed={handleSelectionUsed}
          highlightCommentId={highlightCommentId}
        />
      )}
    </div>
  );
}

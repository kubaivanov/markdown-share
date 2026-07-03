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
  const [sidebarOpen, setSidebarOpen] = useState(commentsEnabled);
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
      <header className="sticky top-0 z-40 bg-background border-b border-outline-variant">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">
          <Link href="/admin" className="text-base font-bold tracking-tight hover:text-on-surface-variant transition-colors">
            jakubivanov<span className="text-on-surface-variant">.</span>
          </Link>
          <span className="text-sm text-on-surface-variant">shared doc</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant mb-6">
            <Link href="/admin" className="hover:text-on-surface transition-colors font-medium">
              MD Share
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

        <div className="mt-20 pt-8 border-t border-outline-variant text-center text-on-surface-variant text-sm">
          Sdíleno přes{' '}
          <Link href="/admin" className="text-secondary hover:text-on-surface transition-colors">
            MD Share
          </Link>
        </div>
      </main>

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

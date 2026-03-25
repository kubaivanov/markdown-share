'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Comment, ThemeName } from '@/types';
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownWithAnnotationsProps {
  content: string;
  theme?: ThemeName;
  slug: string;
  commentsEnabled: boolean;
  onSelectionAdd: (selection: string) => void;
  onHighlightClick: (commentId: string) => void;
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function preprocessContent(content: string, comments: Comment[]): string {
  let processed = content;

  const sorted = [...comments]
    .filter(c => c.selection)
    .sort((a, b) => (b.selection?.length || 0) - (a.selection?.length || 0));

  for (const comment of sorted) {
    if (!comment.selection) continue;
    const escaped = escapeRegex(comment.selection);
    const regex = new RegExp(`(${escaped})`, 'g');
    processed = processed.replace(
      regex,
      `<mark data-comment-id="${comment.id}" class="annotation-highlight">$1</mark>`
    );
  }

  return processed;
}

export default function MarkdownWithAnnotations({
  content,
  theme,
  slug,
  commentsEnabled,
  onSelectionAdd,
  onHighlightClick,
}: MarkdownWithAnnotationsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [selection, setSelection] = useState('');
  const [buttonPos, setButtonPos] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!commentsEnabled) return;
    let cancelled = false;
    fetch(`/api/comments/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data) setComments(data.comments || []);
      })
      .catch(console.error);
    return () => { cancelled = true; };
  }, [slug, commentsEnabled]);

  const handleMouseUp = useCallback(() => {
    if (!commentsEnabled) return;

    const sel = window.getSelection();
    const text = sel?.toString().trim() || '';

    if (text.length > 0 && text.length < 500 && containerRef.current?.contains(sel?.anchorNode || null)) {
      const range = sel!.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelection(text);
      setButtonPos({
        top: rect.top - 44 + window.scrollY,
        left: rect.left + rect.width / 2 - 60,
      });
    } else {
      setSelection('');
      setButtonPos(null);
    }
  }, [commentsEnabled]);

  const handleAddNote = () => {
    if (selection) {
      onSelectionAdd(selection);
      setSelection('');
      setButtonPos(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'MARK' && target.dataset.commentId) {
      onHighlightClick(target.dataset.commentId);
    }
  }, [onHighlightClick]);

  const processedContent = commentsEnabled
    ? preprocessContent(content, comments)
    : content;

  return (
    <div ref={containerRef} className="relative" onMouseUp={handleMouseUp} onClick={handleClick}>
      {/* Floating Add Note Button */}
      {buttonPos && commentsEnabled && (
        <button
          onClick={handleAddNote}
          className="absolute z-30 inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold font-headline shadow-lg hover:bg-primary-container transition-all duration-200 animate-in"
          style={{ top: buttonPos.top, left: buttonPos.left }}
        >
          <span className="material-symbols-outlined text-[16px]">add_comment</span>
          Poznámka
        </button>
      )}

      <MarkdownRenderer content={processedContent} theme={theme} />
    </div>
  );
}

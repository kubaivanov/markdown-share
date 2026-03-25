'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Comment } from '@/types';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

interface CommentSidebarProps {
  slug: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selection?: string;
  onSelectionUsed?: () => void;
  highlightCommentId?: string;
}

export default function CommentSidebar({
  slug,
  isOpen,
  onOpenChange,
  selection,
  onSelectionUsed,
  highlightCommentId,
}: CommentSidebarProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const highlightedRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/comments/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (isOpen) fetchComments();
  }, [isOpen, fetchComments]);

  useEffect(() => {
    if (highlightCommentId && isOpen) {
      setTimeout(() => {
        highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [highlightCommentId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/comments/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: author.trim(),
          text: text.trim(),
          selection: selection || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([...comments, data.comment]);
        setText('');
        onSelectionUsed?.();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Smazat tento komentář?')) return;

    try {
      const response = await fetch(`/api/comments/${slug}?id=${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId));
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      const response = await fetch(`/api/comments/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: commentId, action: 'edit', text: editText.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments(comments.map(c => c.id === commentId ? data.comment : c));
        setEditingId(null);
        setEditText('');
      }
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const handleToggleDone = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: commentId, action: 'done' }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments(comments.map(c => c.id === commentId ? data.comment : c));
      }
    } catch (error) {
      console.error('Failed to toggle done:', error);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => onOpenChange(!isOpen)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 glass-panel border-0 border-l border-outline-variant/15 rounded-l-xl px-2.5 py-4 ambient-shadow hover:px-3 transition-all duration-300"
        title={isOpen ? 'Zavřít komentáře' : 'Otevřít komentáře'}
      >
        <span className="material-symbols-outlined text-on-surface-variant">forum</span>
        {comments.length > 0 && (
          <span className="absolute -top-1 -left-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {comments.filter(c => !c.done).length || comments.length}
          </span>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-on-surface/5" onClick={() => onOpenChange(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 glass-panel border-l border-outline-variant/15 z-50 flex flex-col transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">forum</span>
            <h3 className="font-headline font-bold text-on-surface">Komentáře</h3>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-lg transition-all duration-200"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Selection Preview */}
        {selection && (
          <div className="mx-6 mb-4 px-4 py-3 bg-tertiary-fixed/15 rounded-xl border-l-[3px] border-on-tertiary-container">
            <p className="text-xs font-bold uppercase tracking-wider text-on-tertiary-container mb-1">Označený text</p>
            <p className="text-sm text-on-surface/70 italic line-clamp-3">&ldquo;{selection}&rdquo;</p>
          </div>
        )}

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-5 space-y-3">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Jméno (nepovinné)"
            className="w-full px-4 py-3 bg-surface-container-highest/50 border-none rounded-xl text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all duration-300"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={selection ? 'Napište poznámku k označenému textu...' : 'Napište poznámku...'}
            rows={3}
            className="w-full px-4 py-3 bg-surface-container-highest/50 border-none rounded-xl text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest resize-none transition-all duration-300"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="w-full px-4 py-3 bg-primary hover:bg-primary-container disabled:opacity-40 disabled:hover:bg-primary rounded-xl text-on-primary text-sm font-bold font-headline transition-all duration-300 transform active:scale-[0.98]"
          >
            {submitting ? 'Odesílám...' : 'Odeslat'}
          </button>
        </form>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
          {loading ? (
            <div className="text-center py-10 text-on-surface-variant/50 text-sm">Načítám...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/20 mb-2 block">chat_bubble_outline</span>
              <p className="text-on-surface-variant/50 text-sm">Zatím žádné komentáře</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                ref={highlightCommentId === comment.id ? highlightedRef : undefined}
                className={`bg-surface-container-lowest/60 rounded-xl p-4 transition-all duration-300 ${
                  highlightCommentId === comment.id ? 'ring-2 ring-tertiary-fixed' : ''
                } ${comment.done ? 'opacity-60' : ''}`}
              >
                {/* Selection Quote */}
                {comment.selection && (
                  <div className="mb-3 px-3 py-2 bg-tertiary-fixed/10 rounded-lg border-l-2 border-on-tertiary-container/30">
                    <p className="text-xs text-on-surface-variant/60 italic line-clamp-2">&ldquo;{comment.selection}&rdquo;</p>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-surface-container-highest rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant">person</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface flex-1">
                    {comment.author || 'Anonymní'}
                  </span>
                  <span className="text-[11px] text-on-surface-variant/50">
                    {format(new Date(comment.createdAt), 'd.M. HH:mm', { locale: cs })}
                  </span>
                </div>

                {/* Text or Edit Mode */}
                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-surface-container-highest/50 border-none rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(comment.id)}
                        className="flex-1 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold transition-colors"
                      >
                        Uložit
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 bg-surface-container-highest text-on-surface-variant rounded-lg text-xs font-bold transition-colors"
                      >
                        Zrušit
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={`text-sm text-on-surface/80 whitespace-pre-wrap leading-relaxed ${comment.done ? 'line-through' : ''}`}>
                    {comment.text}
                  </p>
                )}

                {/* Action Buttons */}
                {editingId !== comment.id && (
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-outline-variant/10">
                    <button
                      onClick={() => handleToggleDone(comment.id)}
                      className={`p-1.5 rounded-lg transition-all duration-200 ${
                        comment.done
                          ? 'text-on-tertiary-container bg-tertiary-fixed/20'
                          : 'text-on-surface-variant/40 hover:text-on-tertiary-container hover:bg-tertiary-fixed/10'
                      }`}
                      title={comment.done ? 'Označit jako nedokončené' : 'Označit jako hotové'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {comment.done ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleStartEdit(comment)}
                      className="p-1.5 text-on-surface-variant/40 hover:text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-all duration-200"
                      title="Upravit"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-1.5 text-on-surface-variant/40 hover:text-error hover:bg-error-container/30 rounded-lg transition-all duration-200 ml-auto"
                      title="Smazat"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

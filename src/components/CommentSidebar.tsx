'use client';

import { useState, useEffect, useCallback } from 'react';
import { Comment } from '@/types';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

interface CommentSidebarProps {
  slug: string;
}

export default function CommentSidebar({ slug }: CommentSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/comments/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: author.trim(), text: text.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([...comments, data.comment]);
        setText('');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 glass-panel border-0 border-l border-outline-variant/15 rounded-l-xl px-2.5 py-4 ambient-shadow hover:px-3 transition-all duration-300"
        title={isOpen ? 'Zavřít komentáře' : 'Otevřít komentáře'}
      >
        <span className="material-symbols-outlined text-on-surface-variant">forum</span>
        {comments.length > 0 && (
          <span className="absolute -top-1 -left-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {comments.length}
          </span>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-on-surface/5" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar - glass panel */}
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
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-lg transition-all duration-200"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

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
            placeholder="Napište poznámku..."
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
              <div key={comment.id} className="bg-surface-container-lowest/60 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-surface-container-highest rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant">person</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface">
                    {comment.author || 'Anonymní'}
                  </span>
                  <span className="text-[11px] text-on-surface-variant/50 ml-auto">
                    {format(new Date(comment.createdAt), 'd.M. HH:mm', { locale: cs })}
                  </span>
                </div>
                <p className="text-sm text-on-surface/80 whitespace-pre-wrap leading-relaxed">{comment.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

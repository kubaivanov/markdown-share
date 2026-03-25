'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import Link from 'next/link';
import { MarkdownFile } from '@/types';

interface FileListProps {
  files: MarkdownFile[];
  adminKey: string;
}

export default function FileList({ files: initialFiles, adminKey }: FileListProps) {
  const [files, setFiles] = useState(initialFiles);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleToggleComments = async (slug: string) => {
    try {
      const response = await fetch(`/api/files/${slug}`, {
        method: 'PATCH',
        headers: { 'X-Admin-Key': adminKey },
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(files.map(f =>
          f.slug === slug ? { ...f, commentsEnabled: data.commentsEnabled } : f
        ));
      }
    } catch (error) {
      console.error('Toggle comments error:', error);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Opravdu chcete zrušit sdílení tohoto souboru?')) return;

    setDeleting(slug);
    try {
      const response = await fetch(`/api/files/${slug}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Key': adminKey },
      });

      if (response.ok) {
        setFiles(files.filter(f => f.slug !== slug));
      } else {
        alert('Nepodařilo se smazat soubor');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Nastala chyba při mazání');
    } finally {
      setDeleting(null);
    }
  };

  const copyLink = async (slug: string, type?: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const url = `${cleanBaseUrl}/${slug}${type === 'html' ? '/html' : ''}`;
    await navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-30 mb-4 block">folder_off</span>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-2">Žádné sdílené soubory</h3>
        <p className="text-on-surface-variant text-sm">
          Použijte <code className="bg-surface-container-highest px-2 py-0.5 rounded-lg font-mono text-xs">./share.sh</code> pro nahrání
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left py-4 px-6 text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">Soubor</th>
            <th className="text-left py-4 px-6 text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">URL</th>
            <th className="text-left py-4 px-6 text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">Stav</th>
            <th className="text-left py-4 px-6 text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">Datum</th>
            <th className="text-right py-4 px-6 text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">Akce</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id} className="hover:bg-surface-container transition-colors duration-200 group">
              <td className="py-5 px-6">
                <Link
                  href={`/${file.slug}${file.type === 'html' ? '/html' : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-on-surface hover:text-primary transition-colors flex items-center gap-2.5"
                >
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                    {file.type === 'html' ? 'html' : 'description'}
                  </span>
                  {file.filename}
                  {file.type === 'html' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-secondary-container text-on-secondary-container">
                      HTML
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-surface-container-highest text-on-surface-variant">
                      MD
                    </span>
                  )}
                </Link>
              </td>
              <td className="py-5 px-6">
                <code className="text-sm font-mono text-on-surface-variant">/{file.slug}{file.type === 'html' ? '/html' : ''}</code>
              </td>
              <td className="py-5 px-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-tertiary-fixed/30 text-on-tertiary-fixed-variant">
                  <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container" />
                  Aktivní
                </span>
              </td>
              <td className="py-5 px-6 text-sm text-on-surface-variant">
                {format(new Date(file.createdAt), 'd. MMM yy', { locale: cs })}
                <span className="block text-xs opacity-60">{format(new Date(file.createdAt), 'HH:mm')}</span>
              </td>
              <td className="py-5 px-6">
                <div className="flex items-center justify-end gap-0.5">
                  {file.type !== 'html' && (
                    <button
                      onClick={() => handleToggleComments(file.slug)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        file.commentsEnabled
                          ? 'text-on-tertiary-container bg-tertiary-fixed/20'
                          : 'text-on-surface-variant/40 hover:text-on-surface-variant hover:bg-surface-container-highest'
                      }`}
                      title={file.commentsEnabled ? 'Komentáře zapnuty' : 'Komentáře vypnuty'}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {file.commentsEnabled ? 'chat_bubble' : 'chat_bubble_outline'}
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => copyLink(file.slug, file.type)}
                    className="p-2 text-on-surface-variant/40 hover:text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-all duration-200"
                    title="Kopírovat odkaz"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {copiedSlug === file.slug ? 'check' : 'content_copy'}
                    </span>
                  </button>
                  <Link
                    href={`/${file.slug}${file.type === 'html' ? '/html' : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-on-surface-variant/40 hover:text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-all duration-200"
                    title="Otevřít"
                  >
                    <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(file.slug)}
                    disabled={deleting === file.slug}
                    className="p-2 text-on-surface-variant/40 hover:text-error hover:bg-error-container/30 rounded-lg transition-all duration-200 disabled:opacity-50"
                    title="Zrušit sdílení"
                  >
                    {deleting === file.slug ? (
                      <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

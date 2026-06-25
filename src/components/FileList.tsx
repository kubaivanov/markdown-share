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
        const data = await response.json() as { commentsEnabled: boolean };
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
      <div className="text-center py-20 px-6">
        <h3 className="font-headline text-2xl font-bold text-on-surface mb-3">Žádné sdílené soubory</h3>
        <p className="text-on-surface-variant text-sm">
          Použijte <code className="border border-outline-variant px-2 py-0.5 font-mono text-xs text-on-surface">./share.sh</code> pro nahrání.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left py-4 px-5 text-xs font-medium text-on-surface-variant border-b border-outline-variant">Soubor</th>
            <th className="text-left py-4 px-5 text-xs font-medium text-on-surface-variant border-b border-outline-variant">URL</th>
            <th className="text-left py-4 px-5 text-xs font-medium text-on-surface-variant border-b border-outline-variant">Stav</th>
            <th className="text-left py-4 px-5 text-xs font-medium text-on-surface-variant border-b border-outline-variant">Datum</th>
            <th className="text-right py-4 px-5 text-xs font-medium text-on-surface-variant border-b border-outline-variant">Akce</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id} className="hover:bg-surface-container-low transition-colors duration-200 group border-b border-outline-variant last:border-b-0">
              <td className="py-5 px-5">
                <Link
                  href={`/${file.slug}${file.type === 'html' ? '/html' : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-on-surface hover:text-on-surface-variant transition-colors flex items-center gap-2.5"
                >
                  {file.filename}
                  {file.type === 'html' ? (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium border border-outline-variant text-on-surface-variant">
                      HTML
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium border border-outline-variant text-on-surface-variant">
                      MD
                    </span>
                  )}
                </Link>
              </td>
              <td className="py-5 px-5">
                <code className="text-sm font-mono text-on-surface-variant">/{file.slug}{file.type === 'html' ? '/html' : ''}</code>
              </td>
              <td className="py-5 px-5">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium border border-outline-variant text-on-surface-variant">
                  Aktivní
                </span>
              </td>
              <td className="py-5 px-5 text-sm text-on-surface-variant">
                {format(new Date(file.createdAt), 'd. MMM yy', { locale: cs })}
                <span className="block text-xs opacity-60">{format(new Date(file.createdAt), 'HH:mm')}</span>
              </td>
              <td className="py-5 px-5">
                <div className="flex items-center justify-end gap-0.5">
                  {file.type !== 'html' && (
                    <button
                      onClick={() => handleToggleComments(file.slug)}
                      className={`p-2 transition-all duration-200 ${
                        file.commentsEnabled
                          ? 'text-secondary bg-surface-container-low'
                          : 'text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container-low'
                      }`}
                      title={file.commentsEnabled ? 'Komentáře zapnuty' : 'Komentáře vypnuty'}
                    >
                      <span className="text-sm font-semibold">{file.commentsEnabled ? 'C' : 'c'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => copyLink(file.slug, file.type)}
                    className="p-2 text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container-low transition-all duration-200"
                    title="Kopírovat odkaz"
                  >
                    <span className="text-sm font-semibold">{copiedSlug === file.slug ? '✓' : '↗'}</span>
                  </button>
                  <Link
                    href={`/${file.slug}${file.type === 'html' ? '/html' : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container-low transition-all duration-200"
                    title="Otevřít"
                  >
                    <span className="text-sm font-semibold">open</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(file.slug)}
                    disabled={deleting === file.slug}
                    className="p-2 text-on-surface-variant/50 hover:text-error hover:bg-error-container transition-all duration-200 disabled:opacity-50"
                    title="Zrušit sdílení"
                  >
                    {deleting === file.slug ? (
                      <span className="text-sm font-semibold animate-pulse">...</span>
                    ) : (
                      <span className="text-sm font-semibold">del</span>
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

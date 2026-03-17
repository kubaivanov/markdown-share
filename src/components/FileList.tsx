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

  const handleDelete = async (slug: string) => {
    if (!confirm('Opravdu chcete zrušit sdílení tohoto souboru?')) {
      return;
    }

    setDeleting(slug);

    try {
      const response = await fetch(`/api/files/${slug}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Key': adminKey,
        },
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
      <div className="text-center py-16">
        <div className="text-5xl mb-4 opacity-50">📭</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Žádné sdílené soubory</h3>
        <p className="text-gray-500 text-sm">Použijte <code className="bg-gray-100 px-2 py-1 rounded text-orange-600 font-mono text-xs">./share.sh</code> skript pro nahrání prvního souboru.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Soubor</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Stav</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Akce</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {files.map((file) => (
            <tr key={file.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-4 px-4">
                <Link
                  href={`/${file.slug}${file.type === 'html' ? '/html' : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-gray-900 hover:text-orange-600 transition-colors flex items-center gap-2"
                >
                  {file.filename}
                  {file.type === 'html' ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100">
                      HTML
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      MD
                    </span>
                  )}
                </Link>
              </td>
              <td className="py-4 px-4">
                <code className="text-sm text-gray-500 font-mono">/{file.slug}{file.type === 'html' ? '/html' : ''}</code>
              </td>
              <td className="py-4 px-4">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-600">
                  AKTIVNÍ
                </span>
              </td>
              <td className="py-4 px-4 text-sm text-gray-500">
                {format(new Date(file.createdAt), 'd. MMM yy', { locale: cs })}
                <br />
                <span className="text-gray-400">{format(new Date(file.createdAt), 'HH:mm')}</span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => copyLink(file.slug, file.type)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="Kopírovat odkaz"
                  >
                    {copiedSlug === file.slug ? (
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    )}
                  </button>
                  <Link
                    href={`/${file.slug}${file.type === 'html' ? '/html' : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="Otevřít"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => handleDelete(file.slug)}
                    disabled={deleting === file.slug}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    title="Zrušit sdílení"
                  >
                    {deleting === file.slug ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FileList from '@/components/FileList';
import { MarkdownFile, ThemeName } from '@/types';

const themes: { value: ThemeName; label: string; bg: string }[] = [
  { value: 'orange', label: 'Oranžová', bg: 'bg-[#f97316]' },
  { value: 'blue', label: 'Modrá', bg: 'bg-[#3b82f6]' },
  { value: 'green', label: 'Zelená', bg: 'bg-[#10b981]' },
  { value: 'purple', label: 'Fialová', bg: 'bg-[#8b5cf6]' },
  { value: 'gray', label: 'Šedá', bg: 'bg-[#6b7280]' },
];

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState<MarkdownFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<ThemeName>('orange');

  useEffect(() => {
    const savedKey = localStorage.getItem('md-share-admin-key');
    if (savedKey) {
      setAdminKey(savedKey);
      authenticateAndFetch(savedKey);
    }
  }, []);

  const authenticateAndFetch = async (key: string) => {
    setLoading(true);
    setError('');

    try {
      const authResponse = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey: key }),
      });

      if (!authResponse.ok) {
        const authData = await authResponse.json() as { error?: string };
        setError(authData.error || 'Nesprávný admin klíč');
        localStorage.removeItem('md-share-admin-key');
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const filesResponse = await fetch('/api/files', {
        headers: { 'X-Admin-Key': key },
      });

      if (filesResponse.ok) {
        const data = await filesResponse.json() as { files: MarkdownFile[] };
        setFiles(data.files);
        setIsAuthenticated(true);
        localStorage.setItem('md-share-admin-key', key);

        const settingsResponse = await fetch('/api/settings');
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json() as { settings?: { theme?: ThemeName } };
          setTheme(settingsData.settings?.theme || 'orange');
        }
      } else {
        setError('Nastala chyba při načítání souborů');
      }
    } catch (err) {
      console.error('Auth/Fetch error:', err);
      setError('Nepodařilo se připojit k serveru');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    authenticateAndFetch(adminKey);
  };

  const handleLogout = () => {
    localStorage.removeItem('md-share-admin-key');
    setIsAuthenticated(false);
    setAdminKey('');
    setFiles([]);
  };

  const handleThemeChange = async (newTheme: ThemeName) => {
    setTheme(newTheme);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey,
        },
        body: JSON.stringify({ theme: newTheme }),
      });
    } catch (err) {
      console.error('Theme update error:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 selection:bg-tertiary-fixed selection:text-on-tertiary-fixed-variant">
        {/* Brand Header */}
        <header className="fixed top-0 w-full border-b border-outline-variant bg-background">
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
            <h1 className="text-base font-bold tracking-tight text-on-surface">
              jakubivanov<span className="text-on-surface-variant">.</span>
            </h1>
            <span className="text-sm text-on-surface-variant">docs admin</span>
          </div>
        </header>

        {/* Login Canvas */}
        <main className="w-full max-w-[480px] z-10">
          <div className="mb-8">
            <p className="text-sm text-on-surface-variant mb-3">MD Share</p>
            <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-4 text-on-surface">Přihlášení</h2>
            <p className="text-on-surface-variant leading-relaxed">Správa sdílených markdown a HTML dokumentů.</p>
          </div>

          {/* Glass Card */}
          <div className="border border-outline-variant bg-background p-8 md:p-10">
            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-on-surface">
                  Admin klíč
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="•••• •••• •••• ••••"
                    className="w-full bg-background border border-outline-variant px-4 py-3 font-mono text-base tracking-widest text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-on-surface transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60 group-focus-within:opacity-100 transition-opacity">••</span>
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 border border-error text-error text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !adminKey}
                className="w-full bg-primary text-on-primary border border-primary font-semibold py-3 flex items-center justify-center gap-3 group hover:bg-background hover:text-primary disabled:opacity-40 disabled:hover:bg-primary disabled:hover:text-on-primary transition-colors"
              >
                <span>{loading ? 'Načítám...' : 'Přihlásit se'}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </form>
          </div>

          {/* Security badges */}
          <div className="mt-8 flex items-center justify-between gap-6 text-xs text-on-surface-variant">
            <span>noindex</span>
            <span>D1 + R2</span>
            <span>Cloudflare Worker</span>
          </div>
        </main>

        {/* Status Bar */}
        <footer className="fixed bottom-0 w-full border-t border-outline-variant bg-background p-4 flex justify-center">
          <p className="text-xs text-on-surface-variant">Systém aktivní</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - no borders, tonal separation */}
      <header className="sticky top-0 z-50 bg-background border-b border-outline-variant">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-2 hover:text-on-surface-variant transition-colors">
            <span className="text-base font-bold tracking-tight text-on-surface">jakubivanov<span className="text-on-surface-variant">.</span></span>
            <span className="text-sm text-on-surface-variant">docs</span>
          </Link>

          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs font-medium text-on-surface-variant">Téma</span>
              <div className="flex gap-1.5">
                {themes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => handleThemeChange(t.value)}
                    className={`w-4 h-4 rounded-full border border-outline-variant ${t.bg} transition-all duration-200 ${
                      theme === t.value
                        ? 'ring-2 ring-offset-2 ring-on-surface scale-110'
                        : 'hover:scale-125 opacity-50 hover:opacity-100'
                    }`}
                    title={t.label}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Odhlásit se
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
        {/* Page Title - asymmetric, editorial */}
        <div className="mb-12">
          <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-surface">
            Přehled souborů
          </h2>
          <p className="text-on-surface-variant mt-4 leading-relaxed">Vaše sdílené dokumenty na jednom místě.</p>
        </div>

        {/* Stats - using tonal containers instead of inline text */}
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          <div className="border border-outline-variant bg-background px-5 py-4">
            <div>
              <p className="text-sm text-on-surface-variant">Souborů</p>
              <p className="text-2xl font-bold text-on-surface mt-1">{files.length}</p>
            </div>
          </div>
          <div className="border border-outline-variant bg-background px-5 py-4">
            <div>
              <p className="text-sm text-on-surface-variant">Příkaz</p>
              <code className="text-sm font-mono text-on-surface mt-2 block">./share.sh soubor.md</code>
            </div>
          </div>
        </div>

        {/* File Table - on tonal surface, no borders */}
        <div className="border border-outline-variant bg-background overflow-hidden">
          <FileList files={files} adminKey={adminKey} />
        </div>
      </main>
    </div>
  );
}

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
        const authData = await authResponse.json();
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
        const data = await filesResponse.json();
        setFiles(data.files);
        setIsAuthenticated(true);
        localStorage.setItem('md-share-admin-key', key);

        const settingsResponse = await fetch('/api/settings');
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 asymmetric-bg selection:bg-tertiary-fixed selection:text-on-tertiary-fixed-variant">
        {/* Brand Header */}
        <header className="fixed top-0 w-full p-12 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl">
              <span className="material-symbols-outlined text-on-primary text-2xl">lock</span>
            </div>
            <h1 className="font-headline text-2xl font-extrabold tracking-tighter text-on-surface">MD Share</h1>
          </div>
        </header>

        {/* Login Canvas */}
        <main className="w-full max-w-[480px] z-10">
          <div className="text-center mb-10">
            <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-3 text-on-surface">Vítejte zpět</h2>
            <p className="text-on-surface-variant font-medium">Přístup ke kurátorskému digitálnímu prostoru</p>
          </div>

          {/* Glass Card */}
          <div className="glass-panel rounded-3xl p-10 ambient-shadow relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-secondary-fixed/30 rounded-full blur-3xl" />

            <form onSubmit={handleLogin} className="relative z-10 flex flex-col gap-8">
              <div className="space-y-3">
                <label className="block font-headline text-sm font-bold tracking-wide uppercase text-on-surface-variant ml-1">
                  Admin Klíč
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="•••• •••• •••• ••••"
                    className="w-full bg-surface-container-highest/50 border-none rounded-xl px-6 py-5 font-mono text-lg tracking-widest placeholder:text-outline focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all duration-300"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50 group-focus-within:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined">key</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 bg-error-container rounded-xl text-error text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !adminKey}
                className="w-full bg-primary text-on-primary font-headline font-bold py-5 rounded-xl flex items-center justify-center gap-3 group hover:bg-primary-container disabled:opacity-40 disabled:hover:bg-primary transition-all duration-300 transform active:scale-[0.98]"
              >
                <span>{loading ? 'Načítám...' : 'Přihlásit se'}</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </form>
          </div>

          {/* Security badges */}
          <div className="mt-12 flex items-center justify-center gap-8">
            <div className="flex items-center gap-2 opacity-40">
              <span className="material-symbols-outlined text-xl">security</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.15em]">End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-2 opacity-40">
              <span className="material-symbols-outlined text-xl">verified_user</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.15em]">ISO 27001</span>
            </div>
          </div>
        </main>

        {/* Status Bar */}
        <footer className="fixed bottom-0 w-full p-8 flex justify-center">
          <div className="flex items-center gap-3 bg-surface-container-low px-5 py-2.5 rounded-full">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-on-tertiary-container opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-on-tertiary-container" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-tertiary-container">
              Systém aktivní
            </p>
          </div>
        </footer>

        {/* Background Decorations */}
        <div className="fixed top-1/4 -left-20 w-[500px] h-[500px] rounded-full bg-secondary-fixed opacity-[0.03] blur-[100px] -z-10" />
        <div className="fixed bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-tertiary-fixed opacity-[0.05] blur-[120px] -z-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - no borders, tonal separation */}
      <header className="bg-surface-container-lowest">
        <div className="max-w-6xl mx-auto px-10 py-5 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-lg">
              <span className="material-symbols-outlined text-on-primary text-lg">description</span>
            </div>
            <span className="font-headline text-xl font-extrabold tracking-tight text-on-surface">MD Share</span>
          </Link>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant">Téma</span>
              <div className="flex gap-1.5">
                {themes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => handleThemeChange(t.value)}
                    className={`w-5 h-5 rounded-full ${t.bg} transition-all duration-200 ${
                      theme === t.value
                        ? 'ring-2 ring-offset-2 ring-on-surface-variant scale-110'
                        : 'hover:scale-125 opacity-50 hover:opacity-100'
                    }`}
                    title={t.label}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Odhlásit se
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-10 py-12">
        {/* Page Title - asymmetric, editorial */}
        <div className="mb-12">
          <h2 className="font-headline text-[2rem] font-extrabold tracking-tight text-on-surface">
            Přehled souborů
          </h2>
          <p className="text-on-surface-variant mt-2 font-medium">Vaše sdílené dokumenty na jednom místě</p>
        </div>

        {/* Stats - using tonal containers instead of inline text */}
        <div className="flex items-center gap-8 mb-10">
          <div className="flex items-center gap-3 bg-surface-container-low px-5 py-3 rounded-2xl">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">folder</span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">Souborů</p>
              <p className="text-lg font-headline font-extrabold text-on-surface">{files.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-surface-container-low px-5 py-3 rounded-2xl">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">terminal</span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">Příkaz</p>
              <code className="text-sm font-mono text-on-surface-variant">./share.sh soubor.md</code>
            </div>
          </div>
        </div>

        {/* File Table - on tonal surface, no borders */}
        <div className="bg-surface-container-low rounded-2xl overflow-hidden">
          <FileList files={files} adminKey={adminKey} />
        </div>
      </main>
    </div>
  );
}

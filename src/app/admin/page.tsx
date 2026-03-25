'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FileList from '@/components/FileList';
import { MarkdownFile, ThemeName } from '@/types';

const themes: { value: ThemeName; label: string; color: string }[] = [
  { value: 'orange', label: 'Oranžová', color: 'bg-orange-500' },
  { value: 'blue', label: 'Modrá', color: 'bg-blue-500' },
  { value: 'green', label: 'Zelená', color: 'bg-emerald-500' },
  { value: 'purple', label: 'Fialová', color: 'bg-violet-500' },
  { value: 'gray', label: 'Šedá', color: 'bg-gray-500' },
];

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState<MarkdownFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<ThemeName>('orange');

  // Check for saved admin key
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
      // First, validate the admin key
      const authResponse = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      // Then fetch files
      const filesResponse = await fetch('/api/files', {
        headers: {
          'X-Admin-Key': key,
        },
      });

      if (filesResponse.ok) {
        const data = await filesResponse.json();
        setFiles(data.files);
        setIsAuthenticated(true);
        localStorage.setItem('md-share-admin-key', key);

        // Fetch settings
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
      <div className="min-h-screen bg-[#f5f5f5] grid-pattern flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/admin" className="text-3xl font-bold text-gray-900 inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">📝</span>
              MD Share
            </Link>
          </div>

          {/* Login Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <div className="flex border-b border-gray-200 mb-6">
              <button className="flex-1 py-3 text-center text-gray-900 font-medium border-b-2 border-orange-500">
                Přihlášení
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Admin Klíč
                </label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all"
                />
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !adminKey}
                className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 rounded-lg text-white font-medium transition-colors"
              >
                {loading ? 'Načítám...' : 'Přihlásit se'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="text-xl font-bold text-gray-900 flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span>📝</span>
            MD Share
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Téma:</span>
              <div className="flex gap-1">
                {themes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => handleThemeChange(t.value)}
                    className={`w-6 h-6 rounded-full ${t.color} transition-all ${
                      theme === t.value
                        ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                        : 'hover:scale-110 opacity-60 hover:opacity-100'
                    }`}
                    title={t.label}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Odhlásit se
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 italic">Přehled souborů</h2>
          <p className="text-gray-500 mt-1">Podívejte se na své sdílené soubory</p>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Celkem souborů:</span>
            <span className="font-semibold text-gray-900">{files.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Příkaz pro nahrání:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-orange-600 font-mono text-xs">./share.sh soubor.md</code>
          </div>
        </div>

        {/* File Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <FileList files={files} adminKey={adminKey} />
        </div>
      </main>
    </div>
  );
}

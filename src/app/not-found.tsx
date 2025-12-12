import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] grid-pattern flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl mb-6 opacity-50">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Soubor nenalezen</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          Tento markdown soubor nebyl nalezen. Možná byl smazán nebo je odkaz nesprávný.
        </p>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Zpět na přehled
        </Link>
      </div>
    </div>
  );
}

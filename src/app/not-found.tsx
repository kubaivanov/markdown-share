import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md">
        <p className="text-sm text-on-surface-variant mb-3">404</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">Soubor nenalezen</h1>
        <p className="text-on-surface-variant mb-8 leading-relaxed">
          Tento markdown soubor nebyl nalezen. Možná byl smazán nebo je odkaz nesprávný.
        </p>
        <Link
          href="/admin"
          className="inline-flex items-center px-5 py-2.5 bg-primary text-on-primary border border-primary hover:bg-background hover:text-primary text-sm font-medium transition-colors"
        >
          Zpět na přehled
        </Link>
      </div>
    </div>
  );
}

import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getFileBySlug, getFileContent, getSettings } from '@/lib/storage';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ShareButtons from '@/components/ShareButtons';
import CommentSidebar from '@/components/CommentSidebar';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const file = await getFileBySlug(slug);

  if (!file) {
    return { title: 'Soubor neexistuje' };
  }

  return {
    title: file.filename,
    robots: { index: false, follow: false },
  };
}

export default async function MarkdownPage({ params }: PageProps) {
  const { slug } = await params;
  const file = await getFileBySlug(slug);

  if (!file) notFound();
  if (file.type === 'html') redirect(`/${slug}/html`);

  const content = await getFileContent(file.blobUrl);
  const settings = await getSettings();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-8 py-16">
        {/* Header - no border, spacing as separator */}
        <div className="mb-12">
          <div className="flex items-center gap-3 text-sm text-on-surface-variant mb-6">
            <Link href="/admin" className="flex items-center gap-2 hover:text-on-surface transition-colors font-medium">
              <div className="w-6 h-6 bg-primary flex items-center justify-center rounded-md">
                <span className="material-symbols-outlined text-on-primary text-sm">description</span>
              </div>
              <span>MD Share</span>
            </Link>
            <span className="text-outline-variant">·</span>
            <span>{format(new Date(file.createdAt), "d. MMMM yyyy", { locale: cs })}</span>
          </div>

          <ShareButtons content={content} filename={file.filename} slug={file.slug} />
        </div>

        {/* Content */}
        <MarkdownRenderer content={content} theme={settings.theme} />

        {/* Footer - tonal, no border */}
        <div className="mt-20 pt-8 text-center text-on-surface-variant/50 text-xs font-medium uppercase tracking-[0.15em]">
          Sdíleno přes{' '}
          <Link href="/admin" className="text-secondary hover:text-on-surface transition-colors">
            MD Share
          </Link>
        </div>
      </div>

      {file.commentsEnabled && <CommentSidebar slug={slug} />}
    </div>
  );
}

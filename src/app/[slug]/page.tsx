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
    return {
      title: 'Soubor neexistuje',
    };
  }

  return {
    title: file.filename,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function MarkdownPage({ params }: PageProps) {
  const { slug } = await params;
  const file = await getFileBySlug(slug);

  if (!file) {
    notFound();
  }

  if (file.type === 'html') {
    redirect(`/${slug}/html`);
  }

  const content = await getFileContent(file.blobUrl);
  const settings = await getSettings();

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/admin" className="flex items-center gap-1 hover:text-orange-600 transition-colors">
              <span>📝</span>
              <span>MD Share</span>
            </Link>
            <span className="text-gray-300">•</span>
            <span>{format(new Date(file.createdAt), "d. MMMM yyyy", { locale: cs })}</span>
          </div>

          {/* Action Buttons */}
          <ShareButtons content={content} filename={file.filename} slug={file.slug} />
        </div>

        {/* Content */}
        <MarkdownRenderer content={content} theme={settings.theme} />

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-400 text-sm">
          Sdíleno přes <Link href="/admin" className="text-orange-500 hover:text-orange-600 transition-colors">MD Share</Link>
        </div>
      </div>

      {/* Comments Sidebar */}
      {file.commentsEnabled && (
        <CommentSidebar slug={slug} />
      )}
    </div>
  );
}

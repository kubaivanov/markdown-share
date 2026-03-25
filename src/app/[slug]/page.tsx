import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getFileBySlug, getFileContent, getSettings } from '@/lib/storage';
import PageContent from '@/components/PageContent';

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
    <PageContent
      content={content}
      filename={file.filename}
      slug={slug}
      createdAt={file.createdAt}
      theme={settings.theme}
      commentsEnabled={!!file.commentsEnabled}
    />
  );
}

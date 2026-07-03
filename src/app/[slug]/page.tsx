import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getFileBySlug, getFileContent, getSettings } from '@/lib/storage';
import { getMarkdownExcerpt, getMarkdownTitle } from '@/lib/markdown-metadata';
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

  const content = await getFileContent(file.blobUrl);
  const title = getMarkdownTitle(content, file.filename);
  const description = getMarkdownExcerpt(content, title) || 'Sdílený markdown dokument';
  const imageUrl = `/api/og/${slug}`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
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

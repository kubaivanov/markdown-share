import { ImageResponse } from 'next/og';
import { getFileBySlug, getFileContent } from '@/lib/storage';
import { getMarkdownExcerpt, getMarkdownTitle } from '@/lib/markdown-metadata';

interface RouteProps {
  params: Promise<{ slug: string }>;
}

const size = {
  width: 1200,
  height: 630,
};

function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }

    if (lines.length === maxLines) break;
  }

  if (current && lines.length < maxLines) lines.push(current);

  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:!?-]*$/, '')}...`;
  }

  return lines;
}

export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const file = await getFileBySlug(slug);

  if (!file || file.type === 'html') {
    return new Response('Not found', { status: 404 });
  }

  const content = await getFileContent(file.blobUrl);
  const title = getMarkdownTitle(content, file.filename);
  const excerpt = getMarkdownExcerpt(content, title, 260);
  const titleLines = wrapText(title, 25, 3);
  const excerptLines = wrapText(excerpt, 58, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#fafafa',
          color: '#0a0a0a',
          padding: '58px 68px 52px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em' }}>
            jakubivanov<span style={{ color: '#888888' }}>.</span>
          </div>
          <div
            style={{
              display: 'flex',
              border: '1px solid #d7d7d7',
              padding: '10px 16px',
              fontSize: 18,
              color: '#666666',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            MD Share
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {titleLines.map((line, index) => (
              <div key={`${line}-${index}`} style={{ fontSize: 72, lineHeight: 0.95, fontWeight: 900, letterSpacing: '-0.07em' }}>
                {line}
              </div>
            ))}
          </div>

          {excerptLines.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                maxWidth: 880,
                color: '#4a4a4a',
                fontSize: 30,
                lineHeight: 1.22,
                letterSpacing: '-0.03em',
              }}
            >
              {excerptLines.map((line, index) => (
                <div key={`${line}-${index}`}>{line}</div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: '#777777', fontSize: 22 }}>
          <div style={{ width: 80, height: 6, background: '#004FE0' }} />
          <div style={{ display: 'flex' }}>shared markdown document</div>
        </div>
      </div>
    ),
    size
  );
}

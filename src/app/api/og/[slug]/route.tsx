import { ImageResponse } from 'next/og';
import { getFileBySlug, getFileContent } from '@/lib/storage';
import { getMarkdownTitle } from '@/lib/markdown-metadata';

interface RouteProps {
  params: Promise<{ slug: string }>;
}

const size = {
  width: 1200,
  height: 630,
};

async function getSpaceGroteskFont() {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/floriankarsten/space-grotesk/master/fonts/ttf/static/SpaceGrotesk-Bold.ttf'
    );

    if (!response.ok) return null;

    return response.arrayBuffer();
  } catch {
    return null;
  }
}

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

  const [content, fontData] = await Promise.all([
    getFileContent(file.blobUrl),
    getSpaceGroteskFont(),
  ]);
  const title = getMarkdownTitle(content, file.filename);
  const titleLines = wrapText(title, 27, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#004FE0',
          color: '#fafafa',
          padding: '52px 68px 60px',
          fontFamily: fontData ? 'Space Grotesk' : 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div
            style={{
              display: 'flex',
              border: '1px solid #8ab1ff',
              padding: '9px 14px',
              fontSize: 17,
              color: '#fafafa',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            shared doc
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {titleLines.map((line, index) => (
              <div key={`${line}-${index}`} style={{ fontSize: 76, lineHeight: 0.98, fontWeight: 700, letterSpacing: '-0.055em' }}>
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: 'Space Grotesk',
              data: fontData,
              weight: 700,
              style: 'normal',
            } as const,
          ]
        : undefined,
    }
  );
}

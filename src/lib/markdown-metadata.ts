function cleanInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[\*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const clipped = text.slice(0, maxLength - 1).trimEnd();
  const lastSpace = clipped.lastIndexOf(' ');
  return `${clipped.slice(0, lastSpace > 80 ? lastSpace : clipped.length)}...`;
}

export function getMarkdownTitle(content: string, fallback: string): string {
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  let inFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (/^(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }

    if (inFence) continue;

    const atxHeading = line.match(/^#\s+(.+?)\s*#*\s*$/);
    if (atxHeading) {
      const title = cleanInlineMarkdown(atxHeading[1]);
      if (title) return title;
    }

    const nextLine = lines[index + 1]?.trim();
    if (line && nextLine && /^=+\s*$/.test(nextLine)) {
      const title = cleanInlineMarkdown(line);
      if (title) return title;
    }
  }

  return fallback.replace(/\.(md|markdown)$/i, '');
}

export function getMarkdownExcerpt(content: string, title: string, maxLength = 220): string {
  const withoutFrontMatter = content.replace(/^---[\s\S]*?---\s*/, '');
  const withoutCode = withoutFrontMatter.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, '');
  const lines = withoutCode.replace(/\r\n?/g, '\n').split('\n');
  const parts: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index].trim();
    if (!rawLine) continue;
    if (/^#{1,6}\s+/.test(rawLine)) continue;
    if (/^[-*_]{3,}$/.test(rawLine)) continue;
    if (/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(rawLine)) continue;

    const cleaned = cleanInlineMarkdown(
      rawLine
        .replace(/^>\s?/, '')
        .replace(/^[-*+]\s+/, '')
        .replace(/^\d+\.\s+/, '')
    );

    if (!cleaned || cleaned === title) continue;
    parts.push(cleaned);

    if (parts.join(' ').length >= maxLength) break;
  }

  return truncate(parts.join(' '), maxLength);
}

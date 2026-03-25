'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { ThemeName } from '@/types';

interface MarkdownRendererProps {
  content: string;
  theme?: ThemeName;
}

const themeClasses: Record<ThemeName, string> = {
  orange: `
    prose-a:text-[#ea580c] hover:prose-a:text-[#c2410c]
    prose-code:text-[#ea580c]
    prose-blockquote:border-[#f97316]/40 prose-blockquote:bg-[#f97316]/5
  `,
  blue: `
    prose-a:text-[#2563eb] hover:prose-a:text-[#1d4ed8]
    prose-code:text-[#2563eb]
    prose-blockquote:border-[#3b82f6]/40 prose-blockquote:bg-[#3b82f6]/5
  `,
  green: `
    prose-a:text-[#059669] hover:prose-a:text-[#047857]
    prose-code:text-[#059669]
    prose-blockquote:border-[#10b981]/40 prose-blockquote:bg-[#10b981]/5
  `,
  purple: `
    prose-a:text-[#7c3aed] hover:prose-a:text-[#6d28d9]
    prose-code:text-[#7c3aed]
    prose-blockquote:border-[#8b5cf6]/40 prose-blockquote:bg-[#8b5cf6]/5
  `,
  gray: `
    prose-a:text-secondary hover:prose-a:text-on-surface
    prose-code:text-secondary
    prose-blockquote:border-outline/30 prose-blockquote:bg-surface-container-low
  `,
};

export default function MarkdownRenderer({ content, theme = 'orange' }: MarkdownRendererProps) {
  return (
    <article className={`prose prose-gray max-w-none
      prose-headings:text-on-surface prose-headings:font-headline prose-headings:font-extrabold
      prose-h1:text-3xl prose-h1:mb-6 prose-h1:pb-4 prose-h1:border-b prose-h1:border-outline-variant/15
      prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
      prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
      prose-p:text-on-surface/80 prose-p:leading-relaxed prose-p:mb-5 prose-p:font-body
      prose-a:no-underline prose-a:font-medium
      prose-strong:text-on-surface prose-strong:font-semibold
      prose-code:bg-surface-container-highest/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-surface-container-low prose-pre:rounded-xl prose-pre:overflow-x-auto
      prose-blockquote:border-l-[3px] prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:text-on-surface/70 prose-blockquote:not-italic prose-blockquote:font-body
      prose-ul:text-on-surface/80 prose-ol:text-on-surface/80
      prose-li:marker:text-outline/50 prose-li:my-1.5
      prose-table:border-collapse prose-table:w-full
      prose-th:bg-surface-container-low prose-th:px-5 prose-th:py-3 prose-th:text-left prose-th:font-bold prose-th:text-on-surface prose-th:font-headline prose-th:text-sm
      prose-td:px-5 prose-td:py-3 prose-td:border-t prose-td:border-outline-variant/15
      prose-hr:border-outline-variant/15 prose-hr:my-10
      prose-img:rounded-xl prose-img:shadow-sm
      ${themeClasses[theme]}
    `}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}

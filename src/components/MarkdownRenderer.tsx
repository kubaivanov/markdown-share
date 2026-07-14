'use client';

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
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
    prose-a:text-secondary
    prose-code:text-on-surface
    prose-blockquote:border-outline-variant prose-blockquote:bg-surface-container-low
  `,
  blue: `
    prose-a:text-secondary
    prose-code:text-on-surface
    prose-blockquote:border-outline-variant prose-blockquote:bg-surface-container-low
  `,
  green: `
    prose-a:text-secondary
    prose-code:text-on-surface
    prose-blockquote:border-outline-variant prose-blockquote:bg-surface-container-low
  `,
  purple: `
    prose-a:text-secondary
    prose-code:text-on-surface
    prose-blockquote:border-outline-variant prose-blockquote:bg-surface-container-low
  `,
  gray: `
    prose-a:text-secondary
    prose-code:text-secondary
    prose-blockquote:border-outline/30 prose-blockquote:bg-surface-container-low
  `,
};

type MarkdownTableProps = ComponentPropsWithoutRef<'table'> & {
  node?: unknown;
};

type MarkdownCodeBlockProps = ComponentPropsWithoutRef<'pre'> & {
  node?: unknown;
};

function getTextContent(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(getTextContent).join('');
  if (isValidElement<{ children?: ReactNode }>(children)) return getTextContent(children.props.children);

  return '';
}

function getLanguageLabel(className?: string) {
  const language = className?.match(/language-([\w-]+)/)?.[1]?.toLowerCase();

  if (language === 'javascript' || language === 'js') return 'JavaScript';
  if (language === 'typescript' || language === 'ts') return 'TypeScript';
  if (language === 'json') return 'JSON';
  if (language === 'html') return 'HTML';
  if (language === 'css') return 'CSS';
  if (language === 'bash' || language === 'shell' || language === 'sh') return 'Shell';

  return language ?? 'Kód';
}

function MarkdownCodeBlock({ children, node, ...props }: MarkdownCodeBlockProps) {
  void node;

  const [copied, setCopied] = useState(false);
  const codeElement = Children.toArray(children).find(isValidElement) as
    | ReactElement<{ className?: string; children?: ReactNode }>
    | undefined;
  const code = getTextContent(codeElement?.props.children ?? children);
  const language = getLanguageLabel(codeElement?.props.className);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be unavailable on non-secure origins.
    }
  }

  return (
    <pre {...props} className="markdown-code-block">
      <div className="markdown-code-block__header">
        <span className="markdown-code-block__language">{language}</span>
        <button
          type="button"
          className="markdown-code-block__copy"
          onClick={copyCode}
          aria-label={copied ? 'Kód zkopírován' : 'Kopírovat kód'}
        >
          {copied ? 'Zkopírováno' : 'Kopírovat'}
        </button>
      </div>
      {children}
    </pre>
  );
}

function MarkdownTable({ children, node, ...props }: MarkdownTableProps) {
  void node;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ left: false, right: false });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const updateScrollState = () => {
      const maxScrollLeft = wrapper.scrollWidth - wrapper.clientWidth;

      setScrollState({
        left: wrapper.scrollLeft > 1,
        right: wrapper.scrollLeft < maxScrollLeft - 1,
      });
    };

    updateScrollState();

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(wrapper);
    wrapper.addEventListener('scroll', updateScrollState, { passive: true });

    const table = wrapper.querySelector('table');
    if (table) resizeObserver.observe(table);

    return () => {
      resizeObserver.disconnect();
      wrapper.removeEventListener('scroll', updateScrollState);
    };
  }, [children]);

  const canScroll = scrollState.left || scrollState.right;
  const scrollClasses = [
    'markdown-table-scroll',
    scrollState.left ? 'can-scroll-left' : '',
    scrollState.right ? 'can-scroll-right' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={wrapperRef}
      className={scrollClasses}
      role={canScroll ? 'region' : undefined}
      aria-label={canScroll ? 'Scrollable table' : undefined}
      tabIndex={canScroll ? 0 : undefined}
    >
      <table {...props}>{children}</table>
    </div>
  );
}

const markdownComponents: Components = {
  pre: MarkdownCodeBlock,
  table: MarkdownTable,
};

export default function MarkdownRenderer({ content, theme = 'blue' }: MarkdownRendererProps) {
  return (
    <article className={`prose prose-gray max-w-none text-[1.05rem] md:text-[1.125rem] leading-[1.8]
      prose-headings:text-on-surface prose-headings:font-headline prose-headings:font-extrabold
      prose-h1:text-4xl prose-h1:mb-8 prose-h1:tracking-tight
      prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-5 prose-h2:pt-6 prose-h2:border-t prose-h2:border-outline-variant prose-h2:tracking-tight
      prose-h3:text-2xl prose-h3:mt-11 prose-h3:mb-3 prose-h3:tracking-tight
      prose-p:text-on-surface/85 prose-p:leading-[1.85] prose-p:my-5 prose-p:font-body
      prose-a:underline prose-a:underline-offset-4 prose-a:font-medium
      prose-strong:text-on-surface prose-strong:font-semibold
      prose-code:bg-transparent prose-code:border prose-code:border-outline-variant prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.9em] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
      prose-blockquote:border-l prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:text-on-surface/70 prose-blockquote:not-italic prose-blockquote:font-body
      prose-ul:text-on-surface/80 prose-ol:text-on-surface/80
      prose-li:marker:text-outline prose-li:my-2
      prose-table:border-collapse
      prose-th:bg-surface-container-low prose-th:px-5 prose-th:py-3 prose-th:text-left prose-th:font-bold prose-th:text-on-surface prose-th:font-headline prose-th:text-sm prose-th:border prose-th:border-outline-variant
      prose-td:px-5 prose-td:py-3 prose-td:border prose-td:border-outline-variant
      prose-hr:border-outline-variant prose-hr:my-12
      ${themeClasses[theme]}
    `}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}

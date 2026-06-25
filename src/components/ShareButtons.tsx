'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  content: string;
  filename: string;
  slug: string;
}

export default function ShareButtons({ content, filename, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateContent = (text: string, maxLength: number = 12000) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '\n\n[Obsah zkrácen kvůli limitům délky...]';
  };

  const openInChatGPT = () => {
    const truncated = truncateContent(content);
    const prompt = `Here is a markdown document:\n\n${truncated}`;
    window.open(`https://chat.openai.com/?q=${encodeURIComponent(prompt)}`, '_blank');
  };

  const openInClaude = () => {
    const truncated = truncateContent(content);
    window.open(`https://claude.ai/new?q=${encodeURIComponent(truncated)}`, '_blank');
  };

  const openInGemini = () => {
    const truncated = truncateContent(content);
    window.open(`https://gemini.google.com/app?q=${encodeURIComponent(truncated)}`, '_blank');
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Download */}
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-background hover:bg-surface-container-low border border-outline-variant hover:border-on-surface text-on-surface text-sm font-medium transition-colors"
      >
        <span className="text-on-surface-variant">↓</span>
        Stáhnout
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-background hover:bg-surface-container-low border border-outline-variant hover:border-on-surface text-on-surface text-sm font-medium transition-colors"
      >
        <span className="text-on-surface-variant">{copied ? '✓' : '↗'}</span>
        {copied ? 'Zkopírováno!' : 'Kopírovat odkaz'}
      </button>

      {/* Spacer */}
      <div className="hidden md:block w-px bg-outline-variant mx-1 self-stretch" />

      {/* AI Buttons - primary gradient */}
      <button
        onClick={openInChatGPT}
        className="inline-flex items-center px-4 py-2.5 bg-primary hover:bg-background text-on-primary hover:text-primary border border-primary text-sm font-medium transition-colors"
      >
        ChatGPT
      </button>

      <button
        onClick={openInClaude}
        className="inline-flex items-center px-4 py-2.5 bg-primary hover:bg-background text-on-primary hover:text-primary border border-primary text-sm font-medium transition-colors"
      >
        Claude
      </button>

      <button
        onClick={openInGemini}
        className="inline-flex items-center px-4 py-2.5 bg-primary hover:bg-background text-on-primary hover:text-primary border border-primary text-sm font-medium transition-colors"
      >
        Gemini
      </button>
    </div>
  );
}

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
    const url = `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`;
    window.open(url, '_blank');
  };

  const openInClaude = () => {
    const truncated = truncateContent(content);
    const url = `https://claude.ai/new?q=${encodeURIComponent(truncated)}`;
    window.open(url, '_blank');
  };

  const openInGemini = () => {
    const truncated = truncateContent(content);
    const url = `https://gemini.google.com/app?q=${encodeURIComponent(truncated)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm font-medium transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Stáhnout
      </button>

      {/* Copy Link Button */}
      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm font-medium transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
        {copied ? 'Zkopírováno!' : 'Kopírovat odkaz'}
      </button>

      {/* Divider */}
      <div className="hidden sm:block w-px bg-gray-200 mx-1"></div>

      {/* AI Buttons */}
      <button
        onClick={openInChatGPT}
        className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 rounded-lg text-white text-sm font-medium transition-colors"
      >
        <span className="text-sm">🤖</span>
        ChatGPT
      </button>

      <button
        onClick={openInClaude}
        className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 rounded-lg text-white text-sm font-medium transition-colors"
      >
        <span className="text-sm">🧠</span>
        Claude
      </button>

      <button
        onClick={openInGemini}
        className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 rounded-lg text-white text-sm font-medium transition-colors"
      >
        <span className="text-sm">✨</span>
        Gemini
      </button>
    </div>
  );
}

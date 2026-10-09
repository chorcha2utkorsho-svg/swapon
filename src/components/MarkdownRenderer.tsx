import React, { useMemo } from 'react';
import { marked } from 'marked';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  // Parse markdown into HTML safely
  const html = useMemo(() => {
    try {
      marked.setOptions({
        gfm: true,
        breaks: true,
      });
      return marked.parse(content) as string;
    } catch (e) {
      console.error('Markdown parse error:', e);
      return content;
    }
  }, [content]);

  // Code block copy helper
  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={`prose-chat text-sm leading-relaxed ${className}`}>
      {/* We render through dangerouslySetInnerHTML with post-processing or clean styles */}
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        className="space-y-2 [&_pre]:bg-slate-900/90 [&_pre]:p-3.5 [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-slate-800 [&_pre]:overflow-x-auto [&_code]:text-emerald-400 [&_code]:font-mono [&_p]:text-inherit [&_ul]:list-disc [&_ol]:list-decimal [&_a]:text-sky-400 [&_a]:underline hover:[&_a]:text-sky-300 [&_blockquote]:border-l-indigo-500 [&_strong]:font-semibold [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-semibold"
      />
    </div>
  );
};

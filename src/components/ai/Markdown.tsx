import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

/**
 * Normalise AI math into KaTeX-friendly delimiters.
 * Models often emit: [ \text{...} = \frac{...}{...} ], \( ... \), \[ ... \]
 */
function prepareMathContent(raw: string): string {
  let text = raw;

  // Display math: \[ ... \]
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_m, inner) => `\n$$\n${inner.trim()}\n$$\n`);
  // Inline math: \( ... \)
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_m, inner) => `$${inner.trim()}$`);

  // Bracket-wrapped LaTeX blocks: [ \text{...} = \frac{a}{b} ]
  text = text.replace(
    /\[\s*((?:\\(?:text|frac|times|div|cdot|left|right|sum|prod|sqrt|overline|underline|mathrm|mathbf|mathit)\{|[A-Za-z0-9_^=+\-*/().,\s\\{}])+)\]/g,
    (_m, inner: string) => {
      const cleaned = inner.trim();
      if (!/\\(text|frac|times|div|cdot|left|right|sum|prod|sqrt)/.test(cleaned)) {
        return `[${cleaned}]`;
      }
      return `\n$$\n${cleaned}\n$$\n`;
    }
  );

  // "Formula:" label often precedes a math block — keep it tidy
  text = text.replace(/Formula:\s*(?=\$\$)/gi, '**Formula**\n\n');

  return text;
}

/**
 * Renders AI coach responses as rich markdown — headings, lists, bold, code,
 * GFM tables, and KaTeX math formulas.
 */
export const Markdown: React.FC<{ content: string; className?: string }> = ({
  content,
  className = '',
}) => {
  const prepared = useMemo(() => prepareMathContent(content), [content]);

  return (
    <div className={`md-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1.5 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-bold mt-3 mb-1.5 first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold mt-2.5 mb-1 first:mt-0">{children}</h3>,
          p: ({ children }) => <p className="my-1.5 first:mt-0 last:mb-0 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="my-2 space-y-1 list-disc pl-5 marker:text-emerald-400">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 space-y-1 list-decimal pl-5 marker:text-emerald-400">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed pl-0.5">{children}</li>,
          strong: ({ children }) => <strong className="font-bold text-mist-100">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200">
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-emerald-400/40 pl-3 my-2 text-mist-300 italic">{children}</blockquote>
          ),
          hr: () => <hr className="my-3 border-white/10" />,
          code: ({ className: cls, children }) => {
            const isBlock = (cls || '').includes('language-') || String(children).includes('\n');
            if (isBlock) {
              return (
                <pre className="my-2 overflow-x-auto custom-scrollbar rounded-xl bg-black/30 border border-white/10 p-3 text-xs">
                  <code>{children}</code>
                </pre>
              );
            }
            return <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-[0.85em] font-mono">{children}</code>;
          },
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto custom-scrollbar rounded-xl border border-white/10">
              <table className="w-full text-left border-collapse text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/6">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-white/6">{children}</tbody>,
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-3 py-2 font-bold text-mist-100 whitespace-nowrap border-r border-white/8 last:border-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-mist-300 border-r border-white/6 last:border-0 align-top">{children}</td>
          ),
        }}
      >
        {prepared}
      </ReactMarkdown>
    </div>
  );
};

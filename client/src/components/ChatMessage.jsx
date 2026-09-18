import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, User, Copy, Check, Terminal } from 'lucide-react';

function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 sm:my-3 rounded-lg overflow-hidden border border-gemini-border bg-[#18191a] shadow-md">
      <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 bg-[#212224] text-[11px] sm:text-xs text-gemini-muted font-mono border-b border-gemini-border">
        <span className="flex items-center gap-1.5 truncate pr-2">
          <Terminal size={12} className="text-gemini-accent flex-shrink-0" />
          <span className="truncate">{language || 'code'}</span>
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors flex-shrink-0"
          title="Copy Code"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm font-mono text-[#dcdfe4] leading-relaxed">
        <pre className="!bg-transparent !p-0 !m-0">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
}

export default function ChatMessage({ message, isLast, isGenerating }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`py-3.5 sm:py-5 px-3 sm:px-4 md:px-6 transition-colors ${
        isUser ? 'bg-transparent' : 'bg-gemini-surface/30'
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-2.5 sm:gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm text-xs">
              <User size={15} />
            </div>
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full gemini-gradient-bg flex items-center justify-center text-white shadow-md">
              <Sparkles size={15} className={isLast && isGenerating ? 'animate-spin' : ''} />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gemini-muted">
              {isUser ? 'You' : 'Gemini'}
            </span>
            {message.model && !isUser && (
              <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-gemini-surface text-gemini-muted border border-gemini-border">
                {message.model}
              </span>
            )}
          </div>

          <div className="prose-gemini break-words text-[14px] sm:text-[15px]">
            {message.content ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline ? (
                      <CodeBlock
                        language={match ? match[1] : ''}
                        value={String(children).replace(/\n$/, '')}
                      />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              <div className="flex items-center gap-1.5 text-gemini-muted text-sm py-2">
                <span className="w-2 h-2 rounded-full bg-gemini-accent animate-ping" />
                <span>Thinking...</span>
              </div>
            )}
          </div>

          {/* Action Toolbar for AI message */}
          {!isUser && message.content && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gemini-muted">
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gemini-surface hover:text-white transition-colors"
                title="Copy entire response"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, User, Copy, Check, Terminal, FileText, X, ExternalLink } from 'lucide-react';

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
  const [previewImage, setPreviewImage] = useState(null);

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

          {/* Attached Media / Documents */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2.5">
              {message.attachments.map((file, idx) => {
                const isImage =
                  file.mimeType?.startsWith('image/') ||
                  (file.data && file.data.startsWith('data:image/'));

                if (isImage) {
                  return (
                    <div key={idx} className="relative group">
                      <img
                        src={file.data}
                        alt={file.name || 'Attached image'}
                        onClick={() => setPreviewImage(file)}
                        className="max-h-56 sm:max-h-72 max-w-full rounded-xl border border-gemini-border object-cover cursor-pointer shadow-md hover:opacity-95 transition-all"
                      />
                      <div
                        onClick={() => setPreviewImage(file)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center cursor-pointer transition-opacity text-white text-xs gap-1"
                      >
                        <ExternalLink size={14} />
                        <span>View</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2 px-3 rounded-xl bg-gemini-surface border border-gemini-border text-xs text-gemini-text shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center flex-shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate max-w-[200px] text-white">
                        {file.name || 'Document'}
                      </p>
                      {file.size && (
                        <p className="text-[10px] text-gemini-muted">
                          {(file.size / 1024).toFixed(0)} KB
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Text Content */}
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
            ) : isUser ? null : (
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

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2 text-white text-sm">
              <span className="truncate pr-4">{previewImage.name || 'Image Preview'}</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <img
              src={previewImage.data}
              alt={previewImage.name}
              className="max-h-[82vh] max-w-full rounded-lg border border-gemini-border object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}


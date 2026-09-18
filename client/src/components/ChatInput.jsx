import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { ArrowUp, Sparkles, Key, AlertCircle } from 'lucide-react';

export default function ChatInput({ onOpenSettings }) {
  const [input, setInput] = useState('');
  const { sendMessage, isGenerating, customApiKey, serverStatus, selectedModel } = useChat();
  const textareaRef = useRef(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isGenerating) return;
    sendMessage(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasApiKey = Boolean(customApiKey || serverStatus.hasServerApiKey);

  return (
    <div className="p-2.5 sm:p-4 pb-3 sm:pb-4 max-w-3xl mx-auto w-full flex-shrink-0">
      {/* API Key Warning Banner if none detected */}
      {!hasApiKey && serverStatus.checked && (
        <div className="mb-2 p-2 sm:p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-[11px] sm:text-xs text-amber-300">
          <div className="flex items-center gap-1.5 truncate pr-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span className="truncate">No Gemini API key detected.</span>
          </div>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 font-semibold underline hover:text-amber-200 flex-shrink-0"
          >
            <Key size={12} />
            Add Key
          </button>
        </div>
      )}

      {/* Main Input Box */}
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col bg-gemini-surface rounded-2xl border border-gemini-border focus-within:border-gemini-accent/70 transition-all shadow-lg overflow-hidden"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Gemini anything..."
          rows={1}
          disabled={isGenerating}
          className="w-full py-3 sm:py-3.5 pl-3.5 sm:pl-4 pr-11 sm:pr-12 bg-transparent text-gemini-text placeholder-gemini-muted resize-none focus:outline-none text-[14px] sm:text-[15px] leading-relaxed max-h-[160px] sm:max-h-[180px]"
        />

        <div className="flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 border-t border-gemini-border/40 text-xs text-gemini-muted">
          <div className="flex items-center gap-1.5 truncate pr-2">
            <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-[#282a2c] text-gemini-muted text-[10px] sm:text-[11px] font-mono truncate max-w-[160px] sm:max-w-none">
              <Sparkles size={11} className="text-gemini-accent flex-shrink-0" />
              <span className="truncate">{selectedModel}</span>
            </span>
            <span className="hidden md:inline text-[11px]">
              Use <kbd className="px-1 py-0.5 bg-[#282a2c] rounded text-[10px]">Shift+Enter</kbd> for newline
            </span>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
              input.trim() && !isGenerating
                ? 'gemini-gradient-bg text-white shadow-md hover:opacity-95'
                : 'bg-gemini-border/60 text-gemini-muted cursor-not-allowed'
            }`}
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </form>

      {/* Disclaimer */}
      <p className="text-center text-[10px] sm:text-[11px] text-gemini-muted mt-1.5 sm:mt-2">
        Gemini clone powered by Google Gemini API. Double-check important facts.
      </p>
    </div>
  );
}

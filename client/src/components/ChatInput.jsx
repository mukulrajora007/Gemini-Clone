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
    <div className="p-4 max-w-3xl mx-auto w-full">
      {/* API Key Warning Banner if none detected */}
      {!hasApiKey && serverStatus.checked && (
        <div className="mb-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>No Gemini API key detected on client or server.</span>
          </div>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 font-semibold underline hover:text-amber-200"
          >
            <Key size={13} />
            Configure Key
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
          className="w-full py-3.5 pl-4 pr-12 bg-transparent text-gemini-text placeholder-gemini-muted resize-none focus:outline-none text-[15px] leading-relaxed max-h-[180px]"
        />

        <div className="flex items-center justify-between px-3 py-2 border-t border-gemini-border/40 text-xs text-gemini-muted">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#282a2c] text-gemini-muted text-[11px] font-mono">
              <Sparkles size={12} className="text-gemini-accent" />
              {selectedModel}
            </span>
            <span className="hidden sm:inline text-[11px]">
              Use <kbd className="px-1 py-0.5 bg-[#282a2c] rounded text-[10px]">Shift+Enter</kbd> for newline
            </span>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
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
      <p className="text-center text-[11px] text-gemini-muted mt-2">
        Gemini clone powered by Google Gemini API. Double-check important facts and code outputs.
      </p>
    </div>
  );
}

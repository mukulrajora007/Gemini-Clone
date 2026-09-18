import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import {
  ArrowUp,
  Sparkles,
  Key,
  AlertCircle,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
} from 'lucide-react';

export default function ChatInput({ onOpenSettings }) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [fileError, setFileError] = useState('');
  const { sendMessage, isGenerating, customApiKey, serverStatus, selectedModel } = useChat();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  // Handle file conversion to base64 data URL
  const processFiles = (files) => {
    setFileError('');
    const newAttachments = [];

    Array.from(files).forEach((file) => {
      // 5MB limit check per file
      if (file.size > 5 * 1024 * 1024) {
        setFileError(`"${file.name}" exceeds 5MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            mimeType: file.type || 'image/jpeg',
            data: event.target.result,
            size: file.size,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  // Support Ctrl+V clipboard image paste
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const filesToProcess = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) filesToProcess.push(file);
      }
    }
    if (filesToProcess.length > 0) {
      processFiles(filesToProcess);
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const hasText = input.trim() !== '';
    const hasMedia = attachments.length > 0;
    if ((!hasText && !hasMedia) || isGenerating) return;

    sendMessage(input, attachments);
    setInput('');
    setAttachments([]);
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

      {/* File upload error message */}
      {fileError && (
        <div className="mb-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 flex items-center justify-between">
          <span>{fileError}</span>
          <button onClick={() => setFileError('')} className="text-rose-400 hover:text-rose-200">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Main Input Container */}
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col bg-gemini-surface rounded-2xl border border-gemini-border focus-within:border-gemini-accent/70 transition-all shadow-lg overflow-hidden"
      >
        {/* Attachment Preview Chips */}
        {attachments.length > 0 && (
          <div className="p-2.5 pb-0 flex flex-wrap gap-2 border-b border-gemini-border/30 bg-[#191a1b]">
            {attachments.map((file, idx) => {
              const isImage = file.mimeType.startsWith('image/');
              return (
                <div
                  key={idx}
                  className="relative group flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-[#232426] border border-gemini-border text-xs text-gemini-text shadow-sm"
                >
                  {isImage ? (
                    <img
                      src={file.data}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded-lg border border-gemini-border/50"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                  )}
                  <div className="max-w-[130px] sm:max-w-[180px] truncate text-[11px]">
                    <p className="truncate font-medium text-white">{file.name}</p>
                    <p className="text-[10px] text-gemini-muted">
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="ml-1 p-1 rounded-full bg-black/40 hover:bg-rose-500/80 text-white transition-colors"
                    title="Remove file"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={attachments.length > 0 ? "Ask a question about this media..." : "Ask Gemini anything or paste/attach media..."}
          rows={1}
          disabled={isGenerating}
          className="w-full py-3 sm:py-3.5 pl-3.5 sm:pl-4 pr-11 sm:pr-12 bg-transparent text-gemini-text placeholder-gemini-muted resize-none focus:outline-none text-[14px] sm:text-[15px] leading-relaxed max-h-[160px] sm:max-h-[180px]"
        />

        {/* Action Toolbar */}
        <div className="flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 border-t border-gemini-border/40 text-xs text-gemini-muted">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate pr-2">
            {/* Media Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-gemini-surfaceHover hover:text-white transition-colors text-gemini-muted"
              title="Upload images or documents (PNG, JPG, WEBP, PDF)"
            >
              <Paperclip size={16} className="text-gemini-accent" />
              <span className="hidden sm:inline text-[11px] font-medium">Attach</span>
            </button>

            {/* Model Badge */}
            <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-[#282a2c] text-gemini-muted text-[10px] sm:text-[11px] font-mono truncate max-w-[140px] sm:max-w-none">
              <Sparkles size={11} className="text-gemini-accent flex-shrink-0" />
              <span className="truncate">{selectedModel}</span>
            </span>

            <span className="hidden md:inline text-[11px]">
              Use <kbd className="px-1 py-0.5 bg-[#282a2c] rounded text-[10px]">Shift+Enter</kbd> for newline
            </span>
          </div>

          <button
            type="submit"
            disabled={(!input.trim() && attachments.length === 0) || isGenerating}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
              (input.trim() || attachments.length > 0) && !isGenerating
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
        Gemini clone powered by Google Gemini API. Multimodal image & document analysis supported.
      </p>
    </div>
  );
}

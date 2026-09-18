import React, { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import ChatMessage from './ChatMessage';
import { Sparkles, Code, Lightbulb, Compass, ArrowDown, Square } from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: Code,
    title: 'Write code',
    desc: 'Build a full-stack REST API with Express & Node',
    prompt: 'Write a complete Express.js REST API with input validation and error handling.',
  },
  {
    icon: Compass,
    title: 'Explain a concept',
    desc: 'Deep dive into async JavaScript event loops',
    prompt: 'Explain the JavaScript event loop, microtasks, and macrotasks with visual step-by-step examples.',
  },
  {
    icon: Lightbulb,
    title: 'Brainstorm ideas',
    desc: 'Innovative SaaS features for developer tools',
    prompt: 'Give me 5 innovative SaaS project ideas leveraging modern AI and real-time collaboration.',
  },
  {
    icon: Sparkles,
    title: 'Creative writing',
    desc: 'Draft an engaging product launch announcement',
    prompt: 'Draft an exciting, modern launch post for our new AI-powered developer platform.',
  },
];

export default function ChatArea() {
  const { messages, isGenerating, stopGenerating, sendMessage, activeAssistant } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isGenerating]);

  const userName = user?.email?.split('@')[0] || 'Friend';

  return (
    <div className="flex-1 overflow-y-auto relative flex flex-col overscroll-contain">
      {messages.length === 0 ? (
        // Gemini-style Welcome View
        <div className="flex-1 flex flex-col items-center justify-center p-3.5 sm:p-6 max-w-3xl mx-auto w-full text-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gemini-surface/80 border border-gemini-border text-[11px] sm:text-xs text-gemini-muted mb-3 sm:mb-4">
            <span className="w-2 h-2 rounded-full bg-gemini-accent animate-pulse" />
            Active Persona: <span className="text-white font-medium">{activeAssistant.name}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-1 sm:mb-2">
            <span className="gemini-gradient-text">Hello, {userName}</span>
          </h1>
          <h2 className="text-lg sm:text-2xl md:text-3xl font-medium text-gemini-muted mb-5 sm:mb-8">
            How can I help you today?
          </h2>

          {/* Quick Prompt Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 w-full text-left">
            {SUGGESTIONS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => sendMessage(item.prompt)}
                  className="p-3 sm:p-4 rounded-xl bg-gemini-surface/60 hover:bg-gemini-surface border border-gemini-border/70 hover:border-gemini-accent/60 transition-all group flex flex-col justify-between min-h-[4.75rem] sm:h-28 active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-xs sm:text-sm text-gemini-text group-hover:text-white">
                      {item.title}
                    </span>
                    <Icon
                      size={16}
                      className="text-gemini-muted group-hover:text-gemini-accent transition-colors flex-shrink-0"
                    />
                  </div>
                  <p className="text-[11px] sm:text-xs text-gemini-muted line-clamp-2 mt-1">
                    {item.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        // Message History Thread
        <div className="flex-1 pb-4">
          {messages.map((msg, index) => (
            <ChatMessage
              key={msg.id || index}
              message={msg}
              isLast={index === messages.length - 1}
              isGenerating={isGenerating}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Floating Stop Generation Button */}
      {isGenerating && (
        <div className="sticky bottom-2 flex justify-center z-10">
          <button
            onClick={stopGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gemini-surface border border-gemini-border hover:bg-gemini-surfaceHover text-xs font-medium text-white shadow-xl backdrop-blur-md transition-all animate-bounce"
          >
            <Square size={13} className="text-rose-400 fill-rose-400" />
            Stop Generating
          </button>
        </div>
      )}
    </div>
  );
}

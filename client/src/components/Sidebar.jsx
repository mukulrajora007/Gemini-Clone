import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  MessageSquare,
  Trash2,
  Settings,
  Sparkles,
  Bot,
  User,
  LogOut,
  LogIn,
  Search,
  ChevronRight,
  Database,
  X,
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenAuth,
  onOpenAssistantModal,
}) {
  const {
    conversations,
    currentConversationId,
    switchConversation,
    createNewConversation,
    deleteConversation,
    assistants,
    activeAssistant,
    selectAssistant,
  } = useChat();

  const { user, signOut, isConfigured } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter((c) =>
    (c.title || 'New Chat').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 z-30 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 max-w-[85vw] bg-[#171819] border-r border-gemini-border flex flex-col transition-transform duration-200 ease-in-out shadow-2xl md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header: Logo + New Chat */}
        <div className="p-3 sm:p-3.5 flex flex-col gap-2.5 sm:gap-3 border-b border-gemini-border/50">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gemini-gradient-bg flex items-center justify-center text-white shadow-sm">
                <Sparkles size={16} />
              </div>
              <span className="font-semibold text-base tracking-tight text-white">
                Gemini <span className="text-gemini-accent">AI</span>
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              {isConfigured && (
                <span
                  title="Supabase Connected"
                  className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"
                >
                  <Database size={10} />
                  Cloud
                </span>
              )}
              <button
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg hover:bg-gemini-surface text-gemini-muted hover:text-white transition-colors"
                aria-label="Close Sidebar"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              createNewConversation();
              if (window.innerWidth < 768) onClose();
            }}
            className="flex items-center gap-2.5 w-full py-2.5 px-3.5 rounded-xl bg-gemini-surface hover:bg-gemini-surfaceHover border border-gemini-border/80 text-sm font-medium text-gemini-text hover:text-white transition-all shadow-sm"
          >
            <Plus size={16} className="text-gemini-accent" />
            <span>New Chat</span>
          </button>
        </div>

        {/* AI Personas / Make Your Own AI Section */}
        <div className="px-3 pt-3 pb-2 border-b border-gemini-border/50">
          <div className="flex items-center justify-between px-1 mb-2 text-xs font-semibold text-gemini-muted uppercase tracking-wider">
            <span>AI Personas</span>
            <button
              onClick={onOpenAssistantModal}
              title="Create Custom AI Assistant"
              className="text-gemini-accent hover:text-blue-300 transition-colors flex items-center gap-1 text-[11px] font-normal"
            >
              <Plus size={12} />
              <span>New AI</span>
            </button>
          </div>

          <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
            {assistants.map((assistant) => {
              const isActive = activeAssistant.id === assistant.id;
              return (
                <button
                  key={assistant.id}
                  onClick={() => selectAssistant(assistant)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                    isActive
                      ? 'bg-gemini-accent/20 text-white font-medium border border-gemini-accent/40'
                      : 'text-gemini-muted hover:bg-gemini-surface hover:text-gemini-text'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Bot size={13} className={isActive ? 'text-gemini-accent' : ''} />
                    <span className="truncate">{assistant.name}</span>
                  </div>
                  {isActive && <ChevronRight size={12} className="text-gemini-accent" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversations History */}
        <div className="flex-1 flex flex-col min-h-0 px-3 py-2">
          {/* Search */}
          <div className="relative mb-2">
            <Search size={14} className="absolute left-2.5 top-2.5 text-gemini-muted" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gemini-surface text-xs py-1.5 pl-8 pr-2.5 rounded-lg border border-gemini-border focus:outline-none focus:border-gemini-accent text-gemini-text placeholder-gemini-muted"
            />
          </div>

          <div className="flex items-center justify-between px-1 mb-1.5 text-xs font-semibold text-gemini-muted uppercase tracking-wider">
            <span>Recent Chats</span>
            <span className="text-[10px] text-gemini-muted">{conversations.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-gemini-muted">
                {searchTerm ? 'No matching chats found.' : 'No conversations yet.'}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = currentConversationId === conv.id;
                return (
                  <div
                    key={conv.id}
                    className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-gemini-surface text-white font-medium border border-gemini-border'
                        : 'text-gemini-muted hover:bg-gemini-surface/60 hover:text-gemini-text'
                    }`}
                    onClick={() => {
                      switchConversation(conv.id);
                      if (window.innerWidth < 768) onClose();
                    }}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <MessageSquare size={13} className={isActive ? 'text-gemini-accent' : ''} />
                      <span className="truncate">{conv.title || 'New Chat'}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-1 rounded transition-opacity"
                      title="Delete chat"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer: User & Settings */}
        <div className="p-3 border-t border-gemini-border bg-[#151617] flex flex-col gap-2">
          {/* User profile row */}
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs">
                <User size={14} />
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-white truncate">
                  {user ? user.email : 'Guest Mode'}
                </p>
                <p className="text-[10px] text-gemini-muted">
                  {user ? 'Supabase Account' : 'Local Storage'}
                </p>
              </div>
            </div>

            {user ? (
              <button
                onClick={signOut}
                title="Sign Out"
                className="p-1.5 rounded-lg hover:bg-gemini-surface text-gemini-muted hover:text-rose-400 transition-colors"
              >
                <LogOut size={15} />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                title="Sign In with Supabase"
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-gemini-accent/20 hover:bg-gemini-accent/30 text-blue-300 font-medium transition-colors"
              >
                <LogIn size={13} />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg hover:bg-gemini-surface text-xs text-gemini-muted hover:text-white transition-colors"
          >
            <Settings size={14} />
            <span>Settings & API Keys</span>
          </button>
        </div>
      </aside>
    </>
  );
}

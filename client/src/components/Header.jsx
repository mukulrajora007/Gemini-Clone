import React from 'react';
import { useChat, DEFAULT_MODELS } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  Sparkles,
  Key,
  ShieldCheck,
  AlertTriangle,
  Settings,
  Database,
  User,
} from 'lucide-react';

export default function Header({
  onToggleSidebar,
  onOpenSettings,
  onOpenAuth,
}) {
  const {
    selectedModel,
    changeModel,
    activeAssistant,
    customApiKey,
    serverStatus,
  } = useChat();

  const { user, isConfigured } = useAuth();

  const hasApiKey = Boolean(customApiKey || serverStatus.hasServerApiKey);

  return (
    <header className="h-14 border-b border-gemini-border bg-[#171819]/80 backdrop-blur-md px-2.5 sm:px-4 flex items-center justify-between z-20 flex-shrink-0">
      {/* Left side: Hamburger + Persona info */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gemini-surface text-gemini-muted hover:text-white transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="font-semibold text-xs sm:text-sm text-white hidden md:inline truncate max-w-[120px]">
            {activeAssistant.name}
          </span>
          <span className="text-xs text-gemini-muted hidden md:inline">·</span>

          {/* Model Selector Dropdown */}
          <select
            value={selectedModel}
            onChange={(e) => changeModel(e.target.value)}
            className="bg-gemini-surface hover:bg-gemini-surfaceHover border border-gemini-border text-[11px] sm:text-xs text-gemini-text rounded-lg px-2 sm:px-2.5 py-1 focus:outline-none focus:border-gemini-accent cursor-pointer transition-colors max-w-[135px] sm:max-w-[220px] md:max-w-none truncate"
          >
            {DEFAULT_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} {model.tag ? `(${model.tag})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right side: Key status, Supabase badge, Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        {/* Gemini API Key Status Badge */}
        <button
          onClick={onOpenSettings}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-colors border ${
            hasApiKey
              ? 'bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20 animate-pulse'
          }`}
          title={
            customApiKey
              ? 'Using custom Gemini API Key'
              : serverStatus.hasServerApiKey
              ? 'Using server .env Gemini API Key'
              : 'Click to enter Gemini API Key'
          }
        >
          <Key size={12} />
          <span className="hidden sm:inline">
            {customApiKey
              ? 'Custom Key'
              : serverStatus.hasServerApiKey
              ? 'Server Key'
              : 'Add Key'}
          </span>
        </button>

        {/* Supabase Status Badge */}
        <button
          onClick={user ? onOpenSettings : onOpenAuth}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-colors border ${
            user && isConfigured
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-gemini-surface text-gemini-muted border-gemini-border hover:text-white'
          }`}
          title={user ? `Signed in as ${user.email}` : 'Sign in with Supabase'}
        >
          <Database size={12} />
          <span className="hidden sm:inline">
            {user ? 'Cloud Sync' : 'Guest'}
          </span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg hover:bg-gemini-surface text-gemini-muted hover:text-white transition-colors"
          title="Open Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}

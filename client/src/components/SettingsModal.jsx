import React, { useState, useEffect } from 'react';
import { useChat, DEFAULT_MODELS } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
} from '../supabaseClient';
import {
  X,
  Key,
  Database,
  Sliders,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const {
    customApiKey,
    saveCustomApiKey,
    selectedModel,
    changeModel,
    serverStatus,
    checkServerHealth,
  } = useChat();

  const { isConfigured, recheckAuth } = useAuth();

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Supabase states
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [showSupabaseKey, setShowSupabaseKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(customApiKey || '');
      const { url, key } = getSupabaseCredentials();
      setSupabaseUrl(url || '');
      setSupabaseKey(key || '');
      setSavedSuccess(false);
    }
  }, [isOpen, customApiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Save Gemini API Key
    saveCustomApiKey(apiKeyInput);

    // Save Supabase credentials
    saveSupabaseCredentials(supabaseUrl, supabaseKey);
    recheckAuth();
    checkServerHealth();

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1e1f20] border border-gemini-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-gemini-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-gemini-accent" />
            <h3 className="font-semibold text-base text-white">App & API Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gemini-surface text-gemini-muted hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-sm">
          {/* Section 1: Google Gemini API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-medium text-white flex items-center gap-1.5">
                <Key size={15} className="text-gemini-accent" />
                <span>Google Gemini API Key</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-gemini-accent hover:underline flex items-center gap-1"
              >
                <span>Get Free Key</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <p className="text-xs text-gemini-muted leading-relaxed">
              Your API key is sent directly to the backend for streaming generation. It is securely stored in your browser session and never shared.
            </p>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full bg-[#171819] border border-gemini-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gemini-muted focus:outline-none focus:border-gemini-accent font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-gemini-muted hover:text-white transition-colors"
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div className="text-[11px] text-gemini-muted flex items-center gap-2 pt-1">
              <span>Server Fallback Key:</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  serverStatus.hasServerApiKey
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {serverStatus.hasServerApiKey ? 'Configured in .env' : 'Not configured on server'}
              </span>
            </div>
          </div>

          {/* Section 2: Supabase Auth & DB Config */}
          <div className="space-y-3 pt-4 border-t border-gemini-border/60">
            <div className="flex items-center justify-between">
              <label className="font-medium text-white flex items-center gap-1.5">
                <Database size={15} className="text-emerald-400" />
                <span>Supabase Configuration</span>
              </label>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Supabase Dashboard</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <p className="text-xs text-gemini-muted leading-relaxed">
              Connect your Supabase project for persistent cloud conversation history and user authentication. If left blank, the app uses seamless Local/Guest storage.
            </p>

            <div className="space-y-2">
              <div>
                <label className="text-xs text-gemini-muted block mb-1">Project URL</label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full bg-[#171819] border border-gemini-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gemini-muted focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-gemini-muted block mb-1">Anon / Public API Key</label>
                <div className="relative">
                  <input
                    type={showSupabaseKey ? 'text' : 'password'}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full bg-[#171819] border border-gemini-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gemini-muted focus:outline-none focus:border-emerald-500 font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSupabaseKey(!showSupabaseKey)}
                    className="absolute right-3 top-2.5 text-gemini-muted hover:text-white transition-colors"
                  >
                    {showSupabaseKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Default AI Model */}
          <div className="space-y-2 pt-4 border-t border-gemini-border/60">
            <label className="font-medium text-white block">Default Model</label>
            <div className="grid grid-cols-1 gap-2">
              {DEFAULT_MODELS.map((model) => (
                <label
                  key={model.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedModel === model.id
                      ? 'bg-gemini-surface border-gemini-accent text-white'
                      : 'bg-[#171819] border-gemini-border text-gemini-muted hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="model"
                      value={model.id}
                      checked={selectedModel === model.id}
                      onChange={() => changeModel(model.id)}
                      className="accent-gemini-accent"
                    />
                    <span className="font-medium text-xs">{model.name}</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-black/40 text-gemini-muted font-mono">
                    {model.tag}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-gemini-border bg-[#171819] flex items-center justify-between">
          <button
            onClick={checkServerHealth}
            className="flex items-center gap-1.5 text-xs text-gemini-muted hover:text-white transition-colors"
          >
            <RefreshCw size={13} />
            <span>Recheck Health</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gemini-muted hover:text-white hover:bg-gemini-surface transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-gemini-accent hover:bg-blue-600 text-white shadow-md transition-colors"
            >
              {savedSuccess ? (
                <>
                  <Check size={14} />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

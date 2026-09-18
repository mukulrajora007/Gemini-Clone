import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, AlertCircle, Eye, EyeOff, Sparkles, Database } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onOpenSettings }) {
  const { signIn, signUp, isConfigured } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!isConfigured) {
      setError(
        'Supabase is not configured yet. Click "Configure Supabase" below or continue as guest.'
      );
      return;
    }

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        setSuccessMessage('Account created successfully! You can now sign in or check your email.');
      } else {
        await signIn(email, password);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1e1f20] border border-gemini-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gemini-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gemini-gradient-bg flex items-center justify-center text-white">
              <Sparkles size={14} />
            </div>
            <h3 className="font-semibold text-base text-white">
              {isSignUp ? 'Create Supabase Account' : 'Sign In with Supabase'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gemini-surface text-gemini-muted hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Notice if Supabase not configured */}
        {!isConfigured && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-3 text-xs text-amber-300 flex items-start gap-2.5">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Supabase credentials needed</p>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                Add your Supabase Project URL and Anon Key to enable cloud authentication and sync.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="mt-1.5 underline font-semibold hover:text-amber-200 block"
              >
                Open Settings to configure Supabase →
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
              {successMessage}
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gemini-muted flex items-center gap-1.5">
              <Mail size={13} />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              placeholder="developer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#171819] border border-gemini-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gemini-muted focus:outline-none focus:border-gemini-accent"
              required
            />
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gemini-muted flex items-center gap-1.5">
              <Lock size={13} />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#171819] border border-gemini-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gemini-muted focus:outline-none focus:border-gemini-accent pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gemini-muted hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold gemini-gradient-bg text-white shadow-md hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center justify-between text-xs text-gemini-muted pt-2 border-t border-gemini-border/60">
            <span>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccessMessage('');
              }}
              className="text-gemini-accent hover:underline font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          {/* Guest Mode fallback */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-gemini-muted hover:text-white underline transition-colors"
            >
              Continue as Guest (No Login Required)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

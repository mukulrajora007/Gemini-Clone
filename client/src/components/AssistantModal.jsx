import React, { useState } from 'react';
import { useChat, DEFAULT_MODELS } from '../context/ChatContext';
import { X, Bot, Sparkles, Code, PenTool, BarChart3, GraduationCap, Zap, Check } from 'lucide-react';

const ICONS = [
  { id: 'Bot', icon: Bot, label: 'Bot' },
  { id: 'Sparkles', icon: Sparkles, label: 'Sparkles' },
  { id: 'Code', icon: Code, label: 'Code' },
  { id: 'PenTool', icon: PenTool, label: 'Writer' },
  { id: 'BarChart3', icon: BarChart3, label: 'Data' },
  { id: 'GraduationCap', icon: GraduationCap, label: 'Tutor' },
  { id: 'Zap', icon: Zap, label: 'Turbo' },
];

const COLORS = [
  { id: 'blue', bg: 'bg-blue-500', border: 'border-blue-500' },
  { id: 'emerald', bg: 'bg-emerald-500', border: 'border-emerald-500' },
  { id: 'purple', bg: 'bg-purple-500', border: 'border-purple-500' },
  { id: 'amber', bg: 'bg-amber-500', border: 'border-amber-500' },
  { id: 'rose', bg: 'bg-rose-500', border: 'border-rose-500' },
  { id: 'indigo', bg: 'bg-indigo-500', border: 'border-indigo-500' },
];

export default function AssistantModal({ isOpen, onClose }) {
  const { createCustomAssistant, selectedModel } = useChat();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Bot');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [model, setModel] = useState(selectedModel);
  const [temperature, setTemperature] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !systemInstruction.trim()) {
      setError('Please provide both a Name and System Instructions.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createCustomAssistant({
        name: name.trim(),
        description: description.trim() || 'Custom AI Persona',
        systemInstruction: systemInstruction.trim(),
        icon: selectedIcon,
        accentColor: selectedColor,
        model,
        temperature: Number(temperature),
      });

      // Reset
      setName('');
      setDescription('');
      setSystemInstruction('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create assistant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1e1f20] border border-gemini-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-gemini-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gemini-gradient-bg flex items-center justify-center text-white">
              <Bot size={15} />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-white">Make Your Own AI</h3>
              <p className="text-[10px] sm:text-[11px] text-gemini-muted">Create a personalized AI persona with custom instructions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gemini-surface text-gemini-muted hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-5 overflow-y-auto space-y-3.5 sm:space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-white block">Assistant Name *</label>
            <input
              type="text"
              placeholder="e.g. React Senior Architect, Creative Scriptwriter"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#171819] border border-gemini-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gemini-muted focus:outline-none focus:border-gemini-accent"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gemini-muted block">Short Description</label>
            <input
              type="text"
              placeholder="e.g. Helps architect scalable frontend React applications"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#171819] border border-gemini-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gemini-muted focus:outline-none focus:border-gemini-accent"
            />
          </div>

          {/* System Instruction */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white block">System Instruction (Prompt) *</label>
              <span className="text-[10px] text-gemini-muted">Guides how the AI speaks and thinks</span>
            </div>
            <textarea
              rows={4}
              placeholder="You are an expert full-stack developer. You provide concise, optimized, and modern code snippets..."
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              className="w-full bg-[#171819] border border-gemini-border rounded-xl p-3 text-xs text-white placeholder-gemini-muted focus:outline-none focus:border-gemini-accent leading-relaxed resize-none"
              required
            />
          </div>

          {/* Model & Temperature */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-medium text-gemini-muted block mb-1">Base Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[#171819] border border-gemini-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gemini-accent"
              >
                {DEFAULT_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gemini-muted">Creativity: {temperature}</label>
                <span className="text-[10px] text-gemini-muted">
                  {temperature < 0.4 ? 'Precise' : temperature > 0.8 ? 'Creative' : 'Balanced'}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-gemini-accent h-2 bg-gemini-surface rounded-lg cursor-pointer mt-1"
              />
            </div>
          </div>

          {/* Color & Icon Choice */}
          <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <label className="text-xs font-medium text-gemini-muted block mb-1.5">Theme Color</label>
              <div className="flex items-center gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id)}
                    className={`w-6 h-6 rounded-full ${c.bg} flex items-center justify-center transition-transform ${
                      selectedColor === c.id ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {selectedColor === c.id && <Check size={12} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gemini-muted block mb-1.5">Icon</label>
              <div className="flex items-center gap-2">
                {ICONS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedIcon(item.id)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        selectedIcon === item.id
                          ? 'bg-gemini-surface border-gemini-accent text-white'
                          : 'border-gemini-border text-gemini-muted hover:text-white'
                      }`}
                    >
                      <Icon size={14} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gemini-border flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gemini-muted hover:text-white hover:bg-gemini-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-semibold gemini-gradient-bg text-white shadow-md hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create & Activate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import express from 'express';

const router = express.Router();

// Default preset AI assistants ("Make Your Own AI" starting templates)
const PRESET_ASSISTANTS = [
  {
    id: 'general',
    name: 'Gemini Assistant',
    description: 'Helpful, concise, and versatile AI assistant for everyday tasks.',
    systemInstruction: 'You are Gemini, a helpful, thoughtful, and capable AI assistant.',
    icon: 'Sparkles',
    accentColor: 'blue',
    model: 'gemini-3.8-flash',
    temperature: 0.7,
    isPreset: true,
  },
  {
    id: 'code-wizard',
    name: 'Code Wizard',
    description: 'Expert software engineer specializing in clean code, debugging, and architecture.',
    systemInstruction:
      'You are Code Wizard, an elite full-stack software engineer. Provide clean, well-commented code, modern patterns, security best practices, and thorough debugging explanations. Format code in markdown with syntax highlighting.',
    icon: 'Code',
    accentColor: 'emerald',
    model: 'gemini-3.8-flash',
    temperature: 0.2,
    isPreset: true,
  },
  {
    id: 'creative-writer',
    name: 'Creative Storyteller',
    description: 'Imaginative writer skilled in compelling narratives, copy, and brainstorming.',
    systemInstruction:
      'You are a creative writer and storytelling mentor. Provide vivid descriptions, captivating prose, engaging dialogue, and unique literary angles.',
    icon: 'PenTool',
    accentColor: 'purple',
    model: 'gemini-3.8-flash',
    temperature: 0.9,
    isPreset: true,
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst Pro',
    description: 'Extracts insights, crafts SQL queries, and analyzes complex datasets.',
    systemInstruction:
      'You are a senior data analyst. You break down complex data problems, write optimized SQL, explain metrics, and provide structured insights with tables and statistical summaries.',
    icon: 'BarChart3',
    accentColor: 'amber',
    model: 'gemini-3.8-flash',
    temperature: 0.3,
    isPreset: true,
  },
  {
    id: 'teacher-tutor',
    name: 'Socratic Tutor',
    description: 'Patient teacher who explains concepts simply using analogies and step-by-step guidance.',
    systemInstruction:
      'You are a patient Socratic tutor. Instead of just giving direct answers, explain concepts step-by-step, use real-world analogies, and ask clarifying questions to help the user learn deeply.',
    icon: 'GraduationCap',
    accentColor: 'rose',
    model: 'gemini-3.5-flash-lite',
    temperature: 0.5,
    isPreset: true,
  },
];

// In-memory store for server-stored custom assistants (backed by Supabase when connected)
let customAssistants = [];

/**
 * GET /api/assistants
 * Get all assistants (presets + custom)
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      presets: PRESET_ASSISTANTS,
      custom: customAssistants,
    },
  });
});

/**
 * POST /api/assistants
 * Create a new custom AI assistant
 */
router.post('/', (req, res) => {
  const { name, description, systemInstruction, icon, accentColor, model, temperature } = req.body;

  if (!name || !systemInstruction) {
    return res.status(400).json({
      success: false,
      error: 'Both "name" and "systemInstruction" are required.',
    });
  }

  const newAssistant = {
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: name.trim(),
    description: description ? description.trim() : 'Custom AI Assistant',
    systemInstruction: systemInstruction.trim(),
    icon: icon || 'Bot',
    accentColor: accentColor || 'indigo',
    model: model || 'gemini-3.8-flash',
    temperature: Number(temperature) ?? 0.7,
    isPreset: false,
    createdAt: new Date().toISOString(),
  };

  customAssistants.unshift(newAssistant);

  res.status(201).json({
    success: true,
    data: newAssistant,
  });
});

/**
 * DELETE /api/assistants/:id
 * Delete a custom AI assistant
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = customAssistants.length;
  customAssistants = customAssistants.filter((a) => a.id !== id);

  if (customAssistants.length === initialLength) {
    return res.status(404).json({
      success: false,
      error: 'Assistant not found or cannot delete preset assistants.',
    });
  }

  res.json({
    success: true,
    message: 'Assistant removed successfully.',
  });
});

export default router;

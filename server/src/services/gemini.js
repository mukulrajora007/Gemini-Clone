import { GoogleGenAI } from '@google/genai';

/**
 * Creates a GoogleGenAI client using the provided key or environment variable.
 */
export function getGeminiClient(apiKey) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '') {
    const error = new Error(
      'Missing Gemini API Key. Please provide an API key in the UI settings or set GEMINI_API_KEY in server/.env'
    );
    error.statusCode = 401;
    throw error;
  }
  return new GoogleGenAI({ apiKey: key.trim() });
}

/**
 * Normalizes message history into the Gemini API content format.
 * Gemini expects roles: 'user' and 'model', with parts array.
 */
export function formatMessagesForGemini(messages = []) {
  return messages.map((msg) => {
    const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
    const parts = [];

    // Handle multimodal media attachments (images, documents, PDFs)
    if (msg.attachments && Array.isArray(msg.attachments)) {
      for (const att of msg.attachments) {
        if (att && att.data && att.mimeType) {
          const rawBase64 = att.data.includes('base64,')
            ? att.data.split('base64,')[1]
            : att.data;
          parts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: rawBase64,
            },
          });
        }
      }
    }

    // Add text prompt part
    const textContent = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
    if (textContent && textContent.trim() !== '') {
      parts.push({ text: textContent });
    } else if (parts.length === 0) {
      parts.push({ text: ' ' });
    }

    return {
      role,
      parts,
    };
  });
}

/**
 * Available Gemini models with metadata - optimized for lowest latency
 */
export const AVAILABLE_MODELS = [
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash-Lite',
    description: '⚡ Ultra-fast sub-second latency for instant responses.',
    contextWindow: '1M tokens',
    isDefault: true,
  },
  {
    id: 'gemini-flash-lite-latest',
    name: 'Gemini Flash-Lite (Latest)',
    description: 'Auto-updating fast lightweight model.',
    contextWindow: '1M tokens',
    isDefault: false,
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    description: 'Balanced performance, multi-turn reasoning, and complex coding.',
    contextWindow: '1M tokens',
    isDefault: false,
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    description: 'Deep reasoning and complex architectural analysis.',
    contextWindow: '1M tokens',
    isDefault: false,
  },
];

/**
 * Standard non-streaming chat generation
 */
export async function generateChatResponse({
  apiKey,
  messages,
  model = 'gemini-3.5-flash-lite',
  systemInstruction,
  temperature = 0.7,
}) {
  const ai = getGeminiClient(apiKey);
  const contents = formatMessagesForGemini(messages);

  const config = {
    temperature: Number(temperature) || 0.7,
  };

  if (systemInstruction && systemInstruction.trim() !== '') {
    config.systemInstruction = systemInstruction.trim();
  }

  const targetModel = model || 'gemini-3.5-flash-lite';
  const response = await ai.models.generateContent({
    model: targetModel,
    contents,
    config,
  });

  return {
    content: response.text || '',
    model: targetModel,
    usage: response.usageMetadata || null,
  };
}

/**
 * Streaming chat generation
 */
export async function generateChatStream({
  apiKey,
  messages,
  model = 'gemini-3.5-flash-lite',
  systemInstruction,
  temperature = 0.7,
}) {
  const ai = getGeminiClient(apiKey);
  const contents = formatMessagesForGemini(messages);

  const config = {
    temperature: Number(temperature) || 0.7,
  };

  if (systemInstruction && systemInstruction.trim() !== '') {
    config.systemInstruction = systemInstruction.trim();
  }

  const targetModel = model || 'gemini-3.5-flash-lite';
  const responseStream = await ai.models.generateContentStream({
    model: targetModel,
    contents,
    config,
  });

  return responseStream;
}

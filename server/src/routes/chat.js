import express from 'express';
import { generateChatResponse, generateChatStream } from '../services/gemini.js';

const router = express.Router();

/**
 * POST /api/chat
 * Standard non-streaming chat completion
 */
router.post('/', async (req, res, next) => {
  try {
    const apiKey = req.headers['x-gemini-api-key'] || req.body.apiKey;
    const { messages, model, systemInstruction, temperature } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'The "messages" array is required and must not be empty.',
      });
    }

    const result = await generateChatResponse({
      apiKey,
      messages,
      model,
      systemInstruction,
      temperature,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/chat/stream
 * Server-Sent Events (SSE) streaming chat completion
 */
router.post('/stream', async (req, res) => {
  const apiKey = req.headers['x-gemini-api-key'] || req.body.apiKey;
  const { messages, model, systemInstruction, temperature } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'The "messages" array is required and must not be empty.',
    });
  }

  // Set SSE response headers with anti-buffering for instant real-time tokens
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  try {
    const stream = await generateChatStream({
      apiKey,
      messages,
      model: model || 'gemini-3.5-flash-lite',
      systemInstruction,
      temperature,
    });

    for await (const chunk of stream) {
      const text = chunk.text || '';
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
        if (typeof res.flush === 'function') {
          res.flush();
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Streaming error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

export default router;

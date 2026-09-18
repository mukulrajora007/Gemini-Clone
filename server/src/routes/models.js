import express from 'express';
import { AVAILABLE_MODELS } from '../services/gemini.js';

const router = express.Router();

/**
 * GET /api/models
 * Returns available Gemini models
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: AVAILABLE_MODELS,
  });
});

export default router;

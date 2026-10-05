import { Router, Request, Response } from 'express';
import { processClinicalTranslation } from '../services/geminiService.js';
import { saveTranslationLog, savePatientProfile } from '../services/supabaseService.js';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Hear2Heal Backend Engine', timestamp: new Date().toISOString() });
});

// Translation & Clinical Triage API
router.post('/translate', async (req: Request, res: Response) => {
  try {
    const { text, sourceLang, targetLang } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text field is required' });
    }

    const result = await processClinicalTranslation({ text, sourceLang, targetLang });
    
    // Optionally log to Supabase in background
    saveTranslationLog({
      sender: 'patient',
      sourceLanguage: result.detectedLanguage,
      targetLanguage: targetLang || 'en',
      sourceText: text,
      translatedText: result.englishTranslation,
      triageLevel: result.triageLevel
    }).catch(err => console.warn('Background Supabase logging skipped:', err.message));

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal Translation Server Error' });
  }
});

// Profile Sync Endpoint
router.post('/sync/profile', async (req: Request, res: Response) => {
  try {
    const result = await savePatientProfile(req.body);
    return res.json({ success: true, result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to sync profile' });
  }
});

export default router;

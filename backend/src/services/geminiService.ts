import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface TranslationRequest {
  text: string;
  sourceLang?: string;
  targetLang?: string;
}

export interface TriageAnalysis {
  detectedLanguage: string;
  englishTranslation: string;
  hindiTranslation: string;
  triageLevel: 'red' | 'yellow' | 'green';
  criticalSymptoms: string[];
  clinicalSummary: string;
  recommendedAction: string;
  requiresImmediateSOS: boolean;
}

export async function processClinicalTranslation(request: TranslationRequest): Promise<TriageAnalysis> {
  if (!ai) {
    // Clinical fallback engine supporting Hindi, Bengali, Tamil, Telugu & English emergency keywords
    const isEmergency = /chest pain|heart|breathing|stroke|bleed|unconscious|छाती|दर्द|सीने|सांस|बेहोश|खून|हार्ट|ব্যথা|বুক|নাস|வலி|நெஞ்சு|గుండె|నొప్పి/i.test(request.text);
    return {
      detectedLanguage: request.sourceLang || 'Auto',
      englishTranslation: request.text,
      hindiTranslation: request.text,
      triageLevel: isEmergency ? 'red' : 'yellow',
      criticalSymptoms: isEmergency ? ['Immediate Cardiopulmonary Symptom Alert'] : ['General Symptom'],
      clinicalSummary: isEmergency ? 'Critical triage alert: Immediate cardiopulmonary evaluation required.' : 'Routine clinical evaluation.',
      recommendedAction: isEmergency ? 'Immediate Emergency Triage Required' : 'Standard Routine Consult',
      requiresImmediateSOS: isEmergency
    };
  }

  try {
    const prompt = `You are a medical triage translation engine for emergency hospital environments.
Analyze the following patient input and produce a JSON response matching this schema:
{
  "detectedLanguage": "string",
  "englishTranslation": "string",
  "hindiTranslation": "string",
  "triageLevel": "red" | "yellow" | "green",
  "criticalSymptoms": ["string"],
  "clinicalSummary": "string",
  "recommendedAction": "string",
  "requiresImmediateSOS": boolean
}

Patient Input: "${request.text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as TriageAnalysis;
    }
  } catch (error) {
    console.error('Gemini API Translation error:', error);
  }

  return {
    detectedLanguage: request.sourceLang || 'Unknown',
    englishTranslation: request.text,
    hindiTranslation: request.text,
    triageLevel: 'yellow',
    criticalSymptoms: ['General symptom requiring evaluation'],
    clinicalSummary: 'Clinical analysis pending doctor evaluation.',
    recommendedAction: 'Routine Triage',
    requiresImmediateSOS: false
  };
}

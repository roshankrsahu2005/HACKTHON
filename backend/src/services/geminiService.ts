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
    // Fallback if API key is not present
    const isEmergency = /chest pain|heart|breathing|stroke|bleed|unconscious/i.test(request.text);
    return {
      detectedLanguage: request.sourceLang || 'Auto',
      englishTranslation: request.text,
      hindiTranslation: request.text,
      triageLevel: isEmergency ? 'red' : 'yellow',
      criticalSymptoms: isEmergency ? ['Chest Pain / Breathing Difficulty'] : ['Mild Symptoms'],
      clinicalSummary: 'Offline clinical analysis generated.',
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

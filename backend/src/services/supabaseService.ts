import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

if (url && key) {
  try {
    supabaseClient = createClient(url, key);
  } catch (err) {
    console.error('Failed to initialize Supabase backend client:', err);
  }
}

export async function saveTranslationLog(data: {
  sender: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceText: string;
  translatedText: string;
  triageLevel: string;
}) {
  if (!supabaseClient) return null;
  const { data: result, error } = await supabaseClient
    .from('translation_logs')
    .insert([
      {
        sender: data.sender,
        source_language: data.sourceLanguage,
        target_language: data.targetLanguage,
        source_text: data.sourceText,
        translated_text: data.translatedText,
        triage_level: data.triageLevel
      }
    ]);
  if (error) throw error;
  return result;
}

export async function savePatientProfile(profile: any) {
  if (!supabaseClient) return null;
  const { data: result, error } = await supabaseClient
    .from('patient_profiles')
    .insert([profile]);
  if (error) throw error;
  return result;
}

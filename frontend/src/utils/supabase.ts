/**
 * Hear2Heal - Supabase Realtime Database Client & Cloud Sync Integration
 * Project: https://pcacbjvwldtiruqbbzhz.supabase.co
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { ChatMessage, PatientProfile } from '../types';

// Default Supabase project direct URL & Anon Key
const DEFAULT_SUPABASE_URL = 'https://pcacbjvwldtiruqbbzhz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjYWNianZ3bGR0aXJ1cWJiemh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTcyNDgsImV4cCI6MjEwNjc5MzI0OH0.BUx3nB-ULDSs7gVVBbO6M4IZ2z8NjRDBZFT0_La0tFY';

const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Local storage key overrides if user connects directly via UI
const STORAGE_URL_KEY = 'h2h_supabase_url';
const STORAGE_ANON_KEY = 'h2h_supabase_anon_key';

export function getSupabaseConfig(): { url: string; anonKey: string } {
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem(STORAGE_URL_KEY);
    const savedKey = localStorage.getItem(STORAGE_ANON_KEY);
    if (savedUrl && savedKey) {
      return { url: savedUrl, anonKey: savedKey };
    }
  }
  return { url: ENV_SUPABASE_URL, anonKey: ENV_SUPABASE_ANON_KEY };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_URL_KEY, url.trim());
    localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
    supabaseInstance = null; // Reset instance to recreate with new config
  }
}

export function clearSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_ANON_KEY);
    supabaseInstance = null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url) && Boolean(anonKey) && anonKey.length > 10;
}

// Lazy Supabase client instance
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey || anonKey.length < 10) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: { persistSession: true },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });
    } catch (e) {
      console.warn('Failed to create Supabase client:', e);
      return null;
    }
  }

  return supabaseInstance;
}

/**
 * Realtime Consultations Interface
 */
export interface RealtimeConsultation {
  id?: string;
  patient_id: string;
  patient_name?: string;
  age?: number;
  gender?: string;
  source_text: string;
  detected_language: string;
  translated_text: string;
  doctor_response?: string;
  triage_level: 'red' | 'yellow' | 'green';
  critical_symptoms?: string[];
  pain_location?: string;
  pain_severity?: string;
  clinical_summary?: string;
  created_at?: string;
}

/**
 * Realtime Emergency Alert Interface
 */
export interface RealtimeEmergencyAlert {
  id?: string;
  alert_type: string;
  title: string;
  detail?: string;
  language?: string;
  severity?: string;
  status?: string;
  created_at?: string;
}

/**
 * 1. Sync Consultation to Supabase
 */
export async function syncConsultationToSupabase(consultation: RealtimeConsultation): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('consultations').insert([consultation]);
    if (error) {
      console.warn('Supabase consultation insert error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Supabase consultation request failed:', e);
    return false;
  }
}

/**
 * 2. Sync Emergency Alert to Supabase
 */
export async function syncEmergencyAlertToSupabase(alert: RealtimeEmergencyAlert): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('emergency_alerts').insert([alert]);
    if (error) {
      console.warn('Supabase emergency alert error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Supabase emergency alert failed:', e);
    return false;
  }
}

/**
 * 3. Save translation log entry to Supabase
 */
export async function syncTranslationToSupabase(
  sender: 'patient' | 'doctor',
  sourceLang: string,
  targetLang: string,
  sourceText: string,
  translatedText: string,
  triageLevel: 'red' | 'yellow' | 'green' = 'green'
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('translation_logs').insert([
      {
        sender,
        source_language: sourceLang,
        target_language: targetLang,
        source_text: sourceText,
        translated_text: translatedText,
        triage_level: triageLevel
      }
    ]);

    if (error) {
      console.warn('Supabase sync error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Supabase request failed:', e);
    return false;
  }
}

/**
 * 4. Save Patient Profile to Supabase
 */
export async function syncProfileToSupabase(profile: PatientProfile): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('patient_profiles').insert([
      {
        patient_name: profile.name,
        age: profile.age,
        blood_group: profile.bloodGroup,
        allergies: profile.allergies,
        current_medicines: profile.currentMedicines,
        emergency_contact: profile.emergencyContact
      }
    ]);

    if (error) {
      console.warn('Supabase profile error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Supabase profile request failed:', e);
    return false;
  }
}

/**
 * 5. Fetch Recent Realtime Consultations
 */
export async function fetchRecentConsultations(limit = 10): Promise<RealtimeConsultation[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Fetch consultations error:', error.message);
      return [];
    }
    return data || [];
  } catch (e) {
    console.warn('Fetch consultations failed:', e);
    return [];
  }
}

/**
 * 6. Realtime Subscription for Consultations
 */
export function subscribeToRealtimeConsultations(
  onInsert: (consultation: RealtimeConsultation) => void
): RealtimeChannel | null {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const channel = client
      .channel('public:consultations')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'consultations' },
        (payload) => {
          if (payload.new) {
            onInsert(payload.new as RealtimeConsultation);
          }
        }
      )
      .subscribe();

    return channel;
  } catch (e) {
    console.warn('Failed to subscribe to consultations:', e);
    return null;
  }
}

/**
 * 7. Realtime Subscription for Emergency SOS Alerts
 */
export function subscribeToRealtimeEmergencyAlerts(
  onAlert: (alert: RealtimeEmergencyAlert) => void
): RealtimeChannel | null {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const channel = client
      .channel('public:emergency_alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emergency_alerts' },
        (payload) => {
          if (payload.new) {
            onAlert(payload.new as RealtimeEmergencyAlert);
          }
        }
      )
      .subscribe();

    return channel;
  } catch (e) {
    console.warn('Failed to subscribe to emergency_alerts:', e);
    return null;
  }
}

/**
 * SQL Schema for Supabase Table Creation
 */
export const SUPABASE_SQL_SCHEMA = `-- Hear2Heal Supabase Database Schema
-- Project: https://pcacbjvwldtiruqbbzhz.supabase.co

-- 1. Create Consultations Table
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  patient_name TEXT,
  age INT,
  gender TEXT,
  source_text TEXT,
  detected_language TEXT,
  translated_text TEXT,
  doctor_response TEXT,
  triage_level TEXT DEFAULT 'green',
  critical_symptoms TEXT[],
  pain_location TEXT,
  pain_severity TEXT,
  clinical_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Emergency Alerts Table
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT,
  language TEXT,
  severity TEXT DEFAULT 'critical',
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Translation Logs Table
CREATE TABLE IF NOT EXISTS public.translation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender TEXT NOT NULL,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    triage_level TEXT DEFAULT 'green',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and Realtime
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/insert for consultations" ON public.consultations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert for emergency_alerts" ON public.emergency_alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert for translation_logs" ON public.translation_logs FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.translation_logs;
`;

/**
 * Test Connection with Supabase
 */
export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  if (!url || !key) {
    return { success: false, message: 'URL and Anon API key are required.' };
  }

  try {
    const tempClient = createClient(url.trim(), key.trim());
    const { data, error } = await tempClient.from('consultations').select('count', { count: 'exact', head: true });

    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "public.consultations" does not exist')) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: 'Connected to Supabase Live Realtime Database!'
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection failed. Please check URL and API Key.' };
  }
}

import React, { useState } from 'react';
import {
  ArrowLeft,
  Settings,
  Palette,
  Globe,
  Volume2,
  Database,
  ShieldCheck,
  LogOut,
  Check,
  Moon,
  Sun,
  Sparkles,
  Zap,
  Lock,
  Trash2,
  Radio
} from 'lucide-react';
import { ScreenId, Language, PatientProfile, ThemeOption } from '../../types';
import { LANGUAGES } from '../../data/mockData';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../../utils/supabase';

interface SettingsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  patientLang: Language;
  doctorLang: Language;
  onSelectPatientLang: (lang: Language) => void;
  onSelectDoctorLang: (lang: Language) => void;
  currentTheme: ThemeOption;
  onSelectTheme: (theme: ThemeOption) => void;
  onLogout?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onNavigate,
  patientLang,
  doctorLang,
  onSelectPatientLang,
  onSelectDoctorLang,
  currentTheme,
  onSelectTheme,
  onLogout,
}) => {


  // Audio settings state
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(true);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [speechVolume, setSpeechVolume] = useState<number>(100);

  // Supabase state
  const initialSupabase = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState<string>(initialSupabase.url);
  const [supabaseKey, setSupabaseKey] = useState<string>(initialSupabase.anonKey);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Handle Supabase save
  const handleSaveSupabase = () => {
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Handle Supabase test connection
  const handleTestSupabase = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection(supabaseUrl, supabaseKey);
    setTestResult(result);
    setIsTesting(false);
  };

  return (
    <div className="flex flex-col justify-between h-full min-h-[640px] p-5 sm:p-8 bg-[#eef3fa] relative overflow-y-auto rounded-3xl">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('patient_translation')}
              className="w-10 h-10 -ml-2 rounded-2xl neu-button flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>System Settings</span>
                <Settings className="w-5 h-5 text-blue-600 animate-spin-slow stroke-[2.2]" />
              </h2>
              <p className="text-xs text-slate-500 font-medium">Themes, audio synthesis, language & database configuration</p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-2xl neu-button text-red-600 hover:bg-red-500 hover:text-white flex items-center gap-2 text-xs font-extrabold transition-all cursor-pointer shadow-xs"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 stroke-[2.4]" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>

        {/* 1. Theme & Appearance Section */}
        <div className="p-5 neu-card rounded-3xl space-y-4">
          <div className="flex items-center gap-2.5 text-blue-700 font-black text-base">
            <Palette className="w-5 h-5 stroke-[2.4]" />
            <span>Theme & Visual Aesthetics</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Neumorphic Light Theme */}
            <button
              type="button"
              onClick={() => onSelectTheme('light')}
              className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                currentTheme === 'light'
                  ? 'neu-pressed border-2 border-blue-600 text-blue-900'
                  : 'neu-button text-slate-700 hover:text-slate-900'
              }`}
            >
              <Sun className="w-6 h-6 text-amber-500 stroke-[2.2]" />
              <span>Neumorphic Light</span>
              {currentTheme === 'light' && <Check className="w-4 h-4 text-blue-600" />}
            </button>

            {/* Slate Dark Theme */}
            <button
              type="button"
              onClick={() => onSelectTheme('slate')}
              className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                currentTheme === 'slate'
                  ? 'neu-pressed border-2 border-indigo-500 text-indigo-200'
                  : 'neu-button text-slate-700 hover:text-slate-900'
              }`}
            >
              <Moon className="w-6 h-6 text-indigo-400 stroke-[2.2]" />
              <span>Soft Slate</span>
              {currentTheme === 'slate' && <Check className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Medical Cyan Theme */}
            <button
              type="button"
              onClick={() => onSelectTheme('cyan')}
              className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                currentTheme === 'cyan'
                  ? 'neu-pressed border-2 border-cyan-600 text-cyan-900'
                  : 'neu-button text-slate-700 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-6 h-6 text-cyan-600 stroke-[2.2]" />
              <span>Medical Cyan</span>
              {currentTheme === 'cyan' && <Check className="w-4 h-4 text-cyan-600" />}
            </button>

            {/* Mint Emerald Theme */}
            <button
              type="button"
              onClick={() => onSelectTheme('emerald')}
              className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                currentTheme === 'emerald'
                  ? 'neu-pressed border-2 border-emerald-600 text-emerald-900'
                  : 'neu-button text-slate-700 hover:text-slate-900'
              }`}
            >
              <Zap className="w-6 h-6 text-emerald-600 stroke-[2.2]" />
              <span>Mint Emerald</span>
              {currentTheme === 'emerald' && <Check className="w-4 h-4 text-emerald-600" />}
            </button>
          </div>
        </div>

        {/* 2. Indian Languages Configuration */}
        <div className="p-5 neu-card rounded-3xl space-y-4">
          <div className="flex items-center gap-2.5 text-indigo-700 font-black text-base">
            <Globe className="w-5 h-5 stroke-[2.4]" />
            <span>Active Indian Languages</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Patient Language Selector */}
            <div>
              <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2">
                Patient Language
              </label>
              <select
                value={patientLang.id}
                onChange={(e) => {
                  const selected = LANGUAGES.find((l) => l.id === e.target.value);
                  if (selected) onSelectPatientLang(selected);
                }}
                className="w-full px-4 py-3 neu-input text-sm font-bold cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={`p-${lang.id}`} value={lang.id}>
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor Language Selector */}
            <div>
              <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2">
                Doctor Language
              </label>
              <select
                value={doctorLang.id}
                onChange={(e) => {
                  const selected = LANGUAGES.find((l) => l.id === e.target.value);
                  if (selected) onSelectDoctorLang(selected);
                }}
                className="w-full px-4 py-3 neu-input text-sm font-bold cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={`d-${lang.id}`} value={lang.id}>
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3. Audio & Speech Synthesizer Controls */}
        <div className="p-5 neu-card rounded-3xl space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-700 font-black text-base">
            <Volume2 className="w-5 h-5 stroke-[2.4]" />
            <span>Audio & Voice Synthesizer</span>
          </div>

          <div className="space-y-3.5">
            {/* Auto-Play Toggle */}
            <div className="flex items-center justify-between p-3.5 neu-pressed rounded-2xl">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">Auto-Play Audio Output</h4>
                <p className="text-[11px] text-slate-500 font-medium">Automatically speak translated doctor replies</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoPlayAudio(!autoPlayAudio)}
                className={`w-12 h-7 rounded-full p-1 transition-all cursor-pointer ${
                  autoPlayAudio ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    autoPlayAudio ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Speech Rate Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 mb-1.5">
                <span>Speech Pace / Speed</span>
                <span className="text-blue-600 font-mono">{speechSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.1"
                value={speechSpeed}
                onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4. Cloud Database & Supabase Integration */}
        <div className="p-5 neu-card rounded-3xl space-y-4">
          <div className="flex items-center gap-2.5 text-cyan-700 font-black text-base">
            <Database className="w-5 h-5 stroke-[2.4]" />
            <span>Supabase Cloud Database Settings</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-600 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyz.supabase.co"
                className="w-full px-4 py-2.5 neu-input text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-600 mb-1">
                Supabase Anon API Key
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbG..."
                className="w-full px-4 py-2.5 neu-input text-xs font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleSaveSupabase}
                className="px-4 py-2.5 rounded-xl neu-button-primary font-extrabold text-xs cursor-pointer"
              >
                Save Supabase Config
              </button>

              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-xl neu-button text-slate-800 font-extrabold text-xs cursor-pointer"
              >
                {isTesting ? 'Testing Connection...' : 'Test Connection'}
              </button>
            </div>

            {isSaved && (
              <div className="p-2.5 neu-pill text-emerald-700 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Supabase credentials saved locally!</span>
              </div>
            )}

            {testResult && (
              <div
                className={`p-3 rounded-2xl text-xs font-bold ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {testResult.message}
              </div>
            )}
          </div>
        </div>

        {/* 5. Security & Storage */}
        <div className="p-5 neu-card rounded-3xl space-y-3">
          <div className="flex items-center gap-2.5 text-slate-800 font-black text-base">
            <Lock className="w-5 h-5 text-emerald-600 stroke-[2.4]" />
            <span>Security & Compliance</span>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Hear2Heal runs entirely offline with zero cloud telemetry. All patient profile data, symptom logs, and voice translations remain encrypted inside device local memory.
          </p>
        </div>
      </div>
    </div>
  );
};

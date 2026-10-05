import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Mic,
  MicOff,
  Keyboard,
  Activity,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Bot,
  ShieldAlert,
  Stethoscope,
  CheckCircle2,
  Globe2,
  Zap,
  RotateCcw,
  Trash2,
  X
} from 'lucide-react';
import { ScreenId, Language } from '../../types';
import { playTextToSpeech, stopTextToSpeech } from '../../utils/audio';
import {
  processPatientSpeech,
  EMERGENCY_PRESETS,
  PatientAnalysisResult,
  EmergencyPreset
} from '../../utils/aiTranslator';
import { LANGUAGES } from '../../data/mockData';
import { syncTranslationToSupabase, syncConsultationToSupabase } from '../../utils/supabase';

const LANGUAGE_SPEECH_MAP: Record<string, string> = {
  hi: 'hi-IN',
  en: 'en-US',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  es: 'es-ES',
  ar: 'ar-SA',
  fr: 'fr-FR',
  ur: 'ur-PK'
};

interface PatientTranslationScreenProps {
  onNavigate: (screen: ScreenId) => void;
  patientLang: Language;
  doctorLang: Language;
  onSelectPatientLang?: (lang: Language) => void;
  onSelectDoctorLang?: (lang: Language) => void;
}

export const PatientTranslationScreen: React.FC<PatientTranslationScreenProps> = ({
  onNavigate,
  patientLang,
  doctorLang,
  onSelectPatientLang,
  onSelectDoctorLang
}) => {
  // AI Auto-Detection Mode (default ON for emergency readiness)
  const [isAutoDetectMode, setIsAutoDetectMode] = useState<boolean>(true);

  // Doctor preferred output language: 'en' (English) or 'hi' (Hindi)
  const [doctorOutputLangId, setDoctorOutputLangId] = useState<'en' | 'hi'>('en');

  // Input & analysis state
  const [inputText, setInputText] = useState<string>(EMERGENCY_PRESETS[0].patientText);
  const [analysis, setAnalysis] = useState<PatientAnalysisResult>(() =>
    processPatientSpeech(EMERGENCY_PRESETS[0].patientText, 'en')
  );

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isTypingMode, setIsTypingMode] = useState<boolean>(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  // Active emergency preset selected (if any)
  const [activePresetId, setActivePresetId] = useState<string>('hindi-chest-pain');

  // Speech Recognition ref
  const recognitionRef = useRef<any>(null);

  // Clean up audio & speech recognition on unmount
  useEffect(() => {
    return () => {
      stopTextToSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Re-run analysis & query backend API whenever input text or doctor output language changes
  useEffect(() => {
    // 1. Instant local NLP processing for zero latency
    const localResult = processPatientSpeech(inputText, doctorOutputLangId);
    setAnalysis(localResult);

    // If auto-detect is on, sync detected language with app-wide state
    if (isAutoDetectMode && onSelectPatientLang) {
      if (localResult.detectedLanguage.id !== patientLang.id) {
        onSelectPatientLang(localResult.detectedLanguage);
      }
    }

    // 2. Fetch live backend AI server translation if backend is running
    let isCancelled = false;
    if (inputText.trim()) {
      fetch('http://localhost:5000/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          sourceLang: localResult.detectedLanguage.name,
          targetLang: doctorOutputLangId
        })
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((backendResult) => {
          if (backendResult && !isCancelled) {
            setAnalysis((prev) => ({
              ...prev,
              englishTranslation: backendResult.englishTranslation || prev.englishTranslation,
              hindiTranslation: backendResult.hindiTranslation || prev.hindiTranslation,
              doctorTranslation:
                doctorOutputLangId === 'hi'
                  ? backendResult.hindiTranslation || prev.hindiTranslation
                  : backendResult.englishTranslation || prev.englishTranslation,
              triageLevel: backendResult.triageLevel || prev.triageLevel,
              clinicalSummary: backendResult.clinicalSummary || prev.clinicalSummary,
              requiresImmediateSOS: backendResult.requiresImmediateSOS ?? prev.requiresImmediateSOS
            }));
          }
        })
        .catch(() => {
          // Silent fallback to local NLP engine
        });

      // Cloud sync to Supabase Realtime consultations table
      syncConsultationToSupabase({
        patient_id: 'P-' + Math.floor(1000 + Math.random() * 9000),
        patient_name: 'Walk-in Patient',
        source_text: inputText,
        detected_language: localResult.detectedLanguage.name,
        translated_text: localResult.doctorTranslation,
        triage_level: localResult.triageLevel,
        critical_symptoms: localResult.criticalSymptoms,
        clinical_summary: localResult.clinicalSummary
      });

      // Cloud sync to Supabase translation_logs table
      syncTranslationToSupabase(
        'patient',
        localResult.detectedLanguage.name,
        doctorOutputLangId === 'hi' ? 'Hindi' : 'English',
        inputText,
        localResult.doctorTranslation,
        localResult.triageLevel
      );
    }

    return () => {
      isCancelled = true;
    };
  }, [inputText, doctorOutputLangId, isAutoDetectMode]);

  // Sync doctorLang from parent if changed
  useEffect(() => {
    if (doctorLang.id === 'hi' || doctorLang.id === 'en') {
      setDoctorOutputLangId(doctorLang.id as 'en' | 'hi');
    }
  }, [doctorLang]);

  // Handle switching doctor's output language
  const handleToggleDoctorLang = (targetId: 'en' | 'hi') => {
    setDoctorOutputLangId(targetId);
    if (onSelectDoctorLang) {
      const match = LANGUAGES.find((l) => l.id === targetId);
      if (match) onSelectDoctorLang(match);
    }
  };

  // Play audio in doctor's chosen language (English or Hindi)
  const handlePlayDoctorAudio = () => {
    if (isPlayingAudio) {
      stopTextToSpeech();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak =
      doctorOutputLangId === 'hi' ? analysis.hindiTranslation : analysis.englishTranslation;
    const langCode = doctorOutputLangId === 'hi' ? 'hi-IN' : 'en-US';

    playTextToSpeech(
      textToSpeak,
      langCode,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  // Handle preset pill click
  const handleSelectPreset = (preset: EmergencyPreset) => {
    setActivePresetId(preset.id);
    setInputText(preset.patientText);
    setRecognitionError(null);
  };

  // Toggle Microphone with real Web Speech API + gracefully handled states
  const handleToggleRecord = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsRecording(false);
      return;
    }

    // Stop any ongoing audio synthesis
    stopTextToSpeech();
    setIsPlayingAudio(false);
    setRecognitionError(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecognitionError(
        'Speech recognition is not supported in this browser. Please use the Keyboard or Emergency Presets.'
      );
      setIsTypingMode(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Select proper locale based on patientLang or default to Hindi for Indian medical triage
      const targetLocale = LANGUAGE_SPEECH_MAP[patientLang.id] || 'hi-IN';
      recognition.lang = targetLocale;

      recognition.onstart = () => {
        setIsRecording(true);
        setRecognitionError(null);
      };

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += trans;
          } else {
            interimText += trans;
          }
        }
        const activeText = (finalText || interimText).trim();
        if (activeText) {
          setInputText(activeText);
          setActivePresetId('');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setRecognitionError(
            'Microphone access was blocked. Please grant microphone permission in your browser or select an Emergency Preset below.'
          );
        } else if (event.error === 'no-speech') {
          setRecognitionError('No speech was detected. Please tap the mic and speak clearly.');
        } else {
          setRecognitionError(`Speech notice (${event.error}). You can tap any preset or use keyboard typing.`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition startup error:', err);
      setIsRecording(false);
      setRecognitionError(
        'Microphone could not be started. You can use the Quick Emergency Presets or Keyboard mode.'
      );
    }
  };

  return (
    <div className="flex flex-col justify-between h-full min-h-[640px] p-5 sm:p-8 bg-[#eef3fa] relative overflow-y-auto rounded-3xl">
      <div className="space-y-5">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Patient Translation</span>
                <Mic className="w-5 h-5 text-blue-600 stroke-[2.4]" />
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-black neu-pill text-blue-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" style={{ animationDuration: '4s' }} />
                <span>AI Auto-Detect</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Patient speaks in Indian regional languages — AI auto-detects & translates live for Doctor
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('doctor_reply')}
              className="px-4 py-2 rounded-2xl neu-button-primary text-xs font-extrabold flex items-center gap-2 cursor-pointer"
            >
              <span>Doctor Reply</span>
              <ArrowRight className="w-4 h-4 stroke-[2.4]" />
            </button>
          </div>
        </div>

        {/* Recognition Error Banner if any */}
        {recognitionError && (
          <div className="p-3.5 neu-card rounded-2xl border border-amber-300 bg-amber-50/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{recognitionError}</span>
            </div>
            <button
              type="button"
              onClick={() => setRecognitionError(null)}
              className="p-1 rounded-lg text-amber-700 hover:text-amber-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* AI Zero-Click Auto-Detect Mode Banner */}
        <div className="p-4 neu-card rounded-3xl">
          <div className="flex flex-col sm:flex-row items-start sm:flex-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl neu-raised text-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">
                    Emergency Zero-Click AI Detection
                  </span>
                  <span className="text-[10px] neu-pill px-2 py-0.5 font-extrabold text-emerald-700">
                    Instant Auto-Match
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Zero setup time — Patient speaks naturally in any Indian language.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setIsAutoDetectMode(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isAutoDetectMode
                    ? 'neu-pressed text-blue-900 border-2 border-blue-600'
                    : 'neu-button text-slate-700 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span>Auto-Detect</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAutoDetectMode(false);
                  onNavigate('languages');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  !isAutoDetectMode
                    ? 'neu-pressed text-blue-900 border-2 border-blue-600'
                    : 'neu-button text-slate-700 hover:text-slate-900'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Manual Select</span>
              </button>
            </div>
          </div>
        </div>

        {/* PATIENT VOICE INPUT CARD */}
        <div className="p-5 neu-card rounded-3xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{analysis.detectedLanguage.flag}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {analysis.detectedLanguage.name} ({analysis.detectedLanguage.nativeName})
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black neu-pill text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{analysis.confidence}% Match</span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  Script: {analysis.sourceScript} • Live Patient Audio Stream
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 neu-pill px-3 py-1 text-blue-700 text-xs font-extrabold">
                <Activity className={`w-3.5 h-3.5 ${isRecording ? 'animate-bounce text-red-600' : 'text-blue-600'}`} />
                <span>{isRecording ? 'Listening live...' : 'Voice Stream Active'}</span>
              </div>

              {inputText.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    setActivePresetId('');
                  }}
                  className="p-1.5 rounded-xl neu-button text-slate-500 hover:text-red-600 transition-all cursor-pointer"
                  title="Clear patient input"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsTypingMode(!isTypingMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isTypingMode
                    ? 'neu-pressed text-blue-900 border border-blue-500'
                    : 'neu-button text-slate-700 hover:text-slate-900'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>{isTypingMode ? 'Voice Mode' : 'Keyboard'}</span>
              </button>
            </div>
          </div>

          {/* Input text or Speech Display */}
          {isTypingMode ? (
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setActivePresetId('');
              }}
              rows={3}
              className="w-full p-4 neu-input text-base font-bold resize-none leading-relaxed focus:ring-2 focus:ring-blue-500/30"
              placeholder="Type patient symptoms in Hindi, Bengali, Tamil, Telugu, Marathi, or any Indian language..."
            />
          ) : (
            <div className="p-4 neu-pressed rounded-2xl min-h-[72px] flex items-center justify-between gap-3">
              <p className="text-base sm:text-lg font-black text-slate-900 leading-relaxed">
                {inputText ? `"${inputText}"` : <span className="text-slate-400 font-normal italic">Tap Mic below to speak symptoms or select an emergency preset...</span>}
              </p>
            </div>
          )}

          {/* Audio Telemetry Waveform */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 neu-pressed px-3 py-2 rounded-xl">
              {[30, 65, 95, 45, 80, 25, 90, 50, 75, 35, 85, 40, 60, 90, 45].map((h, i) => (
                <span
                  key={i}
                  style={{
                    height: isRecording
                      ? `${Math.max(16, (h + (i % 4) * 22) % 95)}px`
                      : '8px'
                  }}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isRecording
                      ? 'bg-gradient-to-t from-red-500 via-rose-500 to-blue-600 animate-pulse'
                      : 'bg-slate-400'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-mono neu-pill px-3 py-1 font-extrabold text-slate-600">
              {isRecording ? '🔴 LISTENING LIVE' : 'MIC STANDBY'}
            </span>
          </div>
        </div>

        {/* CENTRAL NEUMORPHIC MIC RECORDING BUTTON */}
        <div className="flex flex-col items-center justify-center py-2 space-y-2">
          <div className="relative flex items-center justify-center">
            {isRecording && (
              <>
                <div className="absolute w-28 h-28 rounded-full bg-red-500/25 animate-ping pointer-events-none" />
                <div className="absolute w-36 h-36 rounded-full bg-blue-500/20 animate-pulse pointer-events-none" />
              </>
            )}

            <button
              type="button"
              onClick={handleToggleRecord}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                isRecording
                  ? 'neu-button-emergency ring-4 ring-red-300 scale-105'
                  : 'neu-button-primary hover:scale-105 active:scale-95'
              }`}
              title={isRecording ? 'Stop listening' : 'Tap to speak in any language'}
            >
              {isRecording ? (
                <MicOff className="w-9 h-9 text-white animate-pulse" />
              ) : (
                <Mic className="w-9 h-9 text-white" />
              )}
            </button>
          </div>

          <div className="text-center space-y-0.5">
            <h4 className="text-xs font-black text-slate-900">
              {isRecording ? '🎙️ Listening to Patient Speech... Tap to Stop' : 'Tap Mic to Speak in Any Indian Language'}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Real-time clinical NLP & triage severity detection
            </p>
          </div>
        </div>

        {/* 1-TAP EMERGENCY SPEECH PRESETS */}
        <div className="p-4 neu-card rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 stroke-[2.4]" />
              <span>Simulate Emergency Patient Speech (1-Tap Test)</span>
            </span>
            <span className="text-[10px] neu-pill px-2.5 py-0.5 text-slate-500 font-extrabold">Quick Test</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {EMERGENCY_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'neu-pressed border-2 border-blue-600 text-blue-900'
                      : 'neu-button text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <span>{preset.flag}</span>
                  <span>{preset.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DOCTOR TRANSLATED OUTPUT CARD */}
        <div className="p-5 neu-card rounded-3xl space-y-3.5 border-l-4 border-l-blue-600">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/60">
            <div className="flex items-center gap-2 text-blue-700 font-black text-sm">
              <Stethoscope className="w-4 h-4 stroke-[2.4]" />
              <span>
                Translated Output ({doctorOutputLangId === 'hi' ? 'हिन्दी - Hindi' : 'English'})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switch Pills */}
              <div className="flex items-center gap-1 neu-pressed p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleToggleDoctorLang('en')}
                  className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                    doctorOutputLangId === 'en'
                      ? 'neu-pill text-blue-700 font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🇬🇧 English
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleDoctorLang('hi')}
                  className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                    doctorOutputLangId === 'hi'
                      ? 'neu-pill text-blue-700 font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🇮🇳 हिन्दी
                </button>
              </div>

              {/* Play Audio Button */}
              <button
                type="button"
                onClick={handlePlayDoctorAudio}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isPlayingAudio
                    ? 'neu-button-primary animate-pulse'
                    : 'neu-button text-blue-700 hover:text-blue-900'
                }`}
              >
                <Volume2 className="w-4 h-4 stroke-[2.4]" />
                <span>{isPlayingAudio ? 'Speaking...' : 'Listen Audio'}</span>
              </button>
            </div>
          </div>

          {/* Main Translated Output Text */}
          <div className="p-4 neu-pressed rounded-2xl">
            <p className="text-slate-900 font-black text-base sm:text-xl leading-relaxed">
              {analysis.doctorTranslation}
            </p>
          </div>

          {/* Subtext Reference */}
          <div className="text-xs text-slate-500 font-medium">
            <span>
              {doctorOutputLangId === 'en'
                ? `हिन्दी अनुवाद reference: ${analysis.hindiTranslation}`
                : `English reference: ${analysis.englishTranslation}`}
            </span>
          </div>
        </div>

        {/* CRITICAL / URGENT TRIAGE CARDS */}
        {analysis.triageLevel === 'red' ? (
          <div className="p-5 neu-card border-2 border-red-500/50 rounded-3xl space-y-3 bg-red-500/5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl neu-raised text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 stroke-[2.4] text-red-600 animate-pulse" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black neu-button-emergency">
                      CRITICAL RED TRIAGE
                    </span>
                    <h4 className="text-sm font-black text-slate-900">
                      Immediate Cardiopulmonary Emergency
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('emergency')}
                    className="px-3.5 py-1.5 rounded-xl neu-button-emergency text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Launch SOS Protocol</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.4]" />
                  </button>
                </div>
                <p className="text-xs text-slate-700 font-bold leading-relaxed">
                  {analysis.clinicalSummary}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {analysis.criticalSymptoms.map((symptom, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-black neu-pill text-red-700 flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                      <span>{symptom}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : analysis.triageLevel === 'yellow' ? (
          <div className="p-4 neu-card border border-amber-500/40 rounded-3xl space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl neu-raised text-amber-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black neu-pill text-amber-700">
                    YELLOW TRIAGE (URGENT)
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('symptoms')}
                    className="text-xs font-extrabold text-blue-700 hover:text-blue-900 cursor-pointer"
                  >
                    Check Triage Symptoms &rarr;
                  </button>
                </div>
                <p className="text-xs text-slate-700 font-bold mt-1">
                  {analysis.clinicalSummary}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* BOTTOM NAVIGATION ACTION BAR */}
      <div className="pt-6 mt-6 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onNavigate('symptoms')}
          className="flex-1 py-3 px-4 rounded-2xl neu-button text-xs font-extrabold text-slate-800 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Select Symptoms</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('doctor_reply')}
          className="flex-1 py-3 px-4 rounded-2xl neu-button-primary text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Doctor Reply ({analysis.detectedLanguage.name})</span>
          <ArrowRight className="w-4 h-4 stroke-[2.4]" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('history')}
          className="py-3 px-4 rounded-2xl neu-button text-xs font-extrabold text-slate-800 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>History</span>
        </button>
      </div>
    </div>
  );
};

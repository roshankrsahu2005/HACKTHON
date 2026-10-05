import React from 'react';
import {
  ShieldCheck,
  Stethoscope,
  Globe,
  Mic,
  ArrowRight,
  Siren,
  Activity,
  Layers,
  FileText,
  User,
  Zap,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { ScreenId } from '../../types';

interface SplashScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onNavigate }) => {
  return (
    <div className="w-full flex-1 flex flex-col justify-between py-6 sm:py-10 px-4 sm:px-8 bg-[#eef3fa] relative">
      {/* Background Subtle Lighting */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-white/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <div className="relative max-w-4xl mx-auto w-full text-center pt-2 sm:pt-6">
        {/* Compliance / Offline Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full neu-pill text-blue-700 text-xs font-bold mb-6">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Local Engine · Zero Internet Required · HIPAA/GDPR Local Data</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
          Instant Medical Translation for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800">
            Emergency Care & Clinics
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
          Break language barriers between patients and doctors anywhere. Designed with bidirectional
          voice-to-voice translation, visual pain mapping, clinical symptom triage, and prescription instructions.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 mb-12">
          <button
            onClick={() => onNavigate('patient_translation')}
            className="px-7 py-4 rounded-2xl neu-button-primary font-extrabold text-sm sm:text-base flex items-center gap-2.5 cursor-pointer"
          >
            <Mic className="w-5 h-5 stroke-[2.4]" />
            <span>Open Translation Console</span>
            <ArrowRight className="w-4 h-4 stroke-[2.4]" />
          </button>

          <button
            onClick={() => onNavigate('symptoms')}
            className="px-6 py-4 rounded-2xl neu-button text-slate-800 font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer"
          >
            <Activity className="w-5 h-5 text-blue-600 stroke-[2.4]" />
            <span>Symptom Triage</span>
          </button>

          <button
            onClick={() => onNavigate('emergency')}
            className="px-6 py-4 rounded-2xl neu-button-emergency font-black text-sm sm:text-base flex items-center gap-2 cursor-pointer"
          >
            <Siren className="w-5 h-5 text-white animate-pulse stroke-[2.4]" />
            <span>Emergency SOS</span>
          </button>
        </div>
      </div>

      {/* 4 Feature Columns Grid */}
      <div className="relative max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-6">
        <div
          onClick={() => onNavigate('languages')}
          className="p-6 rounded-3xl neu-card hover:scale-[1.02] transition-all cursor-pointer group"
        >
          <div className="w-13 h-13 rounded-2xl neu-pressed text-blue-600 flex items-center justify-center mb-4 group-hover:text-blue-700 transition-colors">
            <Globe className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base mb-1.5">10+ Clinical Languages</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Offline speech recognition and synthesis for Hindi, Tamil, Telugu, Spanish, Arabic & more.
          </p>
          <span className="text-xs font-black text-blue-600 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
            Configure Models &rarr;
          </span>
        </div>

        <div
          onClick={() => onNavigate('symptoms')}
          className="p-6 rounded-3xl neu-card hover:scale-[1.02] transition-all cursor-pointer group"
        >
          <div className="w-13 h-13 rounded-2xl neu-pressed text-indigo-600 flex items-center justify-center mb-4 group-hover:text-indigo-700 transition-colors">
            <Activity className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base mb-1.5">Rapid Symptom Triage</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Visual clinical icon cards for immediate communication during acute emergency conditions.
          </p>
          <span className="text-xs font-black text-indigo-600 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
            Assess Symptoms &rarr;
          </span>
        </div>

        <div
          onClick={() => onNavigate('body_map')}
          className="p-6 rounded-3xl neu-card hover:scale-[1.02] transition-all cursor-pointer group"
        >
          <div className="w-13 h-13 rounded-2xl neu-pressed text-emerald-600 flex items-center justify-center mb-4 group-hover:text-emerald-700 transition-colors">
            <User className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base mb-1.5">Anatomical Body Map</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Touch-localized pain mapping with severity slider (1-10) for non-verbal or non-fluent patients.
          </p>
          <span className="text-xs font-black text-emerald-600 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
            Open Body Map &rarr;
          </span>
        </div>

        <div
          onClick={() => onNavigate('medicine')}
          className="p-6 rounded-3xl neu-card hover:scale-[1.02] transition-all cursor-pointer group"
        >
          <div className="w-13 h-13 rounded-2xl neu-pressed text-amber-600 flex items-center justify-center mb-4 group-hover:text-amber-700 transition-colors">
            <FileText className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base mb-1.5">Prescription & Dosage</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Visual dosage schedules (Morning, Noon, Night, Meal instructions) with dual-language audio.
          </p>
          <span className="text-xs font-black text-amber-600 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
            Dosage Guide &rarr;
          </span>
        </div>
      </div>

      {/* Trust & Clinical Readiness Banner */}
      <div className="relative max-w-5xl mx-auto w-full mt-6 p-5 rounded-3xl neu-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl neu-pressed text-emerald-700 flex items-center justify-center font-black text-sm">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 stroke-[2.4]" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">Complete 10-Screen Clinical Architecture</h4>
            <p className="text-xs text-slate-500 font-medium">All medical screens, audio synthesizers, and translation workflows active</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('patient_translation')}
            className="px-5 py-2.5 rounded-2xl neu-button-primary font-bold text-xs cursor-pointer"
          >
            Launch Web Station
          </button>
        </div>
      </div>
    </div>
  );
};

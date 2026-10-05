import React, { useState } from 'react';
import { X, Globe, BookOpen, Siren, DownloadCloud, Clock, Settings, ShieldCheck, Info, Check, ArrowRight } from 'lucide-react';
import { ScreenId } from '../types';

interface ScreenSwitcherDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
}

export const ScreenSwitcherDrawer: React.FC<ScreenSwitcherDrawerProps> = ({
  isOpen,
  onClose,
  currentScreen,
  onSelectScreen,
}) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'about' | 'offline' | null>(null);

  if (!isOpen) return null;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-end p-2 sm:p-6 bg-slate-950/40 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-sm bg-[#eef3fa] rounded-3xl neu-card border border-white/80 overflow-hidden flex flex-col shadow-2xl animate-slide-up my-2 mr-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Menu Header */}
        <div className="p-4 px-5 border-b border-[#dbe4f0] flex items-center justify-between bg-[#eef3fa]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl neu-pressed text-blue-600 flex items-center justify-center font-black text-lg">
              ☰
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">Main Menu</h3>
              <p className="text-[11px] text-slate-500 font-medium">Hear2Heal Navigation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl neu-button flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
            aria-label="Close Menu"
          >
            <X className="w-5 h-5 stroke-[2.4]" />
          </button>
        </div>

        {/* Menu Items List */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[75vh]">
          {/* Group 1: Core Clinical Operations */}
          <div className="space-y-2">
            {/* 🌐 Language Settings */}
            <button
              onClick={() => handleAction(() => onSelectScreen('languages'))}
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                currentScreen === 'languages'
                  ? 'neu-pressed text-blue-700 font-extrabold'
                  : 'neu-button text-slate-800 hover:text-blue-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🌐</span>
                <span className="text-sm font-bold">Language Settings</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-400" />
            </button>

            {/* 📚 Medical Phrasebook */}
            <button
              onClick={() => handleAction(() => onSelectScreen('symptoms'))}
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                currentScreen === 'symptoms'
                  ? 'neu-pressed text-blue-700 font-extrabold'
                  : 'neu-button text-slate-800 hover:text-blue-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📚</span>
                <span className="text-sm font-bold">Medical Phrasebook</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-400" />
            </button>

            {/* 🚨 Emergency Mode */}
            <button
              onClick={() => handleAction(() => onSelectScreen('emergency'))}
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                currentScreen === 'emergency'
                  ? 'neu-button-emergency font-black'
                  : 'neu-button bg-red-50/60 border border-red-200 text-red-900 hover:bg-red-100/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl animate-pulse">🚨</span>
                <span className="text-sm font-black">Emergency Mode</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black neu-pill text-red-600">SOS</span>
            </button>

            {/* 📥 Offline Downloads */}
            <button
              onClick={() => setActiveModal('offline')}
              className="w-full p-3.5 rounded-2xl neu-button text-slate-800 hover:text-emerald-700 flex items-center justify-between text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📥</span>
                <span className="text-sm font-bold">Offline Downloads</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold neu-pill text-emerald-700">Ready</span>
            </button>

            {/* 🕘 Translation History */}
            <button
              onClick={() => handleAction(() => onSelectScreen('history'))}
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                currentScreen === 'history'
                  ? 'neu-pressed text-blue-700 font-extrabold'
                  : 'neu-button text-slate-800 hover:text-blue-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🕘</span>
                <span className="text-sm font-bold">Translation History</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Section Divider Line */}
          <div className="my-3 border-t border-[#c0cfdf]/70 border-dashed" />

          {/* Group 2: System & Privacy */}
          <div className="space-y-2">
            {/* ⚙️ Settings & Privacy */}
            <button
              onClick={() => handleAction(() => onSelectScreen('settings'))}
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                currentScreen === 'settings'
                  ? 'neu-pressed text-blue-700 font-extrabold'
                  : 'neu-button text-slate-800 hover:text-blue-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">⚙️</span>
                <span className="text-sm font-bold">Settings & Privacy</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-400" />
            </button>

            {/* ℹ️ About */}
            <button
              onClick={() => setActiveModal('about')}
              className="w-full p-3.5 rounded-2xl neu-button text-slate-800 hover:text-blue-700 flex items-center justify-between text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">ℹ️</span>
                <span className="text-sm font-bold">About</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-[#eef3fa] border-t border-[#dbe4f0] text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            Hear2Heal · Offline Clinical Suite v2.4
          </p>
        </div>
      </div>

      {/* Info Modals */}
      {activeModal && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-md bg-[#eef3fa] rounded-3xl neu-card p-6 border border-white/80 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl neu-button flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.4]" />
            </button>

            {activeModal === 'privacy' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-indigo-700 font-black text-lg">
                  <span className="text-2xl">🔒</span>
                  <span>Privacy & Security</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Hear2Heal operates on a 100% Zero-Cloud Upload spec for patient speech and clinical data.
                  All voice synthesis, NLP auto-detection, and symptom assessments run locally on your device in compliance with HIPAA and GDPR medical data standards.
                </p>
              </div>
            )}

            {activeModal === 'about' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-blue-700 font-black text-lg">
                  <span className="text-2xl">ℹ️</span>
                  <span>About Hear2Heal</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Hear2Heal is an Offline Medical Language Auto-Detection & Clinical Translation Engine designed for Emergency Hospital & Triage environments.
                </p>
                <div className="text-[11px] text-slate-500 font-mono bg-slate-200/50 p-2.5 rounded-xl border border-slate-300/60">
                  Version: 2.4.0 (Indian Clinical Dialects Pack)
                </div>
              </div>
            )}

            {activeModal === 'offline' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-emerald-700 font-black text-lg">
                  <span className="text-2xl">📥</span>
                  <span>Offline Downloads</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  All 13 Indian regional language models (Hindi, Bengali, Marathi, Tamil, Telugu, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, English) are pre-loaded & cached for instant offline speech synthesis.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neu-pill text-emerald-700 text-xs font-bold">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Downloaded & Active</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

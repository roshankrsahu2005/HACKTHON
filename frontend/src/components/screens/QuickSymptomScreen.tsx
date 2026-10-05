import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Volume2 } from 'lucide-react';
import { ScreenId, SymptomItem } from '../../types';
import { SYMPTOMS_LIST } from '../../data/mockData';
import { playTextToSpeech } from '../../utils/audio';

interface QuickSymptomScreenProps {
  onNavigate: (screen: ScreenId) => void;
  selectedSymptoms: string[];
  onToggleSymptom: (id: string) => void;
}

export const QuickSymptomScreen: React.FC<QuickSymptomScreenProps> = ({
  onNavigate,
  selectedSymptoms,
  onToggleSymptom,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePlaySymptom = (e: React.MouseEvent, symptom: SymptomItem) => {
    e.stopPropagation();
    setPlayingId(symptom.id);
    playTextToSpeech(
      `${symptom.name}. ${symptom.hindiName}`,
      'en-US',
      undefined,
      () => setPlayingId(null)
    );
  };

  const renderSymptomIcon = (id: string) => {
    switch (id) {
      case 'fever':
        return (
          <svg className="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
            <path d="M12 4v7" strokeWidth="2.5" />
            <circle cx="12" cy="18" r="2" fill="currentColor" />
          </svg>
        );
      case 'cough':
        return (
          <svg className="w-8 h-8 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="7" r="4" />
            <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
            <path d="M18 11c1 .5 2 1.5 2 3" strokeWidth="2.5" />
            <path d="M19 8c1.5.5 3 2 3 4" strokeWidth="2" />
          </svg>
        );
      case 'breathing':
        return (
          <svg className="w-8 h-8 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4v8" strokeWidth="2.5" />
            <path d="M12 9c-3-2-6-1-8 2-2 3.5-.5 7 2 8s5-1 6-5" fill="#f43f5e" fillOpacity="0.15" />
            <path d="M12 9c3-2 6-1 8 2 2 3.5.5 7-2 8s-5-1-6-5" fill="#f43f5e" fillOpacity="0.15" />
          </svg>
        );
      case 'chest_pain':
        return (
          <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" fill="#ef4444" fillOpacity="0.15" />
            <path d="M12 8l-2 4l3 1l-2 4" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'headache':
        return (
          <svg className="w-8 h-8 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="7" />
            <path d="M8 5l2 2" strokeWidth="2.5" />
            <path d="M16 5l-2 2" strokeWidth="2.5" />
            <path d="M12 2v3" strokeWidth="2.5" />
            <path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" />
          </svg>
        );
      case 'stomach_pain':
        return (
          <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v3" strokeWidth="2.5" />
            <path d="M10 6c-3 1-5 4-5 8 0 4.5 3.5 7 7 7s7-2.5 7-7c0-4-2-7-5-8" fill="#10b981" fillOpacity="0.15" />
            <path d="M9 14h6" strokeLinecap="round" strokeWidth="2.5" />
          </svg>
        );
      case 'vomiting':
        return (
          <svg className="w-8 h-8 text-lime-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="10" r="7" />
            <path d="M9 9h.01" strokeWidth="3" />
            <path d="M15 9h.01" strokeWidth="3" />
            <path d="M10 14c.5-1 3.5-1 4 0" strokeWidth="2" />
            <path d="M10 16l-2 6M12 16l-1 6M14 16l1 6" stroke="#84cc16" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
      case 'dizziness':
        return (
          <svg className="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="7" />
            <path d="M8 9l2 2m0-2l-2 2" strokeWidth="2" />
            <path d="M14 9l2 2m0-2l-2 2" strokeWidth="2" />
            <path d="M9 16c1.5-1 4.5-1 6 0" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 2l1 2 2 .5-2 1 .5 2-1.5-1.5L10 8" stroke="#f59e0b" strokeWidth="1.5" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col justify-between h-full min-h-[640px] p-5 sm:p-8 bg-[#eef3fa] relative overflow-y-auto rounded-3xl">
      <div className="space-y-6">
        {/* Top Header & Pagination */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('patient_translation')}
            className="w-10 h-10 -ml-2 rounded-2xl neu-button flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
          </button>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2 neu-pill px-3 py-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span className="w-6 h-2.5 rounded-full bg-blue-600 transition-all"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
          </div>

          <div className="w-8" />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Clinical Symptom Checklist
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Tap symptoms to select for immediate triage grading and doctor translation
          </p>
        </div>

        {/* Responsive Symptom Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {SYMPTOMS_LIST.map((symptom) => {
            const isSelected = selectedSymptoms.includes(symptom.id);
            const isPlaying = playingId === symptom.id;

            return (
              <div
                key={symptom.id}
                role="button"
                tabIndex={0}
                onClick={() => onToggleSymptom(symptom.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggleSymptom(symptom.id);
                  }
                }}
                className={`relative flex flex-col items-center justify-center p-4 rounded-3xl transition-all cursor-pointer text-center group select-none ${
                  isSelected
                    ? 'neu-pressed border-2 border-blue-600'
                    : 'neu-card hover:translate-y-[-2px]'
                }`}
              >
                {/* Audio Pronunciation Pill */}
                <button
                  type="button"
                  onClick={(e) => handlePlaySymptom(e, symptom)}
                  className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-xl neu-button flex items-center justify-center transition-all cursor-pointer ${
                    isPlaying ? 'neu-button-primary text-white animate-pulse' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Pronounce Symptom"
                >
                  <Volume2 className="w-3.5 h-3.5 stroke-[2.4]" />
                </button>

                {/* Selection check indicator */}
                {isSelected && (
                  <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full neu-button-primary text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                {/* Symptom Icon */}
                <div className="w-12 h-12 rounded-2xl neu-raised flex items-center justify-center mb-2 group-hover:scale-105 transition-transform mt-1">
                  {renderSymptomIcon(symptom.id)}
                </div>

                {/* Symptom Title & Hindi Translation */}
                <span className="text-sm font-black text-slate-900 tracking-tight">
                  {symptom.name}
                </span>
                <span className="text-[11px] font-bold text-slate-500 mt-0.5">
                  {symptom.hindiName}
                </span>

                {symptom.isCritical && (
                  <span className="mt-2 text-[9px] font-black uppercase tracking-wider text-rose-700 neu-pill px-2 py-0.5">
                    CRITICAL
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="pt-6 mt-6 border-t border-slate-200/60">
        <button
          type="button"
          onClick={() => onNavigate('body_map')}
          className="w-full py-3.5 rounded-2xl neu-button-primary font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <span>View Interactive Body Map</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

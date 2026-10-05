import React, { useState } from 'react';
import { ArrowLeft, ArrowDown, Volume2, Pill, FlaskRound as Flask, Syringe, Wind, Check } from 'lucide-react';
import { ScreenId, DosageType } from '../../types';
import { MEDICINE_PRESCRIPTIONS } from '../../data/mockData';
import { playTextToSpeech, stopTextToSpeech } from '../../utils/audio';

interface MedicineScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const MedicineScreen: React.FC<MedicineScreenProps> = ({ onNavigate }) => {
  const [selectedDosage, setSelectedDosage] = useState<DosageType>('tablet');
  const [isPlayingEnglish, setIsPlayingEnglish] = useState(false);
  const [isPlayingHindi, setIsPlayingHindi] = useState(false);

  const currentPrescription = MEDICINE_PRESCRIPTIONS[selectedDosage];

  const handlePlayEnglish = () => {
    if (isPlayingEnglish) {
      stopTextToSpeech();
      setIsPlayingEnglish(false);
      return;
    }
    playTextToSpeech(
      currentPrescription.englishInstruction,
      'en-US',
      () => setIsPlayingEnglish(true),
      () => setIsPlayingEnglish(false)
    );
  };

  const handlePlayHindi = () => {
    if (isPlayingHindi) {
      stopTextToSpeech();
      setIsPlayingHindi(false);
      return;
    }
    playTextToSpeech(
      currentPrescription.hindiInstruction,
      'hi-IN',
      () => setIsPlayingHindi(true),
      () => setIsPlayingHindi(false)
    );
  };

  return (
    <div className="flex flex-col justify-between h-full min-h-[640px] p-5 bg-[#eef3fa] text-slate-800 relative">
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => onNavigate('doctor_reply')}
            className="neu-button p-2.5 rounded-full text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Medicine & Prescription</h2>
            <p className="text-xs text-slate-500 font-medium">Bilingual dosage & intake schedule</p>
          </div>
        </div>

        {/* Doctor Instruction Card (English) */}
        <div className="p-4.5 neu-card rounded-2xl border border-blue-200/50">
          <div className="flex items-center justify-between text-xs text-blue-700 font-bold mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Doctor Instruction (English)
            </span>
            <button
              onClick={handlePlayEnglish}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isPlayingEnglish ? 'neu-button bg-blue-600 text-white animate-pulse' : 'neu-button text-blue-600'
              }`}
              title="Play English Audio"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-800 font-bold text-base leading-snug">
            {currentPrescription.englishInstruction}
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-200/40 text-[11px] text-blue-800 font-semibold flex items-center justify-between">
            <span className="neu-pressed px-2.5 py-1 rounded-lg">Schedule: {currentPrescription.schedule}</span>
            <span className="neu-pressed px-2.5 py-1 rounded-lg">Duration: {currentPrescription.duration}</span>
          </div>
        </div>

        {/* Translation Flow Arrow */}
        <div className="flex justify-center my-3">
          <div className="w-8 h-8 rounded-full neu-pressed text-blue-600 flex items-center justify-center">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* Translated Instruction Card (Hindi) */}
        <div className="p-4.5 neu-card rounded-2xl border border-emerald-200/60 bg-emerald-50/20">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              Translated (Hindi / हिंदी)
            </span>
            <button
              onClick={handlePlayHindi}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isPlayingHindi ? 'neu-button bg-emerald-600 text-white animate-pulse' : 'neu-button text-emerald-700'
              }`}
              title="Play Hindi Audio"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-900 font-extrabold text-lg leading-snug">
            {currentPrescription.hindiInstruction}
          </p>
        </div>
      </div>

      {/* Dosage Selector Navigation Bar at Bottom */}
      <div className="pt-4 border-t border-slate-200/50 mt-4">
        <div className="text-[11px] font-bold text-slate-500 mb-2.5 text-center uppercase tracking-wider">
          Select Dosage Format
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {/* Tablet */}
          <button
            type="button"
            onClick={() => setSelectedDosage('tablet')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all cursor-pointer ${
              selectedDosage === 'tablet'
                ? 'neu-pressed border-2 border-blue-500/80 text-blue-700'
                : 'neu-card text-slate-600 hover:scale-[1.02]'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 ${
              selectedDosage === 'tablet' ? 'neu-button bg-blue-600 text-white' : 'neu-pressed text-slate-600'
            }`}>
              <Pill className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold">Tablet</span>
          </button>

          {/* Syrup */}
          <button
            type="button"
            onClick={() => setSelectedDosage('syrup')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all cursor-pointer ${
              selectedDosage === 'syrup'
                ? 'neu-pressed border-2 border-blue-500/80 text-blue-700'
                : 'neu-card text-slate-600 hover:scale-[1.02]'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 ${
              selectedDosage === 'syrup' ? 'neu-button bg-blue-600 text-white' : 'neu-pressed text-slate-600'
            }`}>
              <Flask className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold">Syrup</span>
          </button>

          {/* Injection */}
          <button
            type="button"
            onClick={() => setSelectedDosage('injection')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all cursor-pointer ${
              selectedDosage === 'injection'
                ? 'neu-pressed border-2 border-blue-500/80 text-blue-700'
                : 'neu-card text-slate-600 hover:scale-[1.02]'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 ${
              selectedDosage === 'injection' ? 'neu-button bg-blue-600 text-white' : 'neu-pressed text-slate-600'
            }`}>
              <Syringe className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold">Injection</span>
          </button>

          {/* Inhaler */}
          <button
            type="button"
            onClick={() => setSelectedDosage('inhaler')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all cursor-pointer ${
              selectedDosage === 'inhaler'
                ? 'neu-pressed border-2 border-blue-500/80 text-blue-700'
                : 'neu-card text-slate-600 hover:scale-[1.02]'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 ${
              selectedDosage === 'inhaler' ? 'neu-button bg-blue-600 text-white' : 'neu-pressed text-slate-600'
            }`}>
              <Wind className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold">Inhaler</span>
          </button>
        </div>
      </div>
    </div>
  );
};

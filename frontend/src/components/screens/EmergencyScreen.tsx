import React, { useState } from 'react';
import { ArrowLeft, BellRing, Volume2, HeartCrack, Droplets, UserX, AlertTriangle, Baby, Siren } from 'lucide-react';
import { ScreenId, EmergencyAction } from '../../types';
import { EMERGENCY_ACTIONS } from '../../data/mockData';
import { playTextToSpeech, stopTextToSpeech } from '../../utils/audio';
import { syncEmergencyAlertToSupabase } from '../../utils/supabase';
import { LungsIcon } from '../icons/MedicalIcons';

interface EmergencyScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({ onNavigate }) => {
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyAction>(EMERGENCY_ACTIONS[1]); // Default severe chest pain
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePlayDoctorLanguage = () => {
    if (isPlayingAudio) {
      stopTextToSpeech();
      setIsPlayingAudio(false);
      return;
    }

    // Sync to Supabase Realtime table
    syncEmergencyAlertToSupabase({
      alert_type: selectedEmergency.id,
      title: selectedEmergency.title,
      detail: selectedEmergency.detail,
      language: 'Hindi / English',
      severity: 'critical',
      status: 'ACTIVE'
    });

    const doctorEmergencyAnnouncement = `Medical emergency! The patient reports: ${selectedEmergency.title}. ${selectedEmergency.detail}. Immediate doctor assistance required!`;
    
    playTextToSpeech(
      doctorEmergencyAnnouncement,
      'en-US',
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  const renderEmergencyIcon = (id: string) => {
    switch (id) {
      case 'cant_breathe':
        return (
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <LungsIcon className="w-7 h-7" />
          </div>
        );
      case 'chest_pain':
        return (
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <HeartCrack className="w-7 h-7" />
          </div>
        );
      case 'bleeding':
        return (
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <Droplets className="w-7 h-7" />
          </div>
        );
      case 'unconscious':
        return (
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <UserX className="w-7 h-7" />
          </div>
        );
      case 'allergy':
        return (
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-7 h-7" />
          </div>
        );
      case 'pregnancy':
        return (
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <Baby className="w-7 h-7" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col justify-between h-full min-h-[640px] bg-[#eef3fa] text-slate-800 relative">
      {/* High-Contrast Neumorphic Red Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-600 text-white px-5 pt-4 pb-4 shadow-lg rounded-b-3xl">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('patient_translation')}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Back to Translation"
            title="Back to Patient Translation"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <Siren className="w-5 h-5 animate-bounce text-red-200" />
            <h2 className="text-lg font-extrabold tracking-tight">Emergency SOS Mode</h2>
          </div>

          <div className="w-8"></div>
        </div>
      </div>

      {/* 6 Quick-Action Emergency Tiles */}
      <div className="p-5 flex-1 overflow-y-auto">
        <div className="mb-3.5 text-center">
          <span className="text-xs font-semibold text-slate-500 neu-pressed px-3 py-1 rounded-full">
            Tap critical condition to instantly broadcast alert
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {EMERGENCY_ACTIONS.map((item) => {
            const isSelected = selectedEmergency.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedEmergency(item)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all cursor-pointer text-center group ${
                  isSelected
                    ? 'neu-pressed border-2 border-red-500/80 bg-red-50/50 scale-[1.02]'
                    : 'neu-card hover:scale-[1.02]'
                }`}
              >
                {renderEmergencyIcon(item.id)}

                <span className="mt-2.5 text-xs font-extrabold text-slate-800 leading-tight">
                  {item.title}
                </span>
                <span className="text-[11px] text-red-600 mt-0.5 font-bold">
                  {item.hindiTitle}
                </span>

                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Emergency Preview Banner */}
        <div className="mt-4 p-4 neu-card rounded-2xl border border-red-200/60">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-red-600 mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              ACTIVE SELECTION
            </span>
            <span className="text-slate-400 font-medium">Hindi &rarr; English</span>
          </div>
          <div className="text-sm font-bold text-slate-800">
            "{selectedEmergency.hindiTitle}"
          </div>
          <div className="text-xs font-medium text-slate-600 mt-1 italic">
            &rarr; "{selectedEmergency.title}: {selectedEmergency.detail}"
          </div>
        </div>
      </div>

      {/* Bottom High-Priority Emergency Broadcast Button */}
      <div className="p-5 pt-2 bg-[#eef3fa]">
        <button
          onClick={handlePlayDoctorLanguage}
          className={`w-full py-4 px-5 rounded-2xl text-white font-extrabold flex items-center justify-center gap-3 transition-all cursor-pointer neu-button-emergency ${
            isPlayingAudio ? 'animate-pulse scale-[0.98]' : 'active:scale-[0.98]'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            {isPlayingAudio ? (
              <Volume2 className="w-5 h-5 animate-bounce text-white" />
            ) : (
              <BellRing className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="text-left">
            <div className="text-sm font-extrabold tracking-tight text-white">Broadcast Emergency Audio</div>
            <div className="text-[11px] text-red-100 font-medium">Play translated doctor announcement</div>
          </div>
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  Heart,
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Siren
} from 'lucide-react';
import { PatientVitals, ScreenId } from '../../types';

interface BedsideVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vitals: PatientVitals;
  onUpdateVitals: (updated: PatientVitals) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const BedsideVitalsModal: React.FC<BedsideVitalsModalProps> = ({
  isOpen,
  onClose,
  vitals,
  onUpdateVitals,
  onNavigate
}) => {
  const [localVitals, setLocalVitals] = useState<PatientVitals>(vitals);
  const [ecgPhase, setEcgPhase] = useState<number>(0);

  // Sync prop changes
  useEffect(() => {
    setLocalVitals(vitals);
  }, [vitals]);

  // Live ECG lead animation
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setEcgPhase((p) => (p + 1) % 40);
    }, 75);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: {
    name: string;
    hr: number;
    spo2: number;
    sys: number;
    dia: number;
    temp: number;
    rr: number;
    status: string;
  }) => {
    const updated: PatientVitals = {
      heartRate: preset.hr,
      spO2: preset.spo2,
      systolicBP: preset.sys,
      diastolicBP: preset.dia,
      temperature: preset.temp,
      respiratoryRate: preset.rr,
      rhythmStatus: preset.status
    };
    setLocalVitals(updated);
    onUpdateVitals(updated);
  };

  const handleSaveAndClose = () => {
    onUpdateVitals(localVitals);
    onClose();
  };

  const isCritical =
    localVitals.spO2 < 90 ||
    localVitals.heartRate > 135 ||
    localVitals.systolicBP < 85 ||
    localVitals.systolicBP > 175;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl neu-card rounded-[32px] p-6 sm:p-7 border border-white/80 shadow-2xl relative max-h-[90vh] overflow-y-auto bg-[#eef3fa]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl neu-raised text-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Bedside Patient Telemetry & Vitals
                </h3>
                {isCritical && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black neu-button-emergency animate-pulse">
                    CRITICAL
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Real-time hemodynamics, SpO2 pulse oximetry, and triage simulator
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl neu-button text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Animated ECG Rhythm Lead Banner (High-Tech Dark Scope) */}
        <div className="mb-4 p-3.5 rounded-2xl bg-slate-900 text-cyan-400 font-mono text-xs border border-slate-700/80 shadow-inner relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LEAD II · ECG TRACE 25mm/s</span>
            </span>
            <span className="font-bold text-emerald-400">
              {localVitals.rhythmStatus}
            </span>
          </div>

          {/* SVG Animated Lead */}
          <div className="h-10 w-full flex items-center justify-center overflow-hidden relative">
            <svg className="w-full h-full text-cyan-400" preserveAspectRatio="none" viewBox="0 0 400 40">
              <path
                d="M 0 20 L 40 20 L 50 18 L 55 22 L 60 20 L 80 20 L 85 8 L 92 36 L 98 12 L 104 22 L 108 20 L 140 20 L 150 16 L 160 20 L 200 20 L 240 20 L 250 18 L 255 22 L 260 20 L 280 20 L 285 8 L 292 36 L 298 12 L 304 22 L 308 20 L 340 20 L 350 16 L 360 20 L 400 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="opacity-90"
              />
            </svg>
          </div>
        </div>

        {/* 1-Click Simulation Scenario Presets */}
        <div className="mb-4">
          <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-[0.1em]">
            1-Click Clinical Simulation Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() =>
                handleApplyPreset({
                  name: 'Normal',
                  hr: 74,
                  spo2: 98,
                  sys: 120,
                  dia: 80,
                  temp: 98.6,
                  rr: 16,
                  status: 'Normal Sinus Rhythm'
                })
              }
              className="p-2 rounded-xl neu-button text-[11px] font-extrabold text-emerald-700 hover:text-emerald-800 transition-all cursor-pointer text-center"
            >
              🟢 Normal Baseline
            </button>

            <button
              type="button"
              onClick={() =>
                handleApplyPreset({
                  name: 'Cardiac Crisis',
                  hr: 148,
                  spo2: 91,
                  sys: 165,
                  dia: 105,
                  temp: 99.2,
                  rr: 26,
                  status: 'Supraventricular Tachycardia (SVT)'
                })
              }
              className="p-2 rounded-xl neu-button text-[11px] font-extrabold text-red-700 hover:text-red-800 transition-all cursor-pointer text-center"
            >
              🔴 Cardiac Tachycardia
            </button>

            <button
              type="button"
              onClick={() =>
                handleApplyPreset({
                  name: 'Hypoxia',
                  hr: 54,
                  spo2: 83,
                  sys: 95,
                  dia: 60,
                  temp: 97.8,
                  rr: 8,
                  status: 'Severe Hypoxemic Bradycardia'
                })
              }
              className="p-2 rounded-xl neu-button text-[11px] font-extrabold text-blue-700 hover:text-blue-800 transition-all cursor-pointer text-center"
            >
              🟣 Severe Hypoxia (83%)
            </button>

            <button
              type="button"
              onClick={() =>
                handleApplyPreset({
                  name: 'Shock',
                  hr: 132,
                  spo2: 93,
                  sys: 75,
                  dia: 45,
                  temp: 96.5,
                  rr: 28,
                  status: 'Hypovolemic Shock / Hypotension'
                })
              }
              className="p-2 rounded-xl neu-button text-[11px] font-extrabold text-amber-700 hover:text-amber-800 transition-all cursor-pointer text-center"
            >
              🟡 Shock (75/45 BP)
            </button>
          </div>
        </div>

        {/* Interactive Sliders for Custom Adjustments */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
          {/* Heart Rate Slider */}
          <div className="neu-card p-3 rounded-2xl border border-slate-200/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>Heart Rate (Pulse)</span>
              </span>
              <span className="text-xs font-black text-rose-700">{localVitals.heartRate} BPM</span>
            </div>
            <input
              type="range"
              min="40"
              max="180"
              value={localVitals.heartRate}
              onChange={(e) => {
                const val = Number(e.target.value);
                setLocalVitals((v) => ({
                  ...v,
                  heartRate: val,
                  rhythmStatus: val > 100 ? 'Sinus Tachycardia' : val < 60 ? 'Sinus Bradycardia' : 'Normal Sinus Rhythm'
                }));
              }}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
              <span>40 Brady</span>
              <span>75 Normal</span>
              <span>180 Tachy</span>
            </div>
          </div>

          {/* SpO2 Slider */}
          <div className="neu-card p-3 rounded-2xl border border-slate-200/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-cyan-600" />
                <span>Oxygen Saturation (SpO2)</span>
              </span>
              <span className={`text-xs font-black ${localVitals.spO2 < 90 ? 'text-red-600' : 'text-cyan-700'}`}>
                {localVitals.spO2}%
              </span>
            </div>
            <input
              type="range"
              min="70"
              max="100"
              value={localVitals.spO2}
              onChange={(e) => {
                const val = Number(e.target.value);
                setLocalVitals((v) => ({ ...v, spO2: val }));
              }}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
              <span>70% Hypoxia</span>
              <span>95%+ Normal</span>
              <span>100% Max</span>
            </div>
          </div>

          {/* Blood Pressure Sliders */}
          <div className="neu-card p-3 rounded-2xl border border-slate-200/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span>Blood Pressure (Systolic)</span>
              </span>
              <span className="text-xs font-black text-blue-700">
                {localVitals.systolicBP}/{localVitals.diastolicBP} mmHg
              </span>
            </div>
            <input
              type="range"
              min="60"
              max="200"
              value={localVitals.systolicBP}
              onChange={(e) => {
                const val = Number(e.target.value);
                setLocalVitals((v) => ({ ...v, systolicBP: val }));
              }}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
              <span>60 Low</span>
              <span>120 Target</span>
              <span>200 Hyper</span>
            </div>
          </div>

          {/* Temperature Slider */}
          <div className="neu-card p-3 rounded-2xl border border-slate-200/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                <span>Body Temperature</span>
              </span>
              <span className="text-xs font-black text-amber-700">{localVitals.temperature} °F</span>
            </div>
            <input
              type="range"
              min="95.0"
              max="105.0"
              step="0.2"
              value={localVitals.temperature}
              onChange={(e) => {
                const val = Number(e.target.value);
                setLocalVitals((v) => ({ ...v, temperature: val }));
              }}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
              <span>95.0° Hypo</span>
              <span>98.6° Norm</span>
              <span>105.0° High Fever</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-200/80">
          {isCritical ? (
            <button
              type="button"
              onClick={() => {
                handleSaveAndClose();
                onNavigate('emergency');
              }}
              className="py-2.5 px-4 rounded-xl neu-button-emergency text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Siren className="w-4 h-4 animate-bounce" />
              <span>Launch Critical SOS Protocol &rarr;</span>
            </button>
          ) : (
            <span className="text-xs text-slate-500 font-medium">
              Vitals live synced to active patient consultation
            </span>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() =>
                handleApplyPreset({
                  name: 'Reset',
                  hr: 74,
                  spo2: 98,
                  sys: 120,
                  dia: 80,
                  temp: 98.6,
                  rr: 16,
                  status: 'Normal Sinus Rhythm'
                })
              }
              className="py-2 px-3 rounded-xl neu-button text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={handleSaveAndClose}
              className="py-2.5 px-5 rounded-xl neu-button-primary text-xs font-black transition-all cursor-pointer shadow-md"
            >
              Apply & Update Vitals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

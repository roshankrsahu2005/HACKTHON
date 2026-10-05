import React from 'react';
import { Activity, Heart, Wind, Droplets, Thermometer, AlertCircle } from 'lucide-react';
import { PatientVitals } from '../../types';

interface BedsideVitalsWidgetProps {
  vitals: PatientVitals;
  onOpenModal: () => void;
}

export const BedsideVitalsWidget: React.FC<BedsideVitalsWidgetProps> = ({ vitals, onOpenModal }) => {
  const isHeartRateAbnormal = vitals.heartRate > 100 || vitals.heartRate < 60;
  const isSpO2Critical = vitals.spO2 < 92;
  const isBPCritical = vitals.systolicBP > 140 || vitals.systolicBP < 90;
  const isAnyCritical = isSpO2Critical || isBPCritical || vitals.heartRate > 125;

  return (
    <button
      type="button"
      onClick={onOpenModal}
      className={`neu-pressed px-2.5 sm:px-3 py-1.5 rounded-2xl flex items-center gap-2 sm:gap-3 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
        isAnyCritical
          ? 'border-2 border-red-500/80 bg-red-50/70 text-red-900 shadow-sm'
          : 'text-slate-700 hover:text-blue-700'
      }`}
      title="Bedside Vitals Telemetry Monitor (Click to Adjust or Simulate)"
    >
      {/* Pulse / Heart Rate */}
      <div className="flex items-center gap-1.5">
        <Heart
          className={`w-3.5 h-3.5 ${
            isHeartRateAbnormal
              ? 'text-red-600 fill-red-500 animate-pulse'
              : 'text-rose-500 fill-rose-400'
          }`}
        />
        <div className="text-left">
          <div className="text-[11px] font-black leading-none flex items-center gap-0.5">
            <span>{vitals.heartRate}</span>
            <span className="text-[9px] font-medium text-slate-500">BPM</span>
          </div>
        </div>
      </div>

      <div className="w-[1px] h-4 bg-slate-300/80" />

      {/* SpO2 */}
      <div className="flex items-center gap-1.5">
        <Wind
          className={`w-3.5 h-3.5 ${
            isSpO2Critical ? 'text-red-600 animate-bounce' : 'text-cyan-600'
          }`}
        />
        <div className="text-left">
          <div className="text-[11px] font-black leading-none flex items-center gap-0.5">
            <span className={isSpO2Critical ? 'text-red-600 font-extrabold' : ''}>
              {vitals.spO2}%
            </span>
            <span className="text-[9px] font-medium text-slate-500 hidden md:inline">SpO2</span>
          </div>
        </div>
      </div>

      <div className="w-[1px] h-4 bg-slate-300/80 hidden lg:block" />

      {/* BP */}
      <div className="hidden lg:flex items-center gap-1.5">
        <Droplets className="w-3.5 h-3.5 text-blue-600" />
        <div className="text-left">
          <div className="text-[11px] font-black leading-none">
            <span>{vitals.systolicBP}/{vitals.diastolicBP}</span>
          </div>
        </div>
      </div>

      {/* ECG Micro-Pulse Wave */}
      <div className="hidden xl:flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-slate-800 text-cyan-400 font-mono text-[9px] font-bold">
        <Activity className="w-3 h-3 animate-pulse text-emerald-400" />
        <span>72 ECG</span>
      </div>
    </button>
  );
};

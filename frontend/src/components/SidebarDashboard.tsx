import React from 'react';
import {
  Mic,
  Sparkles,
  Activity,
  User,
  Siren,
  Pill,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  Zap,
  Lock,
  HeartPulse,
  PanelLeftClose,
  LayoutDashboard,
  FileText,
  Settings
} from 'lucide-react';
import { ScreenId, Language } from '../types';

interface SidebarDashboardProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  patientLang: Language;
  doctorLang: Language;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const SidebarDashboard: React.FC<SidebarDashboardProps> = ({
  currentScreen,
  onNavigate,
  patientLang,
  doctorLang,
  isOpen = true,
  onToggle,
  className = ''
}) => {
  if (!isOpen) {
    return null;
  }

  const clinicalTools = [
    {
      id: 'splash' as ScreenId,
      label: 'Overview',
      sublabel: 'Clinical System Overview',
      icon: LayoutDashboard,
      badge: 'Start',
      badgeColor: 'bg-indigo-100/90 text-indigo-700 border border-indigo-200/70',
      iconColor: 'bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
    },
    {
      id: 'patient_translation' as ScreenId,
      label: 'Patient Translation',
      sublabel: 'AI Speech & Auto-Detect',
      icon: Mic,
      badge: 'AI Active',
      badgeColor: 'bg-emerald-100/90 text-emerald-700 border border-emerald-200/70',
      iconColor: 'bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
    },
    {
      id: 'doctor_reply' as ScreenId,
      label: 'Doctor Reply',
      sublabel: 'Clinician Voice & Questions',
      icon: Sparkles,
      badge: null,
      badgeColor: '',
      iconColor: 'bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'
    },
    {
      id: 'symptoms' as ScreenId,
      label: 'Symptoms Triage',
      sublabel: 'Clinical Checklist & Triage',
      icon: Activity,
      badge: null,
      badgeColor: '',
      iconColor: 'bg-amber-500/10 text-amber-600 group-hover:bg-amber-600 group-hover:text-white'
    },
    {
      id: 'body_map' as ScreenId,
      label: 'Body Map',
      sublabel: 'Pain Point & Anatomy Locator',
      icon: User,
      badge: null,
      badgeColor: '',
      iconColor: 'bg-violet-500/10 text-violet-600 group-hover:bg-violet-600 group-hover:text-white'
    },
    {
      id: 'history' as ScreenId,
      label: 'Conversation History',
      sublabel: 'Transcripts & Voice Logs',
      icon: FileText,
      badge: 'Logs',
      badgeColor: 'bg-slate-100 text-slate-700 border border-slate-200/80',
      iconColor: 'bg-slate-500/10 text-slate-600 group-hover:bg-slate-700 group-hover:text-white'
    },
    {
      id: 'settings' as ScreenId,
      label: 'System Settings',
      sublabel: 'Themes, Audio & Config',
      icon: Settings,
      badge: 'Config',
      badgeColor: 'bg-blue-100/90 text-blue-700 border border-blue-200/70',
      iconColor: 'bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
    }
  ];

  const emergencyTools = [
    {
      id: 'emergency' as ScreenId,
      label: 'Emergency SOS',
      sublabel: 'Immediate Resuscitation Protocol',
      icon: Siren,
      isEmergency: true,
      badge: 'CRITICAL',
      badgeColor: 'bg-red-600 text-white animate-pulse'
    },
    {
      id: 'medicine' as ScreenId,
      label: 'Prescriptions',
      sublabel: 'Dosage & Rx Translator',
      icon: Pill,
      isEmergency: false,
      badge: 'Rx',
      badgeColor: 'bg-cyan-100/90 text-cyan-700 border border-cyan-200/70',
      iconColor: 'bg-cyan-500/10 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white'
    }
  ];

  return (
    <aside
      className={`w-72 bg-[#eef3fa] border-r border-[#dbe4f0] flex flex-col shrink-0 select-none shadow-[6px_0_16px_#c0cfdf] transition-all duration-300 ease-in-out ${className}`}
    >
      {/* Sidebar Header / Hospital Ward Telemetry + Close/OFF Toggle */}
      <div className="p-3.5 border-b border-[#dbe4f0] bg-[#eef3fa] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl neu-raised text-blue-600 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 stroke-[2.4]" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-wider text-slate-800 uppercase">
              Dashboard
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">Hospital Triage Suite</p>
          </div>
        </div>

        {/* Dashboard Close / Collapse Button inside the sidebar */}
        {onToggle && (
          <button
            onClick={onToggle}
            className="w-8 h-8 rounded-xl neu-button text-slate-500 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center group"
            title="Collapse Dashboard"
            aria-label="Collapse Dashboard"
          >
            <PanelLeftClose className="w-4 h-4 text-slate-600 group-hover:text-slate-900" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-6">
        {/* Group 1: Core Clinical Tools */}
        <div>
          <div className="px-2 mb-3 flex items-center justify-between">
            <span className="text-[11px] font-black tracking-wider text-slate-400 uppercase">
              Clinical Tools
            </span>
            <span className="text-[10px] font-bold text-blue-700 neu-pill px-2.5 py-0.5">
              6 Tools
            </span>
          </div>

          <div className="space-y-2.5">
            {clinicalTools.map((item) => {
              const isActive = currentScreen === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all duration-200 flex items-center justify-between group cursor-pointer relative ${
                    isActive
                      ? 'neu-pressed bg-[#e6eef8] border-l-4 border-l-blue-600 text-blue-900 font-bold'
                      : 'neu-button text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 ${
                        isActive
                          ? 'neu-pill-pressed text-blue-600'
                          : 'neu-pill text-slate-600 group-hover:text-blue-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold truncate ${isActive ? 'text-blue-900' : 'text-slate-800'}`}>
                          {item.label}
                        </span>
                      </div>
                      <p className="text-[10px] truncate leading-tight mt-0.5 text-slate-500">
                        {item.sublabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.badge && !isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold neu-pill text-slate-600">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-all duration-200 ${
                        isActive
                          ? 'text-blue-600 translate-x-0.5'
                          : 'text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Group 2: Emergency & Prescriptions */}
        <div>
          <div className="px-2 mb-3 flex items-center justify-between">
            <span className="text-[11px] font-black tracking-wider text-slate-400 uppercase">
              Emergency & Care
            </span>
            <span className="text-[10px] font-bold text-red-600 neu-pill px-2.5 py-0.5">
              Priority
            </span>
          </div>

          <div className="space-y-2.5">
            {emergencyTools.map((item) => {
              const isActive = currentScreen === item.id;
              const Icon = item.icon;

              if (item.isEmergency) {
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all duration-200 flex items-center justify-between group cursor-pointer relative ${
                      isActive
                        ? 'neu-button-emergency ring-2 ring-red-400'
                        : 'neu-button bg-red-50/50 border border-red-200 text-red-900 hover:bg-red-100/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-red-600 text-white neu-pill'
                        }`}
                      >
                        <Icon className="w-4 h-4 stroke-[2.4] animate-pulse" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-black truncate ${isActive ? 'text-white' : 'text-red-900'}`}>
                            {item.label}
                          </span>
                        </div>
                        <p
                          className={`text-[10px] truncate leading-tight mt-0.5 ${
                            isActive ? 'text-red-100' : 'text-red-700/80'
                          }`}
                        >
                          {item.sublabel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider ${
                          isActive ? 'bg-white text-red-600' : 'bg-red-600 text-white animate-pulse'
                        }`}
                      >
                        SOS
                      </span>
                    </div>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all duration-200 flex items-center justify-between group cursor-pointer relative ${
                    isActive
                      ? 'neu-pressed bg-[#e6eef8] border-l-4 border-l-blue-600 text-blue-900 font-bold'
                      : 'neu-button text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 ${
                        isActive
                          ? 'neu-pill-pressed text-blue-600'
                          : 'neu-pill text-slate-600 group-hover:text-blue-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold truncate ${isActive ? 'text-blue-900' : 'text-slate-800'}`}>
                          {item.label}
                        </span>
                      </div>
                      <p className="text-[10px] truncate leading-tight mt-0.5 text-slate-500">
                        {item.sublabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.badge && !isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold neu-pill text-slate-600">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-all duration-200 ${
                        isActive
                          ? 'text-blue-600 translate-x-0.5'
                          : 'text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar Footer / Active Telemetry Card */}
      <div className="p-3.5 border-t border-[#dbe4f0] bg-[#eef3fa] text-xs">
        <div className="p-3 neu-card rounded-2xl">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Active Pair</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-black neu-pill px-2 py-0.5">READY</span>
          </div>

          <div className="text-[11px] text-slate-600 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[10px]">Patient:</span>
              <span className="font-semibold text-slate-800">
                {patientLang.flag} {patientLang.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[10px]">Doctor:</span>
              <span className="font-semibold text-slate-800">
                {doctorLang.flag} {doctorLang.name}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 px-1 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero Cloud Leak</span>
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>HIPAA Safe</span>
          </span>
        </div>
      </div>
    </aside>
  );
};

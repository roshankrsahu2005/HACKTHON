import React from 'react';
import { ScreenId } from '../types';
import { ShieldCheck, HeartPulse, Lock, Globe } from 'lucide-react';

interface MobileFrameProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onOpenDrawer: () => void;
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  currentScreen,
  onNavigate,
  onOpenDrawer,
  children,
}) => {
  return (
    <div className="relative w-full flex-1 flex flex-col h-full min-h-0 bg-[#eef3fa]">
      {/* Website Main Workspace */}
      <div className="flex-1 w-full overflow-y-auto relative flex flex-col">
        <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col p-3 sm:p-6 lg:p-8">
          {children}
        </div>

        {/* Website Clinical Neumorphic Footer */}
        <footer className="mt-auto border-t border-[#dbe4f0] bg-[#eef3fa] py-4 px-6 text-xs text-slate-600 shadow-[0_-4px_12px_#c0cfdf]">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="font-bold text-slate-800">Hear2Heal Medical Web Portal</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500 font-medium">Offline Neumorphic Speech & Triage Suite</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5 neu-pill px-3 py-1">
                <Lock className="w-3 h-3 text-slate-400" />
                Zero Cloud Upload
              </span>
              <span className="inline-flex items-center gap-1.5 neu-pill px-3 py-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                HIPAA / Clinical Offline Spec
              </span>
              <button
                onClick={onOpenDrawer}
                className="text-blue-700 font-bold neu-pill px-3 py-1 hover:text-blue-900 transition-all cursor-pointer"
              >
                10-Screen Switcher
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

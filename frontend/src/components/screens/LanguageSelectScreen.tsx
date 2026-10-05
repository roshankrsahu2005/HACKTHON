import React, { useState } from 'react';
import { ArrowLeft, ArrowUpDown, ShieldCheck, Check, ChevronDown, DownloadCloud } from 'lucide-react';
import { ScreenId, Language } from '../../types';
import { LANGUAGES } from '../../data/mockData';

interface LanguageSelectScreenProps {
  onNavigate: (screen: ScreenId) => void;
  patientLang: Language;
  doctorLang: Language;
  onSelectPatientLang: (lang: Language) => void;
  onSelectDoctorLang: (lang: Language) => void;
  onSwapLanguages: () => void;
}

export const LanguageSelectScreen: React.FC<LanguageSelectScreenProps> = ({
  onNavigate,
  patientLang,
  doctorLang,
  onSelectPatientLang,
  onSelectDoctorLang,
  onSwapLanguages,
}) => {
  const [openFromDropdown, setOpenFromDropdown] = useState(false);
  const [openToDropdown, setOpenToDropdown] = useState(false);

  return (
    <div className="flex flex-col justify-between h-full min-h-[640px] p-6 sm:p-8 bg-[#eef3fa] relative rounded-3xl">
      {/* Top Header & Pagination */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => onNavigate('splash')}
            className="w-10 h-10 -ml-2 rounded-2xl neu-button flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
          </button>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2 neu-pill px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span className="w-5 h-2 rounded-full bg-blue-600 transition-all"></span>
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          </div>

          <div className="w-8"></div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Select Indian Language</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Choose Indian regional languages for instant clinical speech translation</p>
        </div>

        {/* Language Selection Card Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-start relative mb-4">
          {/* Patient Language Box */}
          <div className="relative">
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
              Patient Language (From)
            </label>
            <button
              type="button"
              onClick={() => {
                setOpenFromDropdown(!openFromDropdown);
                setOpenToDropdown(false);
              }}
              className="w-full flex items-center justify-between p-4 neu-card rounded-2xl text-left cursor-pointer hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center gap-3.5">
                <span className="text-3xl">{patientLang.flag}</span>
                <div>
                  <div className="font-extrabold text-slate-900 text-base">{patientLang.name}</div>
                  <div className="text-xs text-slate-500 font-medium">{patientLang.nativeName}</div>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openFromDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {openFromDropdown && (
              <div className="absolute z-30 top-full mt-2 left-0 right-0 neu-card rounded-2xl max-h-64 overflow-y-auto p-2 space-y-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={`from-${lang.id}`}
                    onClick={() => {
                      onSelectPatientLang(lang);
                      setOpenFromDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                      patientLang.id === lang.id ? 'neu-pressed text-blue-700 font-extrabold' : 'hover:bg-slate-200/50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-bold text-sm">{lang.name}</span>
                      <span className="text-xs text-slate-500">({lang.nativeName})</span>
                    </div>
                    {lang.isDownloaded && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full neu-pill text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Offline
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Doctor Language Box */}
          <div className="relative">
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
              Doctor Language (To)
            </label>
            <button
              type="button"
              onClick={() => {
                setOpenToDropdown(!openToDropdown);
                setOpenFromDropdown(false);
              }}
              className="w-full flex items-center justify-between p-4 neu-card rounded-2xl text-left cursor-pointer hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center gap-3.5">
                <span className="text-3xl">{doctorLang.flag}</span>
                <div>
                  <div className="font-extrabold text-slate-900 text-base">{doctorLang.name}</div>
                  <div className="text-xs text-slate-500 font-medium">{doctorLang.nativeName}</div>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openToDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {openToDropdown && (
              <div className="absolute z-30 top-full mt-2 left-0 right-0 neu-card rounded-2xl max-h-64 overflow-y-auto p-2 space-y-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={`to-${lang.id}`}
                    onClick={() => {
                      onSelectDoctorLang(lang);
                      setOpenToDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                      doctorLang.id === lang.id ? 'neu-pressed text-blue-700 font-extrabold' : 'hover:bg-slate-200/50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-bold text-sm">{lang.name}</span>
                      <span className="text-xs text-slate-500">({lang.nativeName})</span>
                    </div>
                    {lang.isDownloaded && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full neu-pill text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Offline
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Swap Button In-Between */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={onSwapLanguages}
            className="px-5 py-2.5 rounded-2xl neu-button text-slate-800 hover:text-blue-700 flex items-center gap-2 cursor-pointer font-bold text-xs"
            title="Swap Languages"
          >
            <ArrowUpDown className="w-4 h-4 text-blue-600 stroke-[2.4]" />
            <span>Swap Translation Direction</span>
          </button>
        </div>

        {/* Offline Pack Status Badge */}
        <div className="mt-8 p-4 neu-card rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl neu-pressed text-emerald-600 flex items-center justify-center shrink-0">
              <DownloadCloud className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                <span>Indian Offline Speech Engine</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Loaded language models ({patientLang.name} & {doctorLang.name})
              </div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full neu-pill text-emerald-700 flex items-center justify-center shrink-0 font-bold">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="pt-6">
        <button
          onClick={() => onNavigate('patient_translation')}
          className="w-full h-14 rounded-2xl neu-button-primary font-black text-base flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <span>Continue to Translation Console</span>
          <span aria-hidden="true" className="text-xl">&rarr;</span>
        </button>
      </div>
    </div>
  );
};

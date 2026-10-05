import React, { useState } from 'react';
import { ArrowLeft, Check, ShieldAlert, Sparkles } from 'lucide-react';
import { ScreenId, PainSeverity } from '../../types';
import bodyFrontImg from '../../assets/body_muscle_front.jpg';
import bodyBackImg from '../../assets/body_muscle_back.jpg';

interface BodyMapScreenProps {
  onNavigate: (screen: ScreenId) => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  painSeverity: PainSeverity;
  onChangeSeverity: (severity: PainSeverity) => void;
}

interface BodyRegion {
  id: string;
  name: string;
  hindiName: string;
  cx: number;
  cy: number;
  view: 'front' | 'back' | 'both';
}

const BODY_REGIONS: BodyRegion[] = [
  { id: 'head', name: 'Head & Cranial', hindiName: 'सिर और खोपड़ी', cx: 100, cy: 30, view: 'both' },
  { id: 'neck', name: 'Neck & Cervical', hindiName: 'गर्दन', cx: 100, cy: 46, view: 'both' },
  { id: 'right_shoulder', name: 'Right Shoulder', hindiName: 'दायां कंधा', cx: 68, cy: 62, view: 'both' },
  { id: 'left_shoulder', name: 'Left Shoulder', hindiName: 'बायां कंधा', cx: 132, cy: 62, view: 'both' },
  { id: 'chest', name: 'Chest & Pectoral', hindiName: 'सीना व फेफड़े', cx: 100, cy: 74, view: 'front' },
  { id: 'upper_back', name: 'Upper Back & Scapula', hindiName: 'पीठ का ऊपरी भाग', cx: 100, cy: 76, view: 'back' },
  { id: 'stomach', name: 'Abdomen & Stomach', hindiName: 'पेट और आंत', cx: 100, cy: 104, view: 'front' },
  { id: 'lower_back', name: 'Lumbar & Lower Back', hindiName: 'कमर का निचला हिस्सा', cx: 100, cy: 118, view: 'back' },
  { id: 'arms', name: 'Arms & Elbows', hindiName: 'हाथ और कोहनी', cx: 52, cy: 110, view: 'both' },
  { id: 'pelvis', name: 'Pelvis & Groin', hindiName: 'कमर और पेल्विस', cx: 100, cy: 136, view: 'front' },
  { id: 'thighs', name: 'Thighs & Hamstrings', hindiName: 'जांघें', cx: 88, cy: 162, view: 'both' },
  { id: 'knees', name: 'Knees & Joints', hindiName: 'घुटने और जोड़', cx: 100, cy: 194, view: 'both' },
  { id: 'ankles', name: 'Calves & Ankles', hindiName: 'पिंडली और टखने', cx: 100, cy: 236, view: 'both' },
];

export const BodyMapScreen: React.FC<BodyMapScreenProps> = ({
  onNavigate,
  selectedLocation,
  onSelectLocation,
  painSeverity,
  onChangeSeverity,
}) => {
  const [currentView, setCurrentView] = useState<'front' | 'back'>('front');
  const [confirmed, setConfirmed] = useState(false);

  const activeRegion = BODY_REGIONS.find((r) => r.id === selectedLocation) || BODY_REGIONS[4];

  const handleSelectRegion = (regionId: string) => {
    onSelectLocation(regionId);
    setConfirmed(false);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      onNavigate('emergency');
    }, 400);
  };

  const visibleRegions = BODY_REGIONS.filter(
    (r) => r.view === 'both' || r.view === currentView
  );

  return (
    <div className="flex flex-col justify-between h-full min-h-[640px] p-5 sm:p-7 bg-[#eef3fa] text-slate-800 relative overflow-y-auto rounded-3xl">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('symptoms')}
              className="neu-button p-2.5 rounded-2xl text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                Anatomical Pain Locator
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Tap on any body dot to pinpoint pain & severity
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 neu-pressed px-3 py-1.5 rounded-full text-xs font-bold text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive 3D Map</span>
          </div>
        </div>

        {/* Main Canvas Area: Anatomical Muscle Model on Left, Pain Level Card on Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Anatomical Body Image Column */}
          <div className="md:col-span-7 neu-card p-4 rounded-3xl flex flex-col items-center justify-center">
            {/* Front/Back View Pill Selector Top */}
            <div className="w-full mb-3 p-1 neu-pressed rounded-2xl flex items-center">
              <button
                type="button"
                onClick={() => setCurrentView('front')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  currentView === 'front'
                    ? 'neu-pill text-blue-700 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Anterior (Front View)
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('back')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  currentView === 'back'
                    ? 'neu-pill text-blue-700 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Posterior (Back View)
              </button>
            </div>

            <div className="relative w-full max-w-[280px] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center bg-slate-900/5 p-1">
              {/* Muscle System Background Image */}
              <img
                src={currentView === 'front' ? bodyFrontImg : bodyBackImg}
                alt={`Human Anatomical Muscle Model - ${currentView === 'front' ? 'Anterior' : 'Posterior'} View`}
                className="w-full h-auto max-h-[350px] object-contain rounded-xl select-none filter drop-shadow-md"
              />

              {/* Interactive SVG Pin Overlay with small refined dots */}
              <svg
                viewBox="0 0 200 270"
                className="absolute inset-0 w-full h-full select-none pointer-events-auto"
              >
                <defs>
                  <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {visibleRegions.map((region) => {
                  const isSelected = selectedLocation === region.id;
                  return (
                    <g
                      key={region.id}
                      onClick={() => handleSelectRegion(region.id)}
                      className="cursor-pointer group"
                    >
                      {/* Large Invisible Hit Target for easy tapping on mobile and desktop */}
                      <circle
                        cx={region.cx}
                        cy={region.cy}
                        r="18"
                        fill="transparent"
                        className="cursor-pointer"
                      />

                      {/* Active Pulsing Ring */}
                      {isSelected && (
                        <>
                          <circle
                            cx={region.cx}
                            cy={region.cy}
                            r="14"
                            fill="#ef4444"
                            fillOpacity="0.25"
                            className="animate-ping"
                          />
                          <circle
                            cx={region.cx}
                            cy={region.cy}
                            r="9"
                            fill="#ef4444"
                            fillOpacity="0.4"
                            filter="url(#dot-glow)"
                          />
                        </>
                      )}

                      {/* Small Sleek Dot Circle */}
                      <circle
                        cx={region.cx}
                        cy={region.cy}
                        r={isSelected ? 6 : 4.5}
                        fill={isSelected ? '#dc2626' : '#2563eb'}
                        stroke="#ffffff"
                        strokeWidth={isSelected ? 2 : 1.5}
                        className="transition-all duration-200 shadow-sm transform group-hover:scale-125"
                      />

                      {/* Center Pin Accent */}
                      <circle
                        cx={region.cx}
                        cy={region.cy}
                        r={isSelected ? 2 : 1.2}
                        fill="#ffffff"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Quick Region Pill Bar */}
            <div className="w-full mt-3 flex flex-wrap gap-1.5 justify-center">
              {visibleRegions.slice(0, 6).map((region) => {
                const isSelected = selectedLocation === region.id;
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => handleSelectRegion(region.id)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'neu-pressed border border-blue-500/80 text-blue-700 font-extrabold'
                        : 'neu-button text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {region.name.split('&')[0].trim()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pain Level Controls Right Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="p-5 neu-card rounded-3xl space-y-4">
              <div className="text-center pb-3 border-b border-slate-200/60">
                <span className="text-lg font-black text-slate-900 block">
                  {activeRegion.name}
                </span>
                <span className="text-xs text-blue-600 font-bold">
                  {activeRegion.hindiName}
                </span>
              </div>

              <div className="space-y-2.5">
                <span className="block text-xs font-black text-slate-600 uppercase tracking-wider text-center">
                  Select Pain Severity Grade
                </span>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => onChangeSeverity('mild')}
                    className={`w-full py-2.5 px-3.5 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                      painSeverity === 'mild'
                        ? 'neu-pressed border-2 border-amber-500 text-amber-900'
                        : 'neu-button text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span>Mild Discomfort</span>
                    <span className="neu-pill px-2 py-0.5 text-[10px]">1-3</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeSeverity('moderate')}
                    className={`w-full py-2.5 px-3.5 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                      painSeverity === 'moderate'
                        ? 'neu-pressed border-2 border-orange-500 text-orange-900'
                        : 'neu-button text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span>Moderate Pain</span>
                    <span className="neu-pill px-2 py-0.5 text-[10px]">4-6</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeSeverity('severe')}
                    className={`w-full py-2.5 px-3.5 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                      painSeverity === 'severe'
                        ? 'neu-button-emergency ring-2 ring-red-400'
                        : 'neu-button text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span>Severe / Unbearable</span>
                    <span className="bg-white text-red-600 font-black rounded-full px-2 py-0.5 text-[10px]">7-10</span>
                  </button>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full py-3.5 rounded-2xl neu-button-primary font-black text-xs cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                {confirmed ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Saved to Triage!</span>
                  </>
                ) : (
                  <span>Confirm Location & Severity</span>
                )}
              </button>
            </div>

            {/* Quick alert reminder */}
            {painSeverity === 'severe' && (
              <div className="p-4 neu-card border border-red-500/40 rounded-3xl text-xs text-red-800 font-extrabold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>Immediate Emergency protocol indicated</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

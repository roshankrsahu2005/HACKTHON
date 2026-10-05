import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BellRing,
  Volume2,
  HeartCrack,
  Droplets,
  UserX,
  AlertTriangle,
  Baby,
  Siren,
  PhoneCall,
  Share2,
  Copy,
  Check,
  ShieldAlert,
  Flame,
  Activity,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ScreenId, EmergencyAction, Language } from '../../types';
import { EMERGENCY_ACTIONS } from '../../data/mockData';
import { playTextToSpeech, stopTextToSpeech } from '../../utils/audio';
import { syncEmergencyAlertToSupabase } from '../../utils/supabase';
import { LungsIcon } from '../icons/MedicalIcons';

interface EmergencyScreenProps {
  onNavigate: (screen: ScreenId) => void;
  patientLang?: Language;
  doctorLang?: Language;
}

// First-Aid clinical action protocols
const FIRST_AID_PROTOCOLS: Record<
  string,
  {
    title: string;
    hindiTitle: string;
    priority: string;
    stepsEn: string[];
    stepsHi: string[];
    bystanderAudioHi: string;
    doctorAudioEn: string;
  }
> = {
  chest_pain: {
    title: 'Acute Coronary / Severe Chest Pain',
    hindiTitle: 'गंभीर सीने में दर्द (हार्ट अटैक संकेत)',
    priority: 'CODE RED - Immediate ECG & IV Access',
    stepsEn: [
      'Keep patient sitting upright in a comfortable position — DO NOT let them walk.',
      'Loosen tight clothing around neck and chest to assist ventilation.',
      'Administer Aspirin 300mg (chewable) if no contraindications or active bleeding.',
      'Check radial pulse, oxygen saturation (SpO2), and prepare emergency ECG leads.'
    ],
    stepsHi: [
      'मरीज को आरामदायक स्थिति में सीधा बिठाएं — उन्हें चलने या लेटने न दें।',
      'गर्दन और सीने के आसपास के तंग कपड़े ढीले करें ताकि सांस लेने में आसानी हो।',
      'यदि डॉक्टर की सलाह हो तो एस्पिरिन 300mg चबाने को दें।',
      'नाड़ी (Pulse) और ऑक्सीजन लेवल चेक करें, तुरंत इमरजेंसी टीम को बुलाएं।'
    ],
    bystanderAudioHi: 'आपातकालीन सूचना! मरीज को सीने में तेज दर्द है। मरीज को सीधा बिठाएं, शांत रखें और गहरी सांस लेने दें। डॉक्टर सहायता आ रही है।',
    doctorAudioEn: 'Code Red cardiac alert! Patient reports severe crushing chest pain radiating to left arm. Immediate trauma and cardiology evaluation required.'
  },
  cant_breathe: {
    title: 'Severe Respiratory Distress / Dyspnea',
    hindiTitle: 'सांस लेने में भारी तकलीफ / घुटन',
    priority: 'CODE RED - High Flow Oxygen Support',
    stepsEn: [
      'Place patient in High-Fowler position (sitting upright leaning slightly forward).',
      'Check airway for acute foreign body obstruction or stridor.',
      'Initiate 10-15 L/min high-flow oxygen via non-rebreather mask (target SpO2 > 94%).',
      'Prepare nebulization (Salbutamol + Ipratropium) if severe bronchospasm is suspected.'
    ],
    stepsHi: [
      'मरीज को सीधा बिठाकर हल्का आगे की ओर झुकाएं (High-Fowler पोजीशन)।',
      'गले में कोई रुकावट तो नहीं है तुरंत जांचें और हवा का रास्ता साफ रखें।',
      'हाई-फ्लो ऑक्सीजन मास्क तुरंत लगाएं।',
      'यदि अस्थमा का इनहेलर या नेबुलाइजर उपलब्ध हो तो तुरंत उपयोग करें।'
    ],
    bystanderAudioHi: 'आपातकालीन सूचना! मरीज को सांस लेने में गंभीर तकलीफ हो रही है। मरीज को आगे झुकाकर बिठाएं और तुरंत ऑक्सीजन सपोर्ट शुरू करें।',
    doctorAudioEn: 'Code Red respiratory alert! Patient in severe respiratory distress with dyspnea. Immediate airway management and high-flow oxygen needed.'
  },
  bleeding: {
    title: 'Severe Uncontrolled Hemorrhage / Bleeding',
    hindiTitle: 'अत्यधिक रक्तस्राव / खून बहना',
    priority: 'CODE RED - Direct Hemostatic Pressure',
    stepsEn: [
      'Apply continuous, firm direct pressure over the wound using a clean gauze or cloth.',
      'Elevate the bleeding extremity above heart level if no fracture is suspected.',
      'If bleeding does not stop from arterial limb wound, apply a tourniquet 2-3 inches above wound.',
      'Keep patient warm with a thermal blanket to prevent hypothermia and hemorrhagic shock.'
    ],
    stepsHi: [
      'घाव पर साफ कपड़े या पट्टी से लगातार मजबूत दबाव (Direct Pressure) बनाए रखें।',
      'यदि हड्डी न टूटी हो तो खून बहने वाले अंग को दिल के स्तर से ऊपर उठाएं।',
      'यदि खून बहना न रुके तो घाव से 2-3 इंच ऊपर कसकर पट्टी (Tourniquet) बांधें।',
      'मरीज को कंबल से ढककर रखें ताकि शॉक और ठंड लगने से बचाया जा सके।'
    ],
    bystanderAudioHi: 'आपातकालीन चेतावनी! अत्यधिक खून बह रहा है। घाव पर तुरंत साफ कपड़े से कसकर लगातार दबाव बनाए रखें।',
    doctorAudioEn: 'Trauma Code Red! Massive uncontrolled hemorrhage. Immediate surgical hemostasis, IV fluid resuscitation, and blood typing required.'
  },
  unconscious: {
    title: 'Unconscious Patient / Cardiac Arrest Protocol',
    hindiTitle: 'बेहोशी / कार्डियक अरेस्ट प्रोटोकॉल',
    priority: 'CODE RED - CPR 100-120 BPM Metronome',
    stepsEn: [
      'Check for responsiveness: Tap shoulders firmly and ask "Are you okay?".',
      'Check carotid pulse and breathing for NO MORE than 10 seconds.',
      'If no pulse/breathing: START CPR IMMEDIATELY (30 compressions : 2 rescue breaths).',
      'Push hard and fast in center of chest at 100-120 BPM (2 inches / 5 cm deep).'
    ],
    stepsHi: [
      'प्रतिक्रिया जांचें: कंधे थपथपाएं और पूछें "क्या आप ठीक हैं?"।',
      'गले की नाड़ी (Carotid Pulse) और सांस को 10 सेकंड से कम में जांचें।',
      'यदि सांस या नाड़ी न मिले: तुरंत CPR शुरू करें (30 बार सीना दबाएं : 2 बार मुंह से सांस दें)।',
      'सीने के बीच में 100-120 प्रति मिनट की गति से 2 इंच गहराई तक तेजी से दबाएं।'
    ],
    bystanderAudioHi: 'अति-आपातकालीन चेतावनी! मरीज बेहोश है। नाड़ी जांचें और तुरंत CPR शुरू करें। सीने के बीच में तेज गति से लगातार दबाव दें।',
    doctorAudioEn: 'Code Blue Resuscitation! Unresponsive patient with suspected arrest. Crash cart, defibrillator, and airway intubation team stat!'
  },
  allergy: {
    title: 'Anaphylaxis / Severe Allergic Reaction',
    hindiTitle: 'गंभीर एलर्जी / एनाफिलेक्सिस अटैक',
    priority: 'CODE RED - Intramuscular Epinephrine',
    stepsEn: [
      'Administer Epinephrine (EpiPen) 0.3mg - 0.5mg intramuscularly in anterolateral thigh.',
      'Lay patient flat with legs elevated (Trendelenburg) unless in severe breathing difficulty.',
      'Administer IV antihistamines (Diphenhydramine 50mg) and IV Corticosteroids.',
      'Monitor for biphasic reaction, airway edema, and prepare for endotracheal intubation.'
    ],
    stepsHi: [
      'जांघ के बाहरी हिस्से में तुरंत एपिनेफ्रीन (EpiPen) इंजेक्शन लगाएं।',
      'मरीज को सीधा लिटाकर पैर थोड़े ऊपर उठाएं (जब तक सांस में गंभीर रुकावट न हो)।',
      'एंटीहिस्टामाइन और स्टेरॉयड दवा तुरंत दें।',
      'गले की सूजन और सांस की नली पर लगातार नजर रखें।'
    ],
    bystanderAudioHi: 'आपातकालीन चेतावनी! गंभीर एलर्जी और एनाफिलेक्सिस अटैक। तुरंत एपिनेफ्रीन इंजेक्शन लगाएं और सांस की नली खुली रखें।',
    doctorAudioEn: 'Anaphylaxis emergency! Patient exhibiting acute airway compromise and systemic allergic shock. Epinephrine and airway support stat.'
  },
  pregnancy: {
    title: 'Obstetric & Maternal Emergency',
    hindiTitle: 'गर्भावस्था आपातकाल / प्रसव संकट',
    priority: 'CODE RED - Left Lateral Recumbent Position',
    stepsEn: [
      'Position patient immediately on her LEFT LATERAL side to relieve vena cava compression.',
      'Administer high-flow supplemental oxygen (8-10 L/min via mask).',
      'Check for active vaginal bleeding, crowning, or severe hypertensive crisis (Preeclampsia).',
      'Alert OB/GYN trauma team and prepare neonatal resuscitation unit.'
    ],
    stepsHi: [
      'गर्भवती महिला को तुरंत बाईं करवट (Left Lateral) लिटाएं ताकि रक्त संचार बना रहे।',
      'ऑक्सीजन मास्क लगाकर तुरंत ऑक्सीजन सपोर्ट शुरू करें।',
      'रक्तस्राव या तेज दर्द की जांच करें, तुरंत स्त्री रोग (OB/GYN) इमरजेंसी टीम को बुलाएं।'
    ],
    bystanderAudioHi: 'आपातकालीन चेतावनी! गर्भवती महिला को तुरंत बाईं करवट लिटाएं और ऑक्सीजन सपोर्ट दें। प्रसूति इमरजेंसी टीम तुरंत पहुंचे।',
    doctorAudioEn: 'Obstetric Code Red! Maternal patient in acute distress. Immediate OB/GYN evaluation, left lateral positioning, and fetal monitoring required.'
  }
};

export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({ onNavigate }) => {
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyAction>(EMERGENCY_ACTIONS[1]); // Default severe chest pain
  const [broadcastAudience, setBroadcastAudience] = useState<'doctor' | 'patient'>('doctor');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isCprActive, setIsCprActive] = useState(false);
  const [cprBeat, setCprBeat] = useState(false);

  // Active protocol
  const activeProtocol =
    FIRST_AID_PROTOCOLS[selectedEmergency.id] || FIRST_AID_PROTOCOLS['chest_pain'];

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopTextToSpeech();
    };
  }, []);

  // Web Audio API Emergency Siren/Chime
  const playSirenBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // ignore
    }
  };

  // 100-120 BPM CPR Metronome Effect (when CPR guide is active)
  useEffect(() => {
    let interval: any;
    if (isCprActive && selectedEmergency.id === 'unconscious') {
      // 110 BPM = ~545ms interval
      interval = setInterval(() => {
        setCprBeat((prev) => !prev);
      }, 545);
    } else {
      setCprBeat(false);
    }
    return () => clearInterval(interval);
  }, [isCprActive, selectedEmergency.id]);

  // Handle High-Priority Audio Broadcast
  const handleBroadcastAudio = () => {
    if (isPlayingAudio) {
      stopTextToSpeech();
      setIsPlayingAudio(false);
      return;
    }

    playSirenBeep();

    // Sync to Supabase Realtime table
    syncEmergencyAlertToSupabase({
      alert_type: selectedEmergency.id,
      title: selectedEmergency.title,
      detail: `${selectedEmergency.detail} [Audience: ${broadcastAudience.toUpperCase()}]`,
      language: broadcastAudience === 'doctor' ? 'English (Clinical Code)' : 'Hindi (Bystander)',
      severity: 'critical',
      status: 'ACTIVE'
    });

    const textToSpeak =
      broadcastAudience === 'doctor'
        ? activeProtocol.doctorAudioEn
        : activeProtocol.bystanderAudioHi;

    const langCode = broadcastAudience === 'doctor' ? 'en-US' : 'hi-IN';

    playTextToSpeech(
      textToSpeak,
      langCode,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  // Generate formatted dispatch payload for paramedic / WhatsApp share
  const generateDispatchReport = () => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `🚨 [CRITICAL MEDICAL SOS DISPATCH - HEAR2HEAL] 🚨
------------------------------------------------
📍 Condition: ${selectedEmergency.title} (${selectedEmergency.hindiTitle})
🔴 Triage Severity: CRITICAL CODE RED
⏰ Time: ${timeString}
🏥 Clinical Protocol: ${activeProtocol.priority}
📋 Priority Action:
${activeProtocol.stepsEn.map((s, i) => `${i + 1}. ${s}`).join('\n')}
------------------------------------------------
📞 Emergency Hotline Dispatched: 108 (National Ambulance / ER)`;
  };

  const handleCopyDispatch = () => {
    const report = generateDispatchReport();
    navigator.clipboard.writeText(report);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const report = generateDispatchReport();
    const url = `https://wa.me/?text=${encodeURIComponent(report)}`;
    window.open(url, '_blank');
  };

  const renderEmergencyIcon = (id: string) => {
    switch (id) {
      case 'cant_breathe':
        return (
          <div className="w-11 h-11 rounded-2xl bg-red-100/80 flex items-center justify-center text-red-600 shadow-sm">
            <LungsIcon className="w-6 h-6" />
          </div>
        );
      case 'chest_pain':
        return (
          <div className="w-11 h-11 rounded-2xl bg-red-100/80 flex items-center justify-center text-red-600 shadow-sm">
            <HeartCrack className="w-6 h-6" />
          </div>
        );
      case 'bleeding':
        return (
          <div className="w-11 h-11 rounded-2xl bg-red-100/80 flex items-center justify-center text-red-600 shadow-sm">
            <Droplets className="w-6 h-6" />
          </div>
        );
      case 'unconscious':
        return (
          <div className="w-11 h-11 rounded-2xl bg-red-100/80 flex items-center justify-center text-red-600 shadow-sm">
            <UserX className="w-6 h-6" />
          </div>
        );
      case 'allergy':
        return (
          <div className="w-11 h-11 rounded-2xl bg-red-100/80 flex items-center justify-center text-red-600 shadow-sm">
            <AlertTriangle className="w-6 h-6" />
          </div>
        );
      case 'pregnancy':
        return (
          <div className="w-11 h-11 rounded-2xl bg-red-100/80 flex items-center justify-center text-red-600 shadow-sm">
            <Baby className="w-6 h-6" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex flex-col justify-between h-full min-h-[640px] bg-[#eef3fa] text-slate-800 relative transition-all duration-300 ${
        isPlayingAudio ? 'ring-8 ring-red-500/50' : ''
      }`}
    >
      {/* 1. HIGH-CONTRAST NEUMORPHIC RED HEADER */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-5 pt-4 pb-4 shadow-xl rounded-b-3xl relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <button
            onClick={() => onNavigate('patient_translation')}
            className="w-10 h-10 -ml-2 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
            aria-label="Back to Translation"
            title="Back to Patient Translation"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <Siren className="w-6 h-6 animate-bounce text-red-200" />
            <div className="text-center">
              <h2 className="text-lg font-black tracking-tight leading-tight">Emergency SOS Station</h2>
              <p className="text-[10px] text-red-100 font-bold uppercase tracking-widest">
                Critical Triage & Rapid Dispatch
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-red-800/60 border border-white/20 text-[10px] font-black uppercase tracking-wider text-red-100 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-300 animate-ping" />
            <span>LIVE</span>
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
        {/* 2. 1-TAP EMERGENCY 108 DISPATCH BAR */}
        <div className="neu-card p-3.5 rounded-2xl border border-red-200/80 bg-red-50/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-red-700 flex items-center gap-1.5 uppercase tracking-wider">
              <PhoneCall className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              <span>1-Tap Ambulance & ER Dispatch</span>
            </span>
            <span className="text-[10px] neu-pill px-2 py-0.5 text-red-700 font-extrabold">Emergency Hotline</span>
          </div>

          <div>
            <a
              href="tel:108"
              className="w-full py-2.5 px-4 rounded-xl neu-button flex items-center justify-between transition-all hover:scale-[1.01] active:scale-95 group cursor-pointer border border-red-200/60 bg-white"
              title="Call 108 Ambulance"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🚑</span>
                <div className="text-left">
                  <div className="text-sm font-black text-red-700 group-hover:text-red-800">Call 108 Emergency Ambulance</div>
                  <div className="text-[10px] text-slate-500 font-semibold leading-tight">Direct National Medical Trauma & Ambulance Response</div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-black shadow-sm group-hover:bg-red-700 transition-colors">
                DIAL 108
              </span>
            </a>
          </div>
        </div>

        {/* 3. 6 QUICK-ACTION EMERGENCY TILES */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Select Critical Condition
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Tap to load protocol</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {EMERGENCY_ACTIONS.map((item) => {
              const isSelected = selectedEmergency.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedEmergency(item);
                    if (item.id === 'unconscious') {
                      setIsCprActive(true);
                    } else {
                      setIsCprActive(false);
                    }
                  }}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all cursor-pointer text-center group ${
                    isSelected
                      ? 'neu-pressed border-2 border-red-500/80 bg-red-50/60 scale-[1.02]'
                      : 'neu-card hover:scale-[1.02]'
                  }`}
                >
                  {renderEmergencyIcon(item.id)}

                  <span className="mt-2 text-xs font-black text-slate-800 leading-tight">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-red-600 mt-0.5 font-bold">
                    {item.hindiTitle}
                  </span>

                  {isSelected && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. IMMEDIATE FIRST-AID & CPR ACTION GUIDE CARD */}
        <div className="p-4 neu-card rounded-3xl border-2 border-red-500/30 space-y-3 bg-white/70">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  First-Aid Action Protocol
                </h3>
              </div>
              <p className="text-[11px] text-red-600 font-bold mt-0.5">
                {activeProtocol.priority}
              </p>
            </div>

            {/* CPR Metronome Pulse Widget (for unconscious patient) */}
            {selectedEmergency.id === 'unconscious' && (
              <div className="flex items-center gap-2 neu-pill px-3 py-1 bg-red-100 text-red-800">
                <Activity className={`w-3.5 h-3.5 ${cprBeat ? 'scale-125 text-red-600' : 'text-slate-400'}`} />
                <span className="text-[10px] font-black font-mono">110 BPM CPR RHYTHM</span>
              </div>
            )}
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-2">
            {activeProtocol.stepsEn.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-800">
                <span className="w-5 h-5 rounded-full neu-raised text-red-600 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <span>{step}</span>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5 italic">
                    {activeProtocol.stepsHi[idx]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. DUAL-AUDIENCE BROADCAST SELECTOR & DISPATCH SHARE */}
        <div className="p-4 neu-card rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span>Broadcast Target Audience</span>
            </span>
            <span className="text-[10px] neu-pill px-2 py-0.5 text-blue-700 font-extrabold">Bilingual SOS</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBroadcastAudience('doctor')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                broadcastAudience === 'doctor'
                  ? 'neu-pressed border-2 border-blue-600 text-blue-900 bg-blue-50/50'
                  : 'neu-button text-slate-700'
              }`}
            >
              <span>👨‍⚕️ Staff Code (English)</span>
            </button>
            <button
              type="button"
              onClick={() => setBroadcastAudience('patient')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                broadcastAudience === 'patient'
                  ? 'neu-pressed border-2 border-red-600 text-red-900 bg-red-50/50'
                  : 'neu-button text-slate-700'
              }`}
            >
              <span>📢 Patient / Hindi</span>
            </button>
          </div>

          {/* WhatsApp / Clipboard Dispatch Actions */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
            <button
              type="button"
              onClick={handleCopyDispatch}
              className="flex-1 py-2 px-3 rounded-xl neu-button text-xs font-bold text-slate-700 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Dispatch Log</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share to WhatsApp ER</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. BOTTOM HIGH-PRIORITY BROADCAST TRIGGER */}
      <div className="p-4 bg-[#eef3fa] border-t border-slate-200/60">
        <button
          type="button"
          onClick={handleBroadcastAudio}
          className={`w-full py-4 px-5 rounded-2xl text-white font-extrabold flex items-center justify-center gap-3 transition-all cursor-pointer neu-button-emergency shadow-xl ${
            isPlayingAudio ? 'animate-pulse scale-[0.98]' : 'active:scale-[0.98] hover:scale-[1.01]'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            {isPlayingAudio ? (
              <Volume2 className="w-6 h-6 animate-bounce text-white" />
            ) : (
              <BellRing className="w-6 h-6 text-white animate-pulse" />
            )}
          </div>
          <div className="text-left">
            <div className="text-sm font-black tracking-wide text-white">
              {isPlayingAudio
                ? 'Broadcasting Live Emergency Announcement...'
                : `Broadcast Audio Alert (${broadcastAudience === 'doctor' ? 'Staff - English' : 'Patient - Hindi'})`}
            </div>
            <div className="text-[11px] text-red-100 font-medium">
              Plays synthesized emergency announcement + syncs to Supabase Cloud
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

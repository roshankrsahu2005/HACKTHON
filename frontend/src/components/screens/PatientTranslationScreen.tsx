import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Mic,
  MicOff,
  Keyboard,
  Activity,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Bot,
  ShieldAlert,
  Stethoscope,
  CheckCircle2,
  Globe2,
  Zap,
  RotateCcw,
  Trash2,
  X,
  MessageSquare,
  Send,
  User,
  UserCheck,
  Languages,
  Clock,
  Sparkle,
  Reply,
  CornerDownLeft
} from 'lucide-react';
import { ScreenId, Language } from '../../types';
import { playTextToSpeech, stopTextToSpeech } from '../../utils/audio';
import {
  processPatientSpeech,
  EMERGENCY_PRESETS,
  PatientAnalysisResult,
  EmergencyPreset
} from '../../utils/aiTranslator';
import { LANGUAGES } from '../../data/mockData';
import { syncTranslationToSupabase, syncConsultationToSupabase } from '../../utils/supabase';

const LANGUAGE_SPEECH_MAP: Record<string, string> = {
  hi: 'hi-IN',
  en: 'en-US',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  es: 'es-ES',
  ar: 'ar-SA',
  fr: 'fr-FR',
  ur: 'ur-PK'
};

interface ChatItem {
  id: string;
  sender: 'patient' | 'doctor';
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: string;
  triageLevel?: 'red' | 'yellow' | 'green';
}

const INITIAL_CHAT_MESSAGES: ChatItem[] = [
  {
    id: 'msg-1',
    sender: 'patient',
    originalText: 'डॉक्टर साहब, मुझे 2 घंटे से सीने में बहुत तेज दर्द हो रहा है और सांस फूल रही है।',
    translatedText: 'Doctor, I have had severe crushing chest pain for 2 hours and difficulty breathing.',
    sourceLang: 'Hindi',
    targetLang: 'English',
    timestamp: '10:14 AM',
    triageLevel: 'red'
  },
  {
    id: 'msg-2',
    sender: 'doctor',
    originalText: 'Where exactly is the pain radiating, and did it start suddenly?',
    translatedText: 'दर्द ठीक कहाँ फैल रहा है, और क्या यह अचानक शुरू हुआ था?',
    sourceLang: 'English',
    targetLang: 'Hindi',
    timestamp: '10:15 AM'
  },
  {
    id: 'msg-3',
    sender: 'patient',
    originalText: 'दर्द सीने के बीच में है और बाएं हाथ और जबड़े की तरफ जा रहा है।',
    translatedText: 'The pain is in the center of my chest radiating towards my left arm and jaw.',
    sourceLang: 'Hindi',
    targetLang: 'English',
    timestamp: '10:16 AM',
    triageLevel: 'red'
  }
];

const QUICK_CHAT_PROMPTS = [
  'Where is the pain radiating?',
  'When did these symptoms begin?',
  'Do you have any known drug allergies?',
  'Please take deep breaths and stay calm.'
];

// Contextual NLP Question-To-Answer Matching Engine
function generateContextualAutoReply(
  originalMsg: ChatItem,
  patientLang: Language
): { originalText: string; translatedText: string; sourceLang: string; targetLang: string; triageLevel?: 'red' | 'yellow' | 'green' } {
  const text = (originalMsg.originalText + ' ' + originalMsg.translatedText).toLowerCase();
  const isFromPatient = originalMsg.sender === 'patient';

  if (isFromPatient) {
    // -----------------------------------------------------------------
    // PATIENT ASKED / REPORTED SYMPTOMS -> DOCTOR ANSWERS CONTEXTUALLY
    // -----------------------------------------------------------------
    if (
      text.includes('chest') ||
      text.includes('सीने') ||
      text.includes('हार्ट') ||
      text.includes('छाती') ||
      text.includes('heart') ||
      text.includes('attack') ||
      originalMsg.triageLevel === 'red'
    ) {
      return {
        originalText:
          'Please keep sitting completely upright. We have prepared an emergency 12-lead ECG, blood cardiac markers, and starting oxygen support right away.',
        translatedText:
          patientLang.id === 'hi'
            ? 'कृपया बिल्कुल सीधे बैठे रहें। हमने 12-लीड ईसीजी, कार्डियक ब्लड टेस्ट और ऑक्सीजन सपोर्ट तुरंत शुरू कर दिया है।'
            : `[${patientLang.name}]: Please stay seated upright. ECG and oxygen support initiated immediately.`,
        sourceLang: 'English',
        targetLang: patientLang.name
      };
    } else if (
      text.includes('सांस') ||
      text.includes('breath') ||
      text.includes('दम') ||
      text.includes('घुटन') ||
      text.includes('asthma')
    ) {
      return {
        originalText:
          'We are initiating 10 L/min high-flow oxygen through non-rebreather mask and preparing bronchodilator nebulization. Lean slightly forward.',
        translatedText:
          patientLang.id === 'hi'
            ? 'हम 10 लीटर/मिनट हाई-फ्लो ऑक्सीजन मास्क लगा रहे हैं और नेबुलाइजर तैयार कर रहे हैं। हल्का आगे की ओर झुकें।'
            : `[${patientLang.name}]: High-flow oxygen and nebulization prepared. Please lean forward.`,
        sourceLang: 'English',
        targetLang: patientLang.name
      };
    } else if (
      text.includes('पेट') ||
      text.includes('stomach') ||
      text.includes('abdomen') ||
      text.includes('उल्टी') ||
      text.includes('vomit') ||
      text.includes('मरोड़')
    ) {
      return {
        originalText:
          'Do not consume any solid food or water right now. We are administering an IV antispasmodic and scheduling an emergency abdominal ultrasound.',
        translatedText:
          patientLang.id === 'hi'
            ? 'अभी कुछ भी ठोस खाना या पानी न पिएं। हम दर्द निवारक इंजेक्शन (IV) दे रहे हैं और तुरंत पेट का अल्ट्रासाउंड करवा रहे हैं।'
            : `[${patientLang.name}]: Do not eat or drink. IV antispasmodic and ultrasound prepared.`,
        sourceLang: 'English',
        targetLang: patientLang.name
      };
    } else if (
      text.includes('चक्कर') ||
      text.includes('dizzy') ||
      text.includes('faint') ||
      text.includes('बेहोश') ||
      text.includes('unconscious') ||
      text.includes('गिर')
    ) {
      return {
        originalText:
          'Lie flat immediately with your feet elevated to restore blood flow to the brain. We are starting an IV saline drip and checking blood glucose.',
        translatedText:
          patientLang.id === 'hi'
            ? 'तुरंत सीधे लेट जाएं और पैर थोड़े ऊपर उठाएं। हम ब्लड प्रेशर और शुगर चेक करके तुरंत ड्रिप (IV Fluids) शुरू कर रहे हैं।'
            : `[${patientLang.name}]: Lie flat with legs elevated. IV fluids and vitals check started.`,
        sourceLang: 'English',
        targetLang: patientLang.name
      };
    } else if (
      text.includes('खून') ||
      text.includes('bleeding') ||
      text.includes('चोट') ||
      text.includes('injury') ||
      text.includes('accident') ||
      text.includes('wound')
    ) {
      return {
        originalText:
          'Apply firm, direct pressure over the bleeding wound with clean gauze. Keep the injured area elevated above heart level.',
        translatedText:
          patientLang.id === 'hi'
            ? 'घाव पर साफ कपड़े या पट्टी से कसकर लगातार दबाव बनाए रखें। चोट वाले हिस्से को दिल के स्तर से ऊपर उठाएं।'
            : `[${patientLang.name}]: Apply direct pressure on wound and keep elevated.`,
        sourceLang: 'English',
        targetLang: patientLang.name
      };
    } else if (
      text.includes('बुखार') ||
      text.includes('fever') ||
      text.includes('तापमान') ||
      text.includes('ठंड') ||
      text.includes('temperature') ||
      text.includes('chills')
    ) {
      return {
        originalText:
          'We are administering Paracetamol 650mg for fever and sending blood samples for complete blood count (CBC) and screening.',
        translatedText:
          patientLang.id === 'hi'
            ? 'हम बुखार कम करने के लिए पैरासिटामोल 650mg दे रहे हैं और ब्लड टेस्ट (CBC) के लिए सैंपल ले रहे हैं।'
            : `[${patientLang.name}]: Administering antipyretic medication and ordering blood panel.`,
        sourceLang: 'English',
        targetLang: patientLang.name
      };
    } else if (
      text.includes('दवा') ||
      text.includes('medicine') ||
      text.includes('खानी') ||
      text.includes('tablet') ||
      text.includes('dose')
    ) {
      return {
        originalText:
          'Take the prescribed medicine twice daily after meals with water. Do not skip doses or take on an empty stomach.',
        translatedText:
          patientLang.id === 'hi'
            ? 'निर्धारित दवा दिन में दो बार खाना खाने के बाद ताजे पानी से लें। खाली पेट न लें।'
            : `[${patientLang.name}]: Take prescribed dosage twice daily after meals with water.`,
        sourceLang: 'English',
        targetLang: patientLang.name
      };
    } else {
      return {
        originalText:
          'Understood. The clinical triage team has recorded your condition and is examining your vitals. Please stay relaxed.',
        translatedText:
          patientLang.id === 'hi'
            ? 'समझ गया। मेडिकल टीम ने आपके लक्षणों को दर्ज कर लिया है और जांच कर रही है। कृपया शांत रहें।'
            : `[${patientLang.name}]: Clinical triage team is reviewing your symptoms. Please remain seated.`,
        sourceLang: 'English',
        targetLang: patientLang.name
      };
    }
  } else {
    // -----------------------------------------------------------------
    // DOCTOR ASKED A QUESTION -> PATIENT ANSWERS SPECIFICALLY
    // -----------------------------------------------------------------
    if (
      text.includes('radiat') ||
      text.includes('where') ||
      text.includes('कहाँ') ||
      text.includes('location') ||
      text.includes('जगह')
    ) {
      return {
        originalText: 'दर्द मेरे सीने के बीच में है और बाएं कंधे, हाथ और जबड़े की तरफ तेजी से फैल रहा है।',
        translatedText:
          'The pain is in the center of my chest radiating to my left shoulder, arm, and jaw.',
        sourceLang: patientLang.name,
        targetLang: 'English'
      };
    } else if (
      text.includes('when') ||
      text.includes('start') ||
      text.includes('begin') ||
      text.includes('कब') ||
      text.includes('time') ||
      text.includes('hours')
    ) {
      return {
        originalText:
          'यह दर्द लगभग 1 से 2 घंटे पहले अचानक भारी काम करते समय शुरू हुआ और लगातार बढ़ रहा है।',
        translatedText:
          'This pain started suddenly about 1 to 2 hours ago while doing physical work and is worsening.',
        sourceLang: patientLang.name,
        targetLang: 'English'
      };
    } else if (
      text.includes('allerg') ||
      text.includes('एलर्जी') ||
      text.includes('history') ||
      text.includes('bp') ||
      text.includes('diabetes') ||
      text.includes('शुगर')
    ) {
      return {
        originalText:
          'मुझे पेनिसिलिन दवा से एलर्जी है और मैं पिछले 4 साल से ब्लड प्रेशर की गोली ले रहा हूँ।',
        translatedText:
          'I am allergic to Penicillin and I have been taking daily medication for High Blood Pressure for 4 years.',
        sourceLang: patientLang.name,
        targetLang: 'English'
      };
    } else if (
      text.includes('breath') ||
      text.includes('deep') ||
      text.includes('गहरी') ||
      text.includes('calm') ||
      text.includes('शांत')
    ) {
      return {
        originalText:
          'जी डॉक्टर साहब, मैं गहरी सांस ले रहा हूँ, लेकिन सांस अंदर खींचने पर सीने में भारीपन लग रहा है।',
        translatedText:
          'Yes doctor, I am taking deep breaths, but it feels heavy in my chest when inhaling.',
        sourceLang: patientLang.name,
        targetLang: 'English'
      };
    } else if (
      text.includes('fever') ||
      text.includes('vomit') ||
      text.includes('बुखार') ||
      text.includes('उल्टी')
    ) {
      return {
        originalText:
          'हाँ डॉक्टर साहब, कल रात से तेज बुखार और ठंड लग रही है, और सुबह दो बार उल्टी हुई है।',
        translatedText:
          'Yes doctor, high fever and chills since last night, and I vomited twice this morning.',
        sourceLang: patientLang.name,
        targetLang: 'English'
      };
    } else {
      return {
        originalText:
          'जी डॉक्टर साहब, मैं आपकी बात समझ गया/गई। आप जैसा कह रहे हैं मैं वैसा ही कर रहा/रही हूँ।',
        translatedText:
          'Yes doctor, I understood your instruction. I am following exactly as you advised.',
        sourceLang: patientLang.name,
        targetLang: 'English'
      };
    }
  }
}

interface PatientTranslationScreenProps {
  onNavigate: (screen: ScreenId) => void;
  patientLang: Language;
  doctorLang: Language;
  onSelectPatientLang?: (lang: Language) => void;
  onSelectDoctorLang?: (lang: Language) => void;
}

export const PatientTranslationScreen: React.FC<PatientTranslationScreenProps> = ({
  onNavigate,
  patientLang,
  doctorLang,
  onSelectPatientLang,
  onSelectDoctorLang
}) => {
  // Screen sub-view tab: 'triage' (Voice Triage view - default) or 'chat' (Bilingual Chat view)
  const [activeViewMode, setActiveViewMode] = useState<'triage' | 'chat'>('triage');

  // AI Auto-Detection Mode (default ON for emergency readiness)
  const [isAutoDetectMode, setIsAutoDetectMode] = useState<boolean>(true);

  // Doctor preferred output language: 'en' (English) or 'hi' (Hindi)
  const [doctorOutputLangId, setDoctorOutputLangId] = useState<'en' | 'hi'>('en');

  // Input & analysis state
  const [inputText, setInputText] = useState<string>(EMERGENCY_PRESETS[0].patientText);
  const [analysis, setAnalysis] = useState<PatientAnalysisResult>(() =>
    processPatientSpeech(EMERGENCY_PRESETS[0].patientText, 'en')
  );

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isTypingMode, setIsTypingMode] = useState<boolean>(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  // Active emergency preset selected (if any)
  const [activePresetId, setActivePresetId] = useState<string>('hindi-chest-pain');

  // Interactive Bilingual Chat State
  const [chatMessages, setChatMessages] = useState<ChatItem[]>(INITIAL_CHAT_MESSAGES);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatSender, setChatSender] = useState<'patient' | 'doctor'>('patient');
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isAutoReplyActive, setIsAutoReplyActive] = useState<boolean>(true);
  const [replyingTo, setReplyingTo] = useState<ChatItem | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (activeViewMode === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeViewMode]);

  // Clean up audio & speech recognition on unmount
  useEffect(() => {
    return () => {
      stopTextToSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Re-run analysis & query backend API whenever input text or doctor output language changes
  useEffect(() => {
    const localResult = processPatientSpeech(inputText, doctorOutputLangId);
    setAnalysis(localResult);

    if (isAutoDetectMode && onSelectPatientLang) {
      if (localResult.detectedLanguage.id !== patientLang.id) {
        onSelectPatientLang(localResult.detectedLanguage);
      }
    }

    let isCancelled = false;
    if (inputText.trim()) {
      fetch('http://localhost:5000/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          sourceLang: localResult.detectedLanguage.name,
          targetLang: doctorOutputLangId
        })
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((backendResult) => {
          if (backendResult && !isCancelled) {
            setAnalysis((prev) => ({
              ...prev,
              englishTranslation: backendResult.englishTranslation || prev.englishTranslation,
              hindiTranslation: backendResult.hindiTranslation || prev.hindiTranslation,
              doctorTranslation:
                doctorOutputLangId === 'hi'
                  ? backendResult.hindiTranslation || prev.hindiTranslation
                  : backendResult.englishTranslation || prev.englishTranslation,
              triageLevel: backendResult.triageLevel || prev.triageLevel,
              clinicalSummary: backendResult.clinicalSummary || prev.clinicalSummary,
              requiresImmediateSOS: backendResult.requiresImmediateSOS ?? prev.requiresImmediateSOS
            }));
          }
        })
        .catch(() => {});

      syncConsultationToSupabase({
        patient_id: 'P-' + Math.floor(1000 + Math.random() * 9000),
        patient_name: 'Walk-in Patient',
        source_text: inputText,
        detected_language: localResult.detectedLanguage.name,
        translated_text: localResult.doctorTranslation,
        triage_level: localResult.triageLevel,
        critical_symptoms: localResult.criticalSymptoms,
        clinical_summary: localResult.clinicalSummary
      });

      syncTranslationToSupabase(
        'patient',
        localResult.detectedLanguage.name,
        doctorOutputLangId === 'hi' ? 'Hindi' : 'English',
        inputText,
        localResult.doctorTranslation,
        localResult.triageLevel
      );
    }

    return () => {
      isCancelled = true;
    };
  }, [inputText, doctorOutputLangId, isAutoDetectMode]);

  // Sync doctorLang from parent if changed
  useEffect(() => {
    if (doctorLang.id === 'hi' || doctorLang.id === 'en') {
      setDoctorOutputLangId(doctorLang.id as 'en' | 'hi');
    }
  }, [doctorLang]);

  const handleToggleDoctorLang = (targetId: 'en' | 'hi') => {
    setDoctorOutputLangId(targetId);
    if (onSelectDoctorLang) {
      const match = LANGUAGES.find((l) => l.id === targetId);
      if (match) onSelectDoctorLang(match);
    }
  };

  const handlePlayDoctorAudio = () => {
    if (isPlayingAudio) {
      stopTextToSpeech();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak =
      doctorOutputLangId === 'hi' ? analysis.hindiTranslation : analysis.englishTranslation;
    const langCode = doctorOutputLangId === 'hi' ? 'hi-IN' : 'en-US';

    playTextToSpeech(
      textToSpeak,
      langCode,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  const handleSelectPreset = (preset: EmergencyPreset) => {
    setActivePresetId(preset.id);
    setInputText(preset.patientText);
    setRecognitionError(null);
  };

  // Toggle Microphone
  const handleToggleRecord = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsRecording(false);
      return;
    }

    stopTextToSpeech();
    setIsPlayingAudio(false);
    setRecognitionError(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecognitionError(
        'Speech recognition is not supported in this browser. Please type with the keyboard.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      const targetLocale =
        activeViewMode === 'chat' && chatSender === 'doctor'
          ? 'en-US'
          : LANGUAGE_SPEECH_MAP[patientLang.id] || 'hi-IN';

      recognition.lang = targetLocale;

      recognition.onstart = () => {
        setIsRecording(true);
        setRecognitionError(null);
      };

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += trans;
          } else {
            interimText += trans;
          }
        }
        const activeText = (finalText || interimText).trim();
        if (activeText) {
          if (activeViewMode === 'chat') {
            setChatInput(activeText);
          } else {
            setInputText(activeText);
            setActivePresetId('');
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setRecognitionError(
            'Microphone access was blocked. Please grant microphone permission in your browser.'
          );
        } else if (event.error === 'no-speech') {
          setRecognitionError('No speech was detected. Please tap the mic and speak clearly.');
        } else {
          setRecognitionError(`Speech notice (${event.error}). You can use keyboard typing.`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition startup error:', err);
      setIsRecording(false);
      setRecognitionError('Microphone could not be started.');
    }
  };

  // Trigger Contextual AI Clinical Auto-Reply
  const triggerAutoReply = (originalMsg: ChatItem) => {
    if (!isAutoReplyActive) return;

    setTimeout(() => {
      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const replyData = generateContextualAutoReply(originalMsg, patientLang);

      const autoReplyMsg: ChatItem = {
        id: 'msg-reply-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        sender: originalMsg.sender === 'patient' ? 'doctor' : 'patient',
        originalText: replyData.originalText,
        translatedText: replyData.translatedText,
        sourceLang: replyData.sourceLang,
        targetLang: replyData.targetLang,
        timestamp: timeNow,
        triageLevel: replyData.triageLevel
      };

      setChatMessages((prev) => [...prev, autoReplyMsg]);
    }, 700);
  };

  // Send a new bilingual chat message
  const handleSendChatMessage = async (
    e?: React.FormEvent,
    directText?: string,
    forcedSender?: 'patient' | 'doctor'
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const sender = forcedSender || chatSender;
    const textToSend = (directText || chatInput).trim();
    if (!textToSend) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);

    let translated = '';
    let triageLvl: 'red' | 'yellow' | 'green' = 'green';

    if (sender === 'patient') {
      const parsed = processPatientSpeech(textToSend, 'en');
      translated = parsed.englishTranslation;
      triageLvl = parsed.triageLevel;
      setInputText(textToSend);

      syncTranslationToSupabase(
        'patient',
        parsed.detectedLanguage.name,
        'English',
        textToSend,
        translated,
        triageLvl
      );
    } else {
      // Doctor Query -> Instant translation
      const lower = textToSend.toLowerCase().trim();
      if (lower.includes('radiat') || lower.includes('where')) {
        translated = patientLang.id === 'hi' ? 'दर्द कहाँ फैल रहा है?' : `[${patientLang.name}]: Where is pain?`;
      } else if (lower.includes('when') || lower.includes('start') || lower.includes('begin')) {
        translated = patientLang.id === 'hi' ? 'ये लक्षण कब से शुरू हुए?' : `[${patientLang.name}]: When did it start?`;
      } else if (lower.includes('allerg') || lower.includes('bp') || lower.includes('diabetes')) {
        translated = patientLang.id === 'hi' ? 'क्या आपको कोई एलर्जी या बीपी/शुगर है?' : `[${patientLang.name}]: Any allergies/conditions?`;
      } else if (lower.includes('breath') || lower.includes('deep') || lower.includes('calm')) {
        translated = patientLang.id === 'hi' ? 'कृपया गहरी सांस लें और शांत रहें।' : `[${patientLang.name}]: Take deep breaths.`;
      } else {
        translated = patientLang.id === 'hi' ? `[हिन्दी अनुवाद]: ${textToSend}` : `[${patientLang.name} Translation]: ${textToSend}`;
      }
    }

    const newMsg: ChatItem = {
      id: msgId,
      sender: sender,
      originalText: textToSend,
      translatedText: translated,
      sourceLang: sender === 'patient' ? patientLang.name : 'English',
      targetLang: sender === 'patient' ? 'English' : patientLang.name,
      timestamp: timeString,
      triageLevel: sender === 'patient' ? triageLvl : undefined
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
    setReplyingTo(null);

    // Auto-trigger intelligent contextual reply
    triggerAutoReply(newMsg);
  };

  // Play audio for specific chat message
  const handlePlayChatMessageAudio = (msg: ChatItem) => {
    if (playingMessageId === msg.id) {
      stopTextToSpeech();
      setPlayingMessageId(null);
      return;
    }

    stopTextToSpeech();
    setPlayingMessageId(msg.id);

    const textToSpeak = msg.translatedText;
    const langCode = msg.sender === 'patient' ? 'en-US' : LANGUAGE_SPEECH_MAP[patientLang.id] || 'hi-IN';

    playTextToSpeech(
      textToSpeak,
      langCode,
      () => setPlayingMessageId(msg.id),
      () => setPlayingMessageId(null)
    );
  };

  // Handle clicking "Reply" on a specific message
  const handleInitiateReply = (msg: ChatItem) => {
    setReplyingTo(msg);
    if (msg.sender === 'patient') {
      setChatSender('doctor');
      setChatInput('');
    } else {
      setChatSender('patient');
      setChatInput('');
    }
  };

  return (
    <div className="flex flex-col justify-between h-full min-h-[640px] p-4 sm:p-7 bg-[#eef3fa] relative overflow-y-auto rounded-3xl">
      <div className="space-y-4">
        {/* Top Header with Mode Switcher (Voice Triage vs Bilingual Chat) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Patient Translation</span>
                <Languages className="w-5 h-5 text-blue-600 stroke-[2.4]" />
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-black neu-pill text-blue-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" style={{ animationDuration: '4s' }} />
                <span>Zero-Latency AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {activeViewMode === 'triage'
                ? 'Patient speaks in Indian regional languages — AI auto-detects & translates live'
                : 'Interactive back-and-forth bilingual chat stream with AI Auto-Reply'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2">
            <div className="neu-pressed p-1 rounded-2xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveViewMode('triage')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeViewMode === 'triage'
                    ? 'neu-button-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Voice Triage</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveViewMode('chat')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeViewMode === 'chat'
                    ? 'neu-button-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Live Chat</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </button>
            </div>

            <button
              onClick={() => onNavigate('doctor_reply')}
              className="px-3.5 py-2 rounded-2xl neu-button text-xs font-extrabold flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-blue-700"
            >
              <span>Doctor Reply</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recognition Error Banner */}
        {recognitionError && (
          <div className="p-3 neu-card rounded-2xl border border-amber-300 bg-amber-50/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{recognitionError}</span>
            </div>
            <button
              type="button"
              onClick={() => setRecognitionError(null)}
              className="p-1 rounded-lg text-amber-700 hover:text-amber-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: BILINGUAL LIVE CHAT VIEW                             */}
        {/* ------------------------------------------------------------- */}
        {activeViewMode === 'chat' ? (
          <div className="space-y-3.5">
            {/* Chat Top Controls & Auto-Reply Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAutoReplyActive(!isAutoReplyActive)}
                  className={`px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    isAutoReplyActive
                      ? 'neu-pill text-emerald-700 border border-emerald-300 bg-emerald-50'
                      : 'neu-button text-slate-500'
                  }`}
                  title="Toggle automatic AI Doctor/Patient triage responses"
                >
                  <Bot className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>Contextual AI Auto-Reply: {isAutoReplyActive ? 'ON' : 'OFF'}</span>
                </button>
                <span className="text-[10px] text-slate-400 hidden sm:inline font-semibold">
                  · {patientLang.name} ↔ English
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleSendChatMessage(
                      undefined,
                      'मुझे सीने में बहुत तेज दर्द हो रहा है और सांस फूल रही है।',
                      'patient'
                    )
                  }
                  className="px-2.5 py-1 rounded-xl neu-button text-[10px] font-extrabold text-blue-700 hover:text-blue-900 cursor-pointer"
                  title="Simulate patient sending chest pain"
                >
                  + Patient: Chest Pain
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendChatMessage(
                      undefined,
                      'Where exactly is the pain radiating?',
                      'doctor'
                    )
                  }
                  className="px-2.5 py-1 rounded-xl neu-button text-[10px] font-extrabold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                  title="Simulate doctor asking radiation"
                >
                  + Doctor: Radiation Query
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChatMessages([]);
                    setReplyingTo(null);
                  }}
                  className="p-1 rounded-xl neu-button text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Clear Chat History"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Conversation Thread */}
            <div className="p-4 neu-card rounded-3xl space-y-3 h-[380px] overflow-y-auto bg-white/60 shadow-inner">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <MessageSquare className="w-10 h-10 stroke-[1.5] mb-2 text-slate-300" />
                  <p className="text-sm font-bold text-slate-600">Chat conversation is clear</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Send a message below as Patient or Doctor to start real-time bilingual conversation with auto-replies.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isPatient = msg.sender === 'patient';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isPatient ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1">
                          {isPatient ? (
                            <>
                              <User className="w-3.5 h-3.5 text-blue-600" />
                              <span>Patient ({msg.sourceLang})</span>
                            </>
                          ) : (
                            <>
                              <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Dr. Response ({msg.sourceLang})</span>
                            </>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                        {msg.triageLevel === 'red' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black neu-button-emergency">
                            RED
                          </span>
                        )}
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl relative group shadow-sm ${
                          isPatient
                            ? 'neu-card border-l-4 border-l-blue-600 bg-blue-50/50 text-slate-900 rounded-tl-sm'
                            : 'neu-pressed border-r-4 border-r-indigo-600 bg-indigo-50/50 text-slate-900 rounded-tr-sm'
                        }`}
                      >
                        <p className="text-sm font-bold leading-relaxed">{msg.originalText}</p>

                        <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                          <div className="text-xs font-extrabold text-blue-700 italic">
                            <span>&rarr; {msg.translatedText}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* 1-Tap Reply Button */}
                            <button
                              type="button"
                              onClick={() => handleInitiateReply(msg)}
                              className="px-2 py-0.5 rounded-lg neu-button text-[10px] font-bold text-slate-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-all"
                              title="Reply to this message"
                            >
                              <Reply className="w-3 h-3" />
                              <span>Reply</span>
                            </button>

                            {/* Listen Audio Button */}
                            <button
                              type="button"
                              onClick={() => handlePlayChatMessageAudio(msg)}
                              className={`p-1 rounded-lg transition-all cursor-pointer ${
                                playingMessageId === msg.id
                                  ? 'neu-button-primary animate-pulse'
                                  : 'neu-button text-slate-500 hover:text-blue-600'
                              }`}
                              title="Listen translated speech"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Replying Context Banner if active */}
            {replyingTo && (
              <div className="p-2.5 neu-card rounded-2xl border border-blue-300 bg-blue-50/70 flex items-center justify-between gap-2 text-xs font-bold text-blue-900">
                <div className="flex items-center gap-2 truncate">
                  <Reply className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-slate-500">Replying to {replyingTo.sender}:</span>
                  <span className="italic truncate font-semibold text-slate-800">"{replyingTo.originalText}"</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Clinical Prompts */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_CHAT_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setChatSender('doctor');
                    handleSendChatMessage(undefined, prompt, 'doctor');
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-xl neu-button text-[11px] font-bold text-slate-700 hover:text-blue-700 cursor-pointer transition-all flex items-center gap-1"
                >
                  <Sparkle className="w-3 h-3 text-amber-500" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendChatMessage} className="p-3.5 neu-card rounded-3xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-600">Sending as:</span>
                  <div className="flex items-center gap-1 neu-pressed p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setChatSender('patient')}
                      className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                        chatSender === 'patient'
                          ? 'neu-pill text-blue-700 font-black shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🗣️ Patient ({patientLang.name})
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatSender('doctor')}
                      className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                        chatSender === 'doctor'
                          ? 'neu-pill text-indigo-700 font-black shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      👨‍⚕️ Doctor (English)
                    </button>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-semibold">
                  Press Enter ↵ to Send & Auto-Reply
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={
                    chatSender === 'patient'
                      ? `Type in ${patientLang.name} or tap Mic to speak...`
                      : 'Type clinical query or instruction in English...'
                  }
                  className="flex-1 px-4 py-2.5 text-sm font-bold neu-input rounded-2xl focus:ring-2 focus:ring-blue-500/30"
                />

                {/* Mic Speech button for chat */}
                <button
                  type="button"
                  onClick={handleToggleRecord}
                  className={`p-2.5 rounded-2xl transition-all cursor-pointer shadow-md ${
                    isRecording
                      ? 'neu-button-emergency animate-pulse'
                      : 'neu-button text-blue-600 hover:text-blue-800'
                  }`}
                  title={isRecording ? 'Listening...' : 'Voice Dictate'}
                >
                  {isRecording ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Send button */}
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-4 py-2.5 rounded-2xl neu-button-primary text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-md"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* VIEW 2: VOICE TRIAGE DASHBOARD VIEW                           */
          /* ------------------------------------------------------------- */
          <>
            {/* AI Zero-Click Auto-Detect Mode Banner */}
            <div className="p-3.5 neu-card rounded-3xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl neu-raised text-blue-600 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 stroke-[2.4]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">
                        Emergency Zero-Click AI Detection
                      </span>
                      <span className="text-[10px] neu-pill px-2 py-0.5 font-extrabold text-emerald-700">
                        Instant Auto-Match
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Zero setup time — Patient speaks naturally in any Indian language.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setIsAutoDetectMode(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isAutoDetectMode
                        ? 'neu-pressed text-blue-900 border-2 border-blue-600'
                        : 'neu-button text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Auto-Detect</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAutoDetectMode(false);
                      onNavigate('languages');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      !isAutoDetectMode
                        ? 'neu-pressed text-blue-900 border-2 border-blue-600'
                        : 'neu-button text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <Globe2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Manual Select</span>
                  </button>
                </div>
              </div>
            </div>

            {/* PATIENT VOICE INPUT CARD */}
            <div className="p-4 neu-card rounded-3xl space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-200/60">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{analysis.detectedLanguage.flag}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {analysis.detectedLanguage.name} ({analysis.detectedLanguage.nativeName})
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black neu-pill text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{analysis.confidence}% Match</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Script: {analysis.sourceScript} • Live Patient Audio Stream
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 neu-pill px-3 py-1 text-blue-700 text-xs font-extrabold">
                    <Activity className={`w-3.5 h-3.5 ${isRecording ? 'animate-bounce text-red-600' : 'text-blue-600'}`} />
                    <span>{isRecording ? 'Listening live...' : 'Voice Stream Active'}</span>
                  </div>

                  {inputText.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputText('');
                        setActivePresetId('');
                      }}
                      className="p-1.5 rounded-xl neu-button text-slate-500 hover:text-red-600 transition-all cursor-pointer"
                      title="Clear patient input"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsTypingMode(!isTypingMode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isTypingMode
                        ? 'neu-pressed text-blue-900 border border-blue-500'
                        : 'neu-button text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <Keyboard className="w-3.5 h-3.5" />
                    <span>{isTypingMode ? 'Voice Mode' : 'Keyboard'}</span>
                  </button>
                </div>
              </div>

              {/* Input text or Speech Display */}
              {isTypingMode ? (
                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setActivePresetId('');
                  }}
                  rows={2}
                  className="w-full p-3.5 neu-input text-base font-bold resize-none leading-relaxed focus:ring-2 focus:ring-blue-500/30"
                  placeholder="Type patient symptoms in Hindi, Bengali, Tamil, Telugu, Marathi, or any Indian language..."
                />
              ) : (
                <div className="p-3.5 neu-pressed rounded-2xl min-h-[64px] flex items-center justify-between gap-3">
                  <p className="text-base sm:text-lg font-black text-slate-900 leading-relaxed">
                    {inputText ? `"${inputText}"` : <span className="text-slate-400 font-normal italic">Tap Mic below to speak symptoms or select an emergency preset...</span>}
                  </p>
                </div>
              )}

              {/* Audio Telemetry Waveform */}
              <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center gap-1.5 neu-pressed px-3 py-1.5 rounded-xl">
                  {[30, 65, 95, 45, 80, 25, 90, 50, 75, 35, 85, 40, 60, 90, 45].map((h, i) => (
                    <span
                      key={i}
                      style={{
                        height: isRecording
                          ? `${Math.max(16, (h + (i % 4) * 22) % 95)}px`
                          : '8px'
                      }}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isRecording
                          ? 'bg-gradient-to-t from-red-500 via-rose-500 to-blue-600 animate-pulse'
                          : 'bg-slate-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono neu-pill px-3 py-1 font-extrabold text-slate-600">
                  {isRecording ? '🔴 LISTENING LIVE' : 'MIC STANDBY'}
                </span>
              </div>
            </div>

            {/* CENTRAL NEUMORPHIC MIC RECORDING BUTTON */}
            <div className="flex flex-col items-center justify-center py-1 space-y-1.5">
              <div className="relative flex items-center justify-center">
                {isRecording && (
                  <>
                    <div className="absolute w-28 h-28 rounded-full bg-red-500/25 animate-ping pointer-events-none" />
                    <div className="absolute w-36 h-36 rounded-full bg-blue-500/20 animate-pulse pointer-events-none" />
                  </>
                )}

                <button
                  type="button"
                  onClick={handleToggleRecord}
                  className={`w-18 h-18 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                    isRecording
                      ? 'neu-button-emergency ring-4 ring-red-300 scale-105'
                      : 'neu-button-primary hover:scale-105 active:scale-95'
                  }`}
                  title={isRecording ? 'Stop listening' : 'Tap to speak in any language'}
                >
                  {isRecording ? (
                    <MicOff className="w-8 h-8 text-white animate-pulse" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </button>
              </div>

              <div className="text-center">
                <h4 className="text-xs font-black text-slate-900">
                  {isRecording ? '🎙️ Listening to Patient Speech... Tap to Stop' : 'Tap Mic to Speak in Any Indian Language'}
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  Real-time clinical NLP & triage severity detection
                </p>
              </div>
            </div>

            {/* 1-TAP EMERGENCY SPEECH PRESETS */}
            <div className="p-3.5 neu-card rounded-3xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 stroke-[2.4]" />
                  <span>Simulate Emergency Patient Speech (1-Tap Test)</span>
                </span>
                <span className="text-[10px] neu-pill px-2.5 py-0.5 text-slate-500 font-extrabold">Quick Test</span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {EMERGENCY_PRESETS.map((preset) => {
                  const isSelected = activePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`shrink-0 px-3 py-1.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'neu-pressed border-2 border-blue-600 text-blue-900'
                          : 'neu-button text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <span>{preset.flag}</span>
                      <span>{preset.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DOCTOR TRANSLATED OUTPUT CARD */}
            <div className="p-4 neu-card rounded-3xl space-y-3 border-l-4 border-l-blue-600">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-2 text-blue-700 font-black text-sm">
                  <Stethoscope className="w-4 h-4 stroke-[2.4]" />
                  <span>
                    Translated Output ({doctorOutputLangId === 'hi' ? 'हिन्दी - Hindi' : 'English'})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 neu-pressed p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleToggleDoctorLang('en')}
                      className={`px-2 py-0.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                        doctorOutputLangId === 'en'
                          ? 'neu-pill text-blue-700 font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🇬🇧 English
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleDoctorLang('hi')}
                      className={`px-2 py-0.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                        doctorOutputLangId === 'hi'
                          ? 'neu-pill text-blue-700 font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🇮🇳 हिन्दी
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handlePlayDoctorAudio}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isPlayingAudio
                        ? 'neu-button-primary animate-pulse'
                        : 'neu-button text-blue-700 hover:text-blue-900'
                    }`}
                  >
                    <Volume2 className="w-4 h-4 stroke-[2.4]" />
                    <span>{isPlayingAudio ? 'Speaking...' : 'Listen Audio'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 neu-pressed rounded-2xl">
                <p className="text-slate-900 font-black text-base sm:text-lg leading-relaxed">
                  {analysis.doctorTranslation}
                </p>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                <span>
                  {doctorOutputLangId === 'en'
                    ? `हिन्दी अनुवाद reference: ${analysis.hindiTranslation}`
                    : `English reference: ${analysis.englishTranslation}`}
                </span>
              </div>
            </div>

            {/* CRITICAL / URGENT TRIAGE CARDS */}
            {analysis.triageLevel === 'red' ? (
              <div className="p-4 neu-card border-2 border-red-500/50 rounded-3xl space-y-2.5 bg-red-500/5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-2xl neu-raised text-red-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 stroke-[2.4] text-red-600 animate-pulse" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black neu-button-emergency">
                          CRITICAL RED TRIAGE
                        </span>
                        <h4 className="text-xs font-black text-slate-900">
                          Immediate Cardiopulmonary Emergency
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('emergency')}
                        className="px-3 py-1 rounded-xl neu-button-emergency text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Launch SOS Protocol</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.4]" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 font-bold leading-relaxed">
                      {analysis.clinicalSummary}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {analysis.criticalSymptoms.map((symptom, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-black neu-pill text-red-700 flex items-center gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                          <span>{symptom}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : analysis.triageLevel === 'yellow' ? (
              <div className="p-3.5 neu-card border border-amber-500/40 rounded-3xl space-y-1.5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-2xl neu-raised text-amber-600 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4 stroke-[2.4]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black neu-pill text-amber-700">
                        YELLOW TRIAGE (URGENT)
                      </span>
                      <button
                        type="button"
                        onClick={() => onNavigate('symptoms')}
                        className="text-xs font-extrabold text-blue-700 hover:text-blue-900 cursor-pointer"
                      >
                        Check Triage Symptoms &rarr;
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 font-bold mt-0.5">
                      {analysis.clinicalSummary}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* BOTTOM NAVIGATION ACTION BAR */}
      <div className="pt-4 mt-4 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onNavigate('symptoms')}
          className="flex-1 py-2.5 px-3 rounded-2xl neu-button text-xs font-extrabold text-slate-800 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Select Symptoms</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('doctor_reply')}
          className="flex-1 py-2.5 px-3 rounded-2xl neu-button-primary text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Doctor Reply ({analysis.detectedLanguage.name})</span>
          <ArrowRight className="w-4 h-4 stroke-[2.4]" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('history')}
          className="py-2.5 px-4 rounded-2xl neu-button text-xs font-extrabold text-slate-800 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>History</span>
        </button>
      </div>
    </div>
  );
};

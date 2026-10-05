import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Mic,
  MicOff,
  Keyboard,
  ArrowLeft,
  Stethoscope,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Pill
} from 'lucide-react';
import { ScreenId, Language } from '../../types';
import { playTextToSpeech, stopTextToSpeech } from '../../utils/audio';

interface DoctorReplyScreenProps {
  onNavigate: (screen: ScreenId) => void;
  patientLang: Language;
  doctorLang: Language;
}

// Doctor clinical question templates with multi-language patient translations
const DOCTOR_TEMPLATES = [
  {
    id: 'medicine',
    questionEn: 'Have you taken any medicine today?',
    questionHi: 'क्या आपने आज कोई दवा ली है?',
    translations: {
      hi: 'क्या आपने आज कोई दवा ली है?',
      bn: 'আপনি কি আজ কোনো ওষুধ খেয়েছেন?',
      ta: 'இன்று ஏதேனும் மருந்து சாப்பிட்டீர்களா?',
      te: 'మీరు ఈ రోజు ఏదైనా మందు తీసుకున్నారా?',
      mr: 'तुम्ही आज कोणतेही औषध घेतले आहे का?',
      gu: 'શું તમે આજે કોઈ દવા લીધી છે?',
      pa: 'ਕੀ ਤੁਸੀਂ ਅੱਜ ਕੋਈ ਦਵਾਈ ਲਈ ਹੈ?',
      es: '¿Ha tomado algún medicamento hoy?',
      ar: 'هل تناولت أي دواء اليوم؟',
      fr: 'Avez-vous pris des médicaments aujourd’hui ?',
      ur: 'کیا آپ نے آج کوئی دوا لی ہے؟',
      en: 'Have you taken any medicine today?'
    }
  },
  {
    id: 'location',
    questionEn: 'Where exactly does it hurt the most?',
    questionHi: 'आपको ठीक कहां सबसे ज्यादा दर्द हो रहा है?',
    translations: {
      hi: 'आपको ठीक कहां सबसे ज्यादा दर्द हो रहा है?',
      bn: 'আপনার ঠিক কোথায় সবচেয়ে বেশি ব্যথা করছে?',
      ta: 'சரியாக எங்கு மிகவும் வலிக்கிறது?',
      te: 'సరిగ్గా ఎక్కడ చాలా నొప్పిగా ఉంది?',
      mr: 'नेमके कुठे सर्वात जास्त दुखत आहे?',
      gu: 'તમને બરાબર ક્યાં સૌથી વધુ દુખાવો થાય છે?',
      pa: 'ਤੁਹਾਨੂੰ ਬਿਲਕੁਲ ਕਿੱਥੇ ਸਭ ਤੋਂ ਵੱਧ ਦਰਦ ਹੋ ਰਿਹਾ ਹੈ?',
      es: '¿Dónde le duele exactamente más?',
      ar: 'أين يؤلمك بالتحديد أكثر؟',
      fr: 'Où avez-vous le plus mal exactement ?',
      ur: 'آپ کو بالکل کہاں سب से ज्यादा दर्द हो रहा है?',
      en: 'Where exactly does it hurt the most?'
    }
  },
  {
    id: 'duration',
    questionEn: 'Since how many hours or days have you had this pain?',
    questionHi: 'आपको यह दर्द कितने घंटों या दिनों से हो रहा है?',
    translations: {
      hi: 'आपको यह दर्द कितने घंटों या दिनों से हो रहा है?',
      bn: 'কত ঘণ্টা বা দিন ধরে এই ব্যথা হচ্ছে?',
      ta: 'எத்தனை மணிநேரம் அல்லது நாட்களாக இந்த வலி இருக்கிறது?',
      te: 'ఎన్ని గంటలు లేదా రోజుల నుండి ఈ నొప్పి వస్తోంది?',
      mr: 'हा त्रास किती तासांपासून किंवा दिवसांपासून सुरू आहे?',
      gu: 'આ દુખાવો કેટલા કલાકો કે દિવસોથી છે?',
      pa: 'ਇਹ ਦਰਦ ਕਿੰਨੇ ਘੰਟਿਆਂ ਜਾਂ ਦਿਨਾਂ ਤੋਂ ਹੈ?',
      es: '¿Desde cuántas horas o días tiene este dolor?',
      ar: 'منذ كم ساعة أو يوم تشعر بهذا الألم؟',
      fr: 'Depuis combien d’heures ou de jours avez-vous cette douleur ?',
      ur: 'آپ کو یہ درد کتنے گھنٹوں یا دنوں سے ہو رہا ہے؟',
      en: 'Since how many hours or days have you had this pain?'
    }
  },
  {
    id: 'oxygen',
    questionEn: 'Please take deep breaths. We are starting oxygen support now.',
    questionHi: 'कृपया गहरी सांस लें। हम अभी ऑक्सीजन सपोर्ट शुरू कर रहे हैं।',
    translations: {
      hi: 'कृपया गहरी सांस लें। हम अभी ऑक्सीजन सपोर्ट शुरू कर रहे हैं।',
      bn: 'দয়া করে গভীর শ্বাস নিন। আমরা এখনই অক্সিজেন সাপোর্ট শুরু করছি।',
      ta: 'தயவுசெய்து ஆழமாக மூச்சு விடுங்கள். நாங்கள் இப்போது ஆக்ஸிஜன் ஆதரவைத் தொடங்குகிறோம்.',
      te: 'దయచేసి లోతైన శ్వాస తీసుకోండి. మేము ఇప్పుడు ఆక్సిజన్ సపోర్ట్ ప్రారంభిస్తున్నాము.',
      mr: 'कृपया दीर्घ श्वास घ्या. आम्ही आता ऑक्सिजन सपोर्ट सुरू करत आहोत.',
      gu: 'કૃપા કરીને ઊંડા શ્વાસ લો. અમે હમણાં જ ઓક્સિજન સપોર્ટ શરૂ કરી રહ્યા છીએ.',
      pa: 'ਕਿਰਪਾ ਕਰਕੇ ਲੰਮਾ ਸਾਹ ਲਓ। ਅਸੀਂ ਹੁਣੇ ਆਕਸੀਜਨ ਸਹਾਇਤਾ ਸ਼ੁਰੂ ਕਰ ਰਹੇ ਹਾਂ।',
      es: 'Por favor respire hondo. Estamos iniciando el soporte de oxígeno ahora.',
      ar: 'يرجى أخذ أنفاس عميقة. نحن نبدأ دعم الأكسجين الآن.',
      fr: 'Veuillez respirer profondément. Nous commençons l’assistance en oxygène maintenant.',
      ur: 'براہ کرم گہرے سانس لیں۔ ہم ابھی آکسیجن سپورٹ शुरू कर रहे हैं।',
      en: 'Please take deep breaths. We are starting oxygen support now.'
    }
  },
  {
    id: 'history',
    questionEn: 'Do you have diabetes, high blood pressure or heart problems?',
    questionHi: 'क्या आपको शुगर (डायबिटीज), बीपी या दिल की बीमारी है?',
    translations: {
      hi: 'क्या आपको शुगर (डायबिटीज), बीपी या दिल की बीमारी है?',
      bn: 'আপনার কি ডায়াবেটিস, হাই বিপি বা হৃদরোগ আছে?',
      ta: 'உங்களுக்கு சர்க்கரை நோய், உயர் ரத்த அழுத்தம் அல்லது இதய நோய் உள்ளதா?',
      te: 'మీకు షుగర్, హై బీపీ లేదా గుండె సమస్యలు ఉన్నాయా?',
      mr: 'तुम्हाला मधुमेह (डायबिटीज), उच्च रक्तदाब किंवा हृदयाचा त्रास आहे का?',
      gu: 'શું તમને ડાયાબિટીસ, હાઈ બીપી અથવા હૃદયની તકલીફ છે?',
      pa: 'ਕੀ ਤੁਹਾਨੂੰ ਸ਼ੂਗਰ, ਬੀਪੀ ਜਾਂ ਦਿਲ ਦੀ ਕੋਈ ਬਿਮਾਰੀ ਹੈ?',
      es: '¿Tiene diabetes, presión alta o problemas cardíacos?',
      ar: 'هل تعاني من السكري أو ارتفاع ضغط الدم أو مشاكل في القلب؟',
      fr: 'Avez-vous du diabète, de l’hypertension ou des problèmes cardiaques ?',
      ur: 'کیا آپ کو ذیابیطس، ہائی بلڈ پریشر یا دل کی بیماری ہے؟',
      en: 'Do you have diabetes, high blood pressure or heart problems?'
    }
  },
  {
    id: 'calm',
    questionEn: 'Stay calm. You are in safe hands, help is right here.',
    questionHi: 'शांत रहें। आप सुरक्षित हाथों में हैं, डॉक्टर यहीं हैं।',
    translations: {
      hi: 'शांत रहें। आप सुरक्षित हाथों में हैं, डॉक्टर यहीं हैं।',
      bn: 'শান্ত থাকুন। আপনি নিরাপদ হাতে আছেন, ডাক্তার এখানেই আছেন।',
      ta: 'அமைதியாக இருங்கள். நீங்கள் பாதுகாப்பான கைகளில் உள்ளீர்கள்.',
      te: 'ప్రశాంతంగా ఉండండి. మీరు సురక్షితమైన చేతుల్లో ఉన్నారు.',
      mr: 'शांत राहा. आपण सुरक्षित हातात आहात, डॉक्टर इथेच आहेत.',
      gu: 'શાંત રહો. તમે સુરક્ષિત હાથોમાં છો, ડૉક્ટર અહીં જ છે.',
      pa: 'ਸ਼ਾਂਤ ਰਹੋ। ਤੁਸੀਂ ਸੁਰੱਖਿਅਤ ਹੱਥਾਂ ਵਿੱਚ ਹੋ, ਡਾਕਟਰ ਇੱਥੇ ਹਨ।',
      es: 'Mantenga la calma. Está en buenas manos, la ayuda está aquí.',
      ar: 'ابق هادئا. أنت في أيد أمينة، المساعدة هنا.',
      fr: 'Restez calme. Vous êtes entre de bonnes mains, l’aide est là.',
      ur: 'پرسکون رہیں۔ آپ محفوظ ہاتھوں میں ہیں، ڈاکٹر یہیں موجود ہیں۔',
      en: 'Stay calm. You are in safe hands, help is right here.'
    }
  }
];

export const DoctorReplyScreen: React.FC<DoctorReplyScreenProps> = ({
  onNavigate,
  patientLang,
  doctorLang
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingPatientAudio, setIsPlayingPatientAudio] = useState(false);
  const [isPlayingDoctorAudio, setIsPlayingDoctorAudio] = useState(false);
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  // Selected template or custom input
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('medicine');
  const [doctorQuestion, setDoctorQuestion] = useState<string>(DOCTOR_TEMPLATES[0].questionEn);
  const [translatedPatientText, setTranslatedPatientText] = useState<string>('');

  const recognitionRef = useRef<any>(null);

  // Update translation whenever patientLang or doctorQuestion changes
  useEffect(() => {
    // Check if matching a known template first
    const currentTemplate = DOCTOR_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (currentTemplate && (doctorQuestion === currentTemplate.questionEn || doctorQuestion === currentTemplate.questionHi)) {
      const transMap = currentTemplate.translations as Record<string, string>;
      const match = transMap[patientLang.id] || transMap['hi'] || currentTemplate.questionEn;
      setTranslatedPatientText(match);
      return;
    }

    // Dynamic translation via backend API if available
    let isCancelled = false;
    if (doctorQuestion.trim()) {
      fetch('http://localhost:5000/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: doctorQuestion,
          sourceLang: doctorLang.name,
          targetLang: patientLang.id
        })
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && !isCancelled) {
            const trans = patientLang.id === 'hi' ? data.hindiTranslation : (data.englishTranslation || doctorQuestion);
            setTranslatedPatientText(trans);
          }
        })
        .catch(() => {
          // Fallback if backend offline
          if (!isCancelled) {
            setTranslatedPatientText(doctorQuestion);
          }
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [patientLang, selectedTemplateId, doctorQuestion, doctorLang]);

  // Clean up speech synthesis & recognition on unmount
  useEffect(() => {
    return () => {
      stopTextToSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  const handleSelectTemplate = (t: typeof DOCTOR_TEMPLATES[0]) => {
    setSelectedTemplateId(t.id);
    const q = doctorLang.id === 'hi' ? t.questionHi : t.questionEn;
    setDoctorQuestion(q);
    setRecognitionError(null);
  };

  const handlePlayPatientAudio = () => {
    if (isPlayingPatientAudio) {
      stopTextToSpeech();
      setIsPlayingPatientAudio(false);
      return;
    }
    stopTextToSpeech();
    setIsPlayingDoctorAudio(false);

    playTextToSpeech(
      translatedPatientText,
      patientLang.id,
      () => setIsPlayingPatientAudio(true),
      () => setIsPlayingPatientAudio(false)
    );
  };

  const handlePlayDoctorAudio = () => {
    if (isPlayingDoctorAudio) {
      stopTextToSpeech();
      setIsPlayingDoctorAudio(false);
      return;
    }
    stopTextToSpeech();
    setIsPlayingPatientAudio(false);

    playTextToSpeech(
      doctorQuestion,
      doctorLang.id === 'hi' ? 'hi-IN' : 'en-US',
      () => setIsPlayingDoctorAudio(true),
      () => setIsPlayingDoctorAudio(false)
    );
  };

  // Real Web Speech Recognition implementation
  const handleToggleRecord = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecognitionError('Speech recognition is not supported in this browser. Please use keyboard typing mode.');
      setIsTypingMode(true);
      return;
    }

    try {
      setRecognitionError(null);
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Set language code based on doctor's selected language
      const langCodeMap: Record<string, string> = {
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

      recognition.lang = langCodeMap[doctorLang.id] || 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        stopTextToSpeech();
        setIsPlayingPatientAudio(false);
        setIsPlayingDoctorAudio(false);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setDoctorQuestion(transcript);
          setSelectedTemplateId('');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Doctor speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setRecognitionError('Microphone permission denied. Please allow microphone access or use keyboard typing.');
        } else if (event.error !== 'no-speech') {
          setRecognitionError(`Speech recognition: ${event.error}. You can type below.`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start SpeechRecognition:', err);
      setRecognitionError('Unable to activate microphone. Please type your message.');
      setIsRecording(false);
      setIsTypingMode(true);
    }
  };

  const handleClearQuestion = () => {
    setDoctorQuestion('');
    setTranslatedPatientText('');
    setSelectedTemplateId('');
  };

  return (
    <div className="flex flex-col justify-between h-full min-h-[640px] p-5 sm:p-8 bg-[#eef3fa] text-slate-800 relative overflow-y-auto rounded-3xl">
      <div className="space-y-5">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Doctor Clinical Response</span>
                <Stethoscope className="w-5 h-5 text-blue-600 stroke-[2.4]" />
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-black neu-pill text-blue-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Clinician Mode</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Speak or type in <span className="font-extrabold text-slate-800">{doctorLang.name}</span> &rarr; renders translated voice for Patient in <span className="font-extrabold text-blue-700">{patientLang.name} ({patientLang.nativeName})</span>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('patient_translation')}
              className="px-4 py-2 rounded-2xl neu-button text-xs font-extrabold text-slate-800 hover:text-slate-900 flex items-center gap-2 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.4]" />
              <span>Patient Translation</span>
            </button>
          </div>
        </div>

        {/* Microphone Error Alert (if any) */}
        {recognitionError && (
          <div className="p-3.5 neu-card border border-amber-400 bg-amber-50/70 rounded-2xl text-xs font-bold text-amber-900 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="flex-1">{recognitionError}</span>
            <button
              type="button"
              onClick={() => setRecognitionError(null)}
              className="text-[11px] underline cursor-pointer font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Rapid Doctor Inquiries (Quick Clinical Commands) */}
        <div className="p-4 neu-card rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 stroke-[2.4]" />
              <span>Rapid Doctor Inquiries (1-Click Clinical Templates)</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Tap any inquiry
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {DOCTOR_TEMPLATES.map((t) => {
              const isSelected = selectedTemplateId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className={`text-left p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'neu-pressed border-2 border-blue-600 text-blue-900 font-extrabold scale-[1.01]'
                      : 'neu-button text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <p className="line-clamp-2 leading-relaxed">
                    {doctorLang.id === 'hi' ? t.questionHi : t.questionEn}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Doctor Input Card */}
        <div className="p-5 neu-card rounded-3xl space-y-4">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
            <span className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
              <span className="text-xl">{doctorLang.flag}</span>
              <span>Doctor Question ({doctorLang.name})</span>
            </span>
            <div className="flex items-center gap-2">
              {doctorQuestion && (
                <button
                  type="button"
                  onClick={handleClearQuestion}
                  className="p-1.5 rounded-xl neu-button text-slate-500 hover:text-red-600 transition-all cursor-pointer text-xs"
                  title="Clear question"
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
                <span>{isTypingMode ? 'Voice Mode' : 'Type Mode'}</span>
              </button>

              <button
                type="button"
                onClick={handlePlayDoctorAudio}
                className={`p-2 rounded-xl neu-button text-blue-700 hover:text-blue-900 transition-all cursor-pointer ${
                  isPlayingDoctorAudio ? 'neu-button-primary text-white animate-pulse' : ''
                }`}
                title="Play doctor audio"
              >
                <Volume2 className="w-4 h-4 stroke-[2.4]" />
              </button>
            </div>
          </div>

          {isTypingMode ? (
            <div className="space-y-2">
              <textarea
                value={doctorQuestion}
                onChange={(e) => {
                  setDoctorQuestion(e.target.value);
                  setSelectedTemplateId('');
                }}
                rows={2}
                className="w-full p-4 neu-input text-base font-bold resize-none leading-relaxed"
                placeholder={`Type doctor's inquiry in ${doctorLang.name}...`}
              />
            </div>
          ) : (
            <div className="p-4 neu-pressed rounded-2xl min-h-[64px] flex items-center">
              <p className="text-base sm:text-lg font-black text-slate-900 leading-relaxed">
                {doctorQuestion ? `"${doctorQuestion}"` : <span className="text-slate-400 font-normal italic">Tap the microphone below to speak or select a quick inquiry above...</span>}
              </p>
            </div>
          )}

          {/* Audio Waveform Graphic */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 neu-pressed px-3 py-2 rounded-xl">
              {[30, 60, 85, 45, 95, 40, 70, 50, 30, 65, 90, 40].map((h, i) => (
                <span
                  key={i}
                  style={{ height: isRecording ? `${h}%` : `${Math.max(20, h * 0.4)}%` }}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isRecording
                      ? 'bg-gradient-to-t from-red-600 to-rose-500 animate-pulse'
                      : 'bg-slate-400'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-mono neu-pill px-3 py-1 font-extrabold text-slate-600">
              {isRecording ? '🔴 LISTENING DOCTOR...' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* Central Speak Action & Microphone Button */}
        <div className="flex flex-col items-center justify-center py-2 space-y-2">
          <div className="relative flex items-center justify-center">
            {isRecording && (
              <>
                <div className="absolute w-28 h-28 rounded-full bg-red-500/20 animate-ping pointer-events-none" />
                <div className="absolute w-32 h-32 rounded-full bg-blue-500/15 animate-pulse pointer-events-none" />
              </>
            )}

            <button
              type="button"
              onClick={handleToggleRecord}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                isRecording
                  ? 'neu-button-emergency ring-4 ring-red-300 scale-105 animate-pulse'
                  : 'neu-button-primary hover:scale-105 active:scale-95'
              }`}
              title={isRecording ? 'Tap to Stop Listening' : 'Tap to Speak'}
            >
              {isRecording ? (
                <MicOff className="w-9 h-9 text-white" />
              ) : (
                <Mic className="w-9 h-9 text-white" />
              )}
            </button>
          </div>

          <div className="text-center space-y-0.5">
            <h4 className="text-xs font-black text-slate-900">
              {isRecording ? '🎙️ Listening doctor speech (Tap to finish)...' : `Tap Mic to Speak in ${doctorLang.name}`}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Instant translation rendering into {patientLang.name} ({patientLang.nativeName})
            </p>
          </div>
        </div>

        {/* Translated Output Card for the Patient */}
        <div className="p-5 neu-card rounded-3xl space-y-3 border-l-4 border-l-emerald-600">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-2 text-emerald-800 font-black text-xs sm:text-sm">
              <span className="text-xl">{patientLang.flag}</span>
              <span>
                Translated for Patient in {patientLang.name} ({patientLang.nativeName})
              </span>
            </div>

            <button
              type="button"
              onClick={handlePlayPatientAudio}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                isPlayingPatientAudio
                  ? 'neu-button-primary animate-pulse'
                  : 'neu-button text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <Volume2 className="w-4 h-4 stroke-[2.4]" />
              <span>{isPlayingPatientAudio ? 'Speaking to Patient...' : 'Speak to Patient'}</span>
            </button>
          </div>

          <div className="p-4 neu-pressed rounded-2xl">
            <p className="text-slate-900 font-black text-base sm:text-xl leading-relaxed">
              {translatedPatientText || (
                <span className="text-slate-400 font-normal italic">
                  Translation will appear here instantly...
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Doctor Quick Prescriptions / Guidance Link */}
        <div className="p-4 neu-card rounded-3xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-pressed flex items-center justify-center text-blue-600">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-xs block">
                Need to prescribe medication?
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                Translate dosage schedules & tablet instructions into patient's language
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('medicine')}
            className="px-4 py-2 rounded-2xl neu-button-primary text-xs font-extrabold transition-all cursor-pointer shrink-0"
          >
            Dosage &rarr;
          </button>
        </div>
      </div>

      {/* Bottom Navigation Actions Bar */}
      <div className="pt-6 mt-6 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onNavigate('patient_translation')}
          className="flex-1 py-3 px-4 rounded-2xl neu-button text-xs font-extrabold text-slate-800 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>&larr; Patient Translation</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('history')}
          className="py-3 px-4 rounded-2xl neu-button text-xs font-extrabold text-slate-800 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Consultation History</span>
        </button>
      </div>
    </div>
  );
};

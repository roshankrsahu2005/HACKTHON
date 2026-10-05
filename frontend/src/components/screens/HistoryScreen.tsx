import React, { useState } from 'react';
import { ArrowLeft, User, UserCheck, Volume2, Trash2, RotateCcw } from 'lucide-react';
import { ScreenId, ChatMessage } from '../../types';
import { INITIAL_CONVERSATION } from '../../data/mockData';
import { playTextToSpeech, stopTextToSpeech } from '../../utils/audio';

interface HistoryScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CONVERSATION);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);

  const handlePlayAudio = (msg: ChatMessage) => {
    if (activePlayingId === msg.id) {
      stopTextToSpeech();
      setActivePlayingId(null);
      return;
    }

    const langCode = msg.sourceLang === 'Hindi' ? 'hi-IN' : 'en-US';
    setActivePlayingId(msg.id);
    
    playTextToSpeech(
      msg.text,
      langCode,
      undefined,
      () => setActivePlayingId(null)
    );
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  const handleRestoreHistory = () => {
    setMessages(INITIAL_CONVERSATION);
  };

  return (
    <div className="flex flex-col justify-between h-full min-h-[640px] p-5 bg-[#eef3fa] text-slate-800 relative">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('patient_translation')}
              className="neu-button p-2.5 rounded-full text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Conversation History</h2>
              <p className="text-xs text-slate-500 font-medium">Logged consultations & audio transcripts</p>
            </div>
          </div>

          {messages.length === 0 && (
            <button
              onClick={handleRestoreHistory}
              className="neu-button px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Log</span>
            </button>
          )}
        </div>

        {/* Message List */}
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 neu-pressed rounded-3xl my-2">
            <div className="w-14 h-14 rounded-2xl neu-button text-slate-400 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-slate-700">History Cleared</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[220px]">Tap "Reset Log" above to reload example consultation dialogues</p>
          </div>
        ) : (
          <div className="space-y-3.5 flex-1 overflow-y-auto pr-1 py-1">
            {messages.map((msg) => {
              const isPatient = msg.sender === 'patient';
              const isPlaying = activePlayingId === msg.id;

              return (
                <div
                  key={msg.id}
                  className="p-4 neu-card rounded-2xl transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${
                          isPatient
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                            : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                        }`}
                      >
                        {isPatient ? <User className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          {isPatient ? 'Patient (Hindi)' : 'Doctor (English)'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">ID: #{msg.id.slice(-4)}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono neu-pressed px-2 py-0.5 rounded-md">{msg.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between pl-10">
                    <div className="pr-3">
                      <p className="text-sm font-semibold text-slate-800 leading-snug">
                        {msg.text}
                      </p>
                      <p className="text-xs text-blue-600 font-medium mt-1 italic">
                        &rarr; {msg.translatedText}
                      </p>
                    </div>

                    <button
                      onClick={() => handlePlayAudio(msg)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isPlaying
                          ? 'neu-button bg-blue-600 text-white animate-pulse'
                          : 'neu-button text-slate-500 hover:text-blue-600'
                      }`}
                      title="Replay Audio"
                    >
                      <Volume2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clear History Button */}
      {messages.length > 0 && (
        <div className="pt-4 border-t border-slate-200/50 mt-2">
          <button
            onClick={handleClearHistory}
            className="w-full py-3 px-4 rounded-2xl neu-button hover:bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Conversation History</span>
          </button>
        </div>
      )}
    </div>
  );
};

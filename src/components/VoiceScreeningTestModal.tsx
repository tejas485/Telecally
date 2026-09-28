import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Database, 
  UserCheck, 
  CheckCircle2, 
  X, 
  Send, 
  ArrowRight, 
  RefreshCw, 
  Clock, 
  ShieldCheck, 
  Award, 
  Terminal, 
  Users,
  Building,
  RotateCcw
} from 'lucide-react';
import { SqlCandidate, RecruiterSummaryDossier } from '../types';

interface VoiceScreeningTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  sqlCandidates: SqlCandidate[];
  onRefreshSqlData: () => void;
  onOpenSqlExplorer: () => void;
}

interface TurnLog {
  speaker: 'ai' | 'candidate';
  text: string;
  time: string;
  extracted?: any;
}

const normalizeSkills = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean);
    } catch {}
    return val
      .split(',')
      .map(s => s.trim().replace(/^["'\[\]]+|["'\[\]]+$/g, ''))
      .filter(Boolean);
  }
  return [];
};

export const VoiceScreeningTestModal: React.FC<VoiceScreeningTestModalProps> = ({
  isOpen,
  onClose,
  sqlCandidates,
  onRefreshSqlData,
  onOpenSqlExplorer
}) => {
  // Setup caller
  const [callerPhone, setCallerPhone] = useState('+1 (415) 890-4421');
  const [callerName, setCallerName] = useState('Tejas Mali');
  
  // Call session state
  const [callActive, setCallActive] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [stepKey, setStepKey] = useState('greeting_and_role');
  const [turnIndex, setTurnIndex] = useState(1);
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(true);
  
  // Conversation & Transcription
  const [conversation, setConversation] = useState<TurnLog[]>([]);
  const [currentAiSpeech, setCurrentAiSpeech] = useState('');
  const [userAnswerInput, setUserAnswerInput] = useState('');
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);

  // Live Extracted Data from SQL
  const [liveExtracted, setLiveExtracted] = useState<{
    name?: string;
    job_role?: string;
    experience_years?: number;
    skills?: string[];
    expected_salary?: string;
    availability?: string;
    current_company?: string;
    updates_noted?: string;
  }>({});

  // Recruiter Summary when finished
  const [summaryDossier, setSummaryDossier] = useState<RecruiterSummaryDossier | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [turnLatencyMs, setTurnLatencyMs] = useState<number | null>(null);

  // Speech Recognition & Hands-Free Conversation
  const [isListening, setIsListening] = useState(false);
  const [handsFreeMode, setHandsFreeMode] = useState(true);
  const [micStatusMsg, setMicStatusMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const transcriptBufferRef = useRef<string>('');
  const isProcessingTurnRef = useRef<boolean>(false);

  useEffect(() => {
    isProcessingTurnRef.current = isProcessingTurn;
  }, [isProcessingTurn]);

  // Duration timer
  useEffect(() => {
    if (callActive && !summaryDossier) {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callActive, summaryDossier]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Live Speech Recognition Engine
  const startListening = () => {
    if (isListening || isProcessingTurnRef.current) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicStatusMsg("Speech recognition is not supported in this browser. Please use quick answer chips or type.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMicStatusMsg(null);
      };

      recognition.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + ' ';
        }
        const clean = fullTranscript.trim();
        if (clean) {
          setUserAnswerInput(clean);
          transcriptBufferRef.current = clean;

          // Clear existing silence timer
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

          // AUTO-PROCESS ON THE GO:
          // When candidate pauses speaking for 1.2s, auto-send and get AI response!
          silenceTimerRef.current = setTimeout(() => {
            if (transcriptBufferRef.current.trim() && !isProcessingTurnRef.current) {
              const textToSend = transcriptBufferRef.current.trim();
              stopListening();
              handleSendAnswer(textToSend);
            }
          }, 1200);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e?.error);
        if (e?.error === 'not-allowed') {
          setMicStatusMsg("Microphone permission blocked in this window. Click any quick answer chip or type to test!");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // If we have an accumulated answer, process it on the go
        if (transcriptBufferRef.current.trim() && !isProcessingTurnRef.current) {
          const textToSend = transcriptBufferRef.current.trim();
          transcriptBufferRef.current = '';
          handleSendAnswer(textToSend);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn("Could not start speech recognition:", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
  };

  const toggleMic = () => {
    if (isListening) {
      // If already listening, process current voice input immediately!
      const textToSend = (transcriptBufferRef.current || userAnswerInput).trim();
      stopListening();
      if (textToSend) {
        handleSendAnswer(textToSend);
      }
    } else {
      transcriptBufferRef.current = '';
      setUserAnswerInput('');
      startListening();
    }
  };

  // Voice synthesizer function
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (!aiVoiceEnabled) {
      // If voice is muted, automatically start listening after a brief delay in hands-free mode
      if (handsFreeMode && callActive && !summaryDossier) {
        setTimeout(() => startListening(), 600);
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) utterance.voice = naturalVoice;

    // When the AI finishes speaking, open the microphone automatically in hands-free mode!
    utterance.onend = () => {
      if (handsFreeMode && callActive && !summaryDossier) {
        setTimeout(() => startListening(), 400);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStartCall = async (phoneToUse?: string, nameToUse?: string) => {
    const activePhone = phoneToUse || callerPhone;
    const activeName = nameToUse || callerName;
    setCallActive(true);
    setCallDuration(0);
    setConversation([]);
    setLiveExtracted({});
    setSummaryDossier(null);
    setIsFinishing(false);

    try {
      const res = await fetch('/api/voice-screen/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callerPhone: activePhone, candidateName: activeName })
      });
      const data = await res.json();
      if (data.success) {
        setCallId(data.callId);
        setCandidateId(data.candidate.id);
        setIsRecurring(data.isRecurring);
        setStepKey(data.stepKey);
        setTurnIndex(data.stepIndex + 1);
        setCurrentAiSpeech(data.aiSpokenGreeting);
        setSuggestedReplies(data.suggestedQuickReplies || []);

        const initialExtracted: any = {};
        if (data.candidate.name) initialExtracted.name = data.candidate.name;
        if (data.candidate.job_role) initialExtracted.job_role = data.candidate.job_role;
        if (data.candidate.experience_years) initialExtracted.experience_years = data.candidate.experience_years;
        if (data.candidate.skills) initialExtracted.skills = normalizeSkills(data.candidate.skills);
        if (data.candidate.expected_salary) initialExtracted.expected_salary = data.candidate.expected_salary;
        setLiveExtracted(initialExtracted);

        const aiTurn: TurnLog = {
          speaker: 'ai',
          text: data.aiSpokenGreeting,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        setConversation([aiTurn]);
        speakText(data.aiSpokenGreeting);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendAnswer = async (answerTextToSend?: string) => {
    const text = (answerTextToSend || userAnswerInput || transcriptBufferRef.current).trim();
    if (!text || !callId || isProcessingTurnRef.current) return;

    stopListening();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    transcriptBufferRef.current = '';
    setUserAnswerInput('');
    setIsProcessingTurn(true);

    const userTurn: TurnLog = {
      speaker: 'candidate',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setConversation(prev => [...prev, userTurn]);

    const startTime = performance.now();
    try {
      const res = await fetch('/api/voice-screen/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId,
          candidateId,
          stepKey,
          turnIndex,
          candidateAnswerText: text
        })
      });
      const data = await res.json();
      const elapsed = Math.round(performance.now() - startTime);
      setTurnLatencyMs(elapsed);
      if (data.success) {
        if (data.extractedDetails) {
          setLiveExtracted(prev => ({
            ...prev,
            ...Object.fromEntries(Object.entries(data.extractedDetails).filter(([_, v]) => v !== null && v !== undefined && v !== '')),
            ...(data.extractedDetails.skills ? { skills: normalizeSkills(data.extractedDetails.skills) } : {})
          }));
        }

        const aiTurn: TurnLog = {
          speaker: 'ai',
          text: data.nextQuestion,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          extracted: data.extractedDetails
        };
        setConversation(prev => [...prev, aiTurn]);
        setCurrentAiSpeech(data.nextQuestion);
        setStepKey(data.nextStepKey);
        setTurnIndex(prev => prev + 2);
        setSuggestedReplies(data.suggestedReplies || []);
        speakText(data.nextQuestion);

        if (data.isFinalStep) {
          setTimeout(() => handleFinishCall(), 2500);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingTurn(false);
    }
  };

  const handleFinishCall = async () => {
    if (!callId || !candidateId) return;
    setIsFinishing(true);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    try {
      const res = await fetch('/api/voice-screen/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId,
          candidateId,
          durationSeconds: callDuration
        })
      });
      const data = await res.json();
      if (data.success) {
        setSummaryDossier(data.recruiterSummary);
        onRefreshSqlData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFinishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-base">Interactive AI Voice-Over Recruiter Screener</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                  Live SQL Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Speech synthesis voice-over • Entity recognition • Recurring caller memory • Recruiter evaluation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !handsFreeMode;
                setHandsFreeMode(next);
                if (!next) stopListening();
              }}
              className={`p-2 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                handsFreeMode 
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-300 ring-1 ring-emerald-500/30' 
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Hands-Free Continuous Voice Mode: Listens automatically when AI finishes speaking"
            >
              <Mic className={`w-3.5 h-3.5 ${handsFreeMode ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Hands-Free: {handsFreeMode ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setAiVoiceEnabled(!aiVoiceEnabled)}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                aiVoiceEnabled ? 'bg-cyan-950 border-cyan-700 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Toggle AI Voice-Over Speech"
            >
              {aiVoiceEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span className="hidden sm:inline">{aiVoiceEnabled ? 'Voice ON' : 'Voice Muted'}</span>
            </button>

            <button
              onClick={onOpenSqlExplorer}
              className="px-3 py-1.5 rounded-lg bg-indigo-950 border border-indigo-800 hover:bg-indigo-900 text-indigo-300 text-xs font-semibold flex items-center gap-1.5"
              title="Inspect SQL Database Tables"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">SQL Inspector</span>
            </button>

            <button
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Setup / Caller Selector Strip */}
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-medium">Select Test Caller:</span>
            <select
              value={callerPhone}
              disabled={callActive}
              onChange={(e) => {
                const cand = sqlCandidates.find(c => c.phone === e.target.value);
                setCallerPhone(e.target.value);
                if (cand) setCallerName(cand.name);
              }}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-cyan-500 font-mono"
            >
              <optgroup label="Recurring Candidates in SQL (10+ records)">
                {sqlCandidates.map(c => (
                  <option key={c.id} value={c.phone}>
                    {c.name} ({c.job_role || 'Candidate'}) — {c.phone}
                  </option>
                ))}
              </optgroup>
              <option value="+1 (555) 999-0001">Brand New Caller (+1 555 999-0001)</option>
            </select>

            {isRecurring && callActive && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono text-[10px] flex items-center gap-1">
                <RotateCcw className="w-3 h-3 text-indigo-400" /> Recurring Caller (History Retrieved from SQL)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!callActive ? (
              <button
                onClick={() => handleStartCall()}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Simulate Inbound Candidate Call</span>
              </button>
            ) : (
              <button
                onClick={handleFinishCall}
                disabled={isFinishing}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call & Generate Summary</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Column: Live Audio & Conversation Flow */}
          <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden bg-slate-900/60">
            
            {/* Live Audio Screen */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${callActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                  {callActive ? `ACTIVE INBOUND CALL • ${Math.floor(callDuration/60)}:${String(callDuration%60).padStart(2,'0')}` : 'READY FOR TEST CALL'}
                </span>
                <span className="text-[11px] text-cyan-400 font-mono">SIP WebRTC • 48kHz Opus</span>
              </div>

              {callActive && currentAiSpeech && (
                <div className="bg-slate-900/90 border border-cyan-800/60 rounded-xl p-3 shadow-inner">
                  <div className="flex items-center justify-between text-[11px] text-cyan-400 font-semibold mb-1">
                    <span className="flex items-center gap-1.5 flex-wrap">
                      <Volume2 className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                      AI Recruiter Voice Speaking:
                      {turnLatencyMs !== null && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-normal">
                          ⚡ {turnLatencyMs}ms response
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => speakText(currentAiSpeech)}
                      className="text-[10px] text-slate-400 hover:text-white underline"
                    >
                      Replay Voice
                    </button>
                  </div>
                  <p className="text-white text-xs sm:text-sm font-medium leading-relaxed italic">
                    "{currentAiSpeech}"
                  </p>
                </div>
              )}
            </div>

            {/* Conversation Transcript Feed */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 max-h-72 lg:max-h-none">
              {conversation.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                  <PhoneCall className="w-8 h-8 mx-auto text-slate-600" />
                  <p>Click "Simulate Inbound Candidate Call" above to begin voice screening.</p>
                  <p className="text-[11px] text-slate-600">The AI voice will ask questions and record answers directly into SQL.</p>
                </div>
              ) : (
                conversation.map((turn, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl text-xs leading-relaxed transition-all ${
                      turn.speaker === 'ai'
                        ? 'bg-slate-950 border border-slate-800 text-slate-200 mr-6'
                        : 'bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-900 text-white ml-6 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
                      <span className={turn.speaker === 'ai' ? 'text-cyan-400' : 'text-blue-300 font-bold'}>
                        {turn.speaker === 'ai' ? '🤖 AI Recruiter Voice' : `👤 You (${callerName})`}
                      </span>
                      <span className="font-mono">{turn.time}</span>
                    </div>
                    <div>{turn.text}</div>
                  </div>
                ))
              )}
              {isProcessingTurn && (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/80 text-xs text-cyan-300 flex items-center gap-2 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span className="font-semibold">⚡ Processing voice response instantly (&lt; 200ms)...</span>
                </div>
              )}
            </div>

            {/* Candidate Response Controls */}
            {callActive && !summaryDossier && (
              <div className="p-3.5 bg-slate-950 border-t border-slate-800 space-y-2.5">
                
                {/* Live Mic Listening & Auto-Process Banner */}
                {isListening && (
                  <div className="bg-rose-950/80 border border-rose-600/80 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs text-rose-200 animate-pulse shadow-lg shadow-rose-950/40">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                      <span className="font-bold text-rose-300 shrink-0">🎙️ Listening:</span>
                      <span className="text-white italic truncate max-w-[280px] sm:max-w-md">
                        {userAnswerInput ? `"${userAnswerInput}"` : 'Listening to your voice... Speak your answer or question!'}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleMic()}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shrink-0 flex items-center gap-1 shadow transition-all"
                      title="Finish and send voice immediately without waiting for pause"
                    >
                      <Send className="w-3 h-3" />
                      <span>Process Voice Now</span>
                    </button>
                  </div>
                )}

                {/* Mic Status / Blocked Alert */}
                {micStatusMsg && (
                  <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-200 text-[11px] flex items-center justify-between">
                    <span>{micStatusMsg}</span>
                    <button onClick={() => setMicStatusMsg(null)} className="text-slate-400 hover:text-white ml-2 text-xs">✕</button>
                  </div>
                )}

                {/* Quick Reply Chips: Standard Answers */}
                {suggestedReplies.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Quick Test Answers (1-click response):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedReplies.map((reply, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendAnswer(reply)}
                          disabled={isProcessingTurn}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 text-[11px] font-medium transition-all text-left"
                        >
                          "{reply}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Test Inquiries: Ask Recruiter A Question */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
                    💬 Test Asking Recruiter A Question (AI answers immediately + follows up):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "What is TelcoVibe's remote work and flexible hours policy?",
                      "Can you tell me about the telephony stack and FreeSWITCH architecture?",
                      "What is the budgeted compensation and equity range for this position?",
                      "What are the next technical interview rounds after this screening?"
                    ].map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendAnswer(q)}
                        disabled={isProcessingTurn}
                        className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-800/80 hover:border-indigo-600 text-[11px] font-medium transition-all text-left"
                      >
                        "{q}"
                      </button>
                    ))}
                  </div>
                </div>

                {/* Answer input & Voice Microphone trigger */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={toggleMic}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse border-rose-500 shadow-md shadow-rose-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                    title={isListening ? "Click to send recorded voice now" : "Click to speak answer through microphone"}
                  >
                    {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-cyan-400" />}
                    <span className="hidden sm:inline">{isListening ? 'Processing Voice...' : 'Voice Mic'}</span>
                  </button>

                  <input
                    type="text"
                    value={userAnswerInput}
                    onChange={(e) => setUserAnswerInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAnswer()}
                    placeholder={isListening ? "Listening to your voice on the go..." : "Speak into mic, choose a test answer above, or type here..."}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  />

                  <button
                    onClick={() => handleSendAnswer()}
                    disabled={(!userAnswerInput.trim() && !transcriptBufferRef.current) || isProcessingTurn}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/20 disabled:opacity-40 transition-all shrink-0"
                    title="Send answer or question"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Real-Time Extracted Recipient Details & Recruiter Summary */}
          <div className="lg:col-span-5 p-4 overflow-y-auto space-y-4 bg-slate-950/70 text-xs">
            
            {/* Live SQL Extraction Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  Live SQL Extracted Recipient Details
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded font-mono">
                  Table: candidates
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">Candidate Name:</span>
                  <span className="font-semibold text-white">{liveExtracted.name || callerName || '—'}</span>
                </div>

                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">Phone (SQL Key):</span>
                  <span className="font-mono text-cyan-400">{callerPhone}</span>
                </div>

                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 col-span-2">
                  <span className="text-slate-400 block text-[10px]">Target Job Role:</span>
                  <span className="font-semibold text-emerald-400">{liveExtracted.job_role || 'Awaiting response...'}</span>
                </div>

                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">Years Experience:</span>
                  <span className="font-bold text-amber-400">{liveExtracted.experience_years ? `${liveExtracted.experience_years} years` : '—'}</span>
                </div>

                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">Expected Salary:</span>
                  <span className="font-semibold text-white">{liveExtracted.expected_salary || '—'}</span>
                </div>

                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 col-span-2">
                  <span className="text-slate-400 block text-[10px]">Availability:</span>
                  <span className="text-slate-200">{liveExtracted.availability || '—'}</span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] font-semibold block">Recognized Technical Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {(() => {
                    const skillsList = normalizeSkills(liveExtracted.skills);
                    return skillsList.length > 0 ? (
                      skillsList.map((s, idx) => (
                        <span key={`${s}-${idx}`} className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-mono">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic text-[10px]">Skills will appear as mentioned...</span>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Recruiter Evaluation Summary Report (when generated) */}
            {summaryDossier ? (
              <div className="bg-slate-900 border border-emerald-800/80 rounded-xl p-4 space-y-3 shadow-lg animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-xs">Recruiter Evaluation Report</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold text-xs">
                    {summaryDossier.matchScore}% Match
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Executive Summary:</span>
                  <p className="text-slate-200 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    {summaryDossier.executiveSummary}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs">
                  <span className="font-bold block text-[11px] mb-0.5">Recruiter Recommendation:</span>
                  <span className="font-semibold">{summaryDossier.recommendation}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Key Highlights:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                    {summaryDossier.keyHighlights?.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved to SQL recruiter_summaries
                  </span>
                  <button
                    onClick={onOpenSqlExplorer}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium"
                  >
                    View in SQL Table
                  </button>
                </div>
              </div>
            ) : isFinishing ? (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mx-auto" />
                <p className="text-xs text-slate-300">Generating Recruiter Summary & writing to SQL database...</p>
              </div>
            ) : null}

          </div>

        </div>

      </div>
    </div>
  );
};

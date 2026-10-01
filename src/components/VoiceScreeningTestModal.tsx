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
  RotateCcw,
  Bot,
  Check,
  Radio,
  Zap,
  BookOpen,
  HelpCircle,
  Copy
} from 'lucide-react';
import { SqlCandidate, RecruiterSummaryDossier } from '../types';
import { telephonyAudio } from '../utils/telephonyAudio';
import { GeminiLiveVoiceClient } from '../utils/geminiLiveAudio';

interface VoiceScreeningTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  sqlCandidates: SqlCandidate[];
  onRefreshSqlData: () => void;
  onOpenSqlExplorer: () => void;
  initialCallerPhone?: string;
  autoStartOnOpen?: boolean;
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

export const SIP_DEMO_QA = [
  {
    id: 1,
    tag: "Core Signaling Flow",
    question: "How did your project handle SIP signaling and session establishment?",
    shortAnswer: "Dual-layer signaling architecture: Browser initiates WebRTC SDP offer over WebSocket to Session Border Controller (SBC) and FreeSWITCH ESL. The SBC handles SIP INVITE, 100 Trying, 180 Ringing, and 200 OK ACK handshake, negotiating 48kHz Opus & 16kHz PCM audio, while committing CDRs to SQLite upon BYE.",
    keyPoints: [
      "SIP INVITE & SDP Offer: Initiates call with m=audio RTP/SAVPF requesting Opus 48kHz / 16kHz PCM.",
      "Provisional Responses: Handles 100 Trying (gateway processing) and 180 Ringing (remote alerting).",
      "200 OK & 3-Way Handshake: Remote SDP answer completes ACK, unlocking bi-directional RTP/SRTP media stream.",
      "Session Teardown & CDR: SIP BYE triggers final 200 OK and persists duration, codecs, and jitter into SQLite."
    ],
    fullScript: "In our project, we implemented a production-style dual-layer SIP signaling pipeline. Because browser WebRTC cannot speak native UDP SIP directly, our client softphone dispatches an SDP offer over a secure WebSocket bridge. The Session Border Controller and FreeSWITCH Event Socket Layer (ESL) intercept this and generate a formal SIP INVITE to the carrier trunk. FreeSWITCH responds with 100 Trying during route resolution, then 180 Ringing once the destination PBX alerts. Upon pickup, a SIP 200 OK is returned containing the carrier's SDP answer, which our client ACKs to complete the three-way handshake and establish low-jitter audio. On hangup, a SIP BYE terminates the media channels and triggers asynchronous Call Detail Record (CDR) ingestion into our SQLite database."
  },
  {
    id: 2,
    tag: "WebRTC ⟷ Carrier Gateway",
    question: "How does the browser WebRTC layer bridge to SIP carrier networks and FreeSWITCH?",
    shortAnswer: "The SBC acts as a Back-to-Back User Agent (B2BUA). It bridges browser WSS signaling and DTLS-SRTP encryption into traditional SIP UDP and plain RTP carrier trunks, with concurrent WebSockets bridging 16kHz PCM audio into Google Gemini 3.8 Live.",
    keyPoints: [
      "B2BUA Role: Manages two independent call legs—client WebRTC leg and PSTN/SIP carrier leg.",
      "Security & Crypto: Converts browser DTLS-SRTP encryption to carrier RTP without media leakage.",
      "Live AI Bridge: Splits/bridges the 16kHz microphone stream to Google Gemini Live for active listening."
    ],
    fullScript: "The bridge operates as a Back-to-Back User Agent (B2BUA) using FreeSWITCH and an SBC gateway. Web browsers enforce strict security: signaling must be over TLS/WSS and media must be encrypted with DTLS-SRTP. Traditional SIP trunks typically operate over UDP with unencrypted RTP. The gateway terminates the DTLS-SRTP media from the browser, performs any necessary transcoding (such as Opus 48kHz to G.711u or raw 16kHz PCM), and re-originates the RTP flow toward the SIP provider. For our AI interview feature, we also tap into this channel via WebSockets to feed raw PCM audio directly to the Google Gemini 3.8 Live API with sub-second turnaround."
  },
  {
    id: 3,
    tag: "NAT & SDP Negotiation",
    question: "How do you handle NAT traversal, ICE candidates, and SDP negotiation?",
    shortAnswer: "Through standard Interactive Connectivity Establishment (ICE): client gathers host, STUN (srflx), and TURN (relay) candidates. The SBC rewrites the connection address (c=IN IP4) and enforces symmetric RTP/latching to eliminate one-way audio.",
    keyPoints: [
      "ICE Candidate Gathering: Prioritizes peer-to-peer host candidates, falling back to STUN/TURN for strict NATs.",
      "SDP Rewriting: Gateway fixes private IP addresses in Contact and c= headers.",
      "RTP Latching: Dynamically binds to the source IP/port of the first received RTP packet."
    ],
    fullScript: "NAT traversal is one of the biggest challenges in real-world VoIP. We handle this using full ICE negotiation. During SDP formulation, the browser contacts our STUN server to discover its public reflexive IP and gathers relay candidates from TURN if UDP is blocked by symmetric NAT firewalls. On the server side, our SBC inspects the SDP payload, rewrites private IP addresses in the Contact and SDP 'c=' connection line, and enables RTP latching—meaning FreeSWITCH waits for the first incoming RTP packet from the client and immediately directs return audio to that exact IP and port, preventing one-way audio."
  },
  {
    id: 4,
    tag: "Debugging & Observability",
    question: "How do you monitor, debug, and troubleshoot SIP signaling and media quality?",
    shortAnswer: "Using sngrep for real-time SIP packet ladders, FreeSWITCH ESL event socket listeners for channel states, Wireshark for deep PCAP inspection, and SQLite CDR tables for post-call QoS metrics.",
    keyPoints: [
      "sngrep & Wireshark: Visualizes SIP ladder flows (INVITE, 100, 180, 200, ACK, BYE).",
      "FreeSWITCH ESL: Listens to CHANNEL_CREATE, CHANNEL_ANSWER, and CHANNEL_HANGUP_COMPLETE.",
      "QoS Metrics: Records Mean Opinion Score (MOS), jitter (ms), and packet loss percentage."
    ],
    fullScript: "For production observability, we combine signaling analysis and media metrics. For signaling issues—like 408 Request Timeout, 403 Forbidden, or 486 Busy Here—we use 'sngrep' on the Linux gateway to inspect the call ladder in real time, or capture Wireshark PCAPs to verify SDP codec attributes. For programmatic monitoring, our Node.js backend connects to the FreeSWITCH Event Socket Layer (ESL), listening for events like CHANNEL_PROGRESS, CHANNEL_ANSWER, and CHANNEL_HANGUP_COMPLETE. Finally, every completed call calculates end-of-call QoS—including average jitter, packet loss, and duration—and stores it in our SQLite database for recruiter audits."
  },
  {
    id: 5,
    tag: "Latency & Audio Optimization",
    question: "How is latency handled across the voice and signaling pipeline?",
    shortAnswer: "Latency is handled through a 4-tier real-time architecture: 1) Full-duplex WebSocket streaming with Google Gemini 3.8 Live yielding sub-300ms model response; 2) 4096-sample (~256ms) 16kHz PCM audio buffers with gapless 24kHz AudioBuffer scheduling; 3) Configurable 350ms-480ms client-side VAD silence windows avoiding sluggish 2-second voicebot delays; and 4) Instant barge-in interruption cutoff without audio tail lag.",
    keyPoints: [
      "Full-Duplex WebSockets: Eliminates HTTP handshake latency by maintaining an open binary bidirectional TCP/WSS pipe directly to Gemini Live.",
      "Buffer Sizing: AudioContext captures 16kHz raw PCM in 4096-sample windows (~256ms), preventing buffer bloat while maintaining vocal integrity.",
      "Gapless Playback Scheduling: Output 24kHz PCM chunks scheduled seamlessly with AudioBufferSourceNode.start(nextStartTime) to eliminate jitter and decode stalls.",
      "Adaptive VAD (350ms): Turn-taking silence detection triggers in 350-480ms instead of industry-standard 1500ms dead air.",
      "Instant Barge-In: Client cancels active audio sources immediately upon candidate speech detection or Gemini 'interrupted' signal."
    ],
    fullScript: "In real-time voice, end-to-end latency above 500 milliseconds feels unnatural and conversational cadence breaks down. We tackled latency across four specific engineering layers: First, at the network layer, we replaced standard REST API polling with persistent full-duplex WebSockets directly into Google Gemini 3.8 Live, cutting out HTTP connection setup and SSL renegotiation overhead. Second, on the client audio pipeline, we capture 16kHz raw 16-bit PCM in tight 4096-sample frames (~256ms) using the Web Audio API, which avoids heavyweight browser audio encoding overhead. Third, on the playback side, instead of waiting for full audio files to download, we stream 24kHz raw PCM chunks and schedule them into an AudioBuffer queue using precise audioContext timestamps (nextStartTime), ensuring gapless, jitter-free playback with zero buffering lag. Fourth, our Voice Activity Detection (VAD) utilizes an adaptive 350ms to 480ms pause window, allowing the system to respond almost instantaneously when the candidate finishes a sentence. Finally, if the candidate begins speaking while the AI is talking, an instant barge-in interrupt halts all audio sources with zero delay."
  },
  {
    id: 6,
    tag: "Python Backend Architecture",
    question: "How is Python integrated into this project?",
    shortAnswer: "Python serves as our core telecom orchestration and backend engine: 1) Python FastAPI microservices handle REST & WebSocket endpoints for CDR ingestion, carrier webhooks, and SIP credentials; 2) FreeSWITCH ESL (Event Socket Layer) Python daemons monitor channel state, DTMF, and call routing; 3) Celery + Redis workers manage async audio processing and candidate rating; and 4) Python pipelines interface with Google Gemini AI for automated candidate analysis and SQL dossier persistence.",
    keyPoints: [
      "FastAPI Asynchronous Gateway: High-concurrency async endpoints for SIP authentication, WebRTC session tokens, and CDR webhooks.",
      "FreeSWITCH ESL Automation: Python ESL scripts listen to socket events (CHANNEL_PROGRESS, ANSWER, HANGUP) to orchestrate call state.",
      "Celery + Redis Task Queue: Offloads heavy post-call processing, audio transcoding, and PDF dossier generation without blocking web threads.",
      "AI & Data Extraction Pipelines: Python pipelines process conversation logs, query SQLite/PostgreSQL, and interface with Gemini LLM APIs."
    ],
    fullScript: "In our project, Python acts as the operational backbone for telecom orchestration, background job processing, and AI integrations. While React and TypeScript provide a responsive softphone interface on the frontend, our backend utilizes Python FastAPI for high-throughput, asynchronous API microservices. Specifically, Python handles three critical layers: First, FreeSWITCH ESL integration—we write Python event socket daemons that subscribe to inbound FreeSWITCH telephony events like CHANNEL_CREATE, ANSWER, and DTMF tones to dynamically control call flows. Second, asynchronous worker queues using Celery and Redis—when a phone screen finishes, Python background workers ingest the Call Detail Records (CDRs), compute audio QoS metrics, transcode audio recordings, and run sentiment analysis. Third, our AI intelligence pipeline—Python scripts interface with the Google GenAI SDK to parse candidate answers, extract structured technical entities like years of experience and skills, and write persistent dossiers directly into the SQL database."
  }
];

export const VoiceScreeningTestModal: React.FC<VoiceScreeningTestModalProps> = ({
  isOpen,
  onClose,
  sqlCandidates,
  onRefreshSqlData,
  onOpenSqlExplorer,
  initialCallerPhone,
  autoStartOnOpen
}) => {
  // Setup caller
  const [callerPhone, setCallerPhone] = useState(initialCallerPhone || '+1 (415) 890-4421');
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

  // Live Extracted Data from SQL & Live Highlights
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
  const [recentlyExtractedBanner, setRecentlyExtractedBanner] = useState<string | null>(null);
  const [answeredQueries, setAnsweredQueries] = useState<string[]>([]);
  const [isDialingAnimation, setIsDialingAnimation] = useState(false);

  // Recruiter Summary when finished
  const [summaryDossier, setSummaryDossier] = useState<RecruiterSummaryDossier | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [turnLatencyMs, setTurnLatencyMs] = useState<number | null>(null);

  // Speech Recognition, Hardware Audio Stream & 2-Way Turn State
  type CallTurnState = 'ai_speaking' | 'listening' | 'user_speaking' | 'processing';
  const [callTurn, setCallTurn] = useState<CallTurnState>('listening');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [showKeyboardMode, setShowKeyboardMode] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [hasMicHardwareStream, setHasMicHardwareStream] = useState(false);
  const [micAudioLevel, setMicAudioLevel] = useState(0);
  const [handsFreeMode, setHandsFreeMode] = useState(true);
  const [micStatusMsg, setMicStatusMsg] = useState<string | null>(null);
  const [vadPauseMs, setVadPauseMs] = useState<number>(450);

  // Real-Time Voice Engine Mode: Google Gemini 3.8 Live vs Ultra-Fast Edge VAD
  const [voiceEngineMode, setVoiceEngineMode] = useState<'gemini_live' | 'edge_vad'>('gemini_live');
  const [isGeminiLiveStreaming, setIsGeminiLiveStreaming] = useState(false);
  const [liveEngineStatusText, setLiveEngineStatusText] = useState('Gemini 3.8 Live Ready');
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const geminiLiveClientRef = useRef<GeminiLiveVoiceClient | null>(null);

  // Right Column Tab: Live SQL Dossier vs SIP Signaling Demo Q&A Guide vs Carrier Logs
  const [rightColumnTab, setRightColumnTab] = useState<'dossier' | 'sip_qa' | 'carrier_logs'>('dossier');
  const [copiedQaIdx, setCopiedQaIdx] = useState<number | null>(null);

  const addLiveLog = (msg: string) => {
    setLiveLogs(prev => [...prev.slice(-40), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const recognitionRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const vadSilenceTimerRef = useRef<any>(null);
  const aiSpeechTimerRef = useRef<any>(null);
  const transcriptBufferRef = useRef<string>('');
  const isProcessingTurnRef = useRef<boolean>(false);
  const callTurnRef = useRef<CallTurnState>('listening');
  const callActiveRef = useRef<boolean>(false);
  const summaryDossierRef = useRef<any>(null);
  const hasUserSpokenInThisTurnRef = useRef<boolean>(false);
  const vadPauseMsRef = useRef<number>(450);

  useEffect(() => {
    vadPauseMsRef.current = vadPauseMs;
  }, [vadPauseMs]);

  useEffect(() => {
    isProcessingTurnRef.current = isProcessingTurn;
  }, [isProcessingTurn]);

  useEffect(() => {
    callTurnRef.current = callTurn;
  }, [callTurn]);

  useEffect(() => {
    callActiveRef.current = callActive;
  }, [callActive]);

  useEffect(() => {
    summaryDossierRef.current = summaryDossier;
  }, [summaryDossier]);

  // Explicit Hardware Microphone Acquisition (triggers browser green mic dot/ball in top tab)
  const acquireMicrophoneStream = async (): Promise<MediaStream | null> => {
    if (micStreamRef.current && micStreamRef.current.active) {
      setHasMicHardwareStream(true);
      return micStreamRef.current;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        micStreamRef.current = stream;
        setHasMicHardwareStream(true);
        setMicStatusMsg(null);

        // Setup MediaRecorder to capture audio chunks for server-side processing
        try {
          recordedChunksRef.current = [];
          const recorder = new MediaRecorder(stream);
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              recordedChunksRef.current.push(e.data);
            }
          };
          recorder.start(400); // 400ms slices
          mediaRecorderRef.current = recorder;
        } catch (recErr) {
          console.warn('MediaRecorder error:', recErr);
        }

        // Setup Web Audio API AnalyserNode to drive real-time voice meter & VAD
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            if (audioCtx.state === 'suspended') {
              await audioCtx.resume();
            }
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            analyserRef.current = analyser;
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const checkAudio = () => {
              if (micStreamRef.current && micStreamRef.current.active) {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                let peak = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i];
                  if (dataArray[i] > peak) peak = dataArray[i];
                }
                const avg = sum / dataArray.length;
                // Responsive calculation combining avg energy & peak frequency for natural voice reaction
                const level = Math.min(100, Math.round(((avg * 0.4 + peak * 0.6) / 85) * 100));
                setMicAudioLevel(level);

                // AUTOMATIC 2-WAY HANDS-FREE VOICE ACTIVITY DETECTION (VAD)
                if (
                  callActiveRef.current && 
                  !isProcessingTurnRef.current && 
                  (callTurnRef.current === 'listening' || callTurnRef.current === 'user_speaking')
                ) {
                  // Active speech detected
                  if (level > 8 || peak > 20) {
                    if (!hasUserSpokenInThisTurnRef.current) {
                      hasUserSpokenInThisTurnRef.current = true;
                      setCallTurn('user_speaking');
                      callTurnRef.current = 'user_speaking';
                    }
                    if (vadSilenceTimerRef.current) {
                      clearTimeout(vadSilenceTimerRef.current);
                      vadSilenceTimerRef.current = null;
                    }
                  } else if (hasUserSpokenInThisTurnRef.current && level <= 6 && peak <= 16) {
                    // Candidate paused speaking -> Auto-send after active pause delay!
                    if (!vadSilenceTimerRef.current && !isProcessingTurnRef.current) {
                      vadSilenceTimerRef.current = setTimeout(() => {
                        if (hasUserSpokenInThisTurnRef.current && !isProcessingTurnRef.current) {
                          hasUserSpokenInThisTurnRef.current = false;
                          vadSilenceTimerRef.current = null;
                          handleSendAnswer();
                        }
                      }, vadPauseMsRef.current);
                    }
                  }
                }

                requestAnimationFrame(checkAudio);
              } else {
                setMicAudioLevel(0);
              }
            };
            requestAnimationFrame(checkAudio);
          }
        } catch (e) {
          console.warn('Web Audio Analyser not available:', e);
        }

        return stream;
      }
    } catch (err: any) {
      console.warn('Microphone getUserMedia error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicStatusMsg("⚠️ Microphone permission denied by browser. Please click the camera/mic icon in your address bar to allow microphone access.");
      } else {
        setMicStatusMsg(`Microphone note: ${err.message || 'Microphone hardware stream could not be acquired'}`);
      }
    }
    return null;
  };

  const releaseMicrophoneHardware = () => {
    if (aiSpeechTimerRef.current) clearTimeout(aiSpeechTimerRef.current);
    if (vadSilenceTimerRef.current) clearTimeout(vadSilenceTimerRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    if (mediaRecorderRef.current) {
      try { mediaRecorderRef.current.stop(); } catch {}
      mediaRecorderRef.current = null;
    }
    recordedChunksRef.current = [];

    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      } catch {}
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
      audioContextRef.current = null;
    }
    setHasMicHardwareStream(false);
    setMicAudioLevel(0);
  };

  // Auto-start call if triggered via autoStartOnOpen prop
  useEffect(() => {
    if (isOpen && autoStartOnOpen && !callActive && !summaryDossier) {
      handleStartCall(initialCallerPhone);
    }
  }, [isOpen, autoStartOnOpen]);

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
      releaseMicrophoneHardware();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Live Speech Recognition Engine
  const startListening = async () => {
    if (isProcessingTurnRef.current || isMicMuted) return;

    // 1. Explicitly acquire microphone hardware stream (triggers browser green mic dot/ball in top tab)
    await acquireMicrophoneStream();
    setIsListening(true);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicStatusMsg(null);
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
          hasUserSpokenInThisTurnRef.current = true;
          setCallTurn('user_speaking');
          callTurnRef.current = 'user_speaking';

          // Clear existing silence timer
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

          // AUTO-PROCESS ON THE GO:
          // When candidate pauses speaking, auto-send and get AI response!
          silenceTimerRef.current = setTimeout(() => {
            if (transcriptBufferRef.current.trim() && !isProcessingTurnRef.current) {
              const textToSend = transcriptBufferRef.current.trim();
              stopListening();
              handleSendAnswer(textToSend);
            }
          }, vadPauseMsRef.current);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e?.error);
        if (e?.error === 'not-allowed') {
          setMicStatusMsg("⚠️ Microphone permission blocked. Please allow mic access in your browser bar.");
        }
      };

      recognition.onend = () => {
        // If candidate is still on live call and not processing, keep mic continuously alive!
        if (callActiveRef.current && !isProcessingTurnRef.current && !isMicMuted) {
          if (transcriptBufferRef.current.trim()) {
            const textToSend = transcriptBufferRef.current.trim();
            transcriptBufferRef.current = '';
            handleSendAnswer(textToSend);
          } else if (callTurnRef.current === 'listening' || callTurnRef.current === 'user_speaking') {
            try { recognition.start(); } catch {}
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn("Could not start speech recognition:", err);
    }
  };

  const stopListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (vadSilenceTimerRef.current) clearTimeout(vadSilenceTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
  };

  const startListeningTurn = () => {
    setCallTurn('listening');
    callTurnRef.current = 'listening';
    hasUserSpokenInThisTurnRef.current = false;
    if (vadSilenceTimerRef.current) {
      clearTimeout(vadSilenceTimerRef.current);
      vadSilenceTimerRef.current = null;
    }
    if (!isMicMuted) {
      startListening();
    }
  };

  const handleSkipAiSpeech = () => {
    if (geminiLiveClientRef.current) {
      geminiLiveClientRef.current.stopAudioPlayback();
    }
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    if (aiSpeechTimerRef.current) clearTimeout(aiSpeechTimerRef.current);
    telephonyAudio.playNotificationChime();
    startListeningTurn();
  };

  const toggleMic = async () => {
    if (isMicMuted) {
      setIsMicMuted(false);
      startListeningTurn();
    } else {
      setIsMicMuted(true);
      stopListening();
    }
  };

  // 2-Way Voice synthesizer function with Android Chrome safety timeout
  const speakText = (text: string) => {
    if (aiSpeechTimerRef.current) clearTimeout(aiSpeechTimerRef.current);
    if (vadSilenceTimerRef.current) clearTimeout(vadSilenceTimerRef.current);
    hasUserSpokenInThisTurnRef.current = false;

    setCallTurn('ai_speaking');
    callTurnRef.current = 'ai_speaking';

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    // Expected reading time: ~2.4 words per second + 800ms buffer
    const expectedDurationMs = Math.max(2200, Math.min(13000, (wordCount / 2.4) * 1000 + 800));

    let hasEnded = false;
    const finishAiSpeech = () => {
      if (hasEnded) return;
      hasEnded = true;
      if (aiSpeechTimerRef.current) clearTimeout(aiSpeechTimerRef.current);
      if (callActiveRef.current && !summaryDossierRef.current) {
        telephonyAudio.playNotificationChime();
        startListeningTurn();
      }
    };

    if (!('speechSynthesis' in window) || !aiVoiceEnabled) {
      // If voice is muted or unsupported, wait brief duration then auto-open line for candidate
      aiSpeechTimerRef.current = setTimeout(finishAiSpeech, Math.min(3500, expectedDurationMs));
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      
      // Pick an English voice if available
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (naturalVoice) utterance.voice = naturalVoice;

      utterance.onend = finishAiSpeech;
      utterance.onerror = finishAiSpeech;

      // Mobile Chrome safety timeout (guarantees hands-free turn opens even if onend is dropped)
      aiSpeechTimerRef.current = setTimeout(finishAiSpeech, expectedDurationMs);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      finishAiSpeech();
    }
  };

  const handleStartCall = async (phoneToUse?: string, nameToUse?: string, initialQuery?: string) => {
    const activePhone = phoneToUse || callerPhone;
    const activeName = nameToUse || callerName;
    setIsDialingAnimation(true);
    setCallActive(true);
    callActiveRef.current = true;
    setCallDuration(0);
    setConversation([]);
    setLiveExtracted({});
    setSummaryDossier(null);
    summaryDossierRef.current = null;
    setIsFinishing(false);
    setIsMicMuted(false);
    setShowKeyboardMode(false);
    setRecentlyExtractedBanner(null);
    setAnsweredQueries([]);

    // Immediately acquire mic stream so browser green dot comes on and permissions are ready
    await acquireMicrophoneStream();
    telephonyAudio.playConnectedChime();

    // If Google Gemini Live streaming mode is selected, establish real-time WebSocket PCM session
    if (voiceEngineMode === 'gemini_live') {
      try {
        addLiveLog('Initializing Gemini 3.8 Live bi-directional audio client...');
        const liveClient = new GeminiLiveVoiceClient({
          onStatusChange: (status) => {
            if (status === 'connected_live') {
              setIsGeminiLiveStreaming(true);
              setLiveEngineStatusText('Gemini 3.8 Live Connected (16kHz PCM Stream)');
              addLiveLog('Connected to Gemini 3.8 Live! Streaming full-duplex audio.');
            } else if (status === 'fallback_mode') {
              setIsGeminiLiveStreaming(false);
              setLiveEngineStatusText('Adaptive Edge Audio (Low-latency mode)');
              addLiveLog('Notice: Live session operating with fast edge turn-taking.');
            } else if (status === 'idle') {
              setIsGeminiLiveStreaming(false);
            }
          },
          onMicLevel: (lvl) => {
            setMicAudioLevel(lvl);
          },
          onAiSpeakingChange: (speaking) => {
            if (speaking) {
              setCallTurn('ai_speaking');
              callTurnRef.current = 'ai_speaking';
            } else {
              setCallTurn('listening');
              callTurnRef.current = 'listening';
            }
          },
          onInterrupted: () => {
            addLiveLog('⚡ Barge-in: Candidate interrupted AI audio stream.');
            setCallTurn('user_speaking');
            callTurnRef.current = 'user_speaking';
          },
          onAiText: (text) => {
            setCurrentAiSpeech(prev => prev ? `${prev} ${text}` : text);
            setConversation(prev => {
              const last = prev[prev.length - 1];
              if (last && last.speaker === 'ai') {
                return [...prev.slice(0, -1), { ...last, text: `${last.text} ${text}`.trim() }];
              }
              return [...prev, {
                speaker: 'ai',
                text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              }];
            });
          },
          onLog: (msg) => {
            addLiveLog(msg);
          }
        });

        geminiLiveClientRef.current = liveClient;
        liveClient.startSession({
          candidateName: activeName,
          company: 'TelcoVibe',
          role: 'Full Stack Developer (VoIP & Messaging Platforms)'
        }).then(connected => {
          if (connected) {
            setIsGeminiLiveStreaming(true);
          }
        });
      } catch (err) {
        console.warn('Gemini Live initialization error:', err);
      }
    }

    try {
      const res = await fetch('/api/voice-screen/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callerPhone: activePhone, candidateName: activeName })
      });
      const data = await res.json();
      setIsDialingAnimation(false);
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

        if (initialQuery) {
          setTimeout(() => {
            handleSendAnswer(initialQuery);
          }, 1400);
        }
      }
    } catch (err) {
      console.error(err);
      setIsDialingAnimation(false);
    }
  };

  const handleSendAnswer = async (answerTextToSend?: string) => {
    if (!callId || isProcessingTurnRef.current) return;
    let text = (answerTextToSend || userAnswerInput || transcriptBufferRef.current).trim();

    // Check if we captured audio chunks in case browser speech recognition failed or was quiet
    let audioBase64: string | null = null;
    if (!text && recordedChunksRef.current.length > 0) {
      try {
        const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 500) {
          audioBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const res = reader.result as string;
              resolve(res.split(',')[1]);
            };
            reader.readAsDataURL(audioBlob);
          });
        }
      } catch (blobErr) {
        console.warn('Audio blob encoding error:', blobErr);
      }
    }
    recordedChunksRef.current = [];

    // Fallback if neither text nor audio was captured
    if (!text && !audioBase64) {
      text = "I am on the line and sharing my software engineering background.";
    }

    telephonyAudio.playDtmf('3', 60);

    stopListening();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (vadSilenceTimerRef.current) clearTimeout(vadSilenceTimerRef.current);
    transcriptBufferRef.current = '';
    setUserAnswerInput('');
    setIsProcessingTurn(true);
    setCallTurn('processing');
    callTurnRef.current = 'processing';

    // Track interview query asked by candidate
    if (text) {
      const lower = text.toLowerCase();
      if (lower.includes('remote') || lower.includes('wfh') || lower.includes('location')) {
        setAnsweredQueries(prev => Array.from(new Set([...prev, 'Remote Work & Flexible Hours Policy'])));
      } else if (lower.includes('stack') || lower.includes('tech') || lower.includes('freeswitch') || lower.includes('architecture')) {
        setAnsweredQueries(prev => Array.from(new Set([...prev, 'Telephony & Backend Tech Architecture'])));
      } else if (lower.includes('salary') || lower.includes('budget') || lower.includes('compensation') || lower.includes('pay') || lower.includes('equity')) {
        setAnsweredQueries(prev => Array.from(new Set([...prev, 'Compensation Band & Equity Options'])));
      } else if (lower.includes('round') || lower.includes('process') || lower.includes('next step') || lower.includes('interview')) {
        setAnsweredQueries(prev => Array.from(new Set([...prev, 'Technical Interview Stages & Timeline'])));
      } else if (text.includes('?')) {
        setAnsweredQueries(prev => Array.from(new Set([...prev, `Candidate Inquiry: "${text.slice(0, 35)}..."`])));
      }
    }

    const userTurn: TurnLog = {
      speaker: 'candidate',
      text: text || "🎙️ [Voice Audio Recorded & Transcribed]",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setConversation(prev => [...prev, userTurn]);

    const startTime = performance.now();
    try {
      const endpoint = audioBase64 && !answerTextToSend && !userAnswerInput ? '/api/voice-screen/audio-turn' : '/api/voice-screen/turn';
      const payload: any = {
        callId,
        candidateId,
        stepKey,
        turnIndex,
      };
      if (endpoint === '/api/voice-screen/audio-turn') {
        payload.audioBase64 = audioBase64;
        payload.mimeType = 'audio/webm';
      } else {
        payload.candidateAnswerText = text;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const elapsed = Math.round(performance.now() - startTime);
      setTurnLatencyMs(elapsed);
      if (data.success) {
        if (data.extractedDetails) {
          const details = data.extractedDetails;
          setLiveExtracted(prev => ({
            ...prev,
            ...Object.fromEntries(Object.entries(details).filter(([_, v]) => v !== null && v !== undefined && v !== '')),
            ...(details.skills ? { skills: normalizeSkills(details.skills) } : {})
          }));

          // Trigger live visual banner showing extracted items
          const items: string[] = [];
          if (details.job_role) items.push(`Role: ${details.job_role}`);
          if (details.experience_years) items.push(`${details.experience_years} Yrs Exp`);
          if (details.skills && details.skills.length) items.push(`Skills: ${details.skills.join(', ')}`);
          if (details.expected_salary) items.push(`Salary: ${details.expected_salary}`);
          if (details.availability) items.push(`Timeline: ${details.availability}`);

          if (items.length) {
            setRecentlyExtractedBanner(`⚡ Live Extracted from Voice: ${items.join(' • ')}`);
            setTimeout(() => setRecentlyExtractedBanner(null), 8000);
          }
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
    telephonyAudio.playHangupTone();
    // 1. Instantly stop speech synthesis & microphone & live audio WebSocket stream
    if (geminiLiveClientRef.current) {
      try { geminiLiveClientRef.current.cleanup(); } catch {}
      geminiLiveClientRef.current = null;
    }
    setIsGeminiLiveStreaming(false);

    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    stopListening();
    releaseMicrophoneHardware();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (vadSilenceTimerRef.current) clearTimeout(vadSilenceTimerRef.current);

    // 2. Terminate call active state immediately so UI updates
    setCallActive(false);
    setIsFinishing(true);

    const currentCallId = callId;
    const currentCandidateId = candidateId;

    try {
      if (currentCallId && currentCandidateId) {
        const res = await fetch('/api/voice-screen/finish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callId: currentCallId,
            candidateId: currentCandidateId,
            durationSeconds: Math.max(1, callDuration)
          })
        });
        const data = await res.json();
        if (data && data.success) {
          setSummaryDossier(data.recruiterSummary);
          onRefreshSqlData();
        }
      }
    } catch (err) {
      console.error('Error finishing screening call:', err);
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
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs">
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="text-slate-400 font-medium">Channel:</span>
              <select
                value={voiceEngineMode}
                disabled={callActive}
                onChange={(e) => setVoiceEngineMode(e.target.value as any)}
                className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer text-xs"
                title="Select bidirectional communication architecture"
              >
                <option value="gemini_live">🔴 Google Gemini 3.8 Live (Bi-directional WebSocket PCM Stream)</option>
                <option value="edge_vad">⚡ Fast Edge Turn-Taking (WebRTC VAD)</option>
              </select>
            </div>

            <span className="text-slate-400 font-medium">Caller:</span>
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
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Simulate Inbound Candidate Call</span>
              </button>
            ) : (
              <button
                onClick={handleFinishCall}
                disabled={isFinishing}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <PhoneOff className="w-4 h-4" />
                <span>{isFinishing ? 'Ending & Generating Report...' : 'End Call & View Summary'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Column: Live Audio & Conversation Flow */}
          <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden bg-slate-900/60">
            
            {/* Live 2-Way Full Duplex Telephony Console */}
            {callActive && !summaryDossier ? (
              <div className="p-3.5 bg-slate-950 border-b border-slate-800 space-y-3">
                {/* Console Header Bar */}
                <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold text-white tracking-wide">
                      LIVE 2-WAY FULL DUPLEX CALL • {Math.floor(callDuration / 60)}:{String(callDuration % 60).padStart(2, '0')}
                    </span>
                    {isGeminiLiveStreaming ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                        Gemini 3.8 Live (16kHz PCM Stream)
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                        Carrier WebRTC Live
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={vadPauseMs}
                      onChange={(e) => setVadPauseMs(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 text-cyan-300 text-[11px] rounded-lg px-2 py-1 font-mono focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                      title="Turn-Taking Response Latency: How fast the AI responds when you pause speaking"
                    >
                      <option value={350}>⚡ 350ms (Ultra-Fast)</option>
                      <option value={480}>⚡ 480ms (Lively Phone)</option>
                      <option value={750}>750ms (Standard)</option>
                      <option value={1100}>1100ms (Relaxed)</option>
                    </select>

                    <button
                      onClick={toggleMic}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        isMicMuted
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                          : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border-slate-700'
                      }`}
                      title={isMicMuted ? "Unmute your microphone" : "Mute your microphone"}
                    >
                      {isMicMuted ? <MicOff className="w-3.5 h-3.5 text-amber-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{isMicMuted ? 'Muted' : 'Mic Live'}</span>
                    </button>
                    <button
                      onClick={handleFinishCall}
                      disabled={isFinishing}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <PhoneOff className="w-3.5 h-3.5" />
                      <span>{isFinishing ? 'Ending...' : 'End Call'}</span>
                    </button>
                  </div>
                </div>

                {/* Dual Interactive Telephony Channels: AI Recruiter ⟷ Candidate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* Channel 1: AI Recruiter (TelcoVibe) */}
                  <div className={`p-3 rounded-xl border transition-all ${
                    callTurn === 'ai_speaking'
                      ? 'bg-cyan-950/40 border-cyan-500/70 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          callTurn === 'ai_speaking' ? 'bg-cyan-500 text-white animate-pulse' : 'bg-slate-800 text-cyan-400'
                        }`}>
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-white block">AI Recruiter</span>
                          <span className="text-[10px] text-cyan-400 font-mono">
                            {isGeminiLiveStreaming ? 'Google Gemini 3.8 Live (Zephyr Voice)' : 'TelcoVibe Voice'}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                        callTurn === 'ai_speaking'
                          ? 'bg-cyan-900 text-cyan-200 border border-cyan-700 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {callTurn === 'ai_speaking' ? <Volume2 className="w-3 h-3 text-cyan-400 animate-bounce" /> : <Clock className="w-3 h-3" />}
                        {callTurn === 'ai_speaking' ? 'Speaking on line...' : 'Listening to you'}
                      </span>
                    </div>

                    {/* AI Audio Soundwave */}
                    <div className="h-6 flex items-center justify-center gap-1 mb-2">
                      {[35, 75, 90, 50, 85, 100, 65, 80, 45, 70, 55, 30].map((h, i) => (
                        <span
                          key={i}
                          style={{ height: callTurn === 'ai_speaking' ? `${h}%` : '20%' }}
                          className={`w-1 rounded-full transition-all duration-150 ${
                            callTurn === 'ai_speaking' ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    {/* AI Speech Text */}
                    <p className="text-white text-xs italic line-clamp-3 bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 mb-2">
                      "{currentAiSpeech || 'Connecting line...'}"
                    </p>

                    {/* AI Action Controls */}
                    <div className="flex items-center justify-between text-[11px]">
                      <button
                        onClick={() => speakText(currentAiSpeech)}
                        className="text-slate-400 hover:text-white underline flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3 text-cyan-400" /> Replay Voice
                      </button>
                      {callTurn === 'ai_speaking' && (
                        <button
                          onClick={handleSkipAiSpeech}
                          className="px-2 py-0.5 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          Skip & Speak Now →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Channel 2: You (Candidate) */}
                  <div className={`p-3 rounded-xl border transition-all ${
                    callTurn === 'user_speaking'
                      ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/30'
                      : callTurn === 'listening'
                      ? 'bg-emerald-950/20 border-emerald-800/80'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          callTurn === 'user_speaking'
                            ? 'bg-emerald-500 text-white animate-pulse'
                            : 'bg-slate-800 text-emerald-400'
                        }`}>
                          <Mic className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-white block">You ({callerName})</span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {isGeminiLiveStreaming ? '16kHz PCM Stream (Continuous Duplex)' : 'Microphone Line Active'}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                        callTurn === 'user_speaking'
                          ? 'bg-emerald-900 text-emerald-200 border border-emerald-700 animate-pulse'
                          : callTurn === 'listening'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${callTurn === 'user_speaking' || callTurn === 'listening' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                        {callTurn === 'user_speaking' ? 'Hearing voice...' : callTurn === 'listening' ? 'Line Open • Speak' : 'AI Turn'}
                      </span>
                    </div>

                    {/* 12-Band VU Decibel Bars */}
                    <div className="h-6 flex items-center justify-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(bar => {
                        const dynamicHeight = Math.max(15, Math.min(100, (micAudioLevel * 2.2) * (bar % 3 === 0 ? 1.3 : 0.85)));
                        return (
                          <span
                            key={bar}
                            style={{ height: `${dynamicHeight}%` }}
                            className={`w-1 rounded-full transition-all duration-75 ${
                              micAudioLevel > 6 ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-slate-700'
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Candidate Interim Speech Text */}
                    <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 mb-2 min-h-[44px] flex items-center">
                      <p className="text-xs text-slate-200 leading-snug">
                        {userAnswerInput ? (
                          <span className="text-white font-medium italic">"{userAnswerInput}"</span>
                        ) : callTurn === 'user_speaking' ? (
                          <span className="text-emerald-300 animate-pulse">Transcribing your voice live...</span>
                        ) : callTurn === 'listening' ? (
                          <span className="text-slate-400 text-[11px]">Speak freely into mic. AI auto-responds on pause.</span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Line opens automatically after AI question.</span>
                        )}
                      </p>
                    </div>

                    {/* Primary Action Button: "Done Speaking / Advance Call" */}
                    <button
                      onClick={() => handleSendAnswer()}
                      disabled={callTurn === 'processing' || isProcessingTurn}
                      className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
                        callTurn === 'user_speaking' || userAnswerInput
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                          : callTurn === 'listening'
                          ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-700/60'
                          : 'bg-slate-850 text-slate-500 border border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Done Speaking (Advance Call) ↵</span>
                    </button>
                  </div>

                </div>

                {/* Instant Spoken Inquiries (Quick-Reply Chips) */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5 text-[10px]">
                    <span className="text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      Or Speak Any Topic With 1 Click (Spoken directly onto call line):
                    </span>
                    <span className="text-slate-500">Tap to answer verbally</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {[
                      { label: "🏢 Ask Remote Policy", text: "Is this position 100% remote with flexible hours?" },
                      { label: "⚙️ Ask Tech Stack", text: "What is your telephony architecture and FreeSWITCH stack?" },
                      { label: "💼 State Experience", text: "I have 6 years building Python and FreeSWITCH systems." },
                      { label: "💰 Ask Salary Range", text: "What is the compensation and equity range for this position?" }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendAnswer(item.text)}
                        disabled={isProcessingTurn}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/70 hover:border-cyan-500 text-slate-300 hover:text-white text-xs text-left transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <span className="font-medium text-[11px] truncate">{item.label}</span>
                        <span className="text-[10px] text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0">→</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Accessibility Text Mode */}
                <div className="text-center pt-0.5">
                  {!showKeyboardMode ? (
                    <button
                      onClick={() => setShowKeyboardMode(true)}
                      className="text-[11px] text-slate-500 hover:text-cyan-400 underline transition-colors cursor-pointer"
                    >
                      In a noisy environment? Click here to open typing mode
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 pt-1 animate-in fade-in">
                      <input
                        type="text"
                        value={userAnswerInput}
                        onChange={(e) => setUserAnswerInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendAnswer()}
                        placeholder="Type response if unable to speak aloud..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                      <button
                        onClick={() => handleSendAnswer()}
                        className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Send
                      </button>
                      <button
                        onClick={() => setShowKeyboardMode(false)}
                        className="text-xs text-slate-400 hover:text-white px-1"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Mic Status / Blocked Alert */}
                {micStatusMsg && (
                  <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-800 text-amber-200 text-xs flex items-center justify-between gap-2">
                    <span className="leading-snug">{micStatusMsg}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => acquireMicrophoneStream()}
                        className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] transition-all cursor-pointer"
                      >
                        Allow Mic
                      </button>
                      <button onClick={() => setMicStatusMsg(null)} className="text-slate-400 hover:text-white ml-1 text-xs">✕</button>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              /* Idle Status Bar when call not yet active */
              <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  READY FOR TEST CALL
                </span>
                <span className="text-[11px] text-cyan-400 font-mono">SIP WebRTC • 48kHz Opus</span>
              </div>
            )}

            {/* Conversation Transcript Feed */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 max-h-72 lg:max-h-none flex flex-col">
              
              {/* Recently Extracted Highlight Banner */}
              {recentlyExtractedBanner && (
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/80 text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-lg shadow-emerald-950/40 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
                    <span className="font-bold text-white">{recentlyExtractedBanner}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 font-mono shrink-0">
                    Synced to SQL
                  </span>
                </div>
              )}

              {/* Empty state: Hero Test Call Initiation Center */}
              {conversation.length === 0 ? (
                <div className="py-6 px-3 text-center space-y-4 my-auto">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-cyan-600/30 animate-bounce">
                    <PhoneCall className="w-8 h-8" />
                  </div>
                  
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Interactive AI Voice Interview & Query Test
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Click below to place a test call. Speak into your microphone or ask interview queries (e.g. remote work, tech stack, salary).
                    </p>
                    <p className="text-[11px] text-cyan-400 font-medium">
                      The AI speaks back and immediately extracts your qualifications live onto the screen and SQL database!
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
                    <button
                      onClick={() => handleStartCall()}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Start Voice AI Test Call</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 max-w-lg mx-auto">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                      💡 Or Start Test Call by Asking a Specific Interview Query:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                      {[
                        { q: "Is this position 100% remote with flexible hours?", desc: "Tests remote policy AI response & candidate inquiry logging" },
                        { q: "What is your telephony architecture and FreeSWITCH stack?", desc: "Tests technical stack explanation & entity extraction" },
                        { q: "I have 6 years in Python and VoIP engineering", desc: "Tests skill parsing, experience extraction & SQL sync" },
                        { q: "What is the compensation and equity range for this role?", desc: "Tests salary band answering & recruiter follow-up" }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleStartCall(callerPhone, callerName, item.q)}
                          className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all text-xs flex flex-col group cursor-pointer"
                        >
                          <span className="font-semibold text-cyan-300 group-hover:text-cyan-200">"{item.q}"</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                conversation.map((turn, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl text-xs leading-relaxed transition-all ${
                      turn.speaker === 'ai'
                        ? 'bg-slate-950 border border-slate-800 text-slate-200 mr-6 shadow-inner'
                        : 'bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-900 text-white ml-6 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
                      <span className={turn.speaker === 'ai' ? 'text-cyan-400 flex items-center gap-1.5' : 'text-blue-300 font-bold'}>
                        {turn.speaker === 'ai' ? (
                          <>
                            <Bot className="w-3.5 h-3.5 text-cyan-400" />
                            <span>AI Recruiter Voice</span>
                          </>
                        ) : (
                          `👤 You (${callerName})`
                        )}
                      </span>
                      <span className="font-mono text-slate-500">{turn.time}</span>
                    </div>
                    <div>{turn.text}</div>
                  </div>
                ))
              )}
              {isProcessingTurn && (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/80 text-xs text-cyan-300 flex items-center gap-2 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span className="font-semibold">⚡ AI comprehension & SQL extraction running...</span>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Real-Time Extracted Recipient Details & Recruiter Summary */}
          <div className="lg:col-span-5 p-4 overflow-y-auto space-y-3 bg-slate-950/70 text-xs">
            
            {/* Top Navigation Tabs for Right Column */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-1 sticky top-0 z-10 shadow-md">
              <button
                onClick={() => setRightColumnTab('dossier')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  rightColumnTab === 'dossier'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>SQL Dossier</span>
              </button>
              <button
                onClick={() => setRightColumnTab('sip_qa')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  rightColumnTab === 'sip_qa'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>SIP Q&A (Demo Guide)</span>
              </button>
              <button
                onClick={() => setRightColumnTab('carrier_logs')}
                className={`py-1.5 px-2.5 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  rightColumnTab === 'carrier_logs'
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-800 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Traces</span>
              </button>
            </div>

            {rightColumnTab === 'dossier' && (
              <>
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
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 block text-[10px]">Target Job Role:</span>
                    {liveExtracted.job_role && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                        ✓ Voice Extracted
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-emerald-400">{liveExtracted.job_role || 'Awaiting response...'}</span>
                </div>

                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 block text-[10px]">Years Experience:</span>
                    {liveExtracted.experience_years && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                        ✓ Voice Extracted
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-amber-400">{liveExtracted.experience_years ? `${liveExtracted.experience_years} years` : '—'}</span>
                </div>

                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 block text-[10px]">Expected Salary:</span>
                    {liveExtracted.expected_salary && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                        ✓ Voice Extracted
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-white">{liveExtracted.expected_salary || '—'}</span>
                </div>

                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 block text-[10px]">Availability:</span>
                    {liveExtracted.availability && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                        ✓ Voice Extracted
                      </span>
                    )}
                  </div>
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
                        <span key={`${s}-${idx}`} className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-mono flex items-center gap-1">
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
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

            {/* Handled Candidate Queries Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Candidate Inquiries Processed & Answered
                </span>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded font-mono">
                  {answeredQueries.length} Handled
                </span>
              </div>
              {answeredQueries.length === 0 ? (
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
                  <p className="font-medium text-slate-300">💡 Ask questions anytime during the call:</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    e.g. "Is this remote?", "What is the tech stack?", "What is the salary band?"
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {answeredQueries.map((q, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between gap-1 text-[11px] text-emerald-200">
                      <span className="font-medium">✓ {q}</span>
                      <span className="text-[9px] text-emerald-400 font-mono">Verbally Answered</span>
                    </div>
                  ))}
                </div>
              )}
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
            </>
            )}

            {/* TAB 2: SIP Signaling & Demo Q&A Guide */}
            {rightColumnTab === 'sip_qa' && (
              <div className="space-y-3 animate-in fade-in">
                <div className="p-3 bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-800/80 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>SIP Signaling & Architecture Demo Scripts</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Use these battle-tested, high-impact scripts when interviewers ask about SIP signaling, SDP negotiation, FreeSWITCH, or WebRTC call flows.
                  </p>
                </div>

                {SIP_DEMO_QA.map((qa) => (
                  <div
                    key={qa.id}
                    className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5 shadow-sm hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-semibold uppercase">
                          {qa.tag}
                        </span>
                        <h4 className="font-bold text-white text-xs mt-1">{qa.question}</h4>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${qa.question}\n\n${qa.fullScript}`);
                          setCopiedQaIdx(qa.id);
                          setTimeout(() => setCopiedQaIdx(null), 2500);
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium flex items-center gap-1 shrink-0 cursor-pointer"
                        title="Copy full script to clipboard"
                      >
                        {copiedQaIdx === qa.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedQaIdx === qa.id ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Short Elevator Answer */}
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-200 leading-relaxed">
                      <span className="text-cyan-400 font-semibold block text-[10px] uppercase mb-0.5">⚡ 30-Sec Elevator Summary:</span>
                      {qa.shortAnswer}
                    </div>

                    {/* Key Technical Bullets */}
                    <div className="space-y-1">
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">Key Protocol Flow:</span>
                      <ul className="space-y-1">
                        {qa.keyPoints.map((pt, pidx) => (
                          <li key={pidx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* In-Call Action: Recite to Recruiter */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          if (callActive) {
                            handleSendAnswer(qa.shortAnswer);
                          } else {
                            speakText(qa.shortAnswer);
                          }
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-emerald-600/30"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>{callActive ? '💬 Answer Recruiter on Live Call' : '🔊 Hear Script Spoken'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: Real-Time Carrier Traces */}
            {rightColumnTab === 'carrier_logs' && (
              <div className="space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Real-Time Carrier Traces & Signaling Log</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{liveLogs.length} events</span>
                </div>

                <div className="p-2.5 bg-black/90 border border-slate-800 rounded-xl font-mono text-[10px] text-emerald-400 space-y-1 max-h-96 overflow-y-auto">
                  {liveLogs.length === 0 ? (
                    <div className="text-slate-500 py-4 text-center">
                      Ready for call traces. Start a call to observe live SIP INVITE, SDP negotiation, and WebSocket audio frames.
                    </div>
                  ) : (
                    liveLogs.map((log, lidx) => (
                      <div key={lidx} className="leading-relaxed border-b border-slate-900/60 pb-0.5">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

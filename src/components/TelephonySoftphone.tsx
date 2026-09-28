import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  Radio, 
  Volume2, 
  Sparkles, 
  FileText, 
  X, 
  User, 
  Building, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Terminal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { JobApplication, CommunicationLog } from '../types';
import { telephonyAudio } from '../utils/telephonyAudio';
import { fetchCallSummary } from '../utils/geminiApi';

interface TelephonySoftphoneProps {
  isOpen: boolean;
  onClose: () => void;
  applications: JobApplication[];
  selectedApplication?: JobApplication;
  onSaveCallLog: (applicationId: string, log: CommunicationLog) => void;
}

export const TelephonySoftphone: React.FC<TelephonySoftphoneProps> = ({
  isOpen,
  onClose,
  applications,
  selectedApplication,
  onSaveCallLog
}) => {
  const [targetNumber, setTargetNumber] = useState(selectedApplication?.recruiterPhone || '+1 (415) 890-4421');
  const [callerName, setCallerName] = useState(selectedApplication?.recruiterName || 'Sarah Jenkins');
  const [companyName, setCompanyName] = useState(selectedApplication?.company || 'TelcoVibe Communications');
  const [appId, setAppId] = useState(selectedApplication?.id || applications[0]?.id || '');
  
  // Softphone state
  const [callState, setCallState] = useState<'idle' | 'dialing' | 'ringing' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isRecording, setIsRecording] = useState(true);
  const [showSipTraces, setShowSipTraces] = useState(false);
  
  // SIP logs
  const [sipLogs, setSipLogs] = useState<string[]>([]);
  
  // Live conversation transcript
  const [transcriptLines, setTranscriptLines] = useState<{ speaker: string; text: string; time: string }[]>([]);
  
  // Post-call AI analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    summary: string;
    sentiment: string;
    sentimentScore: number;
    actionItems: string[];
    nextStep: string;
    recommendedFollowUpMessage: string;
  } | null>(null);

  const durationTimerRef = useRef<any>(null);
  const simulationTimerRef = useRef<any>(null);

  // Sync when selected application changes
  useEffect(() => {
    if (selectedApplication) {
      setTargetNumber(selectedApplication.recruiterPhone || '+1 (415) 890-4421');
      setCallerName(selectedApplication.recruiterName || 'Recruiter');
      setCompanyName(selectedApplication.company || 'Company');
      setAppId(selectedApplication.id);
    }
  }, [selectedApplication]);

  // Call duration counter
  useEffect(() => {
    if (callState === 'connected') {
      durationTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [callState]);

  const addSipTrace = (msg: string) => {
    const timeStr = new Date().toLocaleTimeString();
    setSipLogs(prev => [...prev.slice(-30), `[${timeStr}] ${msg}`]);
  };

  const handleKeypadPress = (digit: string) => {
    telephonyAudio.playDtmf(digit);
    if (callState === 'idle') {
      setTargetNumber(prev => prev + digit);
    } else {
      addSipTrace(`SIP INFO: Sent DTMF '${digit}' via RFC2833 (Opus in-band)`);
    }
  };

  const startCall = () => {
    setCallState('dialing');
    setCallDuration(0);
    setAnalysisResult(null);
    setTranscriptLines([]);
    setSipLogs([]);

    addSipTrace(`SIP INVITE sip:${targetNumber.replace(/\D/g, '')}@telcovibe-sbc.carrier.net SIP/2.0`);
    addSipTrace(`Content-Type: application/sdp (m=audio RTP/AVP 111 Opus/48000/2)`);
    addSipTrace(`SIP/2.0 100 Trying (FreeSWITCH ESL Channel Originating)`);

    // Dialing -> Ringing after 1.2s
    setTimeout(() => {
      setCallState('ringing');
      telephonyAudio.startRingback();
      addSipTrace(`SIP/2.0 180 Ringing (Carrier trunk connected, DID verified)`);
    }, 1200);

    // Ringing -> Connected after 3.8s
    setTimeout(() => {
      telephonyAudio.playConnectedChime();
      setCallState('connected');
      addSipTrace(`SIP/2.0 200 OK - Two-way WebRTC Audio Established`);
      addSipTrace(`RTP Media Flow: 48kHz Opus Audio, Jitter: 1.2ms, Packet Loss: 0.0%`);

      // Start realistic recruiter conversation simulation
      simulateRecruiterDialogue();
    }, 4500);
  };

  const simulateRecruiterDialogue = () => {
    const script = [
      {
        delay: 1500,
        speaker: callerName,
        text: `Hi Tejas! This is ${callerName} from ${companyName}. Thanks for reaching out!`
      },
      {
        delay: 5500,
        speaker: 'You (Candidate)',
        text: `Hi ${callerName}, wonderful speaking with you! I was reviewing your Full Stack Developer role specializing in VoIP and messaging platforms.`
      },
      {
        delay: 10500,
        speaker: callerName,
        text: `That's great! We are building out our customer portal and AI voice softphones connecting to FreeSWITCH. How comfortable are you with Python FastAPI and SIP call flows?`
      },
      {
        delay: 16500,
        speaker: 'You (Candidate)',
        text: `I have extensive experience with FastAPI, WebRTC softphones, and SIP signaling. I've built CDR rating engines and integrated LLM APIs for automated transcription.`
      },
      {
        delay: 22500,
        speaker: callerName,
        text: `That aligns directly with what our engineering team is looking for. Let's schedule our 60-minute technical deep dive for this Thursday at 2:00 PM PST. I'll send over the calendar invite!`
      }
    ];

    script.forEach(({ delay, speaker, text }) => {
      const timer = setTimeout(() => {
        setTranscriptLines(prev => [
          ...prev,
          {
            speaker,
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          }
        ]);
      }, delay);
      simulationTimerRef.current = timer;
    });
  };

  const endCall = async () => {
    telephonyAudio.playHangupTone();
    if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
    
    addSipTrace(`SIP BYE sip:${targetNumber.replace(/\D/g, '')} SIP/2.0`);
    addSipTrace(`SIP/2.0 200 OK - Call Terminated normally (Duration: ${callDuration}s)`);
    addSipTrace(`CDR Processed: Codec Opus, QOS Score: 4.8/5.0`);
    
    setCallState('ended');

    // Trigger AI Post-Call Summary
    const fullTranscript = transcriptLines.map(l => `${l.speaker}: ${l.text}`).join('\n') || 
      `Recruiter ${callerName} and candidate discussed VoIP, SIP signaling, FreeSWITCH, Python FastAPI background, and agreed on next technical interview round.`;

    setIsAnalyzing(true);
    try {
      const summary = await fetchCallSummary({
        transcript: fullTranscript,
        callerName,
        company: companyName,
        roleTitle: selectedApplication?.role || 'Full Stack Developer',
        callDurationSeconds: callDuration
      });
      setAnalysisResult(summary);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToTimeline = () => {
    if (!analysisResult) return;
    const newLog: CommunicationLog = {
      id: `call-${Date.now()}`,
      applicationId: appId,
      channel: 'call',
      direction: 'outbound',
      timestamp: new Date().toISOString(),
      durationSeconds: callDuration,
      recipient: `${callerName} (${targetNumber})`,
      summary: analysisResult.summary,
      transcript: transcriptLines.map(l => `${l.speaker}: ${l.text}`).join('\n'),
      sentiment: analysisResult.sentiment as any,
      sentimentScore: analysisResult.sentimentScore,
      content: `Call with ${callerName} at ${companyName}. Next Step: ${analysisResult.nextStep}`,
      status: 'completed',
      sipCode: 200
    };

    onSaveCallLog(appId, newLog);
    onClose();
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Softphone Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Phone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                Telephony WebRTC Softphone
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                  SIP Carrier Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Kamailio SBC & FreeSWITCH ESL • DTMF • Real-time AI Transcription
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (callState === 'connected' || callState === 'dialing' || callState === 'ringing') {
                endCall();
              }
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Recruiter & Application Selector */}
        <div className="bg-slate-800/60 px-4 py-2.5 border-b border-slate-700/80 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Building className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Job:</span>
          </div>
          <select
            value={appId}
            disabled={callState !== 'idle'}
            onChange={(e) => {
              const selected = applications.find(a => a.id === e.target.value);
              if (selected) {
                setAppId(selected.id);
                setCallerName(selected.recruiterName);
                setCompanyName(selected.company);
                setTargetNumber(selected.recruiterPhone || '+1 (415) 890-4421');
              }
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-md px-2.5 py-1 text-xs focus:ring-1 focus:ring-cyan-500"
          >
            {applications.map(app => (
              <option key={app.id} value={app.id}>
                {app.company} — {app.role} ({app.recruiterName})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 ml-auto text-slate-400">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-200 font-medium">{callerName}</span>
          </div>
        </div>

        {/* Softphone Main Workspace */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          
          {/* LCD Status Screen */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-900 mb-2 font-mono">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${callState === 'connected' ? 'bg-emerald-400 animate-ping' : callState === 'idle' ? 'bg-slate-600' : 'bg-amber-400 animate-pulse'}`} />
                {callState === 'idle' && 'READY (SIP REGISTERED)'}
                {callState === 'dialing' && 'DIALING SIP INVITE...'}
                {callState === 'ringing' && '180 RINGING (RECRUITER ALERT)'}
                {callState === 'connected' && `200 OK CONNECTED • ${formatSeconds(callDuration)}`}
                {callState === 'ended' && `CALL TERMINATED • DURATION: ${formatSeconds(callDuration)}`}
              </span>
              <span>Codec: Opus / 48kHz</span>
            </div>

            <div className="text-center py-2">
              <div className="text-xl font-bold text-white tracking-wide font-mono">
                {targetNumber || 'Enter Number'}
              </div>
              <div className="text-sm font-semibold text-cyan-400 mt-0.5">
                {callerName} • {companyName}
              </div>
            </div>

            {/* Audio Waveform visualization during live call */}
            {callState === 'connected' && (
              <div className="flex items-center justify-center gap-1 pt-2 h-7">
                {[40, 75, 30, 90, 60, 45, 80, 50, 95, 65, 35, 85].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-1 bg-cyan-400 rounded-full animate-pulse transition-all duration-150"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Interactive Dialpad & Call Action Controls */}
          {callState !== 'ended' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              
              {/* Dialpad Matrix */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { num: '1', sub: ' ' },
                    { num: '2', sub: 'ABC' },
                    { num: '3', sub: 'DEF' },
                    { num: '4', sub: 'GHI' },
                    { num: '5', sub: 'JKL' },
                    { num: '6', sub: 'MNO' },
                    { num: '7', sub: 'PQRS' },
                    { num: '8', sub: 'TUV' },
                    { num: '9', sub: 'WXYZ' },
                    { num: '*', sub: ' ' },
                    { num: '0', sub: '+' },
                    { num: '#', sub: ' ' },
                  ].map(({ num, sub }) => (
                    <button
                      key={num}
                      onClick={() => handleKeypadPress(num)}
                      className="bg-slate-800 hover:bg-slate-700 active:bg-cyan-700/40 text-white rounded-lg py-2 flex flex-col items-center justify-center border border-slate-700 hover:border-cyan-500/50 transition-all shadow-sm"
                    >
                      <span className="font-bold text-base leading-none">{num}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">{sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Call Control Center */}
              <div className="space-y-3">
                {callState === 'idle' ? (
                  <div className="space-y-2">
                    <button
                      onClick={startCall}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Dial Recruiter Follow-up Call</span>
                    </button>
                    <p className="text-[11px] text-slate-400 text-center">
                      Quick call {callerName} regarding application progress & interview rounds.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                          isMuted ? 'bg-amber-950 border-amber-700 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-200'
                        }`}
                      >
                        {isMuted ? <MicOff className="w-4 h-4 text-amber-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                        <span>{isMuted ? 'Muted' : 'Mute'}</span>
                      </button>

                      <button
                        onClick={() => setIsOnHold(!isOnHold)}
                        className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                          isOnHold ? 'bg-amber-950 border-amber-700 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-200'
                        }`}
                      >
                        {isOnHold ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4 text-slate-300" />}
                        <span>{isOnHold ? 'Unhold' : 'Hold'}</span>
                      </button>

                      <button
                        onClick={() => setIsRecording(!isRecording)}
                        className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                          isRecording ? 'bg-rose-950 border-rose-700 text-rose-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        <Radio className={`w-4 h-4 ${isRecording ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
                        <span>{isRecording ? 'Rec ON' : 'Rec OFF'}</span>
                      </button>
                    </div>

                    <button
                      onClick={endCall}
                      className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all"
                    >
                      <PhoneOff className="w-5 h-5" />
                      <span>End Call & Generate AI Summary</span>
                    </button>
                  </div>
                )}

                {/* Clear / Reset Number button */}
                {callState === 'idle' && (
                  <button
                    onClick={() => setTargetNumber('')}
                    className="w-full py-1 text-xs text-slate-400 hover:text-slate-200 underline text-center"
                  >
                    Clear Number
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Live Audio Transcription Feed */}
          {transcriptLines.length > 0 && (
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1.5 border-b border-slate-800">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Live Real-Time Transcription
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded font-mono">
                  STT Engine Active
                </span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {transcriptLines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg text-xs leading-relaxed ${
                      line.speaker.includes('You')
                        ? 'bg-blue-950/60 border border-blue-900 text-blue-200 ml-4'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-[11px] mb-0.5 text-slate-400">
                      <span>{line.speaker}</span>
                      <span className="font-mono text-[10px]">{line.time}</span>
                    </div>
                    <div>{line.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post-Call AI Analysis Card */}
          {callState === 'ended' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">AI Call Summary & Recruiter Sentiment</h3>
                </div>
                {analysisResult && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    analysisResult.sentiment === 'Positive' 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {analysisResult.sentiment} ({analysisResult.sentimentScore}% enthusiasm)
                  </span>
                )}
              </div>

              {isAnalyzing ? (
                <div className="py-6 text-center text-slate-300 text-xs space-y-2">
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Gemini AI analyzing audio transcription, extracting action items and next steps...</p>
                </div>
              ) : analysisResult ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-300">Executive Summary:</span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      {analysisResult.summary}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-300">Key Action Items:</span>
                    <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-300">
                      {analysisResult.actionItems?.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800 text-cyan-200">
                    <span className="font-bold block mb-1">Recommended Follow-up Note:</span>
                    <p className="italic text-[11px]">{analysisResult.recommendedFollowUpMessage}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleSaveToTimeline}
                      className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Save Call Log & Attach to Application Timeline</span>
                    </button>
                    <button
                      onClick={() => {
                        setCallState('idle');
                        setAnalysisResult(null);
                      }}
                      className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                    >
                      New Call
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Collapsible SIP Traces / VoIP Debugger (Relevant to job requirements in image!) */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40 text-xs">
            <button
              onClick={() => setShowSipTraces(!showSipTraces)}
              className="w-full px-3 py-2 bg-slate-900 flex items-center justify-between text-slate-400 hover:text-slate-200"
            >
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                VoIP SIP Signalling & Media Traces ({sipLogs.length} events)
              </span>
              {showSipTraces ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showSipTraces && (
              <div className="p-3 bg-black/90 font-mono text-[10px] text-emerald-400 max-h-36 overflow-y-auto space-y-1">
                {sipLogs.length === 0 ? (
                  <span className="text-slate-600">No active SIP signaling. Press Dial to initiate INVITE.</span>
                ) : (
                  sipLogs.map((log, idx) => (
                    <div key={idx} className="leading-tight">{log}</div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

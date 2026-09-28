import React, { useState } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  RefreshCw, 
  X, 
  Zap, 
  CheckCircle2, 
  HelpCircle, 
  FileText,
  Target,
  BookOpen
} from 'lucide-react';
import { JobApplication, CandidateProfile, CandidateAnalysis } from '../types';
import { fetchCandidateSummary } from '../utils/geminiApi';

interface CandidateSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: JobApplication;
  candidateProfile: CandidateProfile;
  onUpdateAnalysis: (applicationId: string, analysis: CandidateAnalysis) => void;
}

export const CandidateSummaryModal: React.FC<CandidateSummaryModalProps> = ({
  isOpen,
  onClose,
  application,
  candidateProfile,
  onUpdateAnalysis
}) => {
  const [isPlayingPitch, setIsPlayingPitch] = useState(false);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<number | null>(null);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [customNotes, setCustomNotes] = useState('');

  if (!isOpen) return null;

  const analysis = application.analysis;

  const handleSpeakPitch = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    if (isPlayingPitch) {
      window.speechSynthesis.cancel();
      setIsPlayingPitch(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingPitch(false);
    utterance.onerror = () => setIsPlayingPitch(false);
    
    setIsPlayingPitch(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyPitch = () => {
    if (!analysis?.elevatorPitch) return;
    navigator.clipboard.writeText(analysis.elevatorPitch);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const handleCopyBullet = (bullet: string, idx: number) => {
    navigator.clipboard.writeText(bullet);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const newAnalysis = await fetchCandidateSummary({
        jobTitle: application.role,
        company: application.company,
        jobDescription: application.jobDescription,
        candidateSkills: candidateProfile.skills.join(', '),
        candidateExperience: `${candidateProfile.experienceYears} years in ${candidateProfile.title}`,
        candidateNotes: customNotes
      });
      onUpdateAnalysis(application.id, newAnalysis);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-lg">Auto Candidate Summary & Interview Coach</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                  Gemini AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Target Role: <strong className="text-slate-200">{application.role}</strong> at <strong className="text-slate-200">{application.company}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isPlayingPitch && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-4 md:col-span-1 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0">
              <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold text-2xl shadow-lg shadow-emerald-500/20">
                {analysis?.matchScore || 95}%
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Match Fit Score</span>
                <span className="text-sm font-bold text-emerald-400">{analysis?.matchLevel || 'Strong Match'}</span>
              </div>
            </div>

            <div className="md:col-span-3 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate Positioning:</span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {analysis?.summary || 'Candidate demonstrates deep overlap with telecom voice platforms, Python backend microservices, and React dashboard engineering.'}
              </p>
            </div>
          </div>

          {/* 30-Second Verbal Elevator Pitch (Crucial for recruiter phone calls) */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40 border border-blue-900/60 rounded-xl p-5 space-y-3 relative">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">
                  30-Second Phone Screen Elevator Pitch
                </h3>
                <span className="text-[11px] text-cyan-300 font-mono bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  Ready for Recruiter Softphone Calls
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSpeakPitch(analysis?.elevatorPitch || '')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    isPlayingPitch
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700'
                  }`}
                  title="Practice listening to this pitch aloud"
                >
                  {isPlayingPitch ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isPlayingPitch ? 'Stop Audio' : 'Listen Aloud'}</span>
                </button>

                <button
                  onClick={handleCopyPitch}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                >
                  {copiedPitch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPitch ? 'Copied!' : 'Copy Pitch'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans italic bg-black/40 p-4 rounded-lg border border-slate-800/80">
              "{analysis?.elevatorPitch}"
            </p>
          </div>

          {/* Key Strengths & Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Core Strengths */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">Top Strengths to Emphasize</h4>
              </div>
              <ul className="space-y-2 text-xs">
                {analysis?.strengths?.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span className="text-slate-300 leading-relaxed">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Gaps & Interview Talking Points */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm text-white">Interview Cheat Sheet & Prep Tips</h4>
              </div>
              <div className="space-y-2 text-xs">
                {analysis?.gapsAndPrep?.map((item, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>{item.area}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{item.guidance}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Tailored Resume Bullets */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h4 className="font-bold text-sm text-white">Tailored Resume Bullets for This Job</h4>
              </div>
              <span className="text-[11px] text-slate-400">Optimized for ATS & Hiring Managers</span>
            </div>
            <div className="space-y-2 text-xs">
              {analysis?.tailoredResumeBullets?.map((bullet, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <p className="text-slate-200 leading-relaxed text-xs">{bullet}</p>
                  <button
                    onClick={() => handleCopyBullet(bullet, idx)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0"
                    title="Copy bullet"
                  >
                    {copiedBulletIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Questions to Ask Recruiter */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-sm text-white">Smart Questions to Ask Interviewer</h4>
            </div>
            <div className="space-y-2 text-xs">
              {analysis?.recommendedQuestionsForRecruiter?.map((q, idx) => (
                <div key={idx} className="bg-cyan-950/20 border border-cyan-900/50 p-2.5 rounded-lg text-cyan-200">
                  "{q}"
                </div>
              ))}
            </div>
          </div>

          {/* Re-analyze with Extra Notes */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-xs font-semibold text-slate-300 block">Want to re-tailor with specific context?</span>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g., Emphasize my experience building sngrep SIP trace monitors and WebRTC softphones..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
            />
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Analyzing with Gemini AI...' : 'Re-generate Candidate Summary'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

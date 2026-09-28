import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MessageSquare, 
  Sparkles, 
  FileText, 
  Clock, 
  X, 
  CheckCircle, 
  ChevronRight, 
  ExternalLink,
  PhoneForwarded,
  Tag,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import { JobApplication, ApplicationStage, CommunicationLog } from '../types';
import { reminderManager } from '../utils/reminderManager';

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: JobApplication;
  onUpdateStage: (applicationId: string, stage: ApplicationStage) => void;
  onOpenSoftphone: (application: JobApplication) => void;
  onOpenMessaging: (application: JobApplication) => void;
  onOpenMail: (application: JobApplication) => void;
  onOpenSummary: (application: JobApplication) => void;
  onOpenSchedule: () => void;
  onOpenDocuments: () => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  isOpen,
  onClose,
  application,
  onUpdateStage,
  onOpenSoftphone,
  onOpenMessaging,
  onOpenMail,
  onOpenSummary,
  onOpenSchedule,
  onOpenDocuments
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'telephony' | 'messaging' | 'interviews'>('overview');

  if (!isOpen) return null;

  const deadlineCountdown = application.deadlineDate 
    ? reminderManager.calculateTimeRemaining(application.deadlineDate) 
    : null;

  const stageOptions: { key: ApplicationStage; label: string }[] = [
    { key: 'wishlist', label: 'Wishlist' },
    { key: 'applied', label: 'Applied' },
    { key: 'screening', label: 'Phone Screen' },
    { key: 'technical', label: 'Tech Round' },
    { key: 'system_design', label: 'System Design' },
    { key: 'hr_offer', label: 'Offer Received' },
    { key: 'rejected', label: 'Archived' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header & Stage Stepper */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 p-5 border-b border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-bold text-white tracking-tight">{application.company}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-medium">
                  {application.jobType}
                </span>
                {application.analysis && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    {application.analysis.matchScore}% Match
                  </span>
                )}
              </div>
              <h3 className="text-base text-cyan-400 font-semibold">{application.role}</h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {application.location}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  {application.salaryRange}
                </span>
                {application.deadlineDate && (
                  <span className={`flex items-center gap-1 font-mono ${deadlineCountdown?.diffDays && deadlineCountdown.diffDays <= 2 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                    <Clock className="w-3.5 h-3.5" />
                    Deadline: {application.deadlineDate} ({deadlineCountdown?.formatted})
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stage Progression Stepper */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 overflow-x-auto">
            <div className="flex items-center gap-1.5 min-w-max">
              {stageOptions.map((st, i) => {
                const isCurrent = application.stage === st.key;
                return (
                  <button
                    key={st.key}
                    onClick={() => onUpdateStage(application.id, st.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    <span>{st.label}</span>
                    {i < stageOptions.length - 1 && <ChevronRight className="w-3 h-3 text-slate-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Communication Action Bar */}
        <div className="bg-slate-950 px-5 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Recruiter:</span>
            <span className="text-slate-200 font-semibold">{application.recruiterName}</span>
            <span className="text-slate-500 font-mono">({application.recruiterPhone})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenSoftphone(application)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              title="Launch WebRTC softphone to call recruiter"
            >
              <PhoneForwarded className="w-3.5 h-3.5" />
              <span>Softphone Call</span>
            </button>

            <button
              onClick={() => onOpenMessaging(application)}
              className="px-3 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white font-semibold flex items-center gap-1.5 transition-all"
              title="Open WhatsApp or SMS hub"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp / SMS</span>
            </button>

            <button
              onClick={() => onOpenMail(application)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 transition-all"
              title="Compose email follow-up"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>

            <button
              onClick={() => onOpenSummary(application)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-all"
              title="View AI Candidate summary & elevator pitch"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto Summary</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-900 border-b border-slate-800 px-5 flex items-center gap-4 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Job Spec & Responsibilities' },
            { id: 'telephony', label: `Telephony & Call Logs (${application.communications.filter(c => c.channel === 'call').length})` },
            { id: 'messaging', label: `Messaging & Emails (${application.communications.filter(c => c.channel !== 'call').length})` },
            { id: 'interviews', label: `Interview Schedule (${application.interviews.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs text-slate-300">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Stack:
                </span>
                {application.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-[11px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Job Description Text formatted */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-white text-xs block">Job Requirements & Technical Scope:</span>
                <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-sans max-h-72 overflow-y-auto pr-2">
                  {application.jobDescription}
                </div>
              </div>

              {/* Notes */}
              {application.notes && (
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-slate-400 block mb-1">Your Tracking Notes:</span>
                  <p className="text-slate-200 text-xs">{application.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TELEPHONY CALL LOGS & CDRs */}
          {activeTab === 'telephony' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Telephony Communication Logs & AI Summaries:</span>
                <button
                  onClick={() => onOpenSoftphone(application)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1"
                >
                  <PhoneForwarded className="w-3.5 h-3.5" /> Start New Call
                </button>
              </div>

              {application.communications.filter(c => c.channel === 'call').length === 0 ? (
                <div className="py-10 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                  No softphone calls logged for this recruiter yet. Use the "Start New Call" button above to dial {application.recruiterName}.
                </div>
              ) : (
                application.communications.filter(c => c.channel === 'call').map(log => (
                  <div key={log.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs border-b border-slate-900 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{log.recipient}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                          SIP 200 OK • {log.durationSeconds}s
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    {log.summary && (
                      <p className="text-slate-300 leading-relaxed text-xs">
                        <strong>AI Call Summary:</strong> {log.summary}
                      </p>
                    )}
                    {log.transcript && (
                      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 max-h-32 overflow-y-auto">
                        {log.transcript}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: MESSAGING & EMAIL LOGS */}
          {activeTab === 'messaging' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">WhatsApp, SMS & Email History:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenMessaging(application)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp / SMS
                  </button>
                  <button
                    onClick={() => onOpenMail(application)}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email Recruiter
                  </button>
                </div>
              </div>

              {application.communications.filter(c => c.channel !== 'call').length === 0 ? (
                <div className="py-10 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                  No messaging or email interactions recorded yet. Click WhatsApp or Email above to compose your first message.
                </div>
              ) : (
                application.communications.filter(c => c.channel !== 'call').map(log => (
                  <div key={log.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs border-b border-slate-900 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.channel === 'whatsapp' 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                            : log.channel === 'email'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {log.channel}
                        </span>
                        <span className="font-semibold text-white">{log.recipient}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-200 text-xs leading-relaxed bg-slate-900/60 p-2.5 rounded-lg whitespace-pre-wrap">
                      {log.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: INTERVIEW SCHEDULE */}
          {activeTab === 'interviews' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Rounds & Prep Checklist:</span>
                <button
                  onClick={onOpenSchedule}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" /> Schedule New Round
                </button>
              </div>

              {application.interviews.length === 0 ? (
                <div className="py-10 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                  No interview rounds scheduled yet for this role.
                </div>
              ) : (
                application.interviews.map(int => {
                  const countdown = reminderManager.calculateTimeRemaining(int.date, int.time);
                  return (
                    <div key={int.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{int.title}</span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 text-xs font-mono font-bold">
                          {countdown.formatted}
                        </span>
                      </div>
                      <div className="text-slate-400 text-xs">
                        {int.date} at {int.time} ({int.durationMinutes} mins) • Interviewer: {int.interviewerNames}
                      </div>
                      {int.notes && (
                        <p className="text-slate-300 text-xs italic bg-slate-900/80 p-2 rounded-lg">
                          {int.notes}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  X, 
  User, 
  Building, 
  ExternalLink,
  Paperclip,
  CheckCheck
} from 'lucide-react';
import { JobApplication, CommunicationLog } from '../types';
import { fetchAiMessageDraft } from '../utils/geminiApi';

interface MailHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: JobApplication;
  onSaveEmailLog: (applicationId: string, log: CommunicationLog) => void;
}

export const MailHubModal: React.FC<MailHubModalProps> = ({
  isOpen,
  onClose,
  application,
  onSaveEmailLog
}) => {
  const [subject, setSubject] = useState(
    `Thank You & Follow-up: ${application.role} - Tejas Mali`
  );
  const [recipient, setRecipient] = useState(
    application.recruiterEmail || 's.jenkins@telcovibe.io'
  );
  const [body, setBody] = useState(
`Dear ${application.recruiterName || 'Hiring Team'},

Thank you for the opportunity to discuss the ${application.role} position at ${application.company}. I thoroughly enjoyed learning more about your technical vision, especially your work with real-time VoIP platforms, FreeSWITCH infrastructure, and AI-assisted calling capabilities.

Our conversation reinforced my strong interest in joining ${application.company}. With my background in Python/FastAPI microservices, WebRTC softphones, and SIP signaling, I am eager to contribute to your customer portal and communications engine.

Please let me know if there are any additional code samples or references I can provide. I look forward to the next steps!

Warm regards,
Tejas Mali
Phone: +1 (555) 349-8102
GitHub: github.com/tejas-mali`
  );

  const [emailScenario, setEmailScenario] = useState('thank_you');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const scenarios = [
    { id: 'thank_you', label: 'Post-Interview Thank You' },
    { id: 'status_check', label: 'Application Status Follow-up' },
    { id: 'availability', label: 'Interview Availability' },
    { id: 'offer_inquiry', label: 'Offer Letter Clarification' }
  ];

  const handleAiDraft = async () => {
    setIsGenerating(true);
    try {
      const res = await fetchAiMessageDraft({
        channel: 'email',
        type: emailScenario,
        recruiterName: application.recruiterName,
        company: application.company,
        roleTitle: application.role,
        extraContext: 'Professional telecom engineer email, highlighting real-time voice, Python, and React experience'
      });
      if (res.subject) setSubject(res.subject);
      if (res.body) setBody(res.body);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMailto = () => {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const mailtoUrl = `mailto:${recipient}?subject=${encodedSubject}&body=${encodedBody}`;
    window.location.href = mailtoUrl;

    // Log to application
    onSaveEmailLog(application.id, {
      id: `email-${Date.now()}`,
      applicationId: application.id,
      channel: 'email',
      direction: 'outbound',
      timestamp: new Date().toISOString(),
      recipient,
      content: body,
      summary: `Email sent: ${subject}`,
      status: 'sent'
    });

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Recruiter Mail Hub & Drafter</h2>
              <p className="text-xs text-slate-400">
                Direct mail delivery for {application.company} • {application.role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Email Header Fields */}
          <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-16 font-semibold text-slate-400">To:</span>
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-16 font-semibold text-slate-400">Subject:</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* AI Generator Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {scenarios.map(sc => (
                <button
                  key={sc.id}
                  onClick={() => setEmailScenario(sc.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${
                    emailScenario === sc.id
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleAiDraft}
              disabled={isGenerating}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] flex items-center gap-1 transition-all disabled:opacity-50 ml-auto"
            >
              <Sparkles className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Drafting...' : 'Generate with Gemini'}</span>
            </button>
          </div>

          {/* Email Body Area */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-400 block">Email Body:</label>
            <textarea
              rows={9}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed font-mono"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center gap-1.5 border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Email'}</span>
            </button>

            <button
              onClick={handleOpenMailto}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Launch in Email Client (Gmail/Outlook) & Log</span>
            </button>
          </div>

          {isSent && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Email interaction recorded to timeline!</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

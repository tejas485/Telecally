import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  X, 
  User, 
  Phone, 
  ExternalLink,
  Clock,
  CheckCheck
} from 'lucide-react';
import { JobApplication, CommunicationLog } from '../types';
import { fetchAiMessageDraft } from '../utils/geminiApi';

interface MessagingCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: JobApplication;
  onSaveMessageLog: (applicationId: string, log: CommunicationLog) => void;
}

export const MessagingCenterModal: React.FC<MessagingCenterModalProps> = ({
  isOpen,
  onClose,
  application,
  onSaveMessageLog
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [selectedTemplate, setSelectedTemplate] = useState('post_call');
  const [messageBody, setMessageBody] = useState(
    `Hi ${application.recruiterName || 'there'}! 👋 Thank you for taking the time to speak with me earlier regarding the ${application.role} opportunity at ${application.company}. Really enjoyed our conversation and looking forward to next steps!`
  );
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [customToneContext, setCustomToneContext] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const recruiterPhoneRaw = application.recruiterWhatsApp || application.recruiterPhone || '+14158904421';
  const cleanPhone = recruiterPhoneRaw.replace(/\D/g, '');

  const templates = [
    {
      id: 'post_call',
      title: 'Post-Call Thank You',
      whatsapp: `Hi ${application.recruiterName || 'there'}! 👋 Thank you for taking the time to speak with me earlier regarding the ${application.role} opportunity at ${application.company}. Really enjoyed our conversation and looking forward to next steps!`,
      sms: `Hi ${application.recruiterName}, thank you for speaking today about the ${application.role} role at ${application.company}. Looking forward to next steps!`
    },
    {
      id: 'availability',
      title: 'Interview Availability',
      whatsapp: `Hi ${application.recruiterName}! I'm writing to confirm my availability for the upcoming interview round for ${application.role}. I am free this Thursday and Friday between 10:00 AM - 4:00 PM PST. Let me know what works best for your team! 📅`,
      sms: `Hi ${application.recruiterName}, confirmed my availability for the ${application.company} technical screen: Thu/Fri 10am-4pm PST. Best, Tejas.`
    },
    {
      id: 'status_check',
      title: 'Polite Status Follow-up',
      whatsapp: `Hi ${application.recruiterName}, hope you're having a productive week! Just checking in on the status of my application for ${application.role} at ${application.company}. Still very excited about the position and happy to provide any extra info. 🙌`,
      sms: `Hi ${application.recruiterName}, checking in regarding the ${application.role} status at ${application.company}. Hope you have a great week!`
    },
    {
      id: 'project_submission',
      title: 'Project / Portfolio Share',
      whatsapp: `Hi ${application.recruiterName}! As discussed during our call, here is the link to my WebRTC softphone & VoIP portfolio: https://github.com/tejas-mali/voip-webrtc-portal. Looking forward to your thoughts! 💻✨`,
      sms: `Hi ${application.recruiterName}, here is the requested code sample repository: https://github.com/tejas-mali/voip-webrtc-portal. Thanks!`
    }
  ];

  const handleSelectTemplate = (tempId: string) => {
    setSelectedTemplate(tempId);
    const tmpl = templates.find(t => t.id === tempId);
    if (tmpl) {
      setMessageBody(activeTab === 'whatsapp' ? tmpl.whatsapp : tmpl.sms);
    }
  };

  const handleAiDraft = async () => {
    setIsAiGenerating(true);
    try {
      const res = await fetchAiMessageDraft({
        channel: activeTab,
        type: selectedTemplate,
        recruiterName: application.recruiterName,
        company: application.company,
        roleTitle: application.role,
        extraContext: customToneContext || 'Enthusiastic and professional, ready for technical round'
      });
      setMessageBody(res.body);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsAppDirect = () => {
    const encoded = encodeURIComponent(messageBody);
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
    window.open(url, '_blank');

    // Save communication log
    onSaveMessageLog(application.id, {
      id: `comm-wa-${Date.now()}`,
      applicationId: application.id,
      channel: 'whatsapp',
      direction: 'outbound',
      timestamp: new Date().toISOString(),
      recipient: `${application.recruiterName} (${cleanPhone})`,
      content: messageBody,
      summary: `WhatsApp message sent: ${templates.find(t => t.id === selectedTemplate)?.title || 'Follow-up'}`,
      status: 'sent'
    });

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1500);
  };

  const handleSendSms = () => {
    // Record SMPP/SMS communication log
    onSaveMessageLog(application.id, {
      id: `comm-sms-${Date.now()}`,
      applicationId: application.id,
      channel: 'sms',
      direction: 'outbound',
      timestamp: new Date().toISOString(),
      recipient: `${application.recruiterName} (${application.recruiterPhone})`,
      content: messageBody,
      summary: `SMS follow-up via SMPP Gateway: ${templates.find(t => t.id === selectedTemplate)?.title || 'Recruiter note'}`,
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
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                Recruiter Messaging & WhatsApp Hub
              </h2>
              <p className="text-xs text-slate-400">
                To: <span className="text-slate-200 font-semibold">{application.recruiterName}</span> ({application.company}) • {application.recruiterPhone}
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

        {/* Channel Switcher */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('whatsapp');
              const tmpl = templates.find(t => t.id === selectedTemplate);
              if (tmpl) setMessageBody(tmpl.whatsapp);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300" />
            WhatsApp Web / Direct API
          </button>

          <button
            onClick={() => {
              setActiveTab('sms');
              const tmpl = templates.find(t => t.id === selectedTemplate);
              if (tmpl) setMessageBody(tmpl.sms);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'sms'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-300" />
            SMS Carrier Gateway (SMPP)
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          
          {/* Quick Scenario Templates */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Quick Recruiter Templates:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {templates.map(tmpl => (
                <button
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl.id)}
                  className={`p-2 rounded-lg text-left text-xs border transition-all ${
                    selectedTemplate === tmpl.id
                      ? 'bg-slate-800 border-cyan-500 text-cyan-300 font-semibold shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tmpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* AI Message Customizer */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                AI Smart Customizer
              </span>
              <span className="text-[11px] text-slate-500">Gemini 3.8 Flash</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customToneContext}
                onChange={(e) => setCustomToneContext(e.target.value)}
                placeholder="Optional instruction (e.g. mention excitement about FreeSWITCH and sngrep)..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <button
                onClick={handleAiDraft}
                disabled={isAiGenerating}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1 transition-all disabled:opacity-50 shrink-0"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
                <span>{isAiGenerating ? 'Drafting...' : 'Polish with AI'}</span>
              </button>
            </div>
          </div>

          {/* Message Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="font-semibold">Message Preview:</label>
              <span>{messageBody.length} characters • {activeTab === 'sms' ? `${Math.ceil(messageBody.length / 160)} SMS segment(s)` : 'Instant WhatsApp'}</span>
            </div>
            <textarea
              rows={5}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center gap-1.5 border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
            </button>

            {activeTab === 'whatsapp' ? (
              <button
                onClick={handleOpenWhatsAppDirect}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in WhatsApp & Log Interaction</span>
              </button>
            ) : (
              <button
                onClick={handleSendSms}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Send SMS via Carrier Gateway</span>
              </button>
            )}
          </div>

          {isSent && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Message logged to application timeline!</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

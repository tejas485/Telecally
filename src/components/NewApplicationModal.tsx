import React, { useState } from 'react';
import { 
  Briefcase, 
  Building, 
  MapPin, 
  DollarSign, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  X, 
  Sparkles,
  PlusCircle
} from 'lucide-react';
import { JobApplication, Priority, JobType } from '../types';

interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddApplication: (app: JobApplication) => void;
}

export const NewApplicationModal: React.FC<NewApplicationModalProps> = ({
  isOpen,
  onClose,
  onAddApplication
}) => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('Remote');
  const [jobType, setJobType] = useState<JobType>('Remote');
  const [salaryRange, setSalaryRange] = useState('$130,000 - $160,000');
  const [deadlineDate, setDeadlineDate] = useState('2026-10-15');
  const [priority, setPriority] = useState<Priority>('high');
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterRole, setRecruiterRole] = useState('Technical Recruiter');
  const [recruiterPhone, setRecruiterPhone] = useState('+1 (555) 000-0000');
  const [recruiterWhatsApp, setRecruiterWhatsApp] = useState('+15550000000');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [tags, setTags] = useState('VoIP, React, Python, WebRTC');
  const [jobDescription, setJobDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      company: company.trim(),
      role: role.trim(),
      location: location.trim(),
      jobType,
      salaryRange,
      stage: 'applied',
      appliedDate: new Date().toISOString().split('T')[0],
      deadlineDate: deadlineDate || undefined,
      priority,
      recruiterName: recruiterName.trim() || 'Hiring Lead',
      recruiterRole: recruiterRole.trim(),
      recruiterPhone: recruiterPhone.trim() || '+1 (555) 349-0000',
      recruiterWhatsApp: recruiterWhatsApp.trim() || recruiterPhone.trim(),
      recruiterEmail: recruiterEmail.trim() || `careers@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      websiteUrl: websiteUrl.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      notes: 'Initial application submitted. Waiting for screening or recruiter response.',
      attachedDocumentIds: ['doc-resume-01'],
      jobDescription: jobDescription.trim() || `${role} role at ${company}. Key responsibilities include frontend development in React and backend services in Python.`,
      interviews: [],
      communications: []
    };

    onAddApplication(newApp);
    onClose();
  };

  const handlePrefillTelecomSample = () => {
    setCompany('AsterVoice Telecom');
    setRole('Senior VoIP Platform Engineer');
    setLocation('San Jose, CA (Hybrid)');
    setJobType('Hybrid');
    setSalaryRange('$145,000 - $170,000');
    setDeadlineDate('2026-10-12');
    setPriority('high');
    setRecruiterName('Elena Vance');
    setRecruiterRole('Talent Partner - Core Infrastructure');
    setRecruiterPhone('+1 (408) 555-0199');
    setRecruiterWhatsApp('+14085550199');
    setRecruiterEmail('elena.v@astervoice.com');
    setWebsiteUrl('https://astervoice.com');
    setTags('Asterisk, FreeSWITCH, Python, WebRTC, React, SIP');
    setJobDescription(`AsterVoice is hiring a Senior VoIP Platform Engineer to build customer-facing dashboards and telephony switching services.
Responsibilities:
- Build React softphones with WebRTC media streams
- Develop Python FastAPI backend services for call rating & billing
- Integrate with Asterisk and FreeSWITCH clusters
- Support real-time AI transcription pipelines.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Track New Job Application</h2>
              <p className="text-xs text-slate-400">Add recruiter contacts for telephony dialer & AI analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrefillTelecomSample}
              className="px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-800 hover:bg-indigo-900 text-indigo-300 text-xs font-medium flex items-center gap-1 transition-all"
              title="Auto-fill with sample Telecom/VoIP job"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Prefill Sample</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold block">Company Name *</label>
              <input
                required
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. TelcoVibe Communications"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold block">Job Title / Role *</label>
              <input
                required
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Full Stack Developer (VoIP & Messaging)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold block">Workplace Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold block">Location / City</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote (San Francisco)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold block">Salary / Compensation</label>
              <input
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="e.g. $140,000 - $165,000"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold block">Application Deadline</label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
              />
            </div>
          </div>

          {/* Recruiter Details */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <span className="font-semibold text-slate-300 block border-b border-slate-800 pb-1.5">
              Recruiter & Telephony Follow-up Contact:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px] block">Recruiter Name:</label>
                <input
                  type="text"
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[11px] block">Phone (Softphone Dial):</label>
                <input
                  type="text"
                  value={recruiterPhone}
                  onChange={(e) => setRecruiterPhone(e.target.value)}
                  placeholder="+1 (415) 890-4421"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[11px] block">Email Address:</label>
                <input
                  type="email"
                  value={recruiterEmail}
                  onChange={(e) => setRecruiterEmail(e.target.value)}
                  placeholder="s.jenkins@company.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold block">Tags (comma separated):</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Python, FreeSWITCH, React, SIP, SMPP"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
            />
          </div>

          {/* Full Job Description */}
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold block">Job Description & Responsibilities:</label>
            <textarea
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste requirements, tech stack (Python, React, VoIP, SIP, SMPP, LLMs) to enable AI candidate summary..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
          >
            Create Job Application & Enable Tracking
          </button>
        </form>

      </div>
    </div>
  );
};

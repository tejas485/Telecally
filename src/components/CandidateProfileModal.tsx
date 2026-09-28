import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Award, 
  Github, 
  Globe, 
  Linkedin, 
  Plus, 
  X, 
  Save,
  CheckCircle2
} from 'lucide-react';
import { CandidateProfile } from '../types';

interface CandidateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CandidateProfile;
  onSaveProfile: (updated: CandidateProfile) => void;
}

export const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile
}) => {
  const [form, setForm] = useState<CandidateProfile>({ ...profile });
  const [newSkill, setNewSkill] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSave = () => {
    onSaveProfile(form);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Candidate Profile & Skills Vault</h2>
              <p className="text-xs text-slate-400">Used by Gemini AI for automated candidate summaries and elevator pitches</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold block">Full Name:</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold block">Professional Title:</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold block">Contact Email:</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold block">Phone Number (Telephony):</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-semibold block">Professional Bio & Experience Summary:</label>
            <textarea
              rows={3}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs leading-relaxed"
            />
          </div>

          {/* Technical Skills Vault */}
          <div className="space-y-2">
            <label className="text-slate-400 font-semibold block">Core Skills & Protocols:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add skill (e.g. FreeSWITCH, WebRTC, SIP, Python, Redis)..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {form.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-xs flex items-center gap-1.5"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Online Profiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold block flex items-center gap-1">
                <Github className="w-3.5 h-3.5" /> GitHub:
              </label>
              <input
                type="text"
                value={form.githubUrl}
                onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold block flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Portfolio:
              </label>
              <input
                type="text"
                value={form.portfolioUrl}
                onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold block flex items-center gap-1">
                <Linkedin className="w-3.5 h-3.5" /> LinkedIn:
              </label>
              <input
                type="text"
                value={form.linkedinUrl}
                onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Candidate Profile</span>
            </button>
          </div>

          {isSaved && (
            <div className="p-2.5 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-300 text-xs text-center flex items-center justify-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Profile updated successfully!</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

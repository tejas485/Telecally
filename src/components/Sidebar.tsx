import React from 'react';
import { 
  Bot, 
  PhoneForwarded, 
  Database, 
  Calendar, 
  FileText, 
  UserCheck, 
  Plus, 
  Sun, 
  Moon, 
  Palette, 
  X, 
  Sliders, 
  Radio, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { ThemeSettings, ThemeMode } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVoiceScreen: () => void;
  onLaunchTestCall: () => void;
  onOpenSoftphone: () => void;
  onOpenSql: () => void;
  onOpenSchedule: () => void;
  onOpenDocuments: () => void;
  onOpenProfile: () => void;
  onOpenNewApp: () => void;
  onOpenTheme: () => void;
  sqlCandidateCount: number;
  isSoftphoneActive: boolean;
  themeSettings: ThemeSettings;
  onToggleThemeMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onOpenVoiceScreen,
  onLaunchTestCall,
  onOpenSoftphone,
  onOpenSql,
  onOpenSchedule,
  onOpenDocuments,
  onOpenProfile,
  onOpenNewApp,
  onOpenTheme,
  sqlCandidateCount,
  isSoftphoneActive,
  themeSettings,
  onToggleThemeMode
}) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white tracking-tight">OmniCareer</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  VoIP & AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Navigation & Operations Panel</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div className="p-4 border-b border-slate-800/80 space-y-2">
          {/* 1. Start AI Test Call Button */}
          <button
            onClick={() => {
              onLaunchTestCall();
              onClose();
            }}
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>📞 Start Voice AI Test Call</span>
          </button>

          {/* 2. Create New Job Requisition Button */}
          <button
            onClick={() => {
              onOpenNewApp();
              onClose();
            }}
            className="w-full py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Create New Job Requisition</span>
          </button>
        </div>

        {/* Main Navigation Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 text-xs">
          
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Voice & Telephony Tools
          </div>

          {/* AI Voice Screener */}
          <button
            onClick={() => {
              onOpenVoiceScreen();
              onClose();
            }}
            className="w-full p-2.5 rounded-xl bg-gradient-to-r from-teal-950/60 to-cyan-950/40 hover:from-teal-900/60 hover:to-cyan-900/60 border border-teal-800/50 text-left flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600/20 border border-teal-500/40 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="font-semibold text-white group-hover:text-teal-300 block">
                  AI Voice Screener
                </span>
                <span className="text-[10px] text-slate-400">2-Way Voice Interview & SQL Sync</span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          </button>

          {/* Softphone Dialer */}
          <button
            onClick={() => {
              onOpenSoftphone();
              onClose();
            }}
            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between group transition-all ${
              isSoftphoneActive
                ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300 shadow-md shadow-emerald-950/40'
                : 'bg-slate-950/50 hover:bg-slate-800/70 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                isSoftphoneActive 
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' 
                  : 'bg-slate-800 border-slate-700 text-cyan-400'
              }`}>
                <PhoneForwarded className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold block">WebRTC Softphone</span>
                <span className="text-[10px] text-slate-400">SIP FreeSWITCH Dialer</span>
              </div>
            </div>
            {isSoftphoneActive && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700 animate-pulse">
                CALLING
              </span>
            )}
          </button>

          {/* SQL DB Explorer */}
          <button
            onClick={() => {
              onOpenSql();
              onClose();
            }}
            className="w-full p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/70 border border-slate-800 text-slate-300 hover:text-white text-left flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold block">SQL Database Tables</span>
                <span className="text-[10px] text-slate-400">Candidates & Turn Logs</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
              {sqlCandidateCount} records
            </span>
          </button>

          <div className="pt-3 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Recruitment & Organization
          </div>

          {/* Schedule */}
          <button
            onClick={() => {
              onOpenSchedule();
              onClose();
            }}
            className="w-full p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/70 border border-slate-800 text-slate-300 hover:text-white text-left flex items-center gap-2.5 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold block">Interviews & Schedule</span>
              <span className="text-[10px] text-slate-400">Reminders & Calendar Agenda</span>
            </div>
          </button>

          {/* Documents */}
          <button
            onClick={() => {
              onOpenDocuments();
              onClose();
            }}
            className="w-full p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/70 border border-slate-800 text-slate-300 hover:text-white text-left flex items-center gap-2.5 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold block">Resume & Documents</span>
              <span className="text-[10px] text-slate-400">Files, Resumes & Cover Letters</span>
            </div>
          </button>

          {/* Recruiter Profile */}
          <button
            onClick={() => {
              onOpenProfile();
              onClose();
            }}
            className="w-full p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/70 border border-slate-800 text-slate-300 hover:text-white text-left flex items-center gap-2.5 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold block">Recruiter Profile & SIP</span>
              <span className="text-[10px] text-slate-400">Credentials & Telco Config</span>
            </div>
          </button>

          <div className="pt-3 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Appearance & Theme Controls
          </div>

          {/* Day / Night Direct Switch */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {themeSettings.mode === 'light' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
              <div>
                <span className="font-semibold block text-slate-200">
                  {themeSettings.mode === 'light' ? 'Day (Light Mode)' : 'Night (Dark Mode)'}
                </span>
                <span className="text-[10px] text-slate-400">Instant Theme Switch</span>
              </div>
            </div>
            <button
              onClick={onToggleThemeMode}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[11px] border border-slate-700 transition-all cursor-pointer"
            >
              Toggle
            </button>
          </div>

          {/* Open Full Theme & Font Customizer */}
          <button
            onClick={() => {
              onOpenTheme();
              onClose();
            }}
            className="w-full p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/70 border border-slate-800 text-slate-300 hover:text-white text-left flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold block">Theme & Font Settings</span>
                <span className="text-[10px] text-slate-400">
                  Font: {themeSettings.fontFamily || 'Inter'} • Size: {themeSettings.fontSize}
                </span>
              </div>
            </div>
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
          </button>

        </div>

        {/* Telephony Connection Health Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              FreeSWITCH ESL Core
            </span>
            <span className="text-emerald-400">CONNECTED</span>
          </div>
          <div className="flex items-center justify-between">
            <span>WebRTC Audio Codec</span>
            <span className="text-cyan-400">48kHz Opus</span>
          </div>
        </div>

      </aside>
    </>
  );
};

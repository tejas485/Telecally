import React, { useState } from 'react';
import { 
  Briefcase, 
  PhoneCall, 
  Bell, 
  Plus, 
  FileText, 
  Calendar, 
  UserCheck, 
  Search,
  Sparkles,
  PhoneForwarded,
  Clock,
  ExternalLink,
  Database,
  Sun,
  Moon,
  Bot
} from 'lucide-react';
import { ActiveAlert, reminderManager } from '../utils/reminderManager';
import { JobApplication, ThemeSettings } from '../types';

interface HeaderProps {
  applications: JobApplication[];
  onOpenSoftphone: (app?: JobApplication) => void;
  onOpenVoiceScreen: () => void;
  onOpenSql: () => void;
  onOpenTheme: () => void;
  onOpenNewApp: () => void;
  onOpenDocuments: () => void;
  onOpenSchedule: () => void;
  onOpenProfile: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSoftphoneActive: boolean;
  sqlCandidateCount: number;
  themeSettings: ThemeSettings;
}

export const Header: React.FC<HeaderProps> = ({
  applications,
  onOpenSoftphone,
  onOpenVoiceScreen,
  onOpenSql,
  onOpenTheme,
  onOpenNewApp,
  onOpenDocuments,
  onOpenSchedule,
  onOpenProfile,
  searchQuery,
  onSearchChange,
  isSoftphoneActive,
  sqlCandidateCount,
  themeSettings
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const alerts: ActiveAlert[] = reminderManager.getActiveAlerts(applications);

  const handleRequestNotifications = async () => {
    const granted = await reminderManager.requestPermission();
    if (granted) {
      reminderManager.notify('Notifications Enabled! 🔔', {
        body: 'You will receive automatic alerts for upcoming interviews and deadlines.'
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 min-w-max">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 ring-1 ring-white/20">
              <PhoneCall className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  OmniCareer
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  SQL & Voice AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Telephony • AI Screening • SQL Recipient Sync
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-xs xl:max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search jobs, candidates, skills..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* AI Voice Screener Test Script Button */}
            <button
              onClick={onOpenVoiceScreen}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-md shadow-cyan-600/30 flex items-center gap-1.5 transition-all"
              title="Test AI Voice-Over Inbound/Recurring Screening"
            >
              <Bot className="w-3.5 h-3.5 animate-pulse text-cyan-200" />
              <span>Voice Screener</span>
            </button>

            {/* SQL Database Console Button */}
            <button
              onClick={onOpenSql}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-700/60 flex items-center gap-1.5 transition-all"
              title="View and Query Relational SQL Database"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">SQL DB</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-indigo-950 text-indigo-300 font-mono">
                {sqlCandidateCount}
              </span>
            </button>

            {/* Softphone Quick Launcher */}
            <button
              onClick={() => onOpenSoftphone()}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                isSoftphoneActive 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 animate-pulse' 
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700'
              }`}
              title="Open WebRTC Softphone Dialer"
            >
              <PhoneForwarded className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Softphone</span>
            </button>

            {/* Interviews / Schedule button */}
            <button
              onClick={onOpenSchedule}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
              title="Interview Schedule & Deadlines"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden xl:inline">Schedule</span>
            </button>

            {/* Document Manager button */}
            <button
              onClick={onOpenDocuments}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
              title="Document Management System"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xl:inline">Docs</span>
            </button>

            {/* Theme & Display Settings */}
            <button
              onClick={onOpenTheme}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
              title="Day/Night Mode, Color Palette & Sizing"
            >
              {themeSettings.mode === 'light' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-300" />
              )}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 relative transition-all"
                title="Interview and Deadline Reminders"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-slate-900 animate-pulse">
                    {alerts.length}
                  </span>
                )}
              </button>

              {/* Notification dropdown menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-sm text-slate-200">Upcoming Reminders</span>
                    </div>
                    <button
                      onClick={handleRequestNotifications}
                      className="text-xs text-blue-400 hover:text-blue-300 underline font-medium"
                    >
                      Enable Browser Alerts
                    </button>
                  </div>

                  {alerts.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      No urgent interviews or approaching deadlines in the next 48 hours. You're all caught up!
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-2.5 rounded-lg border text-xs transition-all ${
                            alert.urgency === 'critical'
                              ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                              : alert.urgency === 'warning'
                              ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                              : 'bg-blue-950/40 border-blue-800 text-blue-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold mb-0.5">
                            <span>{alert.title}</span>
                            <span className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] uppercase font-mono">
                              {alert.timeRemaining}
                            </span>
                          </div>
                          <p className="text-[11px] opacity-80 mb-2">{alert.subtitle}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {alert.recruiterPhone && (
                              <button
                                onClick={() => {
                                  setShowNotifications(false);
                                  onOpenSoftphone(applications.find(a => a.id === alert.applicationId));
                                }}
                                className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1 text-[11px]"
                              >
                                <PhoneCall className="w-3 h-3" /> Call Recruiter
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* New Application button */}
            <button
              onClick={onOpenNewApp}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Job</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};

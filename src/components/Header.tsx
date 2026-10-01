import React, { useState } from 'react';
import { 
  PhoneCall, 
  Bell, 
  Search, 
  Menu, 
  X,
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Sliders
} from 'lucide-react';
import { ActiveAlert, reminderManager } from '../utils/reminderManager';
import { JobApplication } from '../types';

interface HeaderProps {
  applications: JobApplication[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onSelectApplicationFromAlert?: (app: JobApplication) => void;
}

export const Header: React.FC<HeaderProps> = ({
  applications,
  searchQuery,
  onSearchChange,
  onToggleSidebar,
  isSidebarOpen,
  onSelectApplicationFromAlert
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
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
    <header className="sticky top-0 z-30 w-full bg-slate-900 border-b border-slate-800 text-white shadow-lg backdrop-blur-md">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left Side: Sidebar Toggle Hamburger + Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              title={isSidebarOpen ? "Close operations menu" : "Open operations sidebar menu"}
              aria-label="Toggle Navigation Sidebar"
            >
              <Menu className="w-5 h-5 text-cyan-400" />
              <span className="hidden sm:inline text-xs font-semibold">Menu</span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 ring-1 ring-white/20">
                <PhoneCall className="w-4 h-4 text-white" />
              </div>
              <div className="hidden xs:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    OmniCareer
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                    VoIP & AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden md:block">
                  Automated Voice Screening & Candidate System
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Search Bar & Notification Bell Only */}
          <div className="flex items-center gap-2.5 flex-1 justify-end max-w-md">
            
            {/* Desktop / Tablet Search Input */}
            <div className="relative flex-1 hidden sm:block max-w-xs md:max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search jobs, candidates, skills..."
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')} 
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mobile Search Button (toggles input) */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="sm:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
                title="Notifications & Upcoming Rounds"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-slate-900 animate-pulse">
                    {alerts.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 z-50 text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                        Interview & Deadline Reminders
                      </h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {alerts.length} Active
                    </span>
                  </div>

                  <div className="mt-3 max-h-64 overflow-y-auto space-y-2">
                    {alerts.length === 0 ? (
                      <div className="text-center py-6 text-slate-400">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-60" />
                        <p className="text-xs">No pending interview rounds or deadlines!</p>
                        <p className="text-[10px] text-slate-400 mt-1">You're fully up to date.</p>
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-2.5 rounded-xl border text-xs transition-all ${
                            alert.urgency === 'critical'
                              ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                              : alert.urgency === 'warning'
                              ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                              : 'bg-slate-800/60 border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                {alert.urgency === 'critical' && (
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                )}
                                <span>{alert.title}</span>
                              </div>
                              <p className="text-[11px] text-slate-300 mt-0.5">{alert.subtitle}</p>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 font-mono text-cyan-300 shrink-0">
                              {alert.timeRemaining}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <button
                      onClick={handleRequestNotifications}
                      className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                    >
                      <span>🔔 Enable Browser Push</span>
                    </button>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Search Input Expanded */}
        {isMobileSearchOpen && (
          <div className="pb-3 sm:hidden animate-in fade-in duration-150">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search jobs, candidates, skills..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                autoFocus
              />
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};

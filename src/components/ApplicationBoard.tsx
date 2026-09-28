import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Clock, 
  PhoneCall, 
  MessageSquare, 
  Mail, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  LayoutGrid, 
  List, 
  ChevronRight,
  Filter,
  AlertCircle,
  ExternalLink,
  PhoneForwarded,
  Award
} from 'lucide-react';
import { JobApplication, ApplicationStage, Priority } from '../types';
import { reminderManager } from '../utils/reminderManager';

interface ApplicationBoardProps {
  applications: JobApplication[];
  onSelectApplication: (app: JobApplication) => void;
  onUpdateStage: (applicationId: string, stage: ApplicationStage) => void;
  onOpenSoftphone: (application: JobApplication) => void;
  onOpenMessaging: (application: JobApplication) => void;
  onOpenMail: (application: JobApplication) => void;
  onOpenSummary: (application: JobApplication) => void;
  onOpenNewApp: () => void;
  searchQuery: string;
}

const STAGES: { id: ApplicationStage; title: string; color: string }[] = [
  { id: 'wishlist', title: 'Wishlist', color: 'border-slate-700 bg-slate-900/50' },
  { id: 'applied', title: 'Applied', color: 'border-blue-900/70 bg-blue-950/20' },
  { id: 'screening', title: 'Recruiter Screen', color: 'border-cyan-900/70 bg-cyan-950/20' },
  { id: 'technical', title: 'Technical Round', color: 'border-indigo-900/70 bg-indigo-950/20' },
  { id: 'system_design', title: 'System Design', color: 'border-purple-900/70 bg-purple-950/20' },
  { id: 'hr_offer', title: 'Offer Stage 🎉', color: 'border-emerald-800/80 bg-emerald-950/30' },
  { id: 'rejected', title: 'Archived', color: 'border-slate-800 bg-slate-950/40' },
];

export const ApplicationBoard: React.FC<ApplicationBoardProps> = ({
  applications,
  onSelectApplication,
  onUpdateStage,
  onOpenSoftphone,
  onOpenMessaging,
  onOpenMail,
  onOpenSummary,
  onOpenNewApp,
  searchQuery
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.recruiterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = priorityFilter === 'all' || app.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const handleStageChange = (appId: string, newStage: ApplicationStage) => {
    if (newStage === 'hr_offer') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    onUpdateStage(appId, newStage);
  };

  // Metrics summary
  const totalApps = applications.length;
  const inInterview = applications.filter(a => a.stage === 'screening' || a.stage === 'technical' || a.stage === 'system_design').length;
  const offersReceived = applications.filter(a => a.stage === 'hr_offer').length;
  const upcomingInterviewsCount = applications.reduce((acc, a) => acc + (a.interviews?.filter(i => i.status === 'upcoming').length || 0), 0);

  return (
    <div className="space-y-5">
      
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-xs text-slate-400 font-medium block">Total Applications</span>
          <div className="text-2xl font-bold text-white mt-1">{totalApps}</div>
          <span className="text-[11px] text-cyan-400 font-medium">Active Pipeline</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-xs text-slate-400 font-medium block">Active Interview Rounds</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">{inInterview}</div>
          <span className="text-[11px] text-slate-400">Phone screens & coding</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-xs text-slate-400 font-medium block">Upcoming Calendar Dates</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{upcomingInterviewsCount}</div>
          <span className="text-[11px] text-slate-400">Sync with Google Calendar</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-800/80 rounded-xl p-3.5 shadow-sm">
          <span className="text-xs text-emerald-300 font-medium block">Offers & Packages</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{offersReceived}</div>
          <span className="text-[11px] text-emerald-300">Base salary $155,000+</span>
        </div>
      </div>

      {/* Control & View Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Priority:</span>
          </div>
          <div className="flex items-center gap-1">
            {(['all', 'high', 'medium', 'low'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider transition-all ${
                  priorityFilter === p
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md flex items-center gap-1 ${
                viewMode === 'board' ? 'bg-slate-900 text-cyan-400 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-slate-900 text-cyan-400 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">List</span>
            </button>
          </div>

          <button
            onClick={onOpenNewApp}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Track Application</span>
          </button>
        </div>
      </div>

      {/* MAIN VIEW: KANBAN BOARD */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3.5 items-start">
          {STAGES.map(stage => {
            const stageApps = filteredApplications.filter(a => a.stage === stage.id);
            return (
              <div
                key={stage.id}
                className={`rounded-xl border ${stage.color} p-2.5 flex flex-col min-h-[520px] transition-all`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 px-1">
                  <span className="font-bold text-xs text-slate-200">{stage.title}</span>
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">
                    {stageApps.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {stageApps.map(app => {
                    const upcomingInterview = app.interviews?.find(i => i.status === 'upcoming');
                    const deadlineDiff = app.deadlineDate ? reminderManager.calculateTimeRemaining(app.deadlineDate) : null;

                    return (
                      <div
                        key={app.id}
                        className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3 shadow-md transition-all space-y-2.5 group cursor-pointer"
                        onClick={() => onSelectApplication(app)}
                      >
                        {/* Company & Role */}
                        <div>
                          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-0.5">
                            <span className="font-semibold uppercase tracking-wider text-cyan-400 truncate max-w-[130px]">
                              {app.company}
                            </span>
                            {app.analysis && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
                                {app.analysis.matchScore}% Match
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-tight">
                            {app.role}
                          </h4>
                          <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
                            {app.salaryRange}
                          </span>
                        </div>

                        {/* Imminent Interview Countdown Banner */}
                        {upcomingInterview && (
                          <div className="p-1.5 rounded-lg bg-blue-950/70 border border-blue-800/80 text-[10px] flex items-center justify-between text-blue-200 font-mono">
                            <span className="flex items-center gap-1 font-semibold truncate">
                              <Calendar className="w-3 h-3 text-blue-400 shrink-0" />
                              {upcomingInterview.roundType}
                            </span>
                            <span className="font-bold text-cyan-300 shrink-0 ml-1">
                              {upcomingInterview.date.slice(5)} {upcomingInterview.time}
                            </span>
                          </div>
                        )}

                        {/* Recruiter & Telephony quick actions */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-medium truncate max-w-[90px]">
                            {app.recruiterName}
                          </span>

                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => onOpenSoftphone(app)}
                              className="p-1.5 rounded-md bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 transition-colors"
                              title="Softphone Call to Recruiter"
                            >
                              <PhoneForwarded className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onOpenMessaging(app)}
                              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors"
                              title="WhatsApp / SMS Recruiter"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onOpenMail(app)}
                              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 transition-colors"
                              title="Email Recruiter"
                            >
                              <Mail className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Quick stage selector */}
                        <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={app.stage}
                            onChange={(e) => handleStageChange(app.id, e.target.value as ApplicationStage)}
                            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded px-2 py-1 text-[10px] focus:outline-none"
                          >
                            {STAGES.map(s => (
                              <option key={s.id} value={s.id}>
                                Move to: {s.title}
                              </option>
                            ))}
                          </select>
                        </div>

                      </div>
                    );
                  })}

                  {stageApps.length === 0 && (
                    <div className="py-8 text-center text-slate-600 text-[11px] italic">
                      Empty stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Company & Role</th>
                <th className="py-3 px-3">Stage</th>
                <th className="py-3 px-3">Match</th>
                <th className="py-3 px-3">Recruiter Contact</th>
                <th className="py-3 px-3">Next Schedule</th>
                <th className="py-3 px-3">Salary</th>
                <th className="py-3 px-4 text-right">Quick Telephony Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredApplications.map(app => {
                const upcomingInterview = app.interviews?.find(i => i.status === 'upcoming');
                return (
                  <tr
                    key={app.id}
                    onClick={() => onSelectApplication(app)}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{app.role}</div>
                      <div className="text-cyan-400 text-[11px]">{app.company} • {app.location}</div>
                    </td>

                    <td className="py-3 px-3">
                      <select
                        value={app.stage}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStageChange(app.id, e.target.value as ApplicationStage)}
                        className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2 py-1 text-[11px]"
                      >
                        {STAGES.map(s => (
                          <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-3">
                      {app.analysis ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold text-[11px]">
                          {app.analysis.matchScore}%
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenSummary(app);
                          }}
                          className="text-[10px] text-indigo-400 hover:underline"
                        >
                          Analyze with AI
                        </button>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-200 font-medium">{app.recruiterName}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{app.recruiterPhone}</div>
                    </td>

                    <td className="py-3 px-3">
                      {upcomingInterview ? (
                        <div className="text-blue-300 font-mono text-[11px]">
                          {upcomingInterview.date} at {upcomingInterview.time}
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-300 font-medium">
                      {app.salaryRange}
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenSoftphone(app)}
                          className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1 text-[11px]"
                        >
                          <PhoneForwarded className="w-3 h-3" /> Softphone
                        </button>
                        <button
                          onClick={() => onOpenMessaging(app)}
                          className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
                          title="WhatsApp / SMS"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenMail(app)}
                          className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700"
                          title="Email Recruiter"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

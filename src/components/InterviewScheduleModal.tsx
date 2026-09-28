import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  PhoneCall, 
  ExternalLink, 
  Download, 
  Plus, 
  CheckCircle2, 
  X, 
  User, 
  Building, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { InterviewEvent, JobApplication } from '../types';
import { reminderManager } from '../utils/reminderManager';

interface InterviewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: JobApplication[];
  onAddInterview: (applicationId: string, interview: InterviewEvent) => void;
  onUpdateInterviewStatus: (applicationId: string, interviewId: string, status: 'upcoming' | 'completed' | 'cancelled') => void;
  onOpenSoftphone: (application?: JobApplication) => void;
}

export const InterviewScheduleModal: React.FC<InterviewScheduleModalProps> = ({
  isOpen,
  onClose,
  applications,
  onAddInterview,
  onUpdateInterviewStatus,
  onOpenSoftphone
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(applications[0]?.id || '');
  const [roundTitle, setRoundTitle] = useState('Technical Interview: Python & VoIP System Design');
  const [roundType, setRoundType] = useState<InterviewEvent['roundType']>('Technical / Coding');
  const [date, setDate] = useState('2026-10-02');
  const [time, setTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [interviewerNames, setInterviewerNames] = useState('Engineering Team');
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/new');
  const [notes, setNotes] = useState('Prepare SIP ladder diagrams, FreeSWITCH ESL concepts, and live coding sample.');

  if (!isOpen) return null;

  // Gather all interviews across all applications
  const allInterviews: (InterviewEvent & { app: JobApplication })[] = [];
  applications.forEach(app => {
    app.interviews?.forEach(int => {
      allInterviews.push({
        ...int,
        app
      });
    });
  });

  // Sort upcoming first by date and time
  allInterviews.sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.time}:00`).getTime();
    const timeB = new Date(`${b.date}T${b.time}:00`).getTime();
    return timeA - timeB;
  });

  const handleCreateInterview = () => {
    const targetApp = applications.find(a => a.id === selectedAppId);
    if (!targetApp) return;

    const newInterview: InterviewEvent = {
      id: `int-${Date.now()}`,
      applicationId: targetApp.id,
      company: targetApp.company,
      role: targetApp.role,
      title: roundTitle,
      roundType,
      date,
      time,
      durationMinutes,
      meetingUrl,
      interviewerNames,
      interviewerPhone: targetApp.recruiterPhone,
      interviewerEmail: targetApp.recruiterEmail,
      notes,
      status: 'upcoming',
      reminderMinutesBefore: 30,
      prepTopics: ['System architecture', 'Telecom protocols', 'Compensation expectations']
    };

    onAddInterview(targetApp.id, newInterview);
    setShowAddForm(false);
    reminderManager.notify(`Interview Scheduled: ${roundTitle}`, {
      body: `Reminder set for ${date} at ${time}.`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                Interview Schedule & Deadlines Organizer
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                  {allInterviews.filter(i => i.status === 'upcoming').length} Upcoming
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated reminders, Google/iCal sync & 1-click recruiter softphone dialing
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
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Action Row */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">All Scheduled Rounds:</span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Close Form' : 'Schedule New Round'}</span>
            </button>
          </div>

          {/* New Round Schedule Form */}
          {showAddForm && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 animate-in fade-in">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-400" />
                Schedule Interview Round
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold block">Select Job Application:</label>
                  <select
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  >
                    {applications.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.company} — {app.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold block">Round Type:</label>
                  <select
                    value={roundType}
                    onChange={(e) => setRoundType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  >
                    <option value="Recruiter Screen">Recruiter Phone Screen</option>
                    <option value="Technical / Coding">Technical / Coding Round</option>
                    <option value="System Design">System Design & Architecture</option>
                    <option value="Hiring Manager">Hiring Manager Round</option>
                    <option value="Executive Offer">Executive & Offer Negotiation</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-400 font-semibold block">Interview Title:</label>
                  <input
                    type="text"
                    value={roundTitle}
                    onChange={(e) => setRoundTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold block">Date (YYYY-MM-DD):</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold block">Time & Duration:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                    />
                    <select
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                    >
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                      <option value={90}>90 min</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold block">Interviewer Name(s):</label>
                  <input
                    type="text"
                    value={interviewerNames}
                    onChange={(e) => setInterviewerNames(e.target.value)}
                    placeholder="e.g. Sarah Jenkins & Marcus Vance"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold block">Meeting Link / Room:</label>
                  <input
                    type="text"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-400 font-semibold block">Prep Notes / Key Topics:</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  />
                </div>
              </div>

              <button
                onClick={handleCreateInterview}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all"
              >
                Confirm & Add to Schedule
              </button>
            </div>
          )}

          {/* Interview Cards List */}
          <div className="space-y-3">
            {allInterviews.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No interviews scheduled yet. Click "Schedule New Round" above.
              </div>
            ) : (
              allInterviews.map((item) => {
                const countdown = reminderManager.calculateTimeRemaining(item.date, item.time);
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border text-xs transition-all ${
                      item.status === 'completed'
                        ? 'bg-slate-950/40 border-slate-800 text-slate-400 opacity-75'
                        : countdown.diffHours <= 24 && !countdown.isPast
                        ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/50 border-blue-800 text-slate-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{item.title}</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-medium">
                            {item.roundType}
                          </span>
                        </div>
                        <div className="text-slate-400 mt-0.5 font-medium flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.company}</span>
                          <span>•</span>
                          <span>{item.role}</span>
                        </div>
                      </div>

                      {/* Countdown badge */}
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 ${
                          countdown.isPast
                            ? 'bg-slate-800 text-slate-400'
                            : countdown.diffHours <= 3
                            ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{countdown.formatted}</span>
                        </span>

                        <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold ${
                          item.status === 'completed'
                            ? 'bg-slate-800 text-emerald-400'
                            : 'bg-blue-950 text-blue-300'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {/* Interview Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 mb-3 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Date & Time:</span>
                        <span className="font-semibold text-slate-200">{item.date} at {item.time} ({item.durationMinutes} mins)</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Interviewer(s):</span>
                        <span className="font-semibold text-slate-200">{item.interviewerNames || 'Hiring Team'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Meeting Room:</span>
                        {item.meetingUrl ? (
                          <a
                            href={item.meetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:underline flex items-center gap-1 font-mono truncate"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{item.meetingUrl.replace(/^https?:\/\//, '')}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">Softphone Call</span>
                        )}
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-slate-400 mb-3 italic">
                        <strong>Prep note:</strong> {item.notes}
                      </p>
                    )}

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-900">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onClose();
                            onOpenSoftphone(item.app);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5 transition-all"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Call Recruiter</span>
                        </button>

                        <button
                          onClick={() => reminderManager.downloadIcsFile(item)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
                          title="Add to Google Calendar or Apple iCal"
                        >
                          <Download className="w-3 h-3" />
                          <span>Sync (.ics)</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.status !== 'completed' && (
                          <button
                            onClick={() => onUpdateInterviewStatus(item.app.id, item.id, 'completed')}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 flex items-center gap-1 transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Completed</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

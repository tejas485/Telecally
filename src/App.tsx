/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ApplicationBoard } from './components/ApplicationBoard';
import { TelephonySoftphone } from './components/TelephonySoftphone';
import { CandidateSummaryModal } from './components/CandidateSummaryModal';
import { MessagingCenterModal } from './components/MessagingCenterModal';
import { MailHubModal } from './components/MailHubModal';
import { InterviewScheduleModal } from './components/InterviewScheduleModal';
import { DocumentManagerModal } from './components/DocumentManagerModal';
import { CandidateProfileModal } from './components/CandidateProfileModal';
import { NewApplicationModal } from './components/NewApplicationModal';
import { ApplicationDetailModal } from './components/ApplicationDetailModal';
import { VoiceScreeningTestModal } from './components/VoiceScreeningTestModal';
import { SqlExplorerModal } from './components/SqlExplorerModal';
import { ThemeSettingsModal } from './components/ThemeSettingsModal';

import { 
  JobApplication, 
  CandidateProfile, 
  AppDocument, 
  ApplicationStage, 
  CommunicationLog, 
  InterviewEvent, 
  CandidateAnalysis,
  ThemeSettings,
  SqlCandidate
} from './types';

import { initialApplications, initialCandidateProfile, initialDocuments } from './utils/initialData';
import { reminderManager } from './utils/reminderManager';
import { PhoneForwarded, Sparkles, MessageSquare, Calendar, FileText, Bell, Database, Bot, Palette } from 'lucide-react';

export default function App() {
  // Theme & Appearance Preferences
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('omnicareer_theme_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      mode: 'dark',
      colorTheme: 'cyan',
      fontSize: 'medium',
      buttonSize: 'medium'
    };
  });

  useEffect(() => {
    localStorage.setItem('omnicareer_theme_settings', JSON.stringify(themeSettings));
  }, [themeSettings]);

  // SQL Database Candidates state
  const [sqlCandidates, setSqlCandidates] = useState<SqlCandidate[]>([]);

  const fetchSqlCandidates = async () => {
    try {
      const res = await fetch('/api/sql/candidates');
      const data = await res.json();
      if (data.success) {
        setSqlCandidates(data.data || []);
      }
    } catch (e) {
      console.warn('Could not fetch candidates from SQL API:', e);
    }
  };

  useEffect(() => {
    fetchSqlCandidates();
  }, []);

  // LocalStorage-backed state with initial data fallback
  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const saved = localStorage.getItem('omnicareer_apps');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialApplications;
  });

  const [profile, setProfile] = useState<CandidateProfile>(() => {
    const saved = localStorage.getItem('omnicareer_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialCandidateProfile;
  });

  const [documents, setDocuments] = useState<AppDocument[]>(() => {
    const saved = localStorage.getItem('omnicareer_docs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialDocuments;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('omnicareer_apps', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('omnicareer_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('omnicareer_docs', JSON.stringify(documents));
  }, [documents]);

  // Modal Visibility State
  const [isSoftphoneOpen, setIsSoftphoneOpen] = useState(false);
  const [selectedSoftphoneApp, setSelectedSoftphoneApp] = useState<JobApplication | undefined>(undefined);

  const [isVoiceScreenOpen, setIsVoiceScreenOpen] = useState(false);
  const [isSqlExplorerOpen, setIsSqlExplorerOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [selectedMessagingApp, setSelectedMessagingApp] = useState<JobApplication | null>(null);

  const [isMailOpen, setIsMailOpen] = useState(false);
  const [selectedMailApp, setSelectedMailApp] = useState<JobApplication | null>(null);

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [selectedSummaryApp, setSelectedSummaryApp] = useState<JobApplication | null>(null);

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNewAppOpen, setIsNewAppOpen] = useState(false);

  const [detailApp, setDetailApp] = useState<JobApplication | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Floating Reminder Banner for urgent upcoming round
  const alerts = reminderManager.getActiveAlerts(applications);
  const criticalAlert = alerts.find(a => a.urgency === 'critical') || alerts[0];

  // Stage change handler
  const handleUpdateStage = (applicationId: string, stage: ApplicationStage) => {
    setApplications(prev => prev.map(app => {
      if (app.id === applicationId) {
        return {
          ...app,
          stage,
          lastContactDate: new Date().toISOString().split('T')[0]
        };
      }
      return app;
    }));

    if (detailApp && detailApp.id === applicationId) {
      setDetailApp(prev => prev ? { ...prev, stage } : null);
    }
  };

  // Add communication log (Call, WhatsApp, SMS, Email)
  const handleSaveCommunicationLog = (applicationId: string, log: CommunicationLog) => {
    setApplications(prev => prev.map(app => {
      if (app.id === applicationId) {
        return {
          ...app,
          communications: [log, ...(app.communications || [])],
          lastContactDate: new Date().toISOString().split('T')[0]
        };
      }
      return app;
    }));

    if (detailApp && detailApp.id === applicationId) {
      setDetailApp(prev => prev ? {
        ...prev,
        communications: [log, ...(prev.communications || [])],
        lastContactDate: new Date().toISOString().split('T')[0]
      } : null);
    }
  };

  // Add interview round
  const handleAddInterview = (applicationId: string, interview: InterviewEvent) => {
    setApplications(prev => prev.map(app => {
      if (app.id === applicationId) {
        return {
          ...app,
          interviews: [...(app.interviews || []), interview]
        };
      }
      return app;
    }));
  };

  // Update interview status
  const handleUpdateInterviewStatus = (applicationId: string, interviewId: string, status: 'upcoming' | 'completed' | 'cancelled') => {
    setApplications(prev => prev.map(app => {
      if (app.id === applicationId) {
        return {
          ...app,
          interviews: app.interviews.map(i => i.id === interviewId ? { ...i, status } : i)
        };
      }
      return app;
    }));
  };

  // Update Candidate Analysis (Gemini)
  const handleUpdateAnalysis = (applicationId: string, analysis: CandidateAnalysis) => {
    setApplications(prev => prev.map(app => {
      if (app.id === applicationId) {
        return { ...app, analysis };
      }
      return app;
    }));

    if (detailApp && detailApp.id === applicationId) {
      setDetailApp(prev => prev ? { ...prev, analysis } : null);
    }
  };

  // Document management handlers
  const handleAddDocument = (newDoc: AppDocument) => {
    setDocuments(prev => [newDoc, ...prev]);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleToggleDefaultDocument = (id: string) => {
    setDocuments(prev => prev.map(d => ({
      ...d,
      isDefault: d.id === id
    })));
  };

  // Add new job application
  const handleAddApplication = (newApp: JobApplication) => {
    setApplications(prev => [newApp, ...prev]);
  };

  // Theme styling classes
  const isLight = themeSettings.mode === 'light';
  const fontClass = themeSettings.fontSize === 'small' ? 'text-xs' : themeSettings.fontSize === 'large' ? 'text-base' : 'text-sm';

  return (
    <div 
      data-font-size={themeSettings.fontSize}
      data-button-size={themeSettings.buttonSize}
      data-color-theme={themeSettings.colorTheme}
      className={`min-h-screen ${fontClass} ${isLight ? 'theme-light' : ''} transition-colors duration-200 ${
        isLight 
          ? 'bg-slate-100 text-slate-900 selection:bg-cyan-600 selection:text-white' 
          : 'bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white'
      }`}
    >
      
      {/* Top Navigation */}
      <Header
        applications={applications}
        onOpenSoftphone={(app) => {
          setSelectedSoftphoneApp(app || applications[0]);
          setIsSoftphoneOpen(true);
        }}
        onOpenVoiceScreen={() => setIsVoiceScreenOpen(true)}
        onOpenSql={() => setIsSqlExplorerOpen(true)}
        onOpenTheme={() => setIsThemeOpen(true)}
        onOpenNewApp={() => setIsNewAppOpen(true)}
        onOpenDocuments={() => setIsDocumentsOpen(true)}
        onOpenSchedule={() => setIsScheduleOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSoftphoneActive={isSoftphoneOpen}
        sqlCandidateCount={sqlCandidates.length}
        themeSettings={themeSettings}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Quick Test Callout Banner */}
        <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 shadow-md ${
          isLight 
            ? 'bg-gradient-to-r from-cyan-50 via-white to-blue-50 border-cyan-200 text-slate-800'
            : 'bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border-cyan-900/60 text-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">AI Voice-Over Interviewer & SQL Test Suite Ready</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  11 Test Candidates in SQL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Experience voice-over questions, entity extraction, recurring candidate recognition & live SQL database sync.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVoiceScreenOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center gap-1.5 transition-all"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Launch Voice Interview Test</span>
            </button>
            <button
              onClick={() => setIsSqlExplorerOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Inspect SQL Tables</span>
            </button>
          </div>
        </div>

        {/* Critical Reminder Alert Banner (if interview or deadline near) */}
        {criticalAlert && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-800/80 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <span className="font-bold text-white block">
                  {criticalAlert.title}
                </span>
                <span className="text-slate-300">
                  {criticalAlert.subtitle} • <strong className="text-amber-400 font-mono">{criticalAlert.timeRemaining}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const targetApp = applications.find(a => a.id === criticalAlert.applicationId);
                  setSelectedSoftphoneApp(targetApp || applications[0]);
                  setIsSoftphoneOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <PhoneForwarded className="w-3.5 h-3.5" />
                <span>Call Recruiter</span>
              </button>
              <button
                onClick={() => setIsScheduleOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
              >
                View Agenda
              </button>
            </div>
          </div>
        )}

        {/* Application Board */}
        <ApplicationBoard
          applications={applications}
          onSelectApplication={(app) => setDetailApp(app)}
          onUpdateStage={handleUpdateStage}
          onOpenSoftphone={(app) => {
            setSelectedSoftphoneApp(app);
            setIsSoftphoneOpen(true);
          }}
          onOpenMessaging={(app) => {
            setSelectedMessagingApp(app);
            setIsMessagingOpen(true);
          }}
          onOpenMail={(app) => {
            setSelectedMailApp(app);
            setIsMailOpen(true);
          }}
          onOpenSummary={(app) => {
            setSelectedSummaryApp(app);
            setIsSummaryOpen(true);
          }}
          onOpenNewApp={() => setIsNewAppOpen(true)}
          searchQuery={searchQuery}
        />

      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2.5 items-end">
        <button
          onClick={() => setIsVoiceScreenOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-xl shadow-teal-600/30 border border-teal-400/40 flex items-center gap-2 font-bold text-xs tracking-wide transition-all transform hover:scale-105"
          title="Interactive Voice Interview & Test Script"
        >
          <Bot className="w-4 h-4 animate-pulse" />
          <span>AI Voice Screener</span>
        </button>

        <button
          onClick={() => {
            setSelectedSoftphoneApp(applications[0]);
            setIsSoftphoneOpen(true);
          }}
          className="p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-2xl shadow-cyan-600/40 border border-cyan-400/40 flex items-center gap-2 font-bold text-xs tracking-wide transition-all transform hover:scale-105"
          title="Open WebRTC Softphone"
        >
          <PhoneForwarded className="w-5 h-5" />
          <span className="hidden sm:inline">Softphone Dialer</span>
        </button>
      </div>

      {/* MODALS */}

      {/* 1. Interactive AI Voice Screening & Test Script Modal */}
      <VoiceScreeningTestModal
        isOpen={isVoiceScreenOpen}
        onClose={() => setIsVoiceScreenOpen(false)}
        sqlCandidates={sqlCandidates}
        onRefreshSqlData={fetchSqlCandidates}
        onOpenSqlExplorer={() => {
          setIsVoiceScreenOpen(false);
          setIsSqlExplorerOpen(true);
        }}
      />

      {/* 2. SQL Database Inspector & Query Runner Modal */}
      <SqlExplorerModal
        isOpen={isSqlExplorerOpen}
        onClose={() => setIsSqlExplorerOpen(false)}
        candidates={sqlCandidates}
        onRefreshData={fetchSqlCandidates}
        onLaunchTestCallForCandidate={(phone, name) => {
          setIsSqlExplorerOpen(false);
          setIsVoiceScreenOpen(true);
        }}
      />

      {/* 3. Theme & Appearance Settings Modal */}
      <ThemeSettingsModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        settings={themeSettings}
        onUpdateSettings={setThemeSettings}
      />

      {/* 4. Telephony WebRTC Softphone Modal */}
      <TelephonySoftphone
        isOpen={isSoftphoneOpen}
        onClose={() => setIsSoftphoneOpen(false)}
        applications={applications}
        selectedApplication={selectedSoftphoneApp}
        onSaveCallLog={handleSaveCommunicationLog}
      />

      {/* 5. Candidate Summary & Pitch Coach Modal */}
      {selectedSummaryApp && (
        <CandidateSummaryModal
          isOpen={isSummaryOpen}
          onClose={() => {
            setIsSummaryOpen(false);
            setSelectedSummaryApp(null);
          }}
          application={selectedSummaryApp}
          candidateProfile={profile}
          onUpdateAnalysis={handleUpdateAnalysis}
        />
      )}

      {/* 6. Messaging & WhatsApp Modal */}
      {selectedMessagingApp && (
        <MessagingCenterModal
          isOpen={isMessagingOpen}
          onClose={() => {
            setIsMessagingOpen(false);
            setSelectedMessagingApp(null);
          }}
          application={selectedMessagingApp}
          onSaveMessageLog={handleSaveCommunicationLog}
        />
      )}

      {/* 7. Mail Service Modal */}
      {selectedMailApp && (
        <MailHubModal
          isOpen={isMailOpen}
          onClose={() => {
            setIsMailOpen(false);
            setSelectedMailApp(null);
          }}
          application={selectedMailApp}
          onSaveEmailLog={handleSaveCommunicationLog}
        />
      )}

      {/* 8. Interview Schedule Modal */}
      <InterviewScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        applications={applications}
        onAddInterview={handleAddInterview}
        onUpdateInterviewStatus={handleUpdateInterviewStatus}
        onOpenSoftphone={(app) => {
          setSelectedSoftphoneApp(app || applications[0]);
          setIsSoftphoneOpen(true);
        }}
      />

      {/* 9. Document Management System Modal */}
      <DocumentManagerModal
        isOpen={isDocumentsOpen}
        onClose={() => setIsDocumentsOpen(false)}
        documents={documents}
        applications={applications}
        onAddDocument={handleAddDocument}
        onDeleteDocument={handleDeleteDocument}
        onToggleDefault={handleToggleDefaultDocument}
      />

      {/* 10. Candidate Profile Modal */}
      <CandidateProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={setProfile}
      />

      {/* 11. New Job Application Modal */}
      <NewApplicationModal
        isOpen={isNewAppOpen}
        onClose={() => setIsNewAppOpen(false)}
        onAddApplication={handleAddApplication}
      />

      {/* 12. Application 360 Detail Modal */}
      {detailApp && (
        <ApplicationDetailModal
          isOpen={!!detailApp}
          onClose={() => setDetailApp(null)}
          application={detailApp}
          onUpdateStage={handleUpdateStage}
          onOpenSoftphone={(app) => {
            setSelectedSoftphoneApp(app);
            setIsSoftphoneOpen(true);
          }}
          onOpenMessaging={(app) => {
            setSelectedMessagingApp(app);
            setIsMessagingOpen(true);
          }}
          onOpenMail={(app) => {
            setSelectedMailApp(app);
            setIsMailOpen(true);
          }}
          onOpenSummary={(app) => {
            setSelectedSummaryApp(app);
            setIsSummaryOpen(true);
          }}
          onOpenSchedule={() => setIsScheduleOpen(true)}
          onOpenDocuments={() => setIsDocumentsOpen(true)}
        />
      )}

    </div>
  );
}

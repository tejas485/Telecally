import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Table, 
  Play, 
  RotateCcw, 
  X, 
  Search, 
  Check, 
  PhoneCall, 
  Users, 
  Sparkles,
  Terminal,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { SqlCandidate } from '../types';

interface SqlExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: SqlCandidate[];
  onRefreshData: () => void;
  onLaunchTestCallForCandidate: (phone: string, name: string) => void;
}

export const SqlExplorerModal: React.FC<SqlExplorerModalProps> = ({
  isOpen,
  onClose,
  candidates,
  onRefreshData,
  onLaunchTestCallForCandidate
}) => {
  const [activeTab, setActiveTab] = useState<'candidates' | 'query' | 'schema'>('candidates');
  const [customSql, setCustomSql] = useState('SELECT name, phone, job_role, experience_years, expected_salary, status FROM candidates ORDER BY experience_years DESC;');
  const [queryResults, setQueryResults] = useState<{ columns: string[]; rows: any[]; rowCount: number } | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const handleExecuteQuery = async (sqlToRun?: string) => {
    const query = sqlToRun || customSql;
    setIsExecuting(true);
    setQueryError(null);
    try {
      const res = await fetch('/api/sql/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: query })
      });
      const data = await res.json();
      if (data.success) {
        setQueryResults({
          columns: data.columns || [],
          rows: data.rows || [],
          rowCount: data.rowCount || 0
        });
      } else {
        setQueryError(data.error || 'Query failed');
      }
    } catch (err: any) {
      setQueryError(err.message || 'Execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleResetSeed = async () => {
    if (!confirm('Reset SQL database and re-seed 11 candidate profiles?')) return;
    setIsResetting(true);
    try {
      const res = await fetch('/api/sql/reset-seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        onRefreshData();
        handleExecuteQuery();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  const getSkills = (skills: any): string[] => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') {
      try {
        const p = JSON.parse(skills);
        if (Array.isArray(p)) return p;
      } catch {}
      return skills.split(',').map(s => s.trim().replace(/^["'\[\]]+|["'\[\]]+$/g, '')).filter(Boolean);
    }
    return [];
  };

  const filteredCandidates = candidates.filter(c => {
    const sList = getSkills(c.skills);
    return (
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (c.job_role || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.phone.includes(searchFilter) ||
      sList.some(s => s.toLowerCase().includes(searchFilter.toLowerCase()))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-base">Relational SQL Database Console</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                  SQLite (database.sqlite)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Persistent storage for recipient profiles, call sessions, conversation turns & summaries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetSeed}
              disabled={isResetting}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Reset & Re-seed 11 candidate database"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Resetting...' : 'Re-seed 11 Candidates'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-950 px-4 flex items-center gap-4 border-b border-slate-800 text-xs font-semibold">
          {[
            { id: 'candidates', label: `Candidates Table (${candidates.length} records)` },
            { id: 'query', label: 'Interactive SQL Query Runner' },
            { id: 'schema', label: 'Database Schema & Tables' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'query' && !queryResults) handleExecuteQuery();
              }}
              className={`py-3 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-indigo-400 text-indigo-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* TAB 1: CANDIDATES TABLE VIEW */}
          {activeTab === 'candidates' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="relative max-w-sm flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search candidate name, role, skills in SQL..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <span className="text-slate-400 text-[11px] font-mono">
                  Showing {filteredCandidates.length} of {candidates.length} records
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto shadow-inner">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Candidate / Recipient</th>
                      <th className="py-2.5 px-3">Phone (Caller Key)</th>
                      <th className="py-2.5 px-3">Job Role</th>
                      <th className="py-2.5 px-2">Exp</th>
                      <th className="py-2.5 px-3">Skills Stored</th>
                      <th className="py-2.5 px-3">Salary Target</th>
                      <th className="py-2.5 px-3">Calls</th>
                      <th className="py-2.5 px-3 text-right">Voice Test</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-sans">
                    {filteredCandidates.map(c => (
                      <tr key={c.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-white text-xs">{c.name}</div>
                          <div className="text-slate-400 text-[10px] truncate max-w-[150px]">{c.email || c.location}</div>
                        </td>

                        <td className="py-2.5 px-3 font-mono text-cyan-400 text-[11px]">
                          {c.phone}
                        </td>

                        <td className="py-2.5 px-3 font-medium text-slate-200">
                          {c.job_role || 'Developer'}
                        </td>

                        <td className="py-2.5 px-2 font-bold text-amber-400">
                          {c.experience_years ? `${c.experience_years}y` : '—'}
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {getSkills(c.skills).slice(0, 3).map(s => (
                              <span key={s} className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900 text-[10px]">
                                {s}
                              </span>
                            ))}
                            {getSkills(c.skills).length > 3 && (
                              <span className="text-slate-500 text-[10px]">+{getSkills(c.skills).length - 3}</span>
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-emerald-400 font-medium text-[11px]">
                          {c.expected_salary || '—'}
                        </td>

                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          {c.total_calls || c.total_calls_count || 1}
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              onClose();
                              onLaunchTestCallForCandidate(c.phone, c.name);
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1 shadow-sm ml-auto"
                            title="Simulate inbound call from this candidate to test recurring memory"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Test Call</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE SQL QUERY RUNNER */}
          {activeTab === 'query' && (
            <div className="space-y-3">
              
              {/* Query Quick Templates */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] py-1">
                <span className="text-slate-400 shrink-0">Quick Queries:</span>
                {[
                  {
                    label: 'Senior Candidates (> 4 yrs)',
                    sql: 'SELECT name, phone, job_role, experience_years, expected_salary FROM candidates WHERE experience_years >= 4.0 ORDER BY experience_years DESC;'
                  },
                  {
                    label: 'Latest Recruiter Summaries',
                    sql: 'SELECT candidate_name, job_role, match_score, sentiment, recommendation, created_at FROM recruiter_summaries ORDER BY created_at DESC;'
                  },
                  {
                    label: 'Call Detail Records (CDRs)',
                    sql: 'SELECT c.name, cl.caller_phone, cl.call_direction, cl.duration_seconds, cl.is_recurring, cl.sip_status FROM calls cl JOIN candidates c ON c.id = cl.candidate_id;'
                  },
                  {
                    label: 'Conversation Turns Dialogue',
                    sql: 'SELECT turn_index, speaker, question_key, text, timestamp FROM conversation_turns ORDER BY timestamp DESC LIMIT 15;'
                  }
                ].map((tmpl, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCustomSql(tmpl.sql);
                      handleExecuteQuery(tmpl.sql);
                    }}
                    className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 shrink-0 font-mono text-[10px]"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>

              {/* SQL Input Area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="font-semibold flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    SQL Query Editor:
                  </span>
                  <button
                    onClick={() => handleExecuteQuery()}
                    disabled={isExecuting}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isExecuting ? 'Running...' : 'Execute Query'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={customSql}
                  onChange={(e) => setCustomSql(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-emerald-400 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {queryError && (
                <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 font-mono text-xs">
                  {queryError}
                </div>
              )}

              {/* Query Results Table */}
              {queryResults && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-white">Results ({queryResults.rowCount} row(s)):</span>
                    <span className="font-mono text-[11px]">Database: database.sqlite</span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto max-h-72">
                    <table className="w-full text-left border-collapse text-[11px] font-mono">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase">
                          {queryResults.columns.map(col => (
                            <th key={col} className="py-2 px-3">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {queryResults.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-900/50">
                            {queryResults.columns.map(col => (
                              <td key={col} className="py-2 px-3 text-slate-200">
                                {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SCHEMA SPECIFICATION */}
          {activeTab === 'schema' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-indigo-400 block text-sm">Table: candidates</span>
                <p className="text-slate-400 text-[11px]">
                  Stores candidate contact, job role, experience years, skills (JSON), salary expectations, availability, and total call count.
                </p>
                <div className="bg-slate-900 p-2.5 rounded-lg text-slate-300 text-[11px] leading-relaxed">
                  id (TEXT PRIMARY KEY), name (TEXT), phone (TEXT UNIQUE), email (TEXT), job_role (TEXT), experience_years (REAL), skills (TEXT), current_company (TEXT), expected_salary (TEXT), location (TEXT), availability (TEXT), status (TEXT), total_calls_count (INT), last_call_at (TEXT)
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-indigo-400 block text-sm">Table: calls</span>
                <p className="text-slate-400 text-[11px]">
                  Records all inbound and outbound telephony softphone and test call sessions.
                </p>
                <div className="bg-slate-900 p-2.5 rounded-lg text-slate-300 text-[11px] leading-relaxed">
                  id (TEXT PRIMARY KEY), candidate_id (TEXT FK), caller_phone (TEXT), call_direction (TEXT), duration_seconds (INT), is_recurring (INT), started_at (TEXT), ended_at (TEXT), sip_status (TEXT), audio_summary (TEXT)
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-indigo-400 block text-sm">Table: conversation_turns</span>
                <p className="text-slate-400 text-[11px]">
                  Captures granular turn-by-turn dialogue between AI Voice-over and the candidate, including extracted entities.
                </p>
                <div className="bg-slate-900 p-2.5 rounded-lg text-slate-300 text-[11px] leading-relaxed">
                  id (TEXT PRIMARY KEY), call_id (TEXT FK), candidate_id (TEXT FK), turn_index (INT), speaker (TEXT), question_key (TEXT), text (TEXT), extracted_entities_json (TEXT), timestamp (TEXT)
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-indigo-400 block text-sm">Table: recruiter_summaries</span>
                <p className="text-slate-400 text-[11px]">
                  Synthesizes automated evaluation reports, match scores, recommendations, and next action items.
                </p>
                <div className="bg-slate-900 p-2.5 rounded-lg text-slate-300 text-[11px] leading-relaxed">
                  id (TEXT PRIMARY KEY), candidate_id (TEXT FK), call_id (TEXT FK), candidate_name (TEXT), job_role (TEXT), executive_summary (TEXT), match_score (INT), sentiment (TEXT), recommendation (TEXT), key_highlights (TEXT), verified_skills (TEXT), next_actions (TEXT)
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

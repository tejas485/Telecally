import { CandidateAnalysis } from '../types';

export async function fetchCandidateSummary(params: {
  jobTitle: string;
  company: string;
  jobDescription: string;
  candidateSkills?: string;
  candidateExperience?: string;
  candidateNotes?: string;
}): Promise<CandidateAnalysis> {
  const res = await fetch('/api/candidate-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to generate candidate summary');
  }

  const json = await res.json();
  return json.data;
}

export async function fetchCallSummary(params: {
  transcript: string;
  callerName?: string;
  company?: string;
  roleTitle?: string;
  callDurationSeconds?: number;
}) {
  const res = await fetch('/api/call-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error('Failed to generate call summary');
  }

  const json = await res.json();
  return json.data;
}

export async function fetchAiMessageDraft(params: {
  channel: 'whatsapp' | 'sms' | 'email';
  type: string;
  recruiterName?: string;
  company?: string;
  roleTitle?: string;
  extraContext?: string;
}) {
  const res = await fetch('/api/ai-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error('Failed to draft message');
  }

  const json = await res.json();
  return json.data;
}

export type ApplicationStage =
  | 'wishlist'
  | 'applied'
  | 'screening'
  | 'technical'
  | 'system_design'
  | 'hr_offer'
  | 'rejected';

export type Priority = 'high' | 'medium' | 'low';
export type JobType = 'Remote' | 'Hybrid' | 'On-site';

export interface InterviewEvent {
  id: string;
  applicationId: string;
  company: string;
  role: string;
  title: string;
  roundType: 'Recruiter Screen' | 'Technical / Coding' | 'System Design' | 'Hiring Manager' | 'Executive Offer';
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  meetingUrl?: string;
  interviewerNames: string;
  interviewerPhone?: string;
  interviewerEmail?: string;
  notes?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  reminderMinutesBefore: number;
  prepTopics?: string[];
}

export interface CommunicationLog {
  id: string;
  applicationId: string;
  channel: 'call' | 'whatsapp' | 'sms' | 'email';
  direction: 'outbound' | 'inbound';
  timestamp: string;
  durationSeconds?: number;
  summary?: string;
  transcript?: string;
  sentiment?: 'Positive' | 'Neutral' | 'Needs Attention';
  sentimentScore?: number;
  content: string;
  recipient: string;
  status: 'completed' | 'sent' | 'draft' | 'missed';
  sipCode?: number;
  audioUrl?: string;
}

export interface CandidateAnalysis {
  matchScore: number;
  matchLevel: 'Strong Match' | 'High Potential' | 'Moderate Match';
  summary: string;
  elevatorPitch: string;
  strengths: string[];
  gapsAndPrep: {
    area: string;
    guidance: string;
  }[];
  tailoredResumeBullets: string[];
  recommendedQuestionsForRecruiter: string[];
  generatedAt?: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  jobType: JobType;
  salaryRange: string;
  stage: ApplicationStage;
  appliedDate: string;
  deadlineDate?: string;
  priority: Priority;
  recruiterName: string;
  recruiterEmail: string;
  recruiterPhone: string;
  recruiterWhatsApp?: string;
  recruiterRole?: string;
  jobDescription: string;
  notes: string;
  tags: string[];
  attachedDocumentIds: string[];
  analysis?: CandidateAnalysis;
  interviews: InterviewEvent[];
  communications: CommunicationLog[];
  lastContactDate?: string;
  websiteUrl?: string;
}

export interface CandidateProfile {
  fullName: string;
  email: string;
  phone: string;
  title: string;
  summary: string;
  skills: string[];
  experienceYears: number;
  githubUrl: string;
  portfolioUrl: string;
  linkedinUrl: string;
  education: string;
  preferredRoles: string[];
}

export interface AppDocument {
  id: string;
  title: string;
  type: 'Resume' | 'Cover Letter' | 'Portfolio' | 'Offer Letter' | 'Technical Assessment' | 'Job Description';
  fileName: string;
  fileSize: string;
  uploadDate: string;
  applicationIds: string[];
  contentPreview: string;
  isDefault?: boolean;
}

export interface CallSessionState {
  active: boolean;
  status: 'idle' | 'dialing' | 'ringing' | 'connected' | 'ended' | 'failed';
  remoteNumber: string;
  remoteName: string;
  applicationId?: string;
  startTime?: number;
  durationSeconds: number;
  isMuted: boolean;
  isHold: boolean;
  isRecording: boolean;
  sipTrace: string[];
  transcriptLines: { speaker: string; text: string; timestamp: string }[];
  isAiAnalyzing: boolean;
}

export type ThemeMode = 'dark' | 'light' | 'system';
export type ColorTheme = 'cyan' | 'indigo' | 'emerald' | 'amber' | 'rose';
export type FontSizeSetting = 'small' | 'medium' | 'large' | 'xlarge';
export type FontFamilySetting = 'inter' | 'roboto' | 'space_grotesk' | 'jakarta' | 'jetbrains' | 'system';
export type ButtonSizeSetting = 'compact' | 'medium' | 'spacious';

export interface ThemeSettings {
  mode: ThemeMode;
  colorTheme: ColorTheme;
  fontSize: FontSizeSetting;
  fontFamily: FontFamilySetting;
  buttonSize: ButtonSizeSetting;
}

export interface SqlCandidate {
  id: string;
  name: string;
  phone: string;
  email?: string;
  job_role?: string;
  experience_years?: number;
  skills: string[];
  current_company?: string;
  expected_salary?: string;
  location?: string;
  availability?: string;
  status?: string;
  total_calls?: number;
  total_calls_count?: number;
  last_call_at?: string;
  notes?: string;
  latest_summary?: string;
  latest_match_score?: number;
  latest_recommendation?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RecruiterSummaryDossier {
  executiveSummary: string;
  matchScore: number;
  sentiment: string;
  sentimentScore: number;
  recommendation: string;
  keyHighlights: string[];
  verifiedSkills: string[];
  flaggedConcerns: string;
  nextActions: string;
}


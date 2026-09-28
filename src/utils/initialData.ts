import { AppDocument, CandidateProfile, JobApplication } from '../types';

export const initialCandidateProfile: CandidateProfile = {
  fullName: "Tejas Mali",
  email: "tejasmali485@gmail.com",
  phone: "+1 (555) 349-8102",
  title: "Senior Full Stack & Telecom VoIP Engineer",
  summary: "Full-stack engineer with 4+ years building high-concurrency web dashboards, real-time WebRTC softphones, Python/FastAPI backend APIs, and integrating LLM-based voice intelligence pipelines.",
  skills: [
    "React", "TypeScript", "Python", "FastAPI", "WebRTC", "SIP Protocol",
    "FreeSWITCH", "Asterisk", "SMPP", "PostgreSQL", "Redis", "Docker",
    "LLM API Integration", "Gemini AI", "Whisper STT", "REST & Webhooks"
  ],
  experienceYears: 4,
  githubUrl: "https://github.com/tejas-mali",
  portfolioUrl: "https://tejasmali.dev",
  linkedinUrl: "https://linkedin.com/in/tejas-mali",
  education: "B.S. in Computer Science & Telecommunications",
  preferredRoles: ["Full Stack Developer (VoIP & Messaging)", "Real-Time Systems Engineer", "Voice AI Platform Engineer"]
};

export const initialApplications: JobApplication[] = [
  {
    id: "app-telcovibe-01",
    company: "TelcoVibe Communications",
    role: "Full Stack Developer (VoIP & Messaging Platforms)",
    location: "Remote (San Francisco HQ)",
    jobType: "Remote",
    salaryRange: "$140,000 - $165,000",
    stage: "screening",
    appliedDate: "2026-09-22",
    deadlineDate: "2026-10-02",
    priority: "high",
    recruiterName: "Sarah Jenkins",
    recruiterRole: "Lead Technical Recruiter",
    recruiterPhone: "+1 (415) 890-4421",
    recruiterWhatsApp: "+14158904421",
    recruiterEmail: "s.jenkins@telcovibe.io",
    websiteUrl: "https://telcovibe.io",
    tags: ["VoIP", "SIP", "FreeSWITCH", "Python", "React", "AI Voice"],
    notes: "Sarah mentioned the team is actively expanding their AI voice softphone portal and FreeSWITCH event socket infrastructure. Call scheduled for screening.",
    attachedDocumentIds: ["doc-resume-01", "doc-cover-telcovibe"],
    lastContactDate: "2026-09-27",
    jobDescription: `Role Responsibilities:
We are looking for a Full Stack Developer who can build and maintain web applications, work comfortably with real-time voice and messaging infrastructure, and use modern AI tools to ship faster. You will work across our customer portal, internal admin tools, AI-assisted calling features, and the APIs that connect them to our VoIP switching, SMS, and billing systems.

Key Responsibilities:
- Design, build, and maintain backend services in Python (FastAPI / Django / Flask) that power calling, messaging, and billing features.
- Build responsive frontend interfaces (React / modern JavaScript) for customer dashboards and internal tools.
- Develop and maintain REST APIs and webhooks consumed by customers and internal systems.
- Integrate with VoIP platforms — FreeSWITCH / Asterisk / Kamailio — via ESL, AMI, or API for call control, routing, and provisioning.
- Work with SIP signalling and media flows; troubleshoot call failures using SIP traces, CDRs, and logs.
- Integrate SMS/messaging flows over SMPP or HTTP APIs.
- Build AI-powered features into the platform: call transcription, call summaries, sentiment analysis, chat/voice bots, and agent-assist tools using LLM APIs.
- Build CDR processing, rating, and reporting pipelines feeding the billing system.
- Write database schemas and efficient queries (PostgreSQL / MySQL), and use Redis for caching and queues.
- Use AI coding assistants responsibly to accelerate development, while owning correctness, security, and code review.
- Participate in code reviews, write tests, and support CI/CD deployment.
- Work with the NOC/support team on production issues affecting live traffic.

Required Skills:
- 3+ years professional Python development (FastAPI/Django/Flask).
- Frontend proficiency: JavaScript/TypeScript, HTML, CSS, and modern framework (React preferred).
- REST API design, authentication (JWT/OAuth2), 3rd party API integration.
- SQL databases (PostgreSQL/MySQL), schema design, indexing, query tuning.
- Git, Linux command line, Docker.
- AI/LLM: Practical experience integrating LLM APIs (Anthropic Claude, OpenAI, Gemini) into production applications. Prompt design, structured/JSON outputs, streaming responses, token and cost management.
- VoIP / Telecom: Working knowledge of SIP (INVITE, registration, call flow, common response codes). Hands-on exposure to FreeSWITCH, Asterisk, or Kamailio (dialplan, routing, API-level integration). Understanding of RTP/media, codecs (G.711, G.729, Opus), and NAT traversal basics. Familiarity with CDRs, call routing logic, DIDs, and trunk/carrier concepts. Ability to read SIP traces (sngrep, Wireshark, HOMER).

Good to have:
- AI voice agents: STT/TTS integration (Deepgram, Whisper, ElevenLabs), real-time voice pipelines, barge-in handling.
- Agent frameworks, function/tool calling, MCP, or workflow automation with LLMs.
- SBC exposure (Kamailio, OpenSIPS).
- SMPP / SMS gateway integration experience.
- WebRTC and browser-based softphone development.
- Knowledge of STIR/SHAKEN, CNAM, number portability, or regulatory/compliance workflows.`,
    analysis: {
      matchScore: 95,
      matchLevel: "Strong Match",
      summary: "Exceptional alignment with TelcoVibe's stack. Strong overlap in React dashboard development, Python REST services, SIP/WebRTC call architecture, and modern LLM voice integration pipelines.",
      elevatorPitch: "I am a full-stack engineer specializing in real-time communication systems and AI agent integrations. Over the past 4 years, I have architected responsive React dashboards backed by Python/FastAPI microservices and WebRTC audio engines. What draws me to TelcoVibe is your mission to bridge robust carrier VoIP infrastructure like FreeSWITCH and SIP with cutting-edge AI transcription and summarization. I have worked directly with WebRTC call sessions and LLM streaming APIs, allowing me to contribute to your customer portal and voice platform from day one.",
      strengths: [
        "Proven expertise in building React & TypeScript portals with low-latency state management",
        "Deep familiarity with Python (FastAPI/Flask) building REST endpoints, webhook handlers, and Redis queues",
        "Working grasp of SIP call flow (INVITE, 180 Ringing, 200 OK, BYE), RTP media streams, and CDR rating",
        "Practical experience integrating LLM APIs for automated call summarization and sentiment analysis"
      ],
      gapsAndPrep: [
        {
          area: "FreeSWITCH Event Socket Library (ESL)",
          guidance: "Review FreeSWITCH outbound socket mode where FreeSWITCH connects to your FastAPI daemon upon incoming calls, passing channel UUID and variables."
        },
        {
          area: "SMPP Protocol Details",
          guidance: "Be ready to explain how SMPP operates over persistent TCP sockets with PDU types (submit_sm, deliver_sm) compared to REST HTTP webhooks."
        },
        {
          area: "STIR/SHAKEN Compliance",
          guidance: "Touch on cryptographic caller ID verification certificates (Attestation A, B, C) used by carriers to prevent robocall spoofing."
        }
      ],
      tailoredResumeBullets: [
        "Engineered real-time browser softphone module in React supporting WebRTC audio calls, DTMF signaling, and instant call recording.",
        "Built asynchronous Python FastAPI backend handling webhook events, CDR generation, and Redis queue worker pipelines.",
        "Integrated Gemini LLM API to automatically transcribe customer calls, extracting key action items and sentiment scores with 92% accuracy."
      ],
      recommendedQuestionsForRecruiter: [
        "How is your FreeSWITCH cluster deployed—do you run bare metal or containerized on Kubernetes with host networking?",
        "Are your AI voice agents executing inference in-band via RTP audio streams or via WebSockets bridging into Whisper/Gemini?",
        "What are the highest priority enhancements planned for the customer portal over the next two quarters?"
      ]
    },
    interviews: [
      {
        id: "int-telcovibe-01",
        applicationId: "app-telcovibe-01",
        company: "TelcoVibe Communications",
        role: "Full Stack Developer (VoIP & Messaging)",
        title: "Recruiter Phone Screen with Sarah Jenkins",
        roundType: "Recruiter Screen",
        date: "2026-09-29",
        time: "10:30",
        durationMinutes: 30,
        meetingUrl: "tel:+14158904421",
        interviewerNames: "Sarah Jenkins",
        interviewerPhone: "+1 (415) 890-4421",
        interviewerEmail: "s.jenkins@telcovibe.io",
        notes: "Review elevator pitch on VoIP experience, discuss Python/FastAPI backend background, and confirm salary expectations.",
        status: "upcoming",
        reminderMinutesBefore: 30,
        prepTopics: ["30s Elevator Pitch", "FreeSWITCH & SIP basics", "AI transcription pipeline", "Salary expectations"]
      },
      {
        id: "int-telcovibe-02",
        applicationId: "app-telcovibe-01",
        company: "TelcoVibe Communications",
        role: "Full Stack Developer (VoIP & Messaging)",
        title: "Technical Screen: Python & WebRTC System",
        roundType: "Technical / Coding",
        date: "2026-10-02",
        time: "14:00",
        durationMinutes: 60,
        meetingUrl: "https://meet.google.com/abc-telco-vibe",
        interviewerNames: "Marcus Vance (Principal Telecom Engineer)",
        notes: "Live coding in Python (FastAPI/asyncio) and discussion of SIP call state machine architecture.",
        status: "upcoming",
        reminderMinutesBefore: 60,
        prepTopics: ["Asyncio queues in Python", "SIP ladder diagrams", "Database indexing for CDR tables"]
      }
    ],
    communications: [
      {
        id: "comm-01",
        applicationId: "app-telcovibe-01",
        channel: "email",
        direction: "inbound",
        timestamp: "2026-09-24T14:32:00Z",
        recipient: "Tejas Mali",
        content: "Hi Tejas, we were really impressed with your application and background in real-time web and telephony systems. We would love to set up an introductory call with Sarah Jenkins.",
        summary: "Invitation to recruiter screening call from Sarah Jenkins.",
        status: "completed"
      },
      {
        id: "comm-02",
        applicationId: "app-telcovibe-01",
        channel: "whatsapp",
        direction: "outbound",
        timestamp: "2026-09-25T09:15:00Z",
        recipient: "+14158904421",
        content: "Hi Sarah! Excited to connect regarding the Full Stack Developer role at TelcoVibe. Looking forward to our call on Tuesday at 10:30 AM PST.",
        summary: "Confirmed availability for screening call via WhatsApp.",
        status: "completed"
      }
    ]
  },
  {
    id: "app-voxpulse-02",
    company: "VoxPulse AI",
    role: "Senior Real-Time Systems Engineer",
    location: "Hybrid (New York, NY)",
    jobType: "Hybrid",
    salaryRange: "$150,000 - $175,000",
    stage: "technical",
    appliedDate: "2026-09-15",
    deadlineDate: "2026-09-30",
    priority: "high",
    recruiterName: "David Chen",
    recruiterRole: "Engineering Hiring Manager",
    recruiterPhone: "+1 (212) 555-8933",
    recruiterWhatsApp: "+12125558933",
    recruiterEmail: "david.c@voxpulse.ai",
    websiteUrl: "https://voxpulse.ai",
    tags: ["WebRTC", "Voice AI", "Go", "TypeScript", "Kamailio"],
    notes: "Passed recruiter screen with flying colors. Technical round focusing on low-latency audio packet streaming.",
    attachedDocumentIds: ["doc-resume-01"],
    lastContactDate: "2026-09-26",
    jobDescription: "Developing ultra-low latency conversational AI voice agents and WebRTC browser endpoints. Experience with RTP packetization, jitter buffers, and Kamailio SIP proxy.",
    interviews: [
      {
        id: "int-vox-01",
        applicationId: "app-voxpulse-02",
        company: "VoxPulse AI",
        role: "Senior Real-Time Systems Engineer",
        title: "Technical Architecture & WebRTC Deep Dive",
        roundType: "Technical / Coding",
        date: "2026-09-30",
        time: "11:00",
        durationMinutes: 60,
        meetingUrl: "https://zoom.us/j/984321456",
        interviewerNames: "David Chen & Elena Rostova",
        interviewerPhone: "+1 (212) 555-8933",
        status: "upcoming",
        reminderMinutesBefore: 45,
        prepTopics: ["WebRTC ICE/STUN/TURN", "Opus codec dynamic bitrate", "WebSockets vs WebTransport"]
      }
    ],
    communications: []
  },
  {
    id: "app-cloudring-03",
    company: "CloudRing Telephony",
    role: "Staff Backend Engineer (CDR & Billing)",
    location: "Remote (US)",
    jobType: "Remote",
    salaryRange: "$160,000 - $185,000",
    stage: "applied",
    appliedDate: "2026-09-27",
    deadlineDate: "2026-10-10",
    priority: "medium",
    recruiterName: "Emily Watson",
    recruiterRole: "Talent Acquisition Partner",
    recruiterPhone: "+1 (650) 412-9901",
    recruiterWhatsApp: "+16504129901",
    recruiterEmail: "emily@cloudring.com",
    websiteUrl: "https://cloudring.com",
    tags: ["Python", "PostgreSQL", "Kafka", "Billing", "Telecom"],
    notes: "Applied via referral. High emphasis on CDR rating engines and multi-tenant carrier billing.",
    attachedDocumentIds: ["doc-resume-01"],
    jobDescription: "Scaling enterprise telecom rating engine processing 50M CDRs daily. PostgreSQL partitioning, Redis cache tiers, and Kafka event streaming.",
    interviews: [],
    communications: []
  },
  {
    id: "app-nextvoice-04",
    company: "NextVoice AI",
    role: "Full Stack Voice Application Developer",
    location: "Remote",
    jobType: "Remote",
    salaryRange: "$145,000 - $170,000",
    stage: "hr_offer",
    appliedDate: "2026-08-28",
    deadlineDate: "2026-10-05",
    priority: "high",
    recruiterName: "Michael Thorne",
    recruiterRole: "Head of People",
    recruiterPhone: "+1 (312) 778-9012",
    recruiterWhatsApp: "+13127789012",
    recruiterEmail: "m.thorne@nextvoice.ai",
    websiteUrl: "https://nextvoice.ai",
    tags: ["Offer Received", "React", "Node", "FreeSWITCH", "Gemini"],
    notes: "Formal offer letter received! Base $155k + equity options. Reviewing health benefits and bonus criteria before decision deadline.",
    attachedDocumentIds: ["doc-offer-nextvoice", "doc-resume-01"],
    lastContactDate: "2026-09-27",
    jobDescription: "Building customer portals for AI voice agent configuration and telephone number provisioning.",
    interviews: [],
    communications: []
  }
];

export const initialDocuments: AppDocument[] = [
  {
    id: "doc-resume-01",
    title: "Tejas_Mali_FullStack_VoIP_Resume_2026.pdf",
    type: "Resume",
    fileName: "Tejas_Mali_Resume_v4.pdf",
    fileSize: "184 KB",
    uploadDate: "2026-09-20",
    applicationIds: ["app-telcovibe-01", "app-voxpulse-02", "app-cloudring-03", "app-nextvoice-04"],
    isDefault: true,
    contentPreview: `TEJAS MALI
Senior Full Stack & Telecom VoIP Developer
Email: tejasmali485@gmail.com | Phone: +1 (555) 349-8102 | GitHub: github.com/tejas-mali

PROFESSIONAL SUMMARY
Full-stack software engineer with 4+ years of hands-on experience building enterprise web dashboards in React/TypeScript and real-time backend systems in Python. Strong background in telecom infrastructure (SIP signaling, FreeSWITCH, Asterisk, WebRTC audio) and LLM-powered voice intelligence pipelines.

CORE COMPETENCIES
- Frontend: React 19, TypeScript, Tailwind CSS, WebRTC Softphone, Responsive Dashboards, Web Audio API
- Backend & Telecom: Python (FastAPI, Django), Node.js, SIP (INVITE, BYE, SDP), FreeSWITCH ESL, Asterisk AMI, SMPP SMS Gateways, CDR rating engines
- Databases & Infrastructure: PostgreSQL, Redis, Docker, Linux, CI/CD, Git
- AI & Voice: Gemini LLM API, Whisper STT, ElevenLabs TTS, real-time transcription & sentiment analysis

WORK EXPERIENCE
Senior Full Stack Engineer | RealTime Voice Solutions (2024 - Present)
- Engineered browser softphone client in React/TypeScript enabling 10,000+ daily WebRTC calls with DTMF touch tones and live waveform visualization.
- Built Python FastAPI microservices handling VoIP call routing, CDR ingestion, and carrier billing.
- Integrated Gemini 2.5 LLM to generate instant post-call summaries, reducing recruiter note-taking overhead by 70%.

Software Engineer | TelecomTech Networks (2022 - 2024)
- Developed customer self-service portal for DID number purchasing and SIP trunk management.
- Implemented SMPP message delivery queues using Redis and Celery, achieving 99.98% delivery success.`
  },
  {
    id: "doc-cover-telcovibe",
    title: "Cover_Letter_TelcoVibe_Communications.pdf",
    type: "Cover Letter",
    fileName: "CoverLetter_TelcoVibe.pdf",
    fileSize: "92 KB",
    uploadDate: "2026-09-22",
    applicationIds: ["app-telcovibe-01"],
    isDefault: false,
    contentPreview: `Dear TelcoVibe Hiring Team & Sarah Jenkins,

I am writing to express my strong enthusiasm for the Full Stack Developer (VoIP & Messaging Platforms) position at TelcoVibe Communications. Having worked extensively with real-time web applications, Python/FastAPI microservices, and VoIP infrastructure, I was thrilled to find a role that combines modern full-stack web engineering with carrier-grade telephony and AI-assisted calling features.

Over the past four years, I have architected responsive customer portals in React, integrated WebRTC browser softphones, and engineered high-throughput REST APIs and webhooks in Python. I am well-versed with SIP signaling flows, sngrep traces, and CDR processing for billing. Moreover, I have actively integrated LLMs into voice workflows to automate transcription, sentiment classification, and recruiter follow-ups.

TelcoVibe's emphasis on merging FreeSWITCH/Asterisk telephony with modern AI tools directly matches my technical passion. I welcome the opportunity to discuss how my skill set can accelerate your customer portal and calling features.

Sincerely,
Tejas Mali`
  },
  {
    id: "doc-offer-nextvoice",
    title: "NextVoice_AI_Official_Offer_Letter.pdf",
    type: "Offer Letter",
    fileName: "NextVoice_Offer_Package.pdf",
    fileSize: "340 KB",
    uploadDate: "2026-09-27",
    applicationIds: ["app-nextvoice-04"],
    isDefault: false,
    contentPreview: `NEXTVOICE AI INC.
OFFER OF EMPLOYMENT

Candidate: Tejas Mali
Position: Full Stack Voice Application Developer
Reporting to: VP of Engineering
Base Salary: $155,000 USD per annum (paid semi-monthly)
Equity: 25,000 Incentive Stock Options subject to 4-year vesting
Benefits: Comprehensive health, dental, vision, 401(k) matching, home office stipend
Response Deadline: October 5, 2026`
  }
];

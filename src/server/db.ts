import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve(process.cwd(), 'database.sqlite');
let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();
  if (fs.existsSync(DB_FILE)) {
    try {
      const buffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(buffer);
      console.log('Loaded existing SQLite database from', DB_FILE);
    } catch (e) {
      console.warn('Could not read existing database.sqlite, creating fresh database:', e);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
    console.log('Created fresh in-memory SQLite database');
  }

  initSchema(dbInstance);
  persistDb(dbInstance);
  return dbInstance;
}

export function persistDb(db: Database) {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Failed to persist database to disk:', err);
  }
}

function initSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS candidates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      email TEXT,
      job_role TEXT,
      experience_years REAL DEFAULT 0,
      skills TEXT,
      current_company TEXT,
      expected_salary TEXT,
      location TEXT,
      availability TEXT,
      status TEXT DEFAULT 'Screened',
      total_calls_count INTEGER DEFAULT 0,
      last_call_at TEXT,
      notes TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS calls (
      id TEXT PRIMARY KEY,
      candidate_id TEXT,
      caller_phone TEXT,
      call_direction TEXT DEFAULT 'inbound',
      duration_seconds INTEGER DEFAULT 0,
      is_recurring INTEGER DEFAULT 0,
      started_at TEXT,
      ended_at TEXT,
      sip_status TEXT DEFAULT '200 OK',
      audio_summary TEXT,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id)
    );

    CREATE TABLE IF NOT EXISTS conversation_turns (
      id TEXT PRIMARY KEY,
      call_id TEXT,
      candidate_id TEXT,
      turn_index INTEGER,
      speaker TEXT,
      question_key TEXT,
      text TEXT,
      extracted_entities_json TEXT,
      timestamp TEXT,
      FOREIGN KEY (call_id) REFERENCES calls(id),
      FOREIGN KEY (candidate_id) REFERENCES candidates(id)
    );

    CREATE TABLE IF NOT EXISTS recruiter_summaries (
      id TEXT PRIMARY KEY,
      candidate_id TEXT,
      call_id TEXT,
      candidate_name TEXT,
      job_role TEXT,
      executive_summary TEXT,
      match_score INTEGER DEFAULT 85,
      sentiment TEXT DEFAULT 'Positive',
      sentiment_score INTEGER DEFAULT 85,
      recommendation TEXT DEFAULT 'Advance to Technical Round',
      key_highlights TEXT,
      verified_skills TEXT,
      flagged_concerns TEXT,
      next_actions TEXT,
      created_at TEXT,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id),
      FOREIGN KEY (call_id) REFERENCES calls(id)
    );
  `);

  // Check if candidates table is empty, if so, seed 10+ candidate profiles
  const res = db.exec("SELECT COUNT(*) as count FROM candidates");
  const count = res[0]?.values[0]?.[0] || 0;
  if (count === 0) {
    seedCandidates(db);
  }
}

export function seedCandidates(db: Database) {
  console.log('Seeding initial 11 candidates into SQL database...');

  const initialCandidates = [
    {
      id: "cand-tejas-01",
      name: "Tejas Mali",
      phone: "+1 (415) 890-4421",
      email: "tejasmali485@gmail.com",
      job_role: "Full Stack Developer (VoIP & Messaging Platforms)",
      experience_years: 4.5,
      skills: JSON.stringify(["Python", "FastAPI", "React", "TypeScript", "FreeSWITCH", "SIP", "WebRTC", "SMPP", "LLMs"]),
      current_company: "RealTime Voice Solutions",
      expected_salary: "$145,000 - $165,000",
      location: "San Francisco, CA (Remote)",
      availability: "2 weeks notice",
      status: "Qualified - Technical Screening",
      total_calls_count: 2,
      last_call_at: "2026-09-27T14:30:00Z",
      notes: "Strong expertise in FreeSWITCH ESL and building real-time WebRTC softphones. Expressed high enthusiasm for TelcoVibe.",
      created_at: "2026-09-20T10:00:00Z",
      updated_at: "2026-09-27T15:00:00Z"
    },
    {
      id: "cand-priya-02",
      name: "Priya Sharma",
      phone: "+1 (408) 555-0192",
      email: "priya.sharma@telecomdev.net",
      job_role: "Senior Telecom & SIP Signaling Engineer",
      experience_years: 6.0,
      skills: JSON.stringify(["SIP", "Kamailio", "Asterisk", "OpenSIPS", "sngrep", "Wireshark", "C++", "Python"]),
      current_company: "Global SIP Trunking Corp",
      expected_salary: "$160,000 - $180,000",
      location: "San Jose, CA (Hybrid)",
      availability: "Immediate",
      status: "Ready for Hiring Manager",
      total_calls_count: 1,
      last_call_at: "2026-09-25T11:15:00Z",
      notes: "Deep knowledge of carrier NAT traversal, SDP offer/answer, and STIR/SHAKEN caller verification.",
      created_at: "2026-09-21T09:30:00Z",
      updated_at: "2026-09-25T11:30:00Z"
    },
    {
      id: "cand-alex-03",
      name: "Alex Rivera",
      phone: "+1 (206) 555-8321",
      email: "alex.rivera@codewave.io",
      job_role: "WebRTC Softphone Frontend Architect",
      experience_years: 3.5,
      skills: JSON.stringify(["React 19", "TypeScript", "WebRTC", "Web Audio API", "Tailwind CSS", "Opus Codec", "WebSockets"]),
      current_company: "CloudCall Interfaces",
      expected_salary: "$135,000 - $155,000",
      location: "Seattle, WA (Remote)",
      availability: "3 weeks notice",
      status: "Screened",
      total_calls_count: 1,
      last_call_at: "2026-09-26T16:00:00Z",
      notes: "Built low-latency audio visualizers and DTMF touch-tone keyboards in browser.",
      created_at: "2026-09-22T13:00:00Z",
      updated_at: "2026-09-26T16:30:00Z"
    },
    {
      id: "cand-marcus-04",
      name: "Marcus Vance",
      phone: "+1 (312) 555-7744",
      email: "m.vance@chicago-tech.com",
      job_role: "Staff Backend Engineer (CDR & Rating Pipelines)",
      experience_years: 5.5,
      skills: JSON.stringify(["Python", "Django", "FastAPI", "PostgreSQL", "Redis", "Kafka", "Celery", "Docker"]),
      current_company: "Midwest Billing Telecom",
      expected_salary: "$150,000 - $175,000",
      location: "Chicago, IL (Hybrid)",
      availability: "1 month",
      status: "Qualified - Technical Screening",
      total_calls_count: 2,
      last_call_at: "2026-09-24T10:00:00Z",
      notes: "Expert in SQL partitioning for 100M+ monthly Call Detail Records and sub-millisecond cache lookups.",
      created_at: "2026-09-18T11:00:00Z",
      updated_at: "2026-09-24T10:45:00Z"
    },
    {
      id: "cand-sophia-05",
      name: "Sophia Chen",
      phone: "+1 (650) 555-4920",
      email: "sophia.chen@ai-voice.dev",
      job_role: "Voice AI & LLM Speech Pipeline Engineer",
      experience_years: 4.0,
      skills: JSON.stringify(["Gemini API", "Whisper STT", "ElevenLabs TTS", "Python", "FastAPI", "Vector DBs", "RAG"]),
      current_company: "NeuroVoice Labs",
      expected_salary: "$155,000 - $180,000",
      location: "Palo Alto, CA (On-site/Hybrid)",
      availability: "Immediate",
      status: "Under Review",
      total_calls_count: 1,
      last_call_at: "2026-09-26T15:20:00Z",
      notes: "Implemented real-time speech turn-taking and conversational barge-in algorithms.",
      created_at: "2026-09-23T14:15:00Z",
      updated_at: "2026-09-26T15:45:00Z"
    },
    {
      id: "cand-david-06",
      name: "David Miller",
      phone: "+1 (512) 555-6301",
      email: "david.miller@austin-voip.com",
      job_role: "Asterisk PBX & FreeSWITCH Specialist",
      experience_years: 7.0,
      skills: JSON.stringify(["Asterisk AMI", "FreeSWITCH ESL", "Dialplan XML/Lua", "SIP", "Linux", "RTP", "G.711/G.729"]),
      current_company: "Texas Telecom Systems",
      expected_salary: "$140,000 - $160,000",
      location: "Austin, TX (Remote)",
      availability: "2 weeks",
      status: "Ready for Hiring Manager",
      total_calls_count: 1,
      last_call_at: "2026-09-25T13:40:00Z",
      notes: "Veteran PBX installer and call center IVR routing architect.",
      created_at: "2026-09-19T08:00:00Z",
      updated_at: "2026-09-25T14:00:00Z"
    },
    {
      id: "cand-aisha-07",
      name: "Aisha Khan",
      phone: "+1 (646) 555-9082",
      email: "aisha.khan@nyc-telecom.io",
      job_role: "Full Stack React & Node Telephony Portal Lead",
      experience_years: 4.2,
      skills: JSON.stringify(["React", "Node.js", "Express", "PostgreSQL", "WebSockets", "Twilio / Telnyx APIs", "Docker"]),
      current_company: "MetroVoice NY",
      expected_salary: "$145,000 - $165,000",
      location: "New York, NY (Hybrid)",
      availability: "2 weeks",
      status: "Screened",
      total_calls_count: 1,
      last_call_at: "2026-09-27T09:10:00Z",
      notes: "Led customer dashboard team managing phone number provisioning and webhook routing.",
      created_at: "2026-09-24T16:00:00Z",
      updated_at: "2026-09-27T09:30:00Z"
    },
    {
      id: "cand-liam-08",
      name: "Liam O'Connor",
      phone: "+1 (617) 555-3211",
      email: "liam.oconnor@boston-messaging.com",
      job_role: "SMS & SMPP Messaging Infrastructure Engineer",
      experience_years: 5.0,
      skills: JSON.stringify(["SMPP v3.4/v5.0", "Python", "Go", "RabbitMQ", "Kafka", "PDU Parsing", "Carrier Delivery Receipts"]),
      current_company: "Beacon SMS Gateway",
      expected_salary: "$148,000 - $168,000",
      location: "Boston, MA (Remote)",
      availability: "3 weeks",
      status: "Qualified - Technical Screening",
      total_calls_count: 1,
      last_call_at: "2026-09-26T11:00:00Z",
      notes: "Specializes in high-throughput SMS binary PDU routing and carrier rate-limiting queues.",
      created_at: "2026-09-22T10:30:00Z",
      updated_at: "2026-09-26T11:30:00Z"
    },
    {
      id: "cand-elena-09",
      name: "Elena Rostova",
      phone: "+1 (305) 555-8819",
      email: "elena.rostova@voice-media.org",
      job_role: "Real-time Media & Audio DSP Engineer",
      experience_years: 6.5,
      skills: JSON.stringify(["C++", "WebRTC Native", "Opus Codec", "Jitter Buffer", "AEC/Noise Suppression", "RTP/RTCP"]),
      current_company: "SoundWave Telecom",
      expected_salary: "$165,000 - $190,000",
      location: "Miami, FL (Remote)",
      availability: "1 month",
      status: "Ready for Hiring Manager",
      total_calls_count: 2,
      last_call_at: "2026-09-25T17:00:00Z",
      notes: "Authored custom jitter buffer algorithms improving audio clarity under 20% packet loss.",
      created_at: "2026-09-17T12:00:00Z",
      updated_at: "2026-09-25T17:30:00Z"
    },
    {
      id: "cand-carlos-10",
      name: "Carlos Mendez",
      phone: "+1 (602) 555-7140",
      email: "carlos.mendez@az-telecom.dev",
      job_role: "Junior Full Stack VoIP Developer",
      experience_years: 2.0,
      skills: JSON.stringify(["Python", "Flask", "React", "JavaScript", "SIP Basics", "PostgreSQL", "Git"]),
      current_company: "Desert Tech Solutions",
      expected_salary: "$95,000 - $115,000",
      location: "Phoenix, AZ (Hybrid)",
      availability: "Immediate",
      status: "Screened",
      total_calls_count: 1,
      last_call_at: "2026-09-27T12:00:00Z",
      notes: "Eager learner with strong foundational Python skills and enthusiasm for real-time voice.",
      created_at: "2026-09-26T14:00:00Z",
      updated_at: "2026-09-27T12:20:00Z"
    },
    {
      id: "cand-nina-11",
      name: "Nina Patel",
      phone: "+1 (720) 555-4309",
      email: "nina.patel@compliance-telecom.io",
      job_role: "Telecom Compliance & STIR/SHAKEN Specialist",
      experience_years: 5.0,
      skills: JSON.stringify(["STIR/SHAKEN", "CNAM", "Robocall Mitigation", "FCC Regulations", "Python", "REST APIs"]),
      current_company: "Rocky Mountain Carriers",
      expected_salary: "$140,000 - $160,000",
      location: "Denver, CO (Remote)",
      availability: "2 weeks",
      status: "Qualified - Technical Screening",
      total_calls_count: 1,
      last_call_at: "2026-09-24T15:30:00Z",
      notes: "Implemented cryptographic X.509 certificate validation pipelines for carrier robocall defense.",
      created_at: "2026-09-20T11:00:00Z",
      updated_at: "2026-09-24T16:00:00Z"
    }
  ];

  for (const c of initialCandidates) {
    db.run(
      `INSERT OR REPLACE INTO candidates (
        id, name, phone, email, job_role, experience_years, skills,
        current_company, expected_salary, location, availability,
        status, total_calls_count, last_call_at, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        c.id, c.name, c.phone, c.email, c.job_role, c.experience_years, c.skills,
        c.current_company, c.expected_salary, c.location, c.availability,
        c.status, c.total_calls_count, c.last_call_at, c.notes, c.created_at, c.updated_at
      ]
    );

    // Also add a sample previous call session & summary for recurring recognition
    const callId = `call-${c.id}-prev`;
    db.run(
      `INSERT OR REPLACE INTO calls (
        id, candidate_id, caller_phone, call_direction, duration_seconds,
        is_recurring, started_at, ended_at, sip_status, audio_summary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        callId,
        c.id,
        c.phone,
        'inbound',
        185,
        c.total_calls_count > 1 ? 1 : 0,
        c.last_call_at,
        c.last_call_at,
        '200 OK',
        `Screening conversation with ${c.name} discussing ${c.job_role}. Confirmed ${c.experience_years} years experience and target salary ${c.expected_salary}.`
      ]
    );

    // Sample conversation turns
    db.run(
      `INSERT OR REPLACE INTO conversation_turns (
        id, call_id, candidate_id, turn_index, speaker, question_key, text, extracted_entities_json, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `turn-${c.id}-1`,
        callId,
        c.id,
        1,
        'ai',
        'greeting',
        `Hello ${c.name}, thanks for reaching out. What role are you applying for?`,
        JSON.stringify({}),
        c.last_call_at
      ]
    );

    db.run(
      `INSERT OR REPLACE INTO conversation_turns (
        id, call_id, candidate_id, turn_index, speaker, question_key, text, extracted_entities_json, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `turn-${c.id}-2`,
        callId,
        c.id,
        2,
        'candidate',
        'job_role',
        `I am targeting the ${c.job_role} position. I have ${c.experience_years} years of background in software and telecom.`,
        JSON.stringify({ job_role: c.job_role, experience_years: c.experience_years }),
        c.last_call_at
      ]
    );

    // Sample Recruiter summary
    db.run(
      `INSERT OR REPLACE INTO recruiter_summaries (
        id, candidate_id, call_id, candidate_name, job_role, executive_summary,
        match_score, sentiment, sentiment_score, recommendation,
        key_highlights, verified_skills, flagged_concerns, next_actions, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `sum-${c.id}`,
        c.id,
        callId,
        c.name,
        c.job_role,
        `${c.name} has demonstrated strong technical proficiency in ${c.job_role}. Solid communication and realistic salary expectation of ${c.expected_salary}.`,
        Math.min(96, Math.max(78, Math.round(82 + (c.experience_years * 2.2)))),
        'Positive',
        88,
        c.status.includes('Ready') ? 'Advance to Hiring Manager' : 'Advance to Technical Round',
        JSON.stringify([`${c.experience_years} yrs verified experience`, `Available in ${c.availability}`, `Current firm: ${c.current_company}`]),
        c.skills,
        'None identified. Candidate is articulate and responsive.',
        `Schedule 60-minute technical interview for next week.`,
        c.last_call_at
      ]
    );
  }

  persistDb(db);
  console.log('Seeding completed successfully!');
}

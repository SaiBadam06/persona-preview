export type MockMeeting = {
  id: string;
  title: string;
  start: string; // ISO
  durationMin: number;
  attendees: { name: string; email?: string; self?: boolean }[];
  status: 'scheduled' | 'completed' | 'recording' | 'missed';
  hasRecap: boolean;
  notes?: string;
  recapBullets?: string[];
  actionItems?: { what: string; who: string; due?: string }[];
};

function isoFromNow(daysOffset: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const MOCK_MEETINGS: MockMeeting[] = [
  {
    id: 'm-live-acme',
    title: 'Acme renewal call',
    start: isoFromNow(0, 11, 30),
    durationMin: 30,
    attendees: [
      { name: 'You', self: true },
      { name: 'Jordan Reyes', email: 'jordan@acme.co' },
    ],
    status: 'recording',
    hasRecap: false,
  },
  {
    id: 'm-q2-review',
    title: 'Q2 Strategy Review',
    start: isoFromNow(0, 14, 30),
    durationMin: 60,
    attendees: [
      { name: 'You', self: true },
      { name: 'Alex Morgan', email: 'alex@acme.co' },
      { name: 'Priya Shah', email: 'priya@acme.co' },
    ],
    status: 'scheduled',
    hasRecap: false,
    notes: '',
  },
  {
    id: 'm-standup',
    title: 'Daily standup',
    start: isoFromNow(0, 10, 0),
    durationMin: 15,
    attendees: [
      { name: 'You', self: true },
      { name: 'Marcus Lee' },
      { name: 'Sara Patel' },
    ],
    status: 'completed',
    hasRecap: true,
    recapBullets: [
      'Marcus shipped the search-rank fix; staging looks clean.',
      'Sara is blocked on the design system migration — needs Avery to unblock by EOD.',
      'No on-call incidents overnight.',
    ],
    actionItems: [
      { what: 'Unblock Sara on design tokens', who: 'You', due: 'today' },
      { what: 'Cut staging release', who: 'Marcus' },
    ],
  },
  {
    id: 'm-sales-acme',
    title: 'Sales sync · Acme expansion',
    start: isoFromNow(-1, 16, 0),
    durationMin: 45,
    attendees: [
      { name: 'You', self: true },
      { name: 'Jordan Reyes', email: 'jordan@acme.co' },
      { name: 'Elena Vasquez' },
    ],
    status: 'completed',
    hasRecap: true,
    recapBullets: [
      'Acme committed to a 12-seat trial starting June 1.',
      'Jordan flagged a concern about the SSO timeline — they want SAML by Q3.',
      'Pricing landed at $39/seat, locked-in for 12 months.',
    ],
    actionItems: [
      { what: 'Send signed MSA to Jordan', who: 'You', due: 'Friday' },
      { what: 'Confirm SSO/SAML target with eng', who: 'You' },
    ],
  },
  {
    id: 'm-design-review',
    title: 'Design review · Onboarding v3',
    start: isoFromNow(-3, 11, 0),
    durationMin: 60,
    attendees: [
      { name: 'You', self: true },
      { name: 'Priya Shah' },
      { name: 'Marcus Lee' },
    ],
    status: 'completed',
    hasRecap: true,
    recapBullets: [
      'Decision: ship the calendar-first onboarding behind a flag, 25% rollout.',
      'Priya owns the empty-state copy revisions.',
      'Concern: the "Connect calendar" gate may suppress activation — need to instrument.',
    ],
    actionItems: [
      { what: 'Instrument calendar-connect funnel', who: 'Marcus' },
      { what: 'Empty-state copy v2', who: 'Priya' },
    ],
  },
  {
    id: 'm-1on1-marcus',
    title: '1:1 · Marcus',
    start: isoFromNow(-4, 15, 0),
    durationMin: 30,
    attendees: [
      { name: 'You', self: true },
      { name: 'Marcus Lee' },
    ],
    status: 'completed',
    hasRecap: true,
    recapBullets: [
      'Marcus wants to lead the search rewrite next quarter.',
      'Discussed promotion path; agreed on three concrete milestones.',
    ],
    actionItems: [
      { what: 'Write up promotion milestone doc', who: 'You', due: 'next week' },
    ],
  },
  {
    id: 'm-investor-update',
    title: 'Investor update prep',
    start: isoFromNow(-5, 9, 30),
    durationMin: 45,
    attendees: [
      { name: 'You', self: true },
      { name: 'Elena Vasquez' },
    ],
    status: 'completed',
    hasRecap: true,
    recapBullets: [
      'Numbers locked: 2.1x QoQ growth, churn at 2.8%.',
      'Elena will draft the deck by Wednesday for your edit pass.',
    ],
    actionItems: [
      { what: 'Edit investor deck', who: 'You', due: 'Thursday' },
    ],
  },
  {
    id: 'm-customer-feedback',
    title: 'Customer feedback · Persona memory',
    start: isoFromNow(-9, 13, 0),
    durationMin: 30,
    attendees: [
      { name: 'You', self: true },
      { name: 'Sara Patel' },
    ],
    status: 'completed',
    hasRecap: true,
    recapBullets: [
      'Three customers in a row asked for "ask my persona about X" inside the dashboard, not just public.',
      'Strong signal that internal Q&A is more valued than public chat right now.',
    ],
    actionItems: [
      { what: 'Spike internal persona-ask UX', who: 'You' },
    ],
  },
];

export type DateGroup = {
  label: string;
  meetings: MockMeeting[];
};

export function groupMeetingsByDate(meetings: MockMeeting[]): DateGroup[] {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(startOfToday);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const today: MockMeeting[] = [];
  const yesterday: MockMeeting[] = [];
  const week: MockMeeting[] = [];
  const month: MockMeeting[] = [];
  const older: MockMeeting[] = [];

  const sorted = [...meetings].sort(
    (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime(),
  );

  for (const m of sorted) {
    const t = new Date(m.start).getTime();
    if (t >= startOfToday.getTime()) today.push(m);
    else if (t >= startOfYesterday.getTime()) yesterday.push(m);
    else if (t >= sevenDaysAgo.getTime()) week.push(m);
    else if (t >= thirtyDaysAgo.getTime()) month.push(m);
    else older.push(m);
  }

  const groups: DateGroup[] = [];
  if (today.length) groups.push({ label: 'Today', meetings: today });
  if (yesterday.length) groups.push({ label: 'Yesterday', meetings: yesterday });
  if (week.length) groups.push({ label: 'Previous 7 days', meetings: week });
  if (month.length) groups.push({ label: 'Previous 30 days', meetings: month });
  if (older.length) groups.push({ label: 'Older', meetings: older });
  return groups;
}

export function formatMeetingTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const dayMs = 86_400_000;
  const diffDays = Math.floor((startOfToday.getTime() - d.setHours(0, 0, 0, 0)) / dayMs);
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const MOCK_PERSONA = {
  displayName: 'Avery Stone',
  initial: 'A',
  handle: 'avery',
  status: 'ready' as const,
  statusLabel: 'Ready',
  headline: 'Founder, PersonaOn — meeting intelligence with a public surface.',
  bio: 'Building tools that turn meetings into memory you can ask back. Previously product at two seed-stage SaaS companies.',
  publicReadiness: 78,
  pinnedQuestions: [
    'Who is Avery Stone?',
    'Why did you start PersonaOn?',
    "What's your background before PersonaOn?",
    'How do you think about meeting privacy?',
    'How can I work with you?',
  ],
  allowedTopics: [
    { label: 'PersonaOn product', sources: 14 },
    { label: 'Pricing & plans', sources: 3 },
    { label: 'Hiring', sources: 2 },
  ],
  behavior: {
    tone: 'Direct, calm, practical',
    length: 'Short by default; expand when asked',
    citations: 'Always cite the source when answering from memory',
    uncertainty: 'Say "I don\'t know" rather than guess',
  },
  voice: {
    enabled: false,
    label: 'Voice clone not set up',
  },
  shareLink: 'https://personaon.com/p/avery',
};

export type ReviewCandidate = {
  id: string;
  type: 'Memory' | 'Question' | 'Action';
  fact: string;
  meetingId: string;
  meetingTitle: string;
  meetingWhen: string;
  topic: string;
  unlocks: string[];
  mentionsThirdParty?: string;
};

export const MOCK_REVIEW_CANDIDATES: ReviewCandidate[] = [
  {
    id: 'rc-acme-trial',
    type: 'Memory',
    fact: 'Acme committed to a 12-seat trial starting June 1.',
    meetingId: 'm-sales-acme',
    meetingTitle: 'Sales sync · Acme expansion',
    meetingWhen: 'yesterday · 14:32',
    topic: 'Pricing & customers',
    unlocks: [
      'Who are your customers?',
      'Do you have any signed deals?',
      'How big is your customer base?',
    ],
    mentionsThirdParty: 'Acme / Jordan Reyes',
  },
  {
    id: 'rc-acme-price',
    type: 'Memory',
    fact: 'Pricing landed at $39/seat, locked-in for 12 months.',
    meetingId: 'm-sales-acme',
    meetingTitle: 'Sales sync · Acme expansion',
    meetingWhen: 'yesterday · 14:48',
    topic: 'Pricing & customers',
    unlocks: [
      'How much does PersonaOn cost?',
      'Do you offer annual contracts?',
    ],
  },
  {
    id: 'rc-acme-saml',
    type: 'Memory',
    fact: 'SAML SSO is on the roadmap for Q3.',
    meetingId: 'm-sales-acme',
    meetingTitle: 'Sales sync · Acme expansion',
    meetingWhen: 'yesterday · 14:51',
    topic: 'Product roadmap',
    unlocks: [
      'Do you support SSO?',
      'What enterprise features are coming?',
    ],
  },
  {
    id: 'rc-onboarding-decision',
    type: 'Memory',
    fact: 'Calendar-first onboarding ships behind a flag at 25% rollout.',
    meetingId: 'm-design-review',
    meetingTitle: 'Design review · Onboarding v3',
    meetingWhen: '3 days ago',
    topic: 'Product roadmap',
    unlocks: [
      'How is onboarding changing?',
      'What are you A/B testing right now?',
    ],
  },
  {
    id: 'rc-marcus-promo',
    type: 'Memory',
    fact: 'Marcus is on track for promotion next quarter with three milestones agreed.',
    meetingId: 'm-1on1-marcus',
    meetingTitle: '1:1 · Marcus',
    meetingWhen: '4 days ago',
    topic: 'Team & hiring',
    unlocks: ['Are you hiring?', 'Who is on your team?'],
    mentionsThirdParty: 'Marcus Lee — private 1:1',
  },
  {
    id: 'rc-qq-team-cost',
    type: 'Question',
    fact: 'What does PersonaOn cost for a 50-person team?',
    meetingId: '',
    meetingTitle: 'Asked 3 times this week by visitors',
    meetingWhen: 'public chat',
    topic: 'Pricing & customers',
    unlocks: [
      'How much does PersonaOn cost for teams?',
      'Is there volume pricing?',
    ],
  },
];

export const MOCK_LIVE_TRANSCRIPT: { speaker: string; text: string; t: string }[] = [
  { speaker: 'Jordan Reyes', text: 'So the trial wrapped up last Friday — overall the team is positive.', t: '00:02:14' },
  { speaker: 'You', text: 'Good to hear. Anything blocking renewal at full price?', t: '00:02:31' },
  { speaker: 'Jordan Reyes', text: 'We want SSO before we move to 50 seats. SAML by Q3 was the commit, right?', t: '00:02:48' },
  { speaker: 'You', text: 'Yes — Q3 is on the roadmap. Want me to send the spec?', t: '00:03:05' },
  { speaker: 'Jordan Reyes', text: 'Please. And one more thing — billing wants annual not monthly.', t: '00:03:19' },
];

export const MOCK_PERSONA_MEMORY: Record<string, { fact: string; meetingId: string; meetingTitle: string; when: string }[]> = {
  'About PersonaOn': [
    {
      fact: 'PersonaOn is meeting intelligence with a public memory surface.',
      meetingId: '',
      meetingTitle: 'Bio (manually written)',
      when: 'persona seed',
    },
    {
      fact: 'Founded by Avery Stone after two seed-stage SaaS startups.',
      meetingId: '',
      meetingTitle: 'Bio (manually written)',
      when: 'persona seed',
    },
  ],
  'Pricing & plans': [
    {
      fact: '$39/seat, billed monthly, with 12-month lock-in for early customers.',
      meetingId: 'm-sales-acme',
      meetingTitle: 'Sales sync · Acme expansion',
      when: 'yesterday',
    },
    {
      fact: 'Free tier available for solo users up to 5 meetings/month.',
      meetingId: '',
      meetingTitle: 'Bio (manually written)',
      when: 'persona seed',
    },
  ],
  'Hiring': [
    {
      fact: 'Hiring a senior backend engineer; preference for distributed-systems background.',
      meetingId: 'm-1on1-marcus',
      meetingTitle: '1:1 · Marcus',
      when: '4 days ago',
    },
  ],
};

// ---------------------------------------------------------------------------
// Visitors (people who chatted with your persona via the public link)
// ---------------------------------------------------------------------------

export type VisitorTurn = { q: string; a: string; hadCitation: boolean };

export type VisitorSession = {
  id: string;
  visitor: string;
  visitorEmail?: string;
  when: string;
  source: 'public link' | 'website widget' | 'QR code' | 'email signature';
  city?: string;
  turns: VisitorTurn[];
};

export const MOCK_VISITOR_SESSIONS: VisitorSession[] = [
  {
    id: 'vs-1',
    visitor: 'Anonymous',
    when: '2 hours ago',
    source: 'public link',
    city: 'San Francisco',
    turns: [
      {
        q: 'What is PersonaOn?',
        a: 'Meeting intelligence with a public memory surface. Captures meetings, builds a private archive…',
        hadCitation: true,
      },
      {
        q: 'How much does it cost?',
        a: '$39/seat — locked in for 12 months for early customers.',
        hadCitation: true,
      },
    ],
  },
  {
    id: 'vs-2',
    visitor: 'Priya Kapoor',
    visitorEmail: 'priya@founderscircle.io',
    when: 'yesterday',
    source: 'website widget',
    city: 'Mumbai',
    turns: [
      {
        q: 'Are you hiring?',
        a: 'Yes — looking for a senior backend engineer with distributed-systems experience.',
        hadCitation: true,
      },
      {
        q: 'Can we set up a call?',
        a: 'You can book through this link → personaon.com/p/avery/book',
        hadCitation: false,
      },
    ],
  },
  {
    id: 'vs-3',
    visitor: 'Anonymous',
    when: 'yesterday',
    source: 'QR code',
    city: 'NYC',
    turns: [
      {
        q: 'Why did you start this?',
        a: 'I kept losing context between meetings and wanted a memory layer I could ask back. Friends had the same problem.',
        hadCitation: true,
      },
    ],
  },
  {
    id: 'vs-4',
    visitor: 'Anonymous',
    when: '3 days ago',
    source: 'public link',
    turns: [
      {
        q: 'Do you support SSO?',
        a: 'SAML SSO is on the roadmap for Q3.',
        hadCitation: true,
      },
      {
        q: 'Will there be SCIM?',
        a: "I don't have a verified answer to that yet.",
        hadCitation: false,
      },
    ],
  },
  {
    id: 'vs-5',
    visitor: 'Marcus Park',
    visitorEmail: 'marcus@distrib.dev',
    when: '5 days ago',
    source: 'public link',
    city: 'Seoul',
    turns: [
      {
        q: 'How is your team structured?',
        a: 'Small — currently three engineers plus me. Hiring a fourth.',
        hadCitation: true,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Per-person commitments / detail
// ---------------------------------------------------------------------------

export type PersonCommitment = { what: string; meetingId: string; meetingTitle: string; daysOpen: number };

export const MOCK_PEOPLE_DETAIL: Record<string, {
  name: string;
  email?: string;
  company?: string;
  lastTalked: string;
  next?: string;
  youOwe: PersonCommitment[];
  theyOwe: PersonCommitment[];
  personaCanMention: boolean;
}> = {
  'jordan-reyes': {
    name: 'Jordan Reyes',
    email: 'jordan@acme.co',
    company: 'Acme',
    lastTalked: 'yesterday',
    next: 'Acme renewal call · today 11:30',
    youOwe: [
      { what: 'Send signed MSA', meetingId: 'm-sales-acme', meetingTitle: 'Sales sync · Acme expansion', daysOpen: 1 },
      { what: 'Confirm SSO/SAML target with eng', meetingId: 'm-sales-acme', meetingTitle: 'Sales sync · Acme expansion', daysOpen: 1 },
    ],
    theyOwe: [],
    personaCanMention: true,
  },
  'alex-morgan': {
    name: 'Alex Morgan',
    email: 'alex@acme.co',
    company: 'Acme',
    lastTalked: '12 days ago',
    next: 'Q2 Strategy Review · today 14:30',
    youOwe: [],
    theyOwe: [],
    personaCanMention: true,
  },
  'priya-shah': {
    name: 'Priya Shah',
    email: 'priya@acme.co',
    lastTalked: '3 days ago',
    next: 'Q2 Strategy Review · today 14:30',
    youOwe: [
      { what: 'Review the onboarding copy v2', meetingId: 'm-design-review', meetingTitle: 'Design review · Onboarding v3', daysOpen: 3 },
    ],
    theyOwe: [],
    personaCanMention: true,
  },
  'marcus-lee': {
    name: 'Marcus Lee',
    lastTalked: '4 days ago',
    youOwe: [
      { what: 'Write promotion milestone doc', meetingId: 'm-1on1-marcus', meetingTitle: '1:1 · Marcus', daysOpen: 4 },
    ],
    theyOwe: [
      { what: 'Search-rank rollout report', meetingId: 'm-standup', meetingTitle: 'Daily standup', daysOpen: 0 },
    ],
    personaCanMention: false,
  },
  'sara-patel': {
    name: 'Sara Patel',
    lastTalked: '9 days ago',
    youOwe: [
      { what: 'Unblock on design tokens', meetingId: 'm-standup', meetingTitle: 'Daily standup', daysOpen: 0 },
    ],
    theyOwe: [],
    personaCanMention: false,
  },
  'elena-vasquez': {
    name: 'Elena Vasquez',
    lastTalked: '5 days ago',
    youOwe: [
      { what: 'Edit investor deck', meetingId: 'm-investor-update', meetingTitle: 'Investor update prep', daysOpen: 5 },
    ],
    theyOwe: [
      { what: 'Draft v1 of investor deck', meetingId: 'm-investor-update', meetingTitle: 'Investor update prep', daysOpen: 5 },
    ],
    personaCanMention: false,
  },
};

export function personSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ---------------------------------------------------------------------------
// Routines — scheduled prompts against your memory
// ---------------------------------------------------------------------------

export type RoutineCadence = 'daily' | 'weekly' | 'monthly';

export type Routine = {
  id: string;
  name: string;
  description: string;
  instructions: string;
  cadence: RoutineCadence;
  time: string;         // e.g. "7:00 AM" or "Monday · 6:00 AM" or "1st of month · 7:00 AM"
  active: boolean;
  notifications: boolean;
  sources: ('meetings' | 'people' | 'visitors' | 'memory' | 'calendar')[];
  popular?: boolean;
};

export const ROUTINE_TEMPLATES: Routine[] = [
  {
    id: 'morning-brief',
    name: 'Morning Brief',
    description: "A quick read on what matters today so you start the day knowing where to put your attention.",
    instructions: "What do I have on the calendar today? Who am I meeting and what's the context — last meeting with each, any open commitments? Anything visitors asked my persona overnight that needs an answer?",
    cadence: 'daily',
    time: '7:00 AM',
    active: true,
    notifications: true,
    sources: ['meetings', 'people', 'visitors', 'calendar'],
    popular: true,
  },
  {
    id: 'end-of-day',
    name: 'End-of-Day Wrap-Up',
    description: "What got done, what's still open, what's waiting tomorrow.",
    instructions: "Wrap up my day. What did I actually get done in today's meetings, what commitments did I make, what's still open that I should close out tonight, and what's first thing tomorrow.",
    cadence: 'daily',
    time: '5:00 PM',
    active: true,
    notifications: true,
    sources: ['meetings', 'people'],
  },
  {
    id: 'weekly-reflection',
    name: 'Weekly Reflection',
    description: "Where your time went, what moved forward, where to point your focus next.",
    instructions: "Look back at the week. Where did my time go? Which meetings moved real work forward versus drained energy? What did my persona learn this week? Top 3 things to focus on next week.",
    cadence: 'weekly',
    time: 'Monday · 6:00 AM',
    active: false,
    notifications: true,
    sources: ['meetings', 'people', 'memory'],
  },
  {
    id: 'visitor-pulse',
    name: 'Visitor Pulse',
    description: "What strangers asked your persona this week and which questions went unanswered.",
    instructions: "Summarize what visitors asked my persona this week. Group by topic. Surface any questions where my persona said 'I don't know' — I should teach a fact for those in Review.",
    cadence: 'weekly',
    time: 'Friday · 4:00 PM',
    active: false,
    notifications: true,
    sources: ['visitors', 'memory'],
  },
  {
    id: 'monthly-review',
    name: 'Monthly Review',
    description: "Zoom out: what your persona learned, who you spent time with, what compounded.",
    instructions: "Big picture for the month. How many meetings, how many memories approved, top 5 people I spent time with, what topics dominated, what got better in my persona — and what's still missing.",
    cadence: 'monthly',
    time: '1st · 7:00 AM',
    active: false,
    notifications: true,
    sources: ['meetings', 'people', 'visitors', 'memory'],
  },
  {
    id: 'relationship-check',
    name: 'Relationship Check-in',
    description: "Who you'd normally catch up with that you haven't spoken to in 30+ days.",
    instructions: "List people I've met with 3+ times historically that I haven't talked to in the last 30 days. Order by recency-gap. Skip teammates and one-off acquaintances.",
    cadence: 'weekly',
    time: 'Sunday · 8:00 PM',
    active: false,
    notifications: false,
    sources: ['people', 'meetings'],
  },
];

export const CADENCE_LABEL: Record<RoutineCadence, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export type CommandResult = {
  group: 'Action' | 'Meeting' | 'Person' | 'Memory' | 'Page';
  label: string;
  detail?: string;
  href: string;
  icon?: 'record' | 'meeting' | 'person' | 'memory' | 'page' | 'persona' | 'eye' | 'settings';
};

export function buildCommandIndex(): CommandResult[] {
  const items: CommandResult[] = [
    // Quick actions
    { group: 'Action', label: 'Record a meeting', detail: 'Send bot · record tab · upload audio', href: '?modal=record', icon: 'record' },
    { group: 'Action', label: 'View as visitor', detail: 'See what your persona shows the public', href: '?view=visitor', icon: 'eye' },
    { group: 'Action', label: 'Open persona drawer', detail: 'Bio · knowledge · behavior · share', href: '?drawer=persona', icon: 'persona' },
    { group: 'Action', label: 'Open settings', detail: 'Account · calendar · privacy · billing', href: '?settings=general', icon: 'settings' },
    { group: 'Action', label: 'Open integrations', detail: 'Connect Google, Slack, Linear, more', href: '?settings=integrations', icon: 'settings' },
    // Pages
    { group: 'Page', label: 'Today', href: '/workspace', icon: 'page' },
    { group: 'Page', label: 'People', href: '/workspace/people', icon: 'page' },
    { group: 'Page', label: 'Visitors', href: '/workspace/visitors', icon: 'page' },
    { group: 'Page', label: 'Review', detail: 'Approve memory candidates', href: '/workspace/review', icon: 'page' },
    { group: 'Page', label: 'Routines', detail: 'Scheduled prompts against your memory', href: '/workspace/routines', icon: 'page' },
    { group: 'Page', label: 'Welcome / onboarding', href: '/welcome', icon: 'page' },
  ];

  for (const m of MOCK_MEETINGS) {
    items.push({
      group: 'Meeting',
      label: m.title,
      detail: m.attendees.filter((a) => !a.self).map((a) => a.name).join(', ') || 'Just you',
      href: `/workspace/meeting/${m.id}`,
      icon: 'meeting',
    });
  }

  const seen = new Set<string>();
  for (const m of MOCK_MEETINGS) {
    for (const a of m.attendees) {
      if (a.self || seen.has(a.name)) continue;
      seen.add(a.name);
      items.push({
        group: 'Person',
        label: a.name,
        detail: a.email,
        href: '/workspace/people',
        icon: 'person',
      });
    }
  }

  for (const [topic, facts] of Object.entries(MOCK_PERSONA_MEMORY)) {
    for (const f of facts) {
      items.push({
        group: 'Memory',
        label: f.fact,
        detail: `${topic} · ${f.meetingTitle}`,
        href: f.meetingId ? `/workspace/meeting/${f.meetingId}` : '?drawer=persona',
        icon: 'memory',
      });
    }
  }

  return items;
}

export type SampleVisitorAnswer = {
  question: string;
  answer: string;
  sources: { title: string; date: string }[];
};

export const MOCK_VISITOR_ANSWER: SampleVisitorAnswer = {
  question: 'What is PersonaOn?',
  answer:
    "PersonaOn is meeting intelligence with a memory layer. It captures your meetings, builds a private archive you can ask back like ChatGPT, and lets you publish parts of that memory as a public persona that visitors can chat with — but only what you've explicitly approved.",
  sources: [
    { title: 'Customer feedback · Persona memory', date: '9 days ago' },
    { title: 'Investor update prep', date: '5 days ago' },
  ],
};

export type VisitorSource = {
  meetingId: string;
  meetingTitle: string;
  date: string;
  excerpt: string;
};

export type VisitorCannedAnswer = {
  question: string;
  answer: string;
  sources: VisitorSource[];
};

export const MOCK_VISITOR_ANSWERS: Record<string, VisitorCannedAnswer> = {
  'Who is Avery Stone?': {
    question: 'Who is Avery Stone?',
    answer:
      "I'm Avery Stone, founder of PersonaOn. I'm building meeting intelligence with a public surface — tools that turn your meetings into memory you can ask back, privately for you and publicly through a persona visitors can chat with. Before this I spent years in product at two seed-stage SaaS companies, which is where I got obsessed with how much context teams lose the moment a meeting ends.",
    sources: [
      {
        meetingId: '',
        meetingTitle: 'Persona bio (manually written)',
        date: 'persona seed',
        excerpt:
          'Founded by Avery Stone after two seed-stage SaaS startups.',
      },
      {
        meetingId: '',
        meetingTitle: 'Persona bio (manually written)',
        date: 'persona seed',
        excerpt:
          'Building tools that turn meetings into memory you can ask back.',
      },
    ],
  },
  'Why did you start PersonaOn?': {
    question: 'Why did you start PersonaOn?',
    answer:
      "I kept losing context between meetings and wanted a memory layer I could actually ask questions of — not just another folder of transcripts. When I described it to founder friends, they all had the same problem, so I started building PersonaOn.",
    sources: [
      {
        meetingId: '',
        meetingTitle: 'Founder note (manually written)',
        date: 'persona seed',
        excerpt:
          'I kept losing context between meetings and wanted a memory layer I could ask back. Friends had the same problem.',
      },
    ],
  },
  "What's your background before PersonaOn?": {
    question: "What's your background before PersonaOn?",
    answer:
      "Product, mostly. I spent years as a product person at two seed-stage SaaS startups before founding PersonaOn — shipping 0→1 features, talking to customers constantly, and watching good decisions get lost the moment a meeting ended. That last part is basically why PersonaOn exists.",
    sources: [
      {
        meetingId: '',
        meetingTitle: 'Persona bio (manually written)',
        date: 'persona seed',
        excerpt:
          'Previously product at two seed-stage SaaS companies.',
      },
    ],
  },
  'How do you think about meeting privacy?': {
    question: 'How do you think about meeting privacy?',
    answer:
      "Privacy is the product, not a footnote. My meetings are private by default. Memories are auto-extracted but never auto-published — every fact passes through Review before it joins the set my persona is allowed to say. Anything mentioning a third party is flagged and held back unless I explicitly approve it.",
    sources: [
      {
        meetingId: 'm-customer-feedback',
        meetingTitle: 'Customer feedback · Persona memory',
        date: '9 days ago',
        excerpt:
          'Strong signal that internal Q&A is more valued than public chat right now.',
      },
    ],
  },
  'How can I work with you?': {
    question: 'How can I work with you?',
    answer:
      "The fastest way is to book a quick call through my public link — personaon.com/p/avery/book. Tell me a bit about what you're working on and I'll come prepared. If your question is about PersonaOn itself, you can also just keep chatting here and my persona will answer from what I've approved.",
    sources: [],
  },
};

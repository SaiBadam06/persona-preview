'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check, Mic, Search, Users, Inbox, Globe, Repeat } from 'lucide-react';

import { MOCK_MEETINGS, MOCK_PERSONA, MOCK_VISITOR_SESSIONS, formatMeetingTime, groupMeetingsByDate } from './mockData';
import { useSidebar } from './WorkspaceShellContext';

type ProgressTask = { id: string; label: string; done: boolean };

const DEFAULT_TASKS: ProgressTask[] = [
  { id: 'bio',      label: 'Bio & headline set',              done: true  },
  { id: 'calendar', label: 'Calendar connected',              done: true  },
  { id: 'memory',   label: 'First memory approved',           done: false },
  { id: 'visitor',  label: 'First visitor question answered', done: false },
];

const PROGRESS_KEY = 'personaon-workspace-progress';

function loadProgress(): ProgressTask[] {
  if (typeof window === 'undefined') return DEFAULT_TASKS;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT_TASKS;
    const parsed = JSON.parse(raw) as { id: string; done: boolean }[];
    return DEFAULT_TASKS.map((t) => {
      const stored = parsed.find((s) => s.id === t.id);
      return stored ? { ...t, done: stored.done } : t;
    });
  } catch {
    return DEFAULT_TASKS;
  }
}

function saveProgress(tasks: ProgressTask[]): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(tasks.map((t) => ({ id: t.id, done: t.done }))));
  } catch { /* ignore */ }
}

export function WorkspaceSidebar(): React.JSX.Element {
  const pathname = usePathname();
  const groups = groupMeetingsByDate(MOCK_MEETINGS);
  const { closeMobile } = useSidebar();

  const [tasks, setTasks] = useState<ProgressTask[]>(DEFAULT_TASKS);
  useEffect(() => { setTasks(loadProgress()); }, []);

  const toggleTask = (id: string) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      saveProgress(next);
      return next;
    });
  };

  const isHome = pathname === '/workspace';
  const isPeople = pathname?.startsWith('/workspace/people') ?? false;
  const isReview = pathname === '/workspace/review';
  const isVisitors = pathname === '/workspace/visitors';
  const isRoutines = pathname?.startsWith('/workspace/routines') ?? false;
  const visitorCount = MOCK_VISITOR_SESSIONS.length;

  return (
    <aside className="workspace-sidebar flex w-[268px] shrink-0 flex-col">
      {/* PersonaOn wordmark · brand mark — Instrument Serif + signal-blue pulse dot */}
      <Link
        href="/workspace"
        aria-label="PersonaOn — home"
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 1,
          padding: '14px 18px 10px',
          fontFamily: "var(--w-font-display)",
          fontWeight: 400,
          fontSize: 22,
          lineHeight: 1,
          letterSpacing: '-0.005em',
          color: 'var(--w-ink)',
          textDecoration: 'none',
        }}
      >
        PersonaOn
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--w-accent)',
            marginLeft: 7,
            alignSelf: 'center',
            boxShadow: '0 0 0 4px rgba(0, 102, 204, 0.18)',
          }}
        />
      </Link>

      <Link
        href={`${pathname}?modal=record`}
        scroll={false}
        className="workspace-new-action"
        style={{ background: 'var(--w-ink)', color: 'var(--w-bg-app)', borderColor: 'var(--w-ink)', textDecoration: 'none' }}
      >
        <Mic className="h-4 w-4" />
        Record a meeting
      </Link>

      <Link
        href={`${pathname}?cmd=open`}
        scroll={false}
        className="workspace-cmd-hint"
        style={{ textDecoration: 'none' }}
      >
        <Search className="h-3.5 w-3.5" />
        <span className="label">Search workspace…</span>
        <span className="workspace-cmd-kbd">⌘K</span>
      </Link>

      <div className="px-2 pb-1">
        <Link href="/workspace" onClick={closeMobile} className={`workspace-sidebar-item ${isHome ? 'is-active' : ''}`}>
          <Search className="h-4 w-4 opacity-70" />
          <span className="item-title">Today</span>
        </Link>
        <Link href="/workspace/people" onClick={closeMobile} className={`workspace-sidebar-item ${isPeople ? 'is-active' : ''}`}>
          <Users className="h-4 w-4 opacity-70" />
          <span className="item-title">People</span>
        </Link>
        <Link href="/workspace/visitors" onClick={closeMobile} className={`workspace-sidebar-item ${isVisitors ? 'is-active' : ''}`}>
          <Globe className="h-4 w-4 opacity-70" />
          <span className="item-title">Visitors</span>
          <span className="item-meta">{visitorCount}</span>
        </Link>
        <Link href="/workspace/review" onClick={closeMobile} className={`workspace-sidebar-item ${isReview ? 'is-active' : ''}`}>
          <Inbox className="h-4 w-4 opacity-70" />
          <span className="item-title">Review</span>
          <span className="item-meta">3</span>
        </Link>
        <Link href="/workspace/routines" onClick={closeMobile} className={`workspace-sidebar-item ${isRoutines ? 'is-active' : ''}`}>
          <Repeat className="h-4 w-4 opacity-70" />
          <span className="item-title">Routines</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="workspace-sidebar-group-label">{group.label}</div>
            {group.meetings.map((meeting) => {
              const active = pathname === `/workspace/meeting/${meeting.id}`;
              const isLive = meeting.status === 'recording';
              return (
                <Link
                  key={meeting.id}
                  href={`/workspace/meeting/${meeting.id}`}
                  className={`workspace-sidebar-item ${active ? 'is-active' : ''}`}
                >
                  {isLive && <span className="live-dot" aria-label="Live" />}
                  <span className="item-title" title={meeting.title}>
                    {meeting.title}
                  </span>
                  <span className="item-meta">{isLive ? 'live' : formatMeetingTime(meeting.start)}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {(() => {
        const doneCount = tasks.filter((t) => t.done).length;
        const pct = Math.round((doneCount / tasks.length) * 100);
        if (pct >= 100) return null;
        return (
          <div className="workspace-progress-rail">
            <div className="workspace-progress-rail-header">
              <span className="workspace-progress-rail-title">Build your persona</span>
              <span className="workspace-progress-rail-pct">{pct}%</span>
            </div>
            <div className="workspace-progress-rail-bar">
              <div className="workspace-progress-rail-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {tasks.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => toggleTask(t.id)}
                    className={`workspace-progress-rail-task ${t.done ? 'is-done' : ''}`}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      padding: '4px 4px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <span className="workspace-progress-rail-check">
                      {t.done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                    </span>
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

      <Link href={`${pathname}?drawer=persona`} className="workspace-persona-chip" scroll={false}>
        <div className="avatar">{MOCK_PERSONA.initial}</div>
        <div className="name">{MOCK_PERSONA.displayName}</div>
        <span className="ready-dot" aria-label={MOCK_PERSONA.statusLabel} />
      </Link>
    </aside>
  );
}

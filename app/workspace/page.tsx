'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Calendar, Clock3, Mic, Sparkles, Upload } from 'lucide-react';
import { Suspense } from 'react';

import { MOCK_MEETINGS, formatMeetingTime, groupMeetingsByDate, formatRelativeDate } from './mockData';
import { WorkspaceTopBar } from './WorkspaceTopBar';
import { PromptInput } from './PromptInput';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Late tonight';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function HomeInner(): React.JSX.Element {
  const search = useSearchParams();
  const isEmpty = search.get('seed') === 'empty';

  const groups = isEmpty ? [] : groupMeetingsByDate(MOCK_MEETINGS);
  const today = groups.find((g) => g.label === 'Today');
  const recent = groups.filter((g) => g.label !== 'Today');
  const todayCount = today?.meetings.length ?? 0;

  if (isEmpty) {
    return (
      <>
        <WorkspaceTopBar crumb="Workspace" title="Today" />
        <div className="workspace-canvas">
          <div className="workspace-canvas-inner">
            <header className="mb-10">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <p className="workspace-meta" style={{ margin: 0 }}>
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <Link
                  href="/workspace"
                  className="workspace-meta"
                  style={{ textDecoration: 'none', color: 'var(--w-ink-3)' }}
                >
                  Switch to seeded workspace ↗
                </Link>
              </div>
              <h1 className="workspace-display-xl">
                Welcome to PersonaOn, Avery.
              </h1>
              <p className="workspace-body" style={{ marginTop: 12, color: 'var(--w-ink-2)' }}>
                Your workspace is empty. The fastest way to feel it: record your first meeting, or
                connect a calendar so we can recap the next one automatically.
              </p>
            </header>

            <div
              style={{
                display: 'grid',
                gap: 14,
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                marginBottom: 32,
              }}
            >
              <Link
                href="?modal=record"
                scroll={false}
                style={{
                  padding: 18,
                  background: 'var(--w-bg-canvas)',
                  border: '1px solid var(--w-hairline)',
                  borderRadius: 12,
                  textDecoration: 'none',
                  color: 'var(--w-ink)',
                  display: 'block',
                }}
              >
                <Mic className="h-4 w-4" style={{ color: 'var(--w-accent)' }} />
                <p style={{ margin: '12px 0 4px', fontSize: 15, fontWeight: 500 }}>Record a meeting</p>
                <p className="workspace-meta" style={{ margin: 0 }}>
                  Send a bot to a Zoom link, record this tab, or upload audio. 30 seconds.
                </p>
              </Link>

              <Link
                href="?settings=integrations"
                scroll={false}
                style={{
                  padding: 18,
                  background: 'var(--w-bg-canvas)',
                  border: '1px solid var(--w-hairline)',
                  borderRadius: 12,
                  textDecoration: 'none',
                  color: 'var(--w-ink)',
                  display: 'block',
                }}
              >
                <Calendar className="h-4 w-4" style={{ color: 'var(--w-ink-2)' }} />
                <p style={{ margin: '12px 0 4px', fontSize: 15, fontWeight: 500 }}>Connect your calendar</p>
                <p className="workspace-meta" style={{ margin: 0 }}>
                  Google or Microsoft. We'll suggest which meetings to record going forward.
                </p>
              </Link>

              <Link
                href="?modal=record"
                scroll={false}
                style={{
                  padding: 18,
                  background: 'var(--w-bg-canvas)',
                  border: '1px solid var(--w-hairline)',
                  borderRadius: 12,
                  textDecoration: 'none',
                  color: 'var(--w-ink)',
                  display: 'block',
                }}
              >
                <Upload className="h-4 w-4" style={{ color: 'var(--w-ink-2)' }} />
                <p style={{ margin: '12px 0 4px', fontSize: 15, fontWeight: 500 }}>Upload a past meeting</p>
                <p className="workspace-meta" style={{ margin: 0 }}>
                  Audio or video file. We transcribe and build a recap so your archive isn't empty.
                </p>
              </Link>
            </div>

            <section
              style={{
                padding: 20,
                background: 'var(--w-bg-quiet)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
              }}
            >
              <Sparkles className="h-4 w-4" style={{ color: 'var(--w-accent)', marginTop: 2 }} />
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Your persona is at 30% public-ready.</p>
                <p className="workspace-meta" style={{ margin: '4px 0 0' }}>
                  It already knows your bio and headline from onboarding. It grows every time you
                  approve a fact from a real meeting.
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Link href="?drawer=persona" scroll={false} className="workspace-quiet-btn" style={{ textDecoration: 'none' }}>
                    Open persona
                  </Link>
                  <Link href="?view=visitor" scroll={false} className="workspace-quiet-btn" style={{ textDecoration: 'none' }}>
                    View as visitor
                  </Link>
                </div>
              </div>
            </section>
          </div>

          <PromptInput placeholder="Ask anything once your first meeting is recorded…" />
        </div>
      </>
    );
  }

  return (
    <>
      <WorkspaceTopBar crumb="Workspace" title="Today" />
      <div className="workspace-canvas">
        <div className="workspace-canvas-inner">
          <header className="mb-10">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <p className="workspace-meta" style={{ margin: 0 }}>
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <span className="workspace-meta" style={{ display: 'flex', gap: 16 }}>
                <Link href="/workspace?seed=empty" className="workspace-meta" style={{ textDecoration: 'none', color: 'var(--w-ink-3)' }}>
                  Preview empty state ↗
                </Link>
                <Link href="/welcome" className="workspace-meta" style={{ textDecoration: 'none', color: 'var(--w-ink-3)' }}>
                  See onboarding ↗
                </Link>
              </span>
            </div>
            <h1 className="workspace-display-xl">
              {greeting()}, Avery.
            </h1>
            <p className="workspace-body" style={{ marginTop: 12, color: 'var(--w-ink-2)' }}>
              {todayCount > 0
                ? `You have ${todayCount} meeting${todayCount === 1 ? '' : 's'} today.`
                : 'Nothing on the calendar today.'}
            </p>
            <div
              style={{
                marginTop: 20,
                padding: 14,
                background: 'var(--w-bg-quiet)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
                fontSize: 13.5,
                color: 'var(--w-ink-2)',
              }}
            >
              <span style={{ color: 'var(--w-ink-3)', fontWeight: 500 }}>Pending:</span>
              <Link href="/workspace/review" style={{ color: 'var(--w-ink)', textDecoration: 'none' }}>
                <strong style={{ fontWeight: 500 }}>6</strong>{' '}
                <span style={{ color: 'var(--w-ink-3)' }}>to review</span>
              </Link>
              <span style={{ color: 'var(--w-ink-4)' }}>·</span>
              <Link href="/workspace/people/jordan-reyes" style={{ color: 'var(--w-ink)', textDecoration: 'none' }}>
                <strong style={{ fontWeight: 500 }}>3</strong>{' '}
                <span style={{ color: 'var(--w-ink-3)' }}>follow-ups owed</span>
              </Link>
              <span style={{ color: 'var(--w-ink-4)' }}>·</span>
              <Link href="/workspace/visitors" style={{ color: 'var(--w-accent)', textDecoration: 'none' }}>
                <strong style={{ fontWeight: 500 }}>1</strong>{' '}
                <span>visitor question unanswered</span>
              </Link>
            </div>
          </header>

          <section className="mb-10">
            <div className="workspace-section-header">
              <h2>Today</h2>
              {today && <span className="header-meta">{today.meetings.length} on the calendar</span>}
            </div>
            {today ? (
              <div>
                {today.meetings.map((meeting) => (
                  <Link key={meeting.id} href={`/workspace/meeting/${meeting.id}`} className="workspace-row">
                    <div className="row-time">{formatMeetingTime(meeting.start)}</div>
                    <div className="row-body">
                      <p className="row-title">{meeting.title}</p>
                      <p className="row-meta">
                        {meeting.attendees.filter((a) => !a.self).map((a) => a.name).join(', ')}
                      </p>
                    </div>
                    <div className={`row-status ${meeting.status === 'recording' ? 'is-live' : ''}`}>
                      {meeting.status === 'recording' ? 'live' : meeting.status === 'completed' ? 'done' : 'soon'}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div
                className="workspace-meta"
                style={{
                  padding: '20px 16px',
                  border: '1px dashed var(--w-hairline-2)',
                  borderRadius: 12,
                }}
              >
                <Clock3 className="mb-2 h-4 w-4 opacity-50" />
                Nothing scheduled. Ask the prompt below to plan your day.
              </div>
            )}
          </section>

          {recent.map((group) => (
            <section key={group.label} className="mb-10">
              <div className="workspace-section-header">
                <h2>{group.label}</h2>
                <span className="header-meta">{group.meetings.length}</span>
              </div>
              <div>
                {group.meetings.map((meeting) => (
                  <Link key={meeting.id} href={`/workspace/meeting/${meeting.id}`} className="workspace-row">
                    <div className="row-time">{formatRelativeDate(meeting.start)}</div>
                    <div className="row-body">
                      <p className="row-title">{meeting.title}</p>
                      <p className="row-meta">
                        {meeting.recapBullets?.[0] || meeting.attendees.filter((a) => !a.self).map((a) => a.name).join(', ')}
                      </p>
                    </div>
                    <div className="row-status">
                      {meeting.hasRecap ? 'recap' : ''}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <PromptInput placeholder="Ask: what did we decide about Acme's SAML timeline?" />
      </div>
    </>
  );
}

export default function WorkspaceHome(): React.JSX.Element {
  return (
    <Suspense fallback={<div className="workspace-canvas" />}>
      <HomeInner />
    </Suspense>
  );
}

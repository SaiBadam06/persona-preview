'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';

import {
  MOCK_MEETINGS,
  MOCK_PEOPLE_DETAIL,
  MOCK_PERSONA_MEMORY,
  formatMeetingTime,
  formatRelativeDate,
  personSlug,
} from '../../mockData';
import { WorkspaceTopBar } from '../../WorkspaceTopBar';
import { PromptInput } from '../../PromptInput';

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

export default function PersonDetailPage(): React.JSX.Element {
  const params = useParams();
  const id = String(params?.id ?? '');
  const person = MOCK_PEOPLE_DETAIL[id];

  if (!person) {
    notFound();
  }

  const meetings = MOCK_MEETINGS
    .filter((m) => m.attendees.some((a) => personSlug(a.name) === id))
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

  const mentionsInMemory = Object.entries(MOCK_PERSONA_MEMORY).flatMap(([topic, facts]) =>
    facts
      .filter((f) => f.fact.toLowerCase().includes(person.name.toLowerCase().split(' ')[0]))
      .map((f) => ({ topic, ...f })),
  );

  return (
    <>
      <WorkspaceTopBar crumb="Person" title={person.name} />
      <div className="workspace-canvas">
        <div className="workspace-canvas-inner">
          <Link
            href="/workspace/people"
            style={{
              fontSize: 13,
              color: 'var(--w-ink-3)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All people
          </Link>

          <header className="workspace-person-hero">
            <div className="workspace-person-avatar">{getInitials(person.name)}</div>
            <div>
              <h1 className="workspace-person-name">{person.name}</h1>
              <p className="workspace-person-sub">
                {person.company && <>{person.company} · </>}
                {person.email && <span className="workspace-mono">{person.email}</span>}
              </p>
            </div>
          </header>

          <section className="workspace-person-stat-row">
            <div className="workspace-person-stat">
              <div className="label">Last talked</div>
              <div className="value">{person.lastTalked}</div>
            </div>
            <div className="workspace-person-stat">
              <div className="label">You owe</div>
              <div className="value" style={{ color: person.youOwe.length > 0 ? 'var(--w-accent)' : 'var(--w-ink)' }}>
                {person.youOwe.length} item{person.youOwe.length === 1 ? '' : 's'}
              </div>
            </div>
            <div className="workspace-person-stat">
              <div className="label">They owe</div>
              <div className="value">{person.theyOwe.length} item{person.theyOwe.length === 1 ? '' : 's'}</div>
            </div>
            <div className="workspace-person-stat">
              <div className="label">Next meeting</div>
              <div className="value">{person.next ?? '—'}</div>
            </div>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 28 }}>
            <section>
              <h2 className="workspace-section-h3" style={{ marginTop: 0 }}>Timeline</h2>
              {meetings.length === 0 ? (
                <p className="workspace-meta">No shared meetings recorded yet.</p>
              ) : (
                <div>
                  {meetings.map((m) => (
                    <Link key={m.id} href={`/workspace/meeting/${m.id}`} className="workspace-row">
                      <div className="row-time">{formatRelativeDate(m.start)}</div>
                      <div className="row-body">
                        <p className="row-title">{m.title}</p>
                        <p className="row-meta">
                          {formatMeetingTime(m.start)} · {m.durationMin} min ·{' '}
                          {m.hasRecap ? 'recap ready' : m.status === 'scheduled' ? 'upcoming' : m.status}
                        </p>
                      </div>
                      <div className="row-status">
                        {m.status === 'recording' ? 'live' : m.hasRecap ? 'recap' : ''}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <h2 className="workspace-section-h3">Memory mentioning {person.name.split(' ')[0]}</h2>
              {mentionsInMemory.length === 0 ? (
                <p className="workspace-meta">
                  No approved facts mention {person.name} yet. Memories about them stay in Review
                  until you decide.
                </p>
              ) : (
                <div
                  style={{
                    background: 'var(--w-bg-quiet)',
                    borderRadius: 12,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {mentionsInMemory.map((m) => (
                    <div key={`${m.topic}-${m.fact}`} style={{ fontSize: 13.5, lineHeight: 1.5 }}>
                      <p style={{ margin: 0, color: 'var(--w-ink)' }}>{m.fact}</p>
                      <p className="workspace-meta" style={{ margin: '2px 0 0' }}>
                        {m.topic} · {m.meetingTitle}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <aside>
              <h2 className="workspace-section-h3" style={{ marginTop: 0 }}>Open loops</h2>
              {person.youOwe.length === 0 && person.theyOwe.length === 0 ? (
                <p className="workspace-meta">No open commitments. You're square.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {person.youOwe.length > 0 && (
                    <div>
                      <p className="workspace-meta" style={{ margin: '0 0 6px', fontWeight: 500, color: 'var(--w-ink-2)' }}>
                        You owe
                      </p>
                      {person.youOwe.map((c) => (
                        <div
                          key={c.what}
                          style={{
                            padding: '10px 12px',
                            background: 'rgba(229, 72, 77, 0.05)',
                            border: '1px solid rgba(229, 72, 77, 0.18)',
                            borderRadius: 10,
                            marginBottom: 6,
                            fontSize: 13,
                          }}
                        >
                          <p style={{ margin: 0, color: 'var(--w-ink)' }}>{c.what}</p>
                          <p className="workspace-meta" style={{ margin: '2px 0 0' }}>
                            from {c.meetingTitle} · {c.daysOpen}d open
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {person.theyOwe.length > 0 && (
                    <div>
                      <p className="workspace-meta" style={{ margin: '0 0 6px', fontWeight: 500, color: 'var(--w-ink-2)' }}>
                        They owe
                      </p>
                      {person.theyOwe.map((c) => (
                        <div
                          key={c.what}
                          style={{
                            padding: '10px 12px',
                            background: 'var(--w-bg-quiet)',
                            borderRadius: 10,
                            marginBottom: 6,
                            fontSize: 13,
                          }}
                        >
                          <p style={{ margin: 0, color: 'var(--w-ink)' }}>{c.what}</p>
                          <p className="workspace-meta" style={{ margin: '2px 0 0' }}>
                            from {c.meetingTitle} · {c.daysOpen}d open
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <h2 className="workspace-section-h3">Persona scope</h2>
              <div
                style={{
                  padding: 14,
                  background: person.personaCanMention ? 'var(--w-bg-quiet)' : 'rgba(201, 100, 66, 0.07)',
                  borderRadius: 12,
                  fontSize: 13.5,
                  lineHeight: 1.55,
                }}
              >
                <p style={{ margin: 0, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--w-accent)' }} />
                  <span style={{ fontWeight: 500 }}>
                    {person.personaCanMention
                      ? 'Your persona may mention this person'
                      : 'Your persona will NOT mention this person'}
                  </span>
                </p>
                <p className="workspace-meta" style={{ marginTop: 6 }}>
                  {person.personaCanMention
                    ? 'They appear in approved memory and are flagged OK to reference publicly.'
                    : 'Internal-only contact. Visitors will never get answers about this person.'}
                </p>
                <button
                  type="button"
                  className="workspace-quiet-btn"
                  style={{ marginTop: 10 }}
                >
                  Change permission
                </button>
              </div>

              <h2 className="workspace-section-h3">Private notes</h2>
              <textarea
                placeholder={`Notes about ${person.name} that help future briefs. Never public.`}
                style={{
                  width: '100%',
                  minHeight: 80,
                  padding: 12,
                  border: '1px solid var(--w-hairline)',
                  borderRadius: 10,
                  fontFamily: 'inherit',
                  fontSize: 13.5,
                  color: 'var(--w-ink)',
                  background: 'var(--w-bg-canvas)',
                  resize: 'vertical',
                }}
              />
            </aside>
          </div>
        </div>

        <PromptInput placeholder={`Ask: what's open with ${person.name.split(' ')[0]}?`} />
      </div>
    </>
  );
}

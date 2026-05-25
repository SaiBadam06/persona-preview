'use client';

import { notFound, useParams } from 'next/navigation';
import { useState } from 'react';
import { Check, FileText, Lock, Sparkles, X } from 'lucide-react';

import {
  MOCK_LIVE_TRANSCRIPT,
  MOCK_MEETINGS,
  MOCK_REVIEW_CANDIDATES,
  formatMeetingTime,
} from '../../mockData';
import { PromptInput } from '../../PromptInput';
import { WorkspaceTopBar } from '../../WorkspaceTopBar';

type Tab = 'note' | 'summary' | 'transcript';

export default function MeetingPage(): React.JSX.Element {
  const params = useParams();
  const meetingId = String(params?.id ?? '');
  const meeting = MOCK_MEETINGS.find((m) => m.id === meetingId);

  // Tab defaults: live → note (you take notes during), past with recap → summary
  const initialTab: Tab = meeting?.status === 'recording'
    ? 'note'
    : meeting?.hasRecap
      ? 'summary'
      : 'note';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [note, setNote] = useState('');
  const [decided, setDecided] = useState<Set<string>>(new Set());

  if (!meeting) {
    notFound();
  }

  const isLive = meeting.status === 'recording';
  const otherAttendees = meeting.attendees.filter((a) => !a.self);
  const candidates = MOCK_REVIEW_CANDIDATES.filter((c) => c.meetingId === meetingId);
  const pendingCandidates = candidates.filter((c) => !decided.has(c.id));
  const decide = (id: string) => setDecided((s) => new Set(s).add(id));
  const decideAll = () => setDecided((s) => {
    const next = new Set(s);
    candidates.forEach((c) => next.add(c.id));
    return next;
  });

  return (
    <>
      <WorkspaceTopBar crumb="Meeting" title={meeting.title} showShare />
      <div className="workspace-meeting-shell">
        {isLive && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '6px 16px',
              borderBottom: '1px solid rgba(229, 72, 77, 0.18)',
              background: 'rgba(229, 72, 77, 0.04)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#B83A3E', fontWeight: 500 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: '#E5484D',
                  animation: 'w-live-pulse 1.5s ease-in-out infinite',
                }}
              />
              Recording
            </span>
            <button type="button" className="workspace-meeting-stop">
              <span className="square" />
              Stop
            </button>
          </div>
        )}

      <div className="workspace-meeting-canvas">
        <div className="workspace-meeting-doc">
          <h1 className="workspace-meeting-doc-title">{meeting.title}</h1>

          <div className="workspace-meeting-doc-sub">
            <span>{formatMeetingTime(meeting.start)}</span>
            <span>·</span>
            <span>{meeting.durationMin} min</span>
            {isLive && (
              <>
                <span>·</span>
                <span style={{ color: 'var(--w-accent)' }}>● live</span>
              </>
            )}
          </div>

          {otherAttendees.length > 0 && (
            <div className="workspace-meeting-attendee-row">
              {otherAttendees.map((a) => (
                <span key={a.name} className="workspace-chip">{a.name}</span>
              ))}
            </div>
          )}

          <nav className="workspace-meeting-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === 'note'}
              onClick={() => setTab('note')}
              className={`workspace-meeting-tab ${tab === 'note' ? 'is-active' : ''}`}
            >
              <FileText className="h-3.5 w-3.5" />
              Note
            </button>
            <button
              role="tab"
              aria-selected={tab === 'summary'}
              onClick={() => setTab('summary')}
              className={`workspace-meeting-tab ${tab === 'summary' ? 'is-active' : ''}`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Summary
            </button>
            <button
              role="tab"
              aria-selected={tab === 'transcript'}
              onClick={() => setTab('transcript')}
              className={`workspace-meeting-tab ${tab === 'transcript' ? 'is-active' : ''}`}
            >
              <span style={{ fontFamily: 'var(--w-font-mono)', fontSize: 11, marginRight: 2 }}>≡</span>
              Transcript
            </button>
          </nav>

          {/* NOTE TAB — Notion-style editor */}
          {tab === 'note' && (
            <>
              <textarea
                className="workspace-meeting-note-editor"
                placeholder="Write, '/' for commands"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              {note.length === 0 && (
                <p className="workspace-meeting-note-help">
                  Notes you take here are private to you. They stay with this meeting and feed your
                  memory.
                </p>
              )}
            </>
          )}

          {/* SUMMARY TAB */}
          {tab === 'summary' && (
            <>
              {meeting.hasRecap ? (
                <>
                  <section className="workspace-summary-section">
                    <h3>Recap</h3>
                    <ul className="workspace-summary-bullets">
                      {(meeting.recapBullets ?? []).map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </section>

                  {meeting.actionItems && meeting.actionItems.length > 0 && (
                    <section className="workspace-summary-section">
                      <h3>Action items</h3>
                      <div>
                        {meeting.actionItems.map((a) => (
                          <div key={a.what} className="workspace-summary-action">
                            <span className="who">{a.who}</span>
                            <span className="what">{a.what}</span>
                            <span className="due">{a.due ?? '—'}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {candidates.length > 0 && (
                    <section className="workspace-summary-section">
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div>
                          <h3 style={{ marginBottom: 4 }}>Memory candidates</h3>
                          <p className="workspace-meta" style={{ margin: 0 }}>
                            {pendingCandidates.length === 0
                              ? 'All decided. Approved facts now appear under your persona.'
                              : `${pendingCandidates.length} fact${pendingCandidates.length === 1 ? '' : 's'} waiting to join your persona.`}
                          </p>
                        </div>
                        {pendingCandidates.length > 1 && (
                          <button
                            type="button"
                            className="workspace-quiet-btn"
                            style={{ background: 'var(--w-ink)', color: 'var(--w-bg-app)', borderColor: 'var(--w-ink)' }}
                            onClick={decideAll}
                          >
                            Approve all {pendingCandidates.length}
                          </button>
                        )}
                      </div>

                      {pendingCandidates.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {pendingCandidates.map((c) => (
                            <article
                              key={c.id}
                              style={{
                                padding: '14px 16px',
                                background: 'var(--w-bg-canvas)',
                                border: '1px solid var(--w-hairline)',
                                borderRadius: 12,
                              }}
                            >
                              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span className="workspace-chip">{c.topic}</span>
                                <span className="workspace-mono">{c.meetingWhen}</span>
                              </header>
                              <p
                                style={{
                                  fontFamily: 'var(--w-font-display)',
                                  fontSize: 17,
                                  lineHeight: 1.4,
                                  color: 'var(--w-ink)',
                                  margin: '0 0 8px',
                                  letterSpacing: '-0.003em',
                                }}
                              >
                                {c.fact}
                              </p>
                              {c.mentionsThirdParty && (
                                <p style={{ fontSize: 12.5, color: 'var(--w-accent)', margin: '0 0 8px' }}>
                                  <Lock className="inline h-3 w-3" /> Mentions {c.mentionsThirdParty}
                                </p>
                              )}
                              <p style={{ fontSize: 12, color: 'var(--w-ink-2)', fontWeight: 500, margin: '8px 0 4px' }}>
                                Unlocks visitor questions like:
                              </p>
                              <ul
                                style={{
                                  listStyle: 'none',
                                  padding: '0 0 0 16px',
                                  margin: '0 0 12px',
                                  fontFamily: 'var(--w-font-display)',
                                  fontStyle: 'italic',
                                  fontSize: 13.5,
                                  color: 'var(--w-ink-2)',
                                }}
                              >
                                {c.unlocks.slice(0, 2).map((q) => (
                                  <li key={q}>"{q}"</li>
                                ))}
                              </ul>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  className="workspace-quiet-btn"
                                  style={{ background: 'var(--w-ink)', color: 'var(--w-bg-app)', borderColor: 'var(--w-ink)' }}
                                  onClick={() => decide(c.id)}
                                >
                                  <Check className="h-3 w-3" />
                                  Approve
                                </button>
                                <button type="button" className="workspace-quiet-btn" onClick={() => decide(c.id)}>
                                  Keep private
                                </button>
                                <button
                                  type="button"
                                  className="workspace-quiet-btn"
                                  style={{ color: 'var(--w-ink-3)' }}
                                  onClick={() => decide(c.id)}
                                >
                                  <X className="h-3 w-3" />
                                  Ignore
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>
                  )}
                </>
              ) : isLive ? (
                <div className="workspace-meeting-empty">
                  <div className="icon">··</div>
                  Summary appears here when the meeting wraps. Right now, the transcript is forming.
                </div>
              ) : (
                <div className="workspace-meeting-empty">
                  <div className="icon">··</div>
                  No summary yet. Recap is generated after you stop recording.
                </div>
              )}
            </>
          )}

          {/* TRANSCRIPT TAB */}
          {tab === 'transcript' && (
            <>
              {isLive ? (
                <>
                  <div className="workspace-transcript-pulse">
                    <span className="dot" />
                    Live · auto-scrolling
                  </div>
                  {MOCK_LIVE_TRANSCRIPT.map((line, i) => (
                    <div key={i} className="workspace-transcript-line">
                      <span className="t">{line.t}</span>
                      <div>
                        <span className="speaker">{line.speaker}:</span>
                        {line.text}
                      </div>
                    </div>
                  ))}
                </>
              ) : meeting.hasRecap ? (
                <>
                  {MOCK_LIVE_TRANSCRIPT.map((line, i) => (
                    <div key={i} className="workspace-transcript-line">
                      <span className="t">{line.t}</span>
                      <div>
                        <span className="speaker">{line.speaker}:</span>
                        {line.text}
                      </div>
                    </div>
                  ))}
                  <p className="workspace-meta" style={{ marginTop: 18, fontStyle: 'italic' }}>
                    Excerpt from full transcript. Use the prompt below to ask specific moments.
                  </p>
                </>
              ) : (
                <div className="workspace-meeting-empty">
                  <div className="icon">··</div>
                  No transcript yet. It fills in once the meeting starts recording.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {meeting.hasRecap || isLive ? (
        <PromptInput placeholder={`Ask about ${meeting.title}…`} />
      ) : (
        <div className="workspace-meeting-start-panel">
          <div className="workspace-meeting-start-panel-inner">
            <span className="workspace-meeting-start-panel-text">
              <strong>Ready when you are.</strong> The bot joins instantly · stays private until you approve.
            </span>
            <button type="button" className="workspace-meeting-start">
              <span className="dot" />
              Start recording
            </button>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

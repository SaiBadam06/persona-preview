'use client';

import { useState } from 'react';
import { MessageSquare, AlertCircle } from 'lucide-react';

import { MOCK_VISITOR_SESSIONS, type VisitorSession } from '../mockData';
import { WorkspaceTopBar } from '../WorkspaceTopBar';
import { PromptInput } from '../PromptInput';

function initials(name: string): string {
  if (name === 'Anonymous') return '·';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

export default function VisitorsPage(): React.JSX.Element {
  const [open, setOpen] = useState<VisitorSession | null>(null);
  const totalQuestions = MOCK_VISITOR_SESSIONS.reduce((sum, s) => sum + s.turns.length, 0);
  const unanswered = MOCK_VISITOR_SESSIONS.reduce(
    (sum, s) => sum + s.turns.filter((t) => !t.hadCitation).length,
    0,
  );

  return (
    <>
      <WorkspaceTopBar crumb="Workspace" title="Visitors" />
      <div className="workspace-canvas">
        <div className="workspace-canvas-inner">
          <header className="mb-8">
            <h1 className="workspace-display-lg">Visitors</h1>
            <p className="workspace-meta" style={{ marginTop: 8 }}>
              {MOCK_VISITOR_SESSIONS.length} conversations with your persona · {totalQuestions} questions asked ·{' '}
              {unanswered > 0 ? (
                <span style={{ color: 'var(--w-accent)' }}>{unanswered} unanswered</span>
              ) : (
                'all answered'
              )}
            </p>
          </header>

          {!open ? (
            <div>
              {MOCK_VISITOR_SESSIONS.map((s) => {
                const firstQ = s.turns[0]?.q ?? '';
                const hasGap = s.turns.some((t) => !t.hadCitation);
                return (
                  <button
                    key={s.id}
                    type="button"
                    className="workspace-visitor-row"
                    onClick={() => setOpen(s)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                  >
                    <span className="workspace-visitor-avatar">{initials(s.visitor)}</span>
                    <div style={{ minWidth: 0 }}>
                      <p className="workspace-visitor-row-title">
                        <span>{s.visitor}</span>
                        <span className="when">· {s.when}</span>
                        {hasGap && (
                          <span style={{ color: 'var(--w-accent)', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 400 }}>
                            <AlertCircle className="h-3 w-3" /> unanswered
                          </span>
                        )}
                      </p>
                      <p className="workspace-visitor-row-excerpt">"{firstQ}"</p>
                    </div>
                    <div className="workspace-visitor-row-meta" style={{ textAlign: 'right' }}>
                      <div>{s.turns.length} q · {s.source}</div>
                      {s.city && <div style={{ marginTop: 2, color: 'var(--w-ink-4)' }}>{s.city}</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setOpen(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  fontFamily: 'inherit',
                  fontSize: 13,
                  color: 'var(--w-ink-3)',
                  marginBottom: 16,
                  cursor: 'pointer',
                }}
              >
                ← All visitors
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 24,
                  paddingBottom: 16,
                  borderBottom: '1px solid var(--w-hairline)',
                }}
              >
                <span className="workspace-visitor-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
                  {initials(open.visitor)}
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: 18, fontFamily: 'var(--w-font-display)' }}>{open.visitor}</p>
                  <p className="workspace-meta" style={{ margin: '2px 0 0' }}>
                    {open.when} · via {open.source}
                    {open.city && <> · {open.city}</>}
                    {open.visitorEmail && (
                      <>
                        {' '}· <span className="workspace-mono">{open.visitorEmail}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {open.turns.map((t, i) => (
                  <div key={i}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          background: 'var(--w-bg-active)',
                          color: 'var(--w-ink)',
                          padding: '10px 14px',
                          borderRadius: '18px 18px 4px 18px',
                          fontSize: 14,
                          maxWidth: '80%',
                          lineHeight: 1.5,
                        }}
                      >
                        {t.q}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                      }}
                    >
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 999,
                          background: 'var(--w-ink)',
                          color: '#fff',
                          fontFamily: 'var(--w-font-display)',
                          fontSize: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        A
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: 'var(--w-ink)' }}>
                          {t.a}
                        </p>
                        {!t.hadCitation && (
                          <p
                            style={{
                              marginTop: 6,
                              fontSize: 12,
                              color: 'var(--w-accent)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <AlertCircle className="h-3 w-3" />
                            No verified source — consider adding a fact via Review.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 32, padding: 16, background: 'var(--w-bg-quiet)', borderRadius: 12 }}>
                <p className="workspace-meta" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare className="h-3.5 w-3.5" />
                  This conversation became part of your persona's training signal.
                  Unanswered questions are flagged so you can teach a fact in Review.
                </p>
              </div>
            </div>
          )}
        </div>

        <PromptInput placeholder="Ask: what are visitors asking about most?" />
      </div>
    </>
  );
}

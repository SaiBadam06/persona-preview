'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, Check, Lock, MessageSquare, Sparkles, X } from 'lucide-react';

import { MOCK_REVIEW_CANDIDATES, type ReviewCandidate } from '../mockData';
import { WorkspaceTopBar } from '../WorkspaceTopBar';
import { PromptInput } from '../PromptInput';

type Tab = 'all' | 'by-meeting';

function iconForType(type: ReviewCandidate['type']): React.JSX.Element {
  if (type === 'Question') return <MessageSquare className="h-3.5 w-3.5" />;
  if (type === 'Action') return <Sparkles className="h-3.5 w-3.5" />;
  return <Check className="h-3.5 w-3.5" />;
}

export default function ReviewPage(): React.JSX.Element {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<Tab>('all');
  const items = MOCK_REVIEW_CANDIDATES.filter((i) => !dismissed.has(i.id));

  const byMeeting = useMemo(() => {
    const groups = new Map<string, { title: string; when: string; items: ReviewCandidate[] }>();
    for (const item of items) {
      const key = item.meetingId || 'queued-questions';
      const existing = groups.get(key);
      if (existing) existing.items.push(item);
      else
        groups.set(key, {
          title: item.meetingTitle,
          when: item.meetingWhen,
          items: [item],
        });
    }
    return Array.from(groups.entries());
  }, [items]);

  const dismiss = (id: string) => setDismissed((s) => new Set(s).add(id));
  const dismissMany = (ids: string[]) =>
    setDismissed((s) => {
      const next = new Set(s);
      ids.forEach((id) => next.add(id));
      return next;
    });

  return (
    <>
      <WorkspaceTopBar crumb="Workspace" title="Review" />
      <div className="workspace-canvas">
        <div className="workspace-canvas-inner">
          <header className="mb-8">
            <h1 className="workspace-display-lg">Review</h1>
            <p className="workspace-meta" style={{ marginTop: 8 }}>
              {items.length} candidate{items.length === 1 ? '' : 's'} waiting. Nothing reaches your
              persona until you approve. Each approval visibly expands what visitors can ask.
            </p>
          </header>

          <nav className="workspace-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === 'all'}
              onClick={() => setTab('all')}
              className={`workspace-tab ${tab === 'all' ? 'is-active' : ''}`}
            >
              All
            </button>
            <button
              role="tab"
              aria-selected={tab === 'by-meeting'}
              onClick={() => setTab('by-meeting')}
              className={`workspace-tab ${tab === 'by-meeting' ? 'is-active' : ''}`}
            >
              By meeting
            </button>
          </nav>

          {items.length === 0 ? (
            <div
              className="workspace-meta"
              style={{
                padding: '32px 20px',
                border: '1px dashed var(--w-hairline-2)',
                borderRadius: 12,
                textAlign: 'center',
              }}
            >
              You're caught up.
            </div>
          ) : tab === 'all' ? (
            <div className="workspace-review-list">
              {items.map((item) => (
                <ReviewCard key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
              ))}
            </div>
          ) : (
            <div>
              {byMeeting.map(([key, group]) => (
                <section key={key} className="workspace-review-meeting-group">
                  <div className="workspace-review-meeting-header">
                    <div>
                      <h3>{group.title}</h3>
                      <p className="workspace-meta">{group.when}</p>
                    </div>
                    <button
                      type="button"
                      className="workspace-quiet-btn"
                      style={{
                        background: 'var(--w-ink)',
                        color: 'var(--w-bg-app)',
                        borderColor: 'var(--w-ink)',
                      }}
                      onClick={() => dismissMany(group.items.map((i) => i.id))}
                    >
                      Approve all {group.items.length}
                    </button>
                  </div>
                  <div className="workspace-review-list">
                    {group.items.map((item) => (
                      <ReviewCard key={item.id} item={item} onDismiss={() => dismiss(item.id)} compact />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <PromptInput placeholder="Ask: what's about to become persona knowledge?" />
      </div>

      <style jsx>{`
        .workspace-review-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .workspace-review-meeting-group {
          margin-bottom: 32px;
        }
        .workspace-review-meeting-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 12px;
          padding: 0 0 12px;
          margin-bottom: 12px;
          border-bottom: 1px solid var(--w-hairline);
        }
        .workspace-review-meeting-header h3 {
          font-family: var(--w-font-display);
          font-weight: 400;
          font-size: 20px;
          color: var(--w-ink);
          margin: 0;
        }
      `}</style>
    </>
  );
}

function ReviewCard({
  item,
  onDismiss,
  compact = false,
}: {
  item: ReviewCandidate;
  onDismiss: () => void;
  compact?: boolean;
}): React.JSX.Element {
  return (
    <article className="workspace-review-card">
      <header className="workspace-review-card-header">
        <span className="workspace-chip" style={{ gap: 6 }}>
          {iconForType(item.type)}
          {item.type === 'Question' ? 'Visitor question' : item.type === 'Action' ? 'Action' : 'Memory candidate'}
        </span>
        <span className="workspace-mono">{item.topic}</span>
      </header>

      <p className="workspace-review-fact">{item.fact}</p>

      {!compact && (
        <p className="workspace-meta workspace-review-source">
          {item.meetingId ? (
            <Link
              href={`/workspace/meeting/${item.meetingId}`}
              style={{ color: 'var(--w-ink-2)', textDecoration: 'none' }}
            >
              {item.meetingTitle}
            </Link>
          ) : (
            item.meetingTitle
          )}
          {' · '}
          {item.meetingWhen}
        </p>
      )}

      {item.mentionsThirdParty && (
        <div className="workspace-review-warning">
          <Lock className="h-3.5 w-3.5" />
          Mentions {item.mentionsThirdParty}. Approve only if it's OK to share publicly.
        </div>
      )}

      <div className="workspace-review-unlocks">
        <p className="workspace-meta" style={{ color: 'var(--w-ink-2)', fontWeight: 500, marginBottom: 6 }}>
          <ArrowRight className="inline-block h-3 w-3" style={{ marginRight: 6, marginTop: -2 }} />
          Unlocks answers to visitor questions like:
        </p>
        <ul className="workspace-review-unlocks-list">
          {item.unlocks.map((q) => (
            <li key={q}>"{q}"</li>
          ))}
        </ul>
      </div>

      <div className="workspace-review-actions">
        <button
          type="button"
          className="workspace-quiet-btn"
          style={{
            background: 'var(--w-ink)',
            color: 'var(--w-bg-app)',
            borderColor: 'var(--w-ink)',
          }}
          onClick={onDismiss}
        >
          <Check className="h-3 w-3" />
          Approve
        </button>
        <button type="button" className="workspace-quiet-btn" onClick={onDismiss}>
          Edit & approve
        </button>
        <button type="button" className="workspace-quiet-btn" onClick={onDismiss}>
          Keep private
        </button>
        <button
          type="button"
          className="workspace-quiet-btn"
          onClick={onDismiss}
          style={{ color: 'var(--w-ink-3)' }}
        >
          <X className="h-3 w-3" />
          Ignore
        </button>
      </div>

      <style jsx>{`
        .workspace-review-card {
          padding: 18px 20px;
          background: var(--w-bg-canvas);
          border: 1px solid var(--w-hairline);
          border-radius: 12px;
          transition: border-color 80ms ease;
        }
        .workspace-review-card:hover {
          border-color: var(--w-hairline-2);
        }
        .workspace-review-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }
        .workspace-review-fact {
          font-family: var(--w-font-display);
          font-size: 19px;
          line-height: 1.35;
          color: var(--w-ink);
          margin: 0 0 6px;
          letter-spacing: -0.003em;
        }
        .workspace-review-source {
          margin: 0 0 14px;
        }
        .workspace-review-warning {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          background: rgba(201, 100, 66, 0.07);
          border-radius: 8px;
          font-size: 12.5px;
          color: var(--w-accent);
          margin: 0 0 12px;
        }
        .workspace-review-unlocks {
          padding: 12px 14px;
          background: var(--w-bg-quiet);
          border-radius: 10px;
          margin: 0 0 14px;
        }
        .workspace-review-unlocks-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-family: var(--w-font-display);
          font-style: italic;
          font-size: 14.5px;
          color: var(--w-ink-2);
        }
        .workspace-review-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
      `}</style>
    </article>
  );
}

// Silence unused-import warning for AlertTriangle (kept available for future warning variants)
void AlertTriangle;

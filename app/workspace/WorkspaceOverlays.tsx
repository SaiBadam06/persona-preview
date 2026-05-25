'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  Calendar,
  Copy,
  Eye,
  FileAudio,
  Globe,
  LayoutGrid,
  Link2,
  Mic,
  Search,
  Settings,
  Sparkles,
  User,
  Video,
  X,
} from 'lucide-react';

import {
  MOCK_PERSONA,
  MOCK_PERSONA_MEMORY,
  MOCK_VISITOR_ANSWERS,
  ROUTINE_TEMPLATES,
  buildCommandIndex,
  type CommandResult,
  type Routine,
  type RoutineCadence,
  type VisitorCannedAnswer,
} from './mockData';
import Link from 'next/link';

function useOverlayParam(key: string): { value: string | null; set: (v: string | null) => void } {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const value = search.get(key);

  const set = useCallback(
    (next: string | null) => {
      const params = new URLSearchParams(search.toString());
      if (next == null) params.delete(key);
      else params.set(key, next);
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [key, pathname, router, search],
  );

  return { value, set };
}

function PersonaDrawer({ onClose }: { onClose: () => void }): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(MOCK_PERSONA.shareLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <>
      <div className="workspace-drawer-backdrop" onClick={onClose} />
      <aside className="workspace-drawer" role="dialog" aria-label="Persona settings">
        <header className="workspace-drawer-header">
          <div className="workspace-drawer-title">
            <div className="avatar">{MOCK_PERSONA.initial}</div>
            <div>
              <div className="name">{MOCK_PERSONA.displayName}</div>
              <div className="ready">Public-ready · {MOCK_PERSONA.publicReadiness}%</div>
            </div>
          </div>
          <button className="workspace-drawer-close" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="workspace-drawer-body">
          {/* Share */}
          <section className="workspace-drawer-section">
            <h3>Share</h3>
            <div className="workspace-share-link">
              <span className="url">{MOCK_PERSONA.shareLink}</span>
              <button
                onClick={copy}
                className="workspace-quiet-btn"
                style={{ padding: '0 10px', height: 26, fontSize: 12 }}
              >
                <Copy className="h-3 w-3" />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="workspace-quiet-row">
              <a href="?view=visitor" className="workspace-quiet-btn" style={{ textDecoration: 'none' }}>
                <Eye className="h-3 w-3" />
                View as visitor
              </a>
              <button className="workspace-quiet-btn">QR / Print</button>
            </div>

            <details style={{ marginTop: 14 }}>
              <summary
                style={{
                  cursor: 'pointer',
                  fontSize: 12.5,
                  color: 'var(--w-ink-2)',
                  padding: '6px 0',
                  listStyle: 'none',
                  fontWeight: 500,
                }}
              >
                Website embed ↓
              </summary>
              <p className="workspace-meta" style={{ margin: '6px 0 8px' }}>
                Drop this snippet into any page to add your persona as a chat widget.
              </p>
              <pre
                style={{
                  margin: 0,
                  padding: 12,
                  background: '#1F1E1B',
                  color: '#FAF9F5',
                  borderRadius: 10,
                  fontFamily: 'var(--w-font-mono)',
                  fontSize: 11.5,
                  lineHeight: 1.55,
                  overflowX: 'auto',
                  whiteSpace: 'pre',
                }}
              >{`<script async src="https://personaon.com/embed.js"
        data-persona="avery"></script>`}</pre>
              <div className="workspace-quiet-row">
                <button className="workspace-quiet-btn">Copy snippet</button>
                <button className="workspace-quiet-btn">Customize widget</button>
              </div>
            </details>
          </section>

          {/* Readiness */}
          <section className="workspace-drawer-section">
            <h3>Public readiness</h3>
            <div className="workspace-readiness">
              <div className="workspace-readiness-bar">
                <div
                  className="workspace-readiness-fill"
                  style={{ width: `${MOCK_PERSONA.publicReadiness}%` }}
                />
              </div>
              <div className="workspace-readiness-pct">{MOCK_PERSONA.publicReadiness}%</div>
            </div>
            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--w-ink-3)' }}>
              {MOCK_PERSONA.allowedTopics.length} topic
              {MOCK_PERSONA.allowedTopics.length === 1 ? '' : 's'} approved for public answers.
              Add more by approving meeting memory in Review.
            </p>
          </section>

          {/* Identity */}
          <section className="workspace-drawer-section">
            <h3>Identity</h3>
            <div className="workspace-drawer-row">
              <span className="label">Name</span>
              <span className="value">{MOCK_PERSONA.displayName}</span>
            </div>
            <div className="workspace-drawer-row">
              <span className="label">Handle</span>
              <span className="value workspace-mono">@{MOCK_PERSONA.handle}</span>
            </div>
            <div className="workspace-drawer-row">
              <span className="label">Headline</span>
              <span className="value">{MOCK_PERSONA.headline}</span>
            </div>
            <p style={{ marginTop: 12 }}>{MOCK_PERSONA.bio}</p>
          </section>

          {/* What persona can say — from meetings + seeds */}
          <section className="workspace-drawer-section">
            <h3>What your persona can say · from meetings</h3>
            <div className="workspace-memory-tree">
              {Object.entries(MOCK_PERSONA_MEMORY).map(([topic, facts]) => (
                <div key={topic} className="workspace-memory-topic">
                  <div className="workspace-memory-topic-header">
                    <span className="topic-name">{topic}</span>
                    <span className="workspace-mono">{facts.length}</span>
                  </div>
                  <ul className="workspace-memory-facts">
                    {facts.map((f, i) => (
                      <li key={`${topic}-${i}`}>
                        <span className="fact-text">{f.fact}</span>
                        {f.meetingId ? (
                          <Link href={`/workspace/meeting/${f.meetingId}`} className="fact-source">
                            {f.meetingTitle} · {f.when}
                          </Link>
                        ) : (
                          <span className="fact-source seed">{f.meetingTitle} · {f.when}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="workspace-quiet-row">
              <button className="workspace-quiet-btn">Add knowledge</button>
              <Link href="/workspace/review" className="workspace-quiet-btn" style={{ textDecoration: 'none' }}>
                Open Review
              </Link>
            </div>

            <style jsx>{`
              .workspace-memory-tree {
                display: flex;
                flex-direction: column;
                gap: 14px;
              }
              .workspace-memory-topic {
                background: var(--w-bg-quiet);
                border-radius: 10px;
                padding: 12px 14px;
              }
              .workspace-memory-topic-header {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                margin-bottom: 8px;
              }
              .topic-name {
                font-size: 13px;
                font-weight: 500;
                color: var(--w-ink);
              }
              .workspace-memory-facts {
                list-style: none;
                padding: 0;
                margin: 0;
                display: flex;
                flex-direction: column;
                gap: 8px;
              }
              .workspace-memory-facts li {
                font-size: 13px;
                line-height: 1.45;
                color: var(--w-ink-2);
              }
              .fact-text {
                display: block;
              }
              .fact-source {
                display: block;
                font-size: 11.5px;
                color: var(--w-ink-3);
                margin-top: 2px;
                text-decoration: none;
              }
              .fact-source:not(.seed):hover {
                color: var(--w-ink);
                text-decoration: underline;
              }
              .fact-source.seed {
                font-style: italic;
              }
            `}</style>
          </section>

          {/* Pinned questions */}
          <section className="workspace-drawer-section">
            <h3>Pinned questions (shown to visitors)</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {MOCK_PERSONA.pinnedQuestions.map((q) => (
                <li
                  key={q}
                  style={{
                    padding: '8px 0',
                    borderBottom: '1px solid var(--w-hairline)',
                    fontSize: 14,
                    color: 'var(--w-ink-2)',
                  }}
                >
                  {q}
                </li>
              ))}
            </ul>
          </section>

          {/* Voice */}
          <section className="workspace-drawer-section">
            <h3>Voice (beta)</h3>
            <p style={{ color: 'var(--w-ink-3)', fontSize: 13 }}>{MOCK_PERSONA.voice.label}</p>
            <div className="workspace-quiet-row">
              <button className="workspace-quiet-btn">Set up voice clone</button>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}

function VisitorMode({ onClose }: { onClose: () => void }): React.JSX.Element {
  const [thread, setThread] = useState<VisitorCannedAnswer | null>(null);
  const [openSource, setOpenSource] = useState<number | null>(null);
  const [draft, setDraft] = useState('');

  const ask = (question: string) => {
    const canned = MOCK_VISITOR_ANSWERS[question];
    if (canned) {
      setThread(canned);
    } else {
      // Fallback: graceful "I don't know" with hint
      setThread({
        question,
        answer:
          "I don't have a verified answer to that yet. Avery hasn't approved any memory on this topic — but I can pass the question along.",
        sources: [],
      });
    }
    setOpenSource(null);
    setDraft('');
  };

  return (
    <div className="workspace-visitor-root">
      <header className="workspace-visitor-topbar">
        <button className="workspace-visitor-pill" onClick={onClose}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to workspace
        </button>
        <span className="workspace-visitor-eyebrow">Preview · how visitors see {MOCK_PERSONA.displayName}</span>
        <div style={{ width: 180 }} />
      </header>

      <main className="workspace-visitor-stage">
        <div className="workspace-visitor-hero">
          <div className="workspace-visitor-avatar">{MOCK_PERSONA.initial}</div>
          <h1 className="workspace-visitor-name">{MOCK_PERSONA.displayName}</h1>
          <p className="workspace-visitor-headline">{MOCK_PERSONA.headline}</p>

          {!thread && (
            <div className="workspace-visitor-suggestions">
              {MOCK_PERSONA.pinnedQuestions.map((q) => (
                <button
                  key={q}
                  className="workspace-visitor-suggestion"
                  onClick={() => ask(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        {thread && (
          <div className="workspace-visitor-thread">
            <div className="workspace-visitor-message-q">
              <span>{thread.question}</span>
            </div>
            <div className="workspace-visitor-message-a">{thread.answer}</div>
            {thread.sources.length > 0 && (
              <>
                <p
                  className="workspace-visitor-eyebrow"
                  style={{ marginTop: 18, marginBottom: 6, textTransform: 'none', letterSpacing: 0 }}
                >
                  {thread.sources.length} verified source{thread.sources.length === 1 ? '' : 's'} · click to see the exact quote
                </p>
                <div className="workspace-visitor-sources">
                  {thread.sources.map((s, i) => {
                    const isOpen = openSource === i;
                    return (
                      <button
                        key={`${s.meetingTitle}-${i}`}
                        type="button"
                        className="workspace-visitor-source"
                        onClick={() => setOpenSource(isOpen ? null : i)}
                        style={{
                          border: 'none',
                          cursor: 'pointer',
                          background: isOpen ? 'var(--w-ink)' : 'rgba(31,30,27,0.05)',
                          color: isOpen ? 'var(--w-bg-app)' : 'var(--w-ink-2)',
                        }}
                      >
                        <span>{s.meetingTitle}</span>
                        <span style={{ color: isOpen ? 'rgba(255,255,255,0.55)' : 'var(--w-ink-4)' }}>
                          · {s.date}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {openSource !== null && thread.sources[openSource] && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: '14px 16px',
                      background: '#fff',
                      border: '1px solid rgba(31,30,27,0.08)',
                      borderRadius: 12,
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: 'var(--w-ink-2)',
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontFamily: 'var(--w-font-display)',
                        fontStyle: 'italic',
                        fontSize: 16,
                        color: 'var(--w-ink)',
                      }}
                    >
                      "{thread.sources[openSource].excerpt}"
                    </p>
                    <p
                      style={{
                        margin: '10px 0 0',
                        fontSize: 12,
                        color: 'var(--w-ink-3)',
                      }}
                    >
                      from {thread.sources[openSource].meetingTitle} · {thread.sources[openSource].date}
                      {thread.sources[openSource].meetingId && (
                        <> · <span style={{ color: 'var(--w-accent)' }}>verified by Avery</span></>
                      )}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="workspace-visitor-prompt">
          <form
            className="workspace-prompt-shell"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) ask(draft.trim());
            }}
          >
            <textarea
              className="workspace-prompt-input"
              rows={1}
              placeholder={`Ask ${MOCK_PERSONA.displayName} anything…`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (draft.trim()) ask(draft.trim());
                }
              }}
            />
            <button
              type="submit"
              className="workspace-prompt-send"
              disabled={!draft.trim()}
              aria-label="Send"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

// =============================================================================
// Settings — centered modal with left nav + right content panel
// =============================================================================

type SettingsSection =
  | 'general'
  | 'notifications'
  | 'meetings'
  | 'persona-defaults'
  | 'privacy'
  | 'integrations'
  | 'shortcuts'
  | 'subscription';

const SETTINGS_NAV: { id: SettingsSection; label: string; icon: React.JSX.Element }[] = [
  { id: 'general',          label: 'General',           icon: <Settings className="icon" /> },
  { id: 'notifications',    label: 'Notifications',     icon: <ArrowUp className="icon" /> },
  { id: 'meetings',         label: 'Meetings',          icon: <Calendar className="icon" /> },
  { id: 'persona-defaults', label: 'Persona behavior',  icon: <Sparkles className="icon" /> },
  { id: 'privacy',          label: 'Privacy & memory',  icon: <Eye className="icon" /> },
  { id: 'integrations',     label: 'Integrations',      icon: <Link2 className="icon" /> },
  { id: 'shortcuts',        label: 'Keyboard shortcuts', icon: <ArrowUp className="icon" /> },
  { id: 'subscription',     label: 'Subscription',      icon: <Settings className="icon" /> },
];

function SettingsModal({ section, onSelect, onClose }: {
  section: SettingsSection;
  onSelect: (s: SettingsSection) => void;
  onClose: () => void;
}): React.JSX.Element {
  return (
    <div className="workspace-settings-backdrop" onClick={onClose}>
      <div className="workspace-settings-modal" onClick={(e) => e.stopPropagation()}>
        <nav className="workspace-settings-nav">
          <div className="workspace-settings-nav-label">SETTINGS</div>
          {SETTINGS_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`workspace-settings-nav-item ${section === item.id ? 'is-active' : ''}`}
              onClick={() => onSelect(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <div className="workspace-settings-nav-version">PersonaOn v0.78.15</div>
        </nav>

        <div className="workspace-settings-content">
          <button type="button" className="workspace-settings-close" onClick={onClose} aria-label="Close settings">
            <X className="h-4 w-4" />
          </button>
          {section === 'general' && <SettingsGeneral />}
          {section === 'notifications' && <SettingsNotifications />}
          {section === 'meetings' && <SettingsMeetings />}
          {section === 'persona-defaults' && <SettingsPersonaDefaults />}
          {section === 'privacy' && <SettingsPrivacy />}
          {section === 'integrations' && <SettingsIntegrations />}
          {section === 'shortcuts' && <SettingsShortcuts />}
          {section === 'subscription' && <SettingsSubscription />}
        </div>
      </div>
    </div>
  );
}

function SettingsHeader({ title, primary }: { title: string; primary?: { label: string; icon?: React.JSX.Element } }) {
  return (
    <header className="workspace-settings-content-header">
      <h2>{title}</h2>
      {primary && (
        <button type="button" className="workspace-settings-cta-dark">
          {primary.icon}
          {primary.label}
        </button>
      )}
    </header>
  );
}

function Field({ title, help, value }: { title: string; help?: string; value: React.ReactNode }) {
  return (
    <div className="workspace-field">
      <div className="workspace-field-label">
        <p className="title">{title}</p>
        {help && <p className="help">{help}</p>}
      </div>
      <div className="workspace-field-value">{value}</div>
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  const [v, setV] = useState(on);
  return <button type="button" className={`workspace-toggle ${v ? 'is-on' : ''}`} onClick={() => setV(!v)} aria-pressed={v} />;
}

function SettingsGeneral() {
  return (
    <>
      <SettingsHeader title="General" />
      <div className="workspace-settings-body">
        <h3 className="workspace-section-h3">Account</h3>
        <Field title="Name" value="Avery Stone" />
        <Field title="Email" value={<span className="workspace-mono">avery@personaon.com</span>} />
        <Field title="Workspace" value="Solo (1 person)" />
        <Field title="Language" value="English (US)" />
        <h3 className="workspace-section-h3">Appearance</h3>
        <Field title="Theme" help="Warm parchment is the only theme right now." value="Warm light" />
        <Field title="Density" value="Comfortable" />
        <Field title="Reduce motion" help="Honors your OS setting too." value={<Toggle on={false} />} />

        <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--w-hairline)' }}>
          <button
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontFamily: 'inherit',
              fontSize: 13,
              color: 'var(--w-ink-3)',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              textDecorationColor: 'var(--w-ink-4)',
            }}
          >
            Sign out
          </button>
          <span style={{ color: 'var(--w-ink-4)', margin: '0 10px' }}>·</span>
          <button
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontFamily: 'inherit',
              fontSize: 13,
              color: 'var(--w-ink-3)',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              textDecorationColor: 'var(--w-ink-4)',
            }}
          >
            Delete account
          </button>
        </div>
      </div>
    </>
  );
}

function SettingsNotifications() {
  return (
    <>
      <SettingsHeader title="Notifications" />
      <div className="workspace-settings-body">
        <h3 className="workspace-section-h3">Meetings</h3>
        <Field title="Meeting starting soon" help="Heads-up before a calendar event begins." value="Email · 10 min before" />
        <Field title="Recording started" help="When a bot joins or you start recording." value={<Toggle on={true} />} />
        <Field title="Recap ready" help="When transcript and summary finish processing." value={<Toggle on={true} />} />

        <h3 className="workspace-section-h3">Persona &amp; visitors</h3>
        <Field title="Visitor asked your persona" help="When someone chats with your public link." value="Real time" />
        <Field title="Unanswered question detected" help="When your persona had to say 'I don't know'." value={<Toggle on={true} />} />
        <Field title="New memory candidates" help="Things to approve from recent meetings." value={<Toggle on={true} />} />

        <div
          style={{
            marginTop: 24,
            padding: 14,
            background: 'var(--w-bg-quiet)',
            borderRadius: 10,
            fontSize: 13,
            color: 'var(--w-ink-2)',
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: 'var(--w-ink)' }}>Looking for the daily digest?</strong> Recurring
          summaries (morning brief, end-of-day wrap-up, weekly reflection) live in{' '}
          <Link href="/workspace/routines" style={{ color: 'var(--w-accent)' }}>Routines</Link> so you
          can pick the cadence and what they cover.
        </div>
      </div>
    </>
  );
}

function SettingsMeetings() {
  return (
    <>
      <SettingsHeader title="Meetings & recording" />
      <div className="workspace-settings-body">
        <h3 className="workspace-section-h3">Recording rules</h3>
        <Field title="Default behavior" help="What happens when a calendar meeting starts." value="Ask before each meeting" />
        <Field title="Auto-record" help="Skip the ask for specific calendars or attendee patterns." value="Internal team meetings only" />
        <Field title="Notify other attendees of recording" help="Posts a chat / email notice when the bot joins." value={<Toggle on={true} />} />
        <h3 className="workspace-section-h3">Transcription</h3>
        <Field title="Speaker labels" value={<Toggle on={true} />} />
        <Field title="Auto-detect language" value={<Toggle on={true} />} />
        <Field title="Save raw audio" help="Audio is deleted after 90 days unless saved." value={<Toggle on={false} />} />
        <h3 className="workspace-section-h3">Storage</h3>
        <Field title="Recordings used" value={<span className="workspace-mono">3.2 GB / unlimited</span>} />
      </div>
    </>
  );
}

function SettingsPersonaDefaults() {
  return (
    <>
      <SettingsHeader title="Persona behavior" />
      <div className="workspace-settings-body">
        <h3 className="workspace-section-h3">Voice</h3>
        <Field title="Tone" value="Direct, calm, practical" />
        <Field title="Response length" value="Short by default; expand when asked" />
        <Field title="Always cite sources" value={<Toggle on={true} />} />
        <Field title="Refuse to guess" help="Say 'I don't know' rather than fabricate." value={<Toggle on={true} />} />
        <h3 className="workspace-section-h3">Boundaries</h3>
        <Field title="Mention third parties only if approved" value={<Toggle on={true} />} />
        <Field title="Decline questions about pricing without permission" value={<Toggle on={false} />} />
      </div>
    </>
  );
}

function SettingsPrivacy() {
  return (
    <>
      <SettingsHeader title="Privacy & memory" />
      <div className="workspace-settings-body">
        <h3 className="workspace-section-h3">Defaults</h3>
        <Field title="Meetings private by default" help="Recordings are never shared automatically." value={<Toggle on={true} />} />
        <Field title="Review required before learning" help="No fact joins your persona without your approval." value={<Toggle on={true} />} />
        <Field title="Flag third-party mentions" help="Hold back memories that quote other people until you confirm." value={<Toggle on={true} />} />

        <h3 className="workspace-section-h3">Visitor history</h3>
        <Field title="Log questions visitors ask" value={<Toggle on={true} />} />
        <Field title="Keep visitor emails" help="Only when they sign in or share contact info." value={<Toggle on={true} />} />

        <h3 className="workspace-section-h3">Your data</h3>
        <Field
          title="Export all memory"
          help="JSON dump of every meeting, recap, and approved fact. You own this — take it anywhere."
          value={<button className="workspace-quiet-btn">Export</button>}
        />
        <Field title="Region" value="US-West (Oregon)" />
        <Field title="Encryption at rest" value="AES-256" />
      </div>
    </>
  );
}

function SettingsIntegrations() {
  return (
    <>
      <SettingsHeader title="Your integrations" primary={{ label: 'Add integration', icon: <span style={{ fontSize: 14 }}>+</span> }} />
      <div className="workspace-settings-body">
        <article className="workspace-integration-card">
          <div className="workspace-integration-header">
            <div className="workspace-integration-logo" style={{ background: '#fff', color: '#EA4335' }}>G</div>
            <div className="workspace-integration-meta">
              <p className="workspace-integration-name">Google Calendar</p>
              <p className="workspace-integration-desc">See and record meetings from your calendar.</p>
            </div>
          </div>
          <div className="workspace-integration-account">
            <span className="email">avery@personaon.com</span>
            <span className="secondary">avery@personaon.com</span>
            <span className="workspace-integration-connected">Connected</span>
            <button className="workspace-icon-btn" aria-label="Edit"><Settings className="h-3.5 w-3.5" /></button>
          </div>
          <button type="button" className="workspace-integration-add">+ Add another account</button>
        </article>

        <article className="workspace-integration-card">
          <div className="workspace-integration-header">
            <div className="workspace-integration-logo" style={{ background: '#fff', color: '#EA4335' }}>M</div>
            <div className="workspace-integration-meta">
              <p className="workspace-integration-name">Gmail</p>
              <p className="workspace-integration-desc">Pull meeting context from your inbox.</p>
            </div>
          </div>
          <div className="workspace-integration-account">
            <span className="email">avery@personaon.com</span>
            <span className="secondary">avery@personaon.com</span>
            <span className="workspace-integration-connected">Connected</span>
            <button className="workspace-icon-btn" aria-label="Edit"><Settings className="h-3.5 w-3.5" /></button>
          </div>
          <button type="button" className="workspace-integration-add">+ Add another account</button>
        </article>

        <article className="workspace-integration-card">
          <div className="workspace-integration-header">
            <div className="workspace-integration-logo" style={{ background: '#4A154B', color: '#fff' }}>S</div>
            <div className="workspace-integration-meta">
              <p className="workspace-integration-name">Slack</p>
              <p className="workspace-integration-desc">Post recaps and follow-ups to channels.</p>
            </div>
            <button type="button" className="workspace-settings-cta-dark" style={{ padding: '6px 12px' }}>Connect</button>
          </div>
        </article>

        <article className="workspace-integration-card">
          <div className="workspace-integration-header">
            <div className="workspace-integration-logo" style={{ background: '#0F0F23', color: '#fff' }}>L</div>
            <div className="workspace-integration-meta">
              <p className="workspace-integration-name">Linear</p>
              <p className="workspace-integration-desc">Turn action items into issues automatically.</p>
            </div>
            <button type="button" className="workspace-settings-cta-dark" style={{ padding: '6px 12px' }}>Connect</button>
          </div>
        </article>
      </div>
    </>
  );
}

function SettingsShortcuts() {
  const rows: [string, string][] = [
    ['Open command palette', '⌘K'],
    ['Open persona drawer', '⌘P'],
    ['Open settings', '⌘,'],
    ['Record a meeting', '⌘⇧R'],
    ['View as visitor', '⌘⇧V'],
    ['Close any overlay', 'Esc'],
  ];
  return (
    <>
      <SettingsHeader title="Keyboard shortcuts" />
      <div className="workspace-settings-body">
        {rows.map(([label, kbd]) => (
          <div key={label} className="workspace-field">
            <div className="workspace-field-label">
              <p className="title">{label}</p>
            </div>
            <div className="workspace-field-value">
              <span className="workspace-cmd-kbd">{kbd}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SettingsSubscription() {
  return (
    <>
      <SettingsHeader title="Subscription" primary={{ label: 'Manage billing' }} />
      <div className="workspace-settings-body">
        <h3 className="workspace-section-h3">Plan</h3>
        <Field title="Current plan" value="Pro · $39/month" />
        <Field title="Meetings this month" value={<span className="workspace-mono">7 / unlimited</span>} />
        <Field title="Next charge" value="June 6 · $39.00" />
        <Field title="Payment method" value="Visa ending 4242" />
        <h3 className="workspace-section-h3">Usage</h3>
        <Field title="Memory candidates approved" value={<span className="workspace-mono">42 this month</span>} />
        <Field title="Visitor questions answered" value={<span className="workspace-mono">128 this month</span>} />
      </div>
    </>
  );
}


function RecordModal({ onClose }: { onClose: () => void }): React.JSX.Element {
  const [meetingLink, setMeetingLink] = useState('');
  return (
    <div className="workspace-modal-backdrop" onClick={onClose}>
      <div className="workspace-modal" onClick={(e) => e.stopPropagation()}>
        <header className="workspace-modal-header">
          <span className="workspace-modal-title">Record a meeting</span>
          <button className="workspace-drawer-close" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="workspace-modal-body">
          <p className="workspace-meta" style={{ marginTop: 0, marginBottom: 14 }}>
            Pick how you want to capture this one. Default behavior lives in Settings.
          </p>

          <button type="button" className="workspace-record-option">
            <span className="workspace-record-option-icon"><Link2 className="h-4 w-4" /></span>
            <span style={{ flex: 1 }}>
              <p className="workspace-record-option-name">Send a bot to a meeting link</p>
              <p className="workspace-record-option-detail">
                Zoom · Google Meet · Microsoft Teams. The bot joins, records, transcribes.
              </p>
              <div className="workspace-record-link-input" onClick={(e) => e.stopPropagation()}>
                <input
                  type="url"
                  placeholder="paste meet.google.com/abc-defg-hij"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
                <button
                  className="workspace-quiet-btn"
                  style={{ background: 'var(--w-ink)', color: 'var(--w-bg-app)', borderColor: 'var(--w-ink)' }}
                  disabled={!meetingLink.trim()}
                >
                  Send bot
                </button>
              </div>
            </span>
          </button>

          <button type="button" className="workspace-record-option">
            <span className="workspace-record-option-icon"><Video className="h-4 w-4" /></span>
            <span>
              <p className="workspace-record-option-name">Record this tab or window</p>
              <p className="workspace-record-option-detail">
                Best for in-person calls or apps without bot support. Uses the browser extension.
              </p>
            </span>
          </button>

          <button type="button" className="workspace-record-option">
            <span className="workspace-record-option-icon"><Mic className="h-4 w-4" /></span>
            <span>
              <p className="workspace-record-option-name">Record on this device</p>
              <p className="workspace-record-option-detail">
                Microphone-only. Good for solo notes or in-person meetings without a video call.
              </p>
            </span>
          </button>

          <button type="button" className="workspace-record-option">
            <span className="workspace-record-option-icon"><FileAudio className="h-4 w-4" /></span>
            <span>
              <p className="workspace-record-option-name">Upload an existing recording</p>
              <p className="workspace-record-option-detail">
                Audio or video file. We transcribe and generate a recap.
              </p>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function RoutineModal({ templateId, onClose }: { templateId: string; onClose: () => void }): React.JSX.Element {
  const tpl: Routine = (templateId && templateId !== 'custom'
    ? ROUTINE_TEMPLATES.find((r) => r.id === templateId)
    : undefined) ?? {
      id: 'custom',
      name: 'Custom routine',
      description: 'Build your own from scratch',
      instructions: '',
      cadence: 'daily',
      time: '9:00 AM',
      active: false,
      notifications: true,
      sources: ['meetings'],
    };

  const [name, setName] = useState(tpl.name);
  const [instructions, setInstructions] = useState(tpl.instructions);
  const [cadence, setCadence] = useState<RoutineCadence>(tpl.cadence);
  const [time, setTime] = useState(tpl.cadence === 'daily' ? tpl.time : '7:00 AM');
  const [notifications, setNotifications] = useState(tpl.notifications);
  const [sources, setSources] = useState<Routine['sources']>(tpl.sources);

  const toggleSource = (s: Routine['sources'][number]) => {
    setSources((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const ALL_SOURCES: { id: Routine['sources'][number]; label: string }[] = [
    { id: 'meetings', label: 'Meetings' },
    { id: 'people', label: 'People' },
    { id: 'visitors', label: 'Visitor questions' },
    { id: 'memory', label: 'Approved memory' },
    { id: 'calendar', label: 'Calendar' },
  ];

  return (
    <div className="workspace-modal-backdrop" onClick={onClose}>
      <div className="workspace-routine-modal" onClick={(e) => e.stopPropagation()}>
        <header className="workspace-routine-modal-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>{tpl.id === 'custom' ? 'New routine' : 'Configure routine'}</h2>
              <p>Adjust the details, then create the routine.</p>
            </div>
            <button className="workspace-drawer-close" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="workspace-routine-template-row">
          <span className="workspace-routine-template-icon">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="workspace-routine-template-meta">
            <div className="workspace-routine-template-name">{name || 'Untitled routine'}</div>
            <div className="workspace-routine-template-sched">
              {cadence === 'daily' ? `Daily · ${time}` : cadence === 'weekly' ? `Weekly · ${time}` : `Monthly · ${time}`}
            </div>
          </div>
          <Link
            href="/workspace/routines"
            onClick={onClose}
            className="workspace-quiet-btn"
            style={{ textDecoration: 'none' }}
          >
            Change template
          </Link>
        </div>

        <div className="workspace-routine-body">
          <div className="workspace-routine-col">
            <p className="workspace-routine-label">Name</p>
            <input
              className="workspace-routine-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <p className="workspace-routine-label" style={{ marginTop: 16 }}>Schedule</p>
            <div className="workspace-routine-segment">
              {(['daily', 'weekly', 'monthly'] as RoutineCadence[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cadence === c ? 'is-active' : ''}
                  onClick={() => setCadence(c)}
                >
                  {c[0].toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
            <div>
              <input
                className="workspace-routine-time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 20,
              }}
            >
              <div>
                <p className="workspace-routine-label" style={{ marginBottom: 2 }}>Notifications</p>
                <p className="workspace-routine-help" style={{ margin: 0 }}>Push when a new report is ready.</p>
              </div>
              <button
                type="button"
                className={`workspace-toggle ${notifications ? 'is-on' : ''}`}
                onClick={() => setNotifications((v) => !v)}
                aria-pressed={notifications}
              />
            </div>

            <p className="workspace-routine-label" style={{ marginTop: 20 }}>Sources</p>
            <p className="workspace-routine-help">What this routine can read from.</p>
            <div>
              {ALL_SOURCES.map((s) => {
                const selected = sources.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`workspace-routine-source-chip ${selected ? 'is-selected' : ''}`}
                    onClick={() => toggleSource(s.id)}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="workspace-routine-col">
            <p className="workspace-routine-label">Instructions</p>
            <p className="workspace-routine-help">
              Describe what your persona should gather, analyze, or summarize.
            </p>
            <textarea
              className="workspace-routine-textarea"
              placeholder="Wrap up my day. What did I get done, what's still open, what's first thing tomorrow."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>
        </div>

        <div className="workspace-routine-footer">
          <button type="button" className="welcome-cta-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="welcome-cta-primary" onClick={onClose}>
            {tpl.id === 'custom' ? 'Create routine' : 'Save routine'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CommandPalette({ onClose }: { onClose: () => void }): React.JSX.Element {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const all = useMemo(() => buildCommandIndex(), []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((r) =>
      r.label.toLowerCase().includes(q) || (r.detail ?? '').toLowerCase().includes(q),
    );
  }, [all, query]);

  const grouped = useMemo(() => {
    const order: CommandResult['group'][] = ['Action', 'Page', 'Meeting', 'Person', 'Memory'];
    const map = new Map<CommandResult['group'], CommandResult[]>();
    for (const item of filtered) {
      const arr = map.get(item.group) ?? [];
      arr.push(item);
      map.set(item.group, arr);
    }
    return order.filter((g) => map.has(g)).map((g) => ({ group: g, items: map.get(g)! }));
  }, [filtered]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const handleSelect = useCallback(
    (result: CommandResult) => {
      onClose();
      if (result.href.startsWith('?')) {
        // overlay query — preserve current pathname
        router.replace(`${window.location.pathname}${result.href}`, { scroll: false });
      } else {
        router.push(result.href);
      }
    },
    [onClose, router],
  );

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[active];
      if (item) handleSelect(item);
    }
  };

  const iconFor = (icon?: CommandResult['icon']) => {
    if (icon === 'record') return <Mic className="h-3.5 w-3.5" />;
    if (icon === 'meeting') return <Calendar className="h-3.5 w-3.5" />;
    if (icon === 'person') return <User className="h-3.5 w-3.5" />;
    if (icon === 'memory') return <Sparkles className="h-3.5 w-3.5" />;
    if (icon === 'persona') return <User className="h-3.5 w-3.5" />;
    if (icon === 'eye') return <Eye className="h-3.5 w-3.5" />;
    if (icon === 'settings') return <Settings className="h-3.5 w-3.5" />;
    return <LayoutGrid className="h-3.5 w-3.5" />;
  };

  // Track running index across groups so Up/Down highlights match filtered ordering
  let runningIndex = -1;

  return (
    <div className="workspace-modal-backdrop" onClick={onClose}>
      <div className="workspace-cmd-shell" onClick={(e) => e.stopPropagation()}>
        <div className="workspace-cmd-input-row">
          <Search className="h-4 w-4 text-[var(--w-ink-3)]" />
          <input
            ref={inputRef}
            className="workspace-cmd-input"
            placeholder="Search meetings, people, memory… or run an action"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
          />
          <span className="workspace-cmd-kbd">esc</span>
        </div>
        <div className="workspace-cmd-results">
          {filtered.length === 0 ? (
            <div className="workspace-cmd-empty">No matches. Try a different word.</div>
          ) : (
            grouped.map(({ group, items }) => (
              <div key={group}>
                <div className="workspace-cmd-group-label">{group}</div>
                {items.map((item) => {
                  runningIndex += 1;
                  const isActive = runningIndex === active;
                  const key = `${group}-${item.label}-${runningIndex}`;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`workspace-cmd-item ${isActive ? 'is-active' : ''}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActive(runningIndex)}
                    >
                      <span className="workspace-cmd-item-icon">{iconFor(item.icon)}</span>
                      <span className="workspace-cmd-item-text">
                        <div className="workspace-cmd-item-label">{item.label}</div>
                        {item.detail && (
                          <div className="workspace-cmd-item-detail">{item.detail}</div>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
      {/* Silence unused-icon warning */}
      <span style={{ display: 'none' }}><Globe /></span>
    </div>
  );
}

export function WorkspaceOverlays(): React.JSX.Element | null {
  const { value: drawer, set: setDrawer } = useOverlayParam('drawer');
  const { value: view, set: setView } = useOverlayParam('view');
  const { value: modal, set: setModal } = useOverlayParam('modal');
  const { value: cmd, set: setCmd } = useOverlayParam('cmd');
  const { value: settings, set: setSettings } = useOverlayParam('settings');
  const { value: template } = useOverlayParam('template');

  const settingsSection = (settings && SETTINGS_NAV.some((s) => s.id === settings))
    ? (settings as SettingsSection)
    : settings ? 'general' as SettingsSection : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (cmd === 'open') setCmd(null);
        else if (settingsSection) setSettings(null);
        else if (modal === 'record') setModal(null);
        else if (view === 'visitor') setView(null);
        else if (drawer) setDrawer(null);
        return;
      }
      const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac');
      const hot = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (hot) {
        e.preventDefault();
        setCmd(cmd === 'open' ? null : 'open');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [drawer, view, modal, cmd, settingsSection, setDrawer, setView, setModal, setCmd, setSettings]);

  return (
    <>
      {drawer === 'persona' && <PersonaDrawer onClose={() => setDrawer(null)} />}
      {settingsSection && (
        <SettingsModal
          section={settingsSection}
          onSelect={(s) => setSettings(s)}
          onClose={() => setSettings(null)}
        />
      )}
      {view === 'visitor' && <VisitorMode onClose={() => setView(null)} />}
      {modal === 'record' && <RecordModal onClose={() => setModal(null)} />}
      {modal === 'routine' && <RoutineModal templateId={template ?? 'custom'} onClose={() => setModal(null)} />}
      {cmd === 'open' && <CommandPalette onClose={() => setCmd(null)} />}
    </>
  );
}

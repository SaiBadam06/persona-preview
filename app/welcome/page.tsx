'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { ArrowRight, Calendar, Check, Link as LinkIcon } from 'lucide-react';

type SeedMode = 'link' | 'text' | 'voice';

function WelcomeInner(): React.JSX.Element {
  const router = useRouter();
  const search = useSearchParams();
  const step = Number(search.get('step') ?? '0');

  const [mode, setMode] = useState<SeedMode>('link');
  const [seedValue, setSeedValue] = useState('');

  const goto = (next: number) => {
    router.push(`/welcome?step=${next}`, { scroll: false });
  };

  const finish = () => {
    router.push('/workspace');
  };

  return (
    <div className="welcome-shell">
      <header className="welcome-topbar">
        <span className="welcome-brand">PersonaOn</span>
        {step > 0 ? (
          <div className="welcome-step-pips" aria-label={`Step ${step} of 2`}>
            <span className={`welcome-step-pip ${step >= 1 ? 'is-active' : ''}`} />
            <span className={`welcome-step-pip ${step >= 2 ? 'is-active' : ''}`} />
          </div>
        ) : (
          <span />
        )}
        <Link href="/workspace" className="welcome-skip">
          Skip for now
        </Link>
      </header>

      <main className="welcome-stage">
        {step === 0 ? (
          <div className="welcome-hero">
            <p className="welcome-hero-eyebrow">Welcome to PersonaOn</p>
            <h1>
              Your meetings, <em>asked back.</em>
              <br />
              Privately by you. Publicly by your persona.
            </h1>
            <p>
              PersonaOn turns every meeting into memory you can search, ask, and selectively
              publish. Your persona starts from your bio and grows every time you approve a fact
              from a real conversation.
            </p>
            <div className="welcome-hero-actions">
              <button type="button" className="welcome-cta-primary" onClick={() => goto(1)}>
                Get started
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <Link href="/workspace" className="welcome-cta-secondary">
                See a sample workspace
              </Link>
            </div>

            <div className="welcome-hero-pillars">
              <div className="welcome-hero-pillar">
                <p className="pillar-eyebrow">01 · Capture</p>
                <h3>Record the meetings that matter</h3>
                <p>Connect your calendar. Choose which meetings to record. We do the rest.</p>
              </div>
              <div className="welcome-hero-pillar">
                <p className="pillar-eyebrow">02 · Ask</p>
                <h3>Your second brain, indexed</h3>
                <p>"What did Acme commit to last week?" Your meeting memory answers instantly.</p>
              </div>
              <div className="welcome-hero-pillar">
                <p className="pillar-eyebrow">03 · Publish</p>
                <h3>Approve what visitors can ask</h3>
                <p>Every public fact passes through Review. Nothing leaks. Everything is sourced.</p>
              </div>
            </div>
          </div>
        ) : step === 1 ? (
          <div className="welcome-card">
            <p className="welcome-eyebrow">Step 1 · 60 seconds</p>
            <h1 className="welcome-h1">Tell us who your persona is.</h1>
            <p className="welcome-sub">
              We'll seed your persona with what's already public about you. It grows from your
              meetings later — and you approve every fact before it goes public.
            </p>

            <div className="welcome-segmented" role="tablist">
              <button
                role="tab"
                aria-selected={mode === 'link'}
                className={mode === 'link' ? 'is-active' : ''}
                onClick={() => setMode('link')}
              >
                Paste a link
              </button>
              <button
                role="tab"
                aria-selected={mode === 'text'}
                className={mode === 'text' ? 'is-active' : ''}
                onClick={() => setMode('text')}
              >
                Answer one question
              </button>
              <button
                role="tab"
                aria-selected={mode === 'voice'}
                className={mode === 'voice' ? 'is-active' : ''}
                onClick={() => setMode('voice')}
              >
                Upload resume
              </button>
            </div>

            {mode === 'link' && (
              <>
                <label className="welcome-input">
                  <LinkIcon className="h-4 w-4 opacity-50" />
                  <input
                    type="url"
                    placeholder="linkedin.com/in/your-name  ·  yoursite.com  ·  github.com/you"
                    value={seedValue}
                    onChange={(e) => setSeedValue(e.target.value)}
                  />
                </label>
                <p className="welcome-helper">
                  We'll extract your bio, role, and expertise. Takes about 20 seconds.
                </p>
              </>
            )}

            {mode === 'text' && (
              <>
                <label className="welcome-input">
                  <textarea
                    rows={4}
                    placeholder="In a few sentences: what do you want to be known for?"
                    value={seedValue}
                    onChange={(e) => setSeedValue(e.target.value)}
                  />
                </label>
                <p className="welcome-helper">
                  This becomes your persona's voice for visitors. You can edit it any time.
                </p>
              </>
            )}

            {mode === 'voice' && (
              <>
                <label
                  className="welcome-input"
                  style={{ flexDirection: 'column', alignItems: 'flex-start', cursor: 'pointer', padding: 24 }}
                >
                  <p style={{ fontSize: 14, color: 'var(--w-ink)', margin: 0 }}>
                    Drop a PDF here — resume, bio, or pitch deck.
                  </p>
                  <p style={{ fontSize: 12.5, color: 'var(--w-ink-3)', margin: '4px 0 0' }}>
                    We pull facts, never share the file.
                  </p>
                  <input type="file" accept=".pdf" style={{ display: 'none' }} />
                </label>
                <p className="welcome-helper">PDF only. Max 10 MB.</p>
              </>
            )}

            <div className="welcome-callout">
              <span className="welcome-callout-icon">A</span>
              <span>
                Your persona starts at about <strong>30% public-ready</strong> after this. It grows
                every time you approve a meeting memory.
              </span>
            </div>

            <div className="welcome-cta-row">
              <Link href="/workspace" className="welcome-cta-secondary">
                I'll set this up later
              </Link>
              <button
                type="button"
                className="welcome-cta-primary"
                onClick={() => goto(2)}
                disabled={mode !== 'voice' && !seedValue.trim()}
              >
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="welcome-card">
            <p className="welcome-eyebrow">Step 2 · 30 seconds</p>
            <h1 className="welcome-h1">Connect your calendar so your persona can grow.</h1>
            <p className="welcome-sub">
              Your persona learns from meetings you choose to record. Nothing becomes public until you
              approve it in Review.
            </p>

            <div className="welcome-provider-row">
              <button type="button" className="welcome-provider" onClick={finish}>
                <span className="welcome-provider-name">Connect Google Calendar</span>
                <span className="welcome-provider-sub">Most common · 1-click via Google sign-in</span>
              </button>
              <button type="button" className="welcome-provider" onClick={finish}>
                <span className="welcome-provider-name">Connect Microsoft 365</span>
                <span className="welcome-provider-sub">Outlook · Office · Teams calendars</span>
              </button>
            </div>

            <div className="welcome-callout">
              <span className="welcome-callout-icon">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span>
                You decide which meetings to record. Nothing happens automatically — every meeting,
                every memory, every public fact passes through your Review.
              </span>
            </div>

            <div className="welcome-cta-row">
              <button type="button" className="welcome-cta-secondary" onClick={() => goto(1)}>
                ← Back
              </button>
              <button type="button" className="welcome-cta-primary" onClick={finish}>
                <Calendar className="h-3.5 w-3.5" />
                Take me to my workspace
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function WelcomePage(): React.JSX.Element {
  return (
    <Suspense fallback={<div className="welcome-shell" />}>
      <WelcomeInner />
    </Suspense>
  );
}

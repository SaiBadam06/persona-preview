'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';

import { CADENCE_LABEL, ROUTINE_TEMPLATES } from '../mockData';
import { WorkspaceTopBar } from '../WorkspaceTopBar';
import { PromptInput } from '../PromptInput';

function schedule(r: typeof ROUTINE_TEMPLATES[number]): string {
  if (r.cadence === 'daily') return `Daily at ${r.time}`;
  if (r.cadence === 'weekly') return `Weekly · ${r.time}`;
  return `Monthly · ${r.time}`;
}

export default function RoutinesPage(): React.JSX.Element {
  const pathname = usePathname();
  const active = ROUTINE_TEMPLATES.filter((r) => r.active);
  const templates = ROUTINE_TEMPLATES.filter((r) => !r.active);

  return (
    <>
      <WorkspaceTopBar crumb="Workspace" title="Routines" />
      <div className="workspace-canvas">
        <div className="workspace-canvas-inner">
          <header
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 28,
            }}
          >
            <div>
              <h1 className="workspace-display-lg">Routines</h1>
              <p className="workspace-meta" style={{ marginTop: 8, maxWidth: 520 }}>
                Recurring prompts against your memory. Morning briefs, end-of-day wrap-ups, weekly
                reflections — delivered on a schedule, sourced from your meetings.
              </p>
            </div>
            <Link
              href={`${pathname}?modal=routine`}
              scroll={false}
              className="welcome-cta-primary"
              style={{ textDecoration: 'none' }}
            >
              <Plus className="h-3.5 w-3.5" />
              New routine
            </Link>
          </header>

          {active.length > 0 && (
            <section className="workspace-routines-section">
              <p className="workspace-routines-section-label">Active · {active.length}</p>
              <div className="workspace-routines-grid">
                {active.map((r) => (
                  <Link
                    key={r.id}
                    href={`${pathname}?modal=routine&template=${r.id}`}
                    scroll={false}
                    className="workspace-routine-card"
                  >
                    <span className="workspace-routine-card-status is-active">
                      <span className="dot" />
                      Active
                    </span>
                    <h3 className="workspace-routine-card-title">{r.name}</h3>
                    <p className="workspace-routine-card-desc">{r.description}</p>
                    <div className="workspace-routine-card-schedule">{schedule(r)}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="workspace-routines-section">
            <p className="workspace-routines-section-label">Templates · ready to enable</p>
            <div className="workspace-routines-grid">
              <Link
                href={`${pathname}?modal=routine&template=custom`}
                scroll={false}
                className="workspace-routine-card is-blank"
              >
                <span className="icon">+</span>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--w-ink)' }}>
                  Create custom routine
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 12.5 }}>Build your own from scratch</p>
              </Link>
              {templates.map((r) => (
                <Link
                  key={r.id}
                  href={`${pathname}?modal=routine&template=${r.id}`}
                  scroll={false}
                  className="workspace-routine-card"
                >
                  {r.popular && <span className="workspace-routine-card-badge">Popular</span>}
                  <h3 className="workspace-routine-card-title">{r.name}</h3>
                  <p className="workspace-routine-card-desc">{r.description}</p>
                  <div className="workspace-routine-card-schedule">{schedule(r)}</div>
                </Link>
              ))}
            </div>
          </section>

          <section
            style={{
              padding: 18,
              background: 'var(--w-bg-quiet)',
              borderRadius: 12,
              fontSize: 13,
              color: 'var(--w-ink-2)',
              lineHeight: 1.55,
            }}
          >
            <p style={{ margin: 0, fontWeight: 500, color: 'var(--w-ink)' }}>
              How routines work
            </p>
            <p style={{ margin: '6px 0 0' }}>
              Every routine is a saved prompt that runs on a {CADENCE_LABEL.daily.toLowerCase()},{' '}
              {CADENCE_LABEL.weekly.toLowerCase()}, or {CADENCE_LABEL.monthly.toLowerCase()} schedule
              against the sources you choose (meetings, people, visitors, approved memory). Reports
              land in your inbox and stay searchable in your workspace.
            </p>
          </section>
        </div>

        <PromptInput placeholder="Ask: what would a morning brief look like for me?" />
      </div>
    </>
  );
}

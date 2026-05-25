'use client';

import Link from 'next/link';
import { MOCK_MEETINGS, formatRelativeDate, personSlug } from '../mockData';
import { WorkspaceTopBar } from '../WorkspaceTopBar';
import { PromptInput } from '../PromptInput';

type PersonRow = {
  name: string;
  email?: string;
  lastMet: string;
  meetingCount: number;
  latestTopic: string;
};

function buildPeople(): PersonRow[] {
  const byName = new Map<string, PersonRow>();
  const sorted = [...MOCK_MEETINGS].sort(
    (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime(),
  );
  for (const m of sorted) {
    for (const a of m.attendees) {
      if (a.self) continue;
      const existing = byName.get(a.name);
      if (existing) {
        existing.meetingCount += 1;
      } else {
        byName.set(a.name, {
          name: a.name,
          email: a.email,
          lastMet: m.start,
          meetingCount: 1,
          latestTopic: m.title,
        });
      }
    }
  }
  return Array.from(byName.values()).sort((a, b) => b.meetingCount - a.meetingCount);
}

export default function PeoplePage(): React.JSX.Element {
  const people = buildPeople();

  return (
    <>
      <WorkspaceTopBar crumb="Workspace" title="People" />
      <div className="workspace-canvas">
        <div className="workspace-canvas-inner">
          <header className="mb-8">
            <h1 className="workspace-display-lg">People</h1>
            <p className="workspace-meta" style={{ marginTop: 8 }}>
              {people.length} people across your recent meetings. Click any to see history and what's
              open between you.
            </p>
          </header>

          <div>
            {people.map((p) => (
              <Link key={p.name} href={`/workspace/people/${personSlug(p.name)}`} className="workspace-row">
                <div className="row-time">{formatRelativeDate(p.lastMet)}</div>
                <div className="row-body">
                  <p className="row-title">{p.name}</p>
                  <p className="row-meta">
                    {p.meetingCount} meeting{p.meetingCount === 1 ? '' : 's'} · last: {p.latestTopic}
                  </p>
                </div>
                <div className="row-status">{p.email ?? ''}</div>
              </Link>
            ))}
          </div>
        </div>

        <PromptInput placeholder="Ask: who did I talk to about pricing last week?" />
      </div>
    </>
  );
}

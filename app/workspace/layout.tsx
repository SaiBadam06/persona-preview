import React, { Suspense } from 'react';
import './workspace-tokens.css';
import { WorkspaceShell } from './WorkspaceShell';
import { WorkspaceSidebarProvider } from './WorkspaceShellContext';
import { WorkspaceOverlays } from './WorkspaceOverlays';

export const metadata = {
  title: 'PersonaOn — Workspace',
};

// Workspace is a fully-interactive prototype with client-side state, search params,
// and URL-driven overlays. Skip static prerendering — render at request time.
export const dynamic = 'force-dynamic';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="workspace-root h-screen w-screen overflow-hidden">
      <WorkspaceSidebarProvider>
        <WorkspaceShell>{children}</WorkspaceShell>
        <Suspense fallback={null}>
          <WorkspaceOverlays />
        </Suspense>
      </WorkspaceSidebarProvider>
    </div>
  );
}

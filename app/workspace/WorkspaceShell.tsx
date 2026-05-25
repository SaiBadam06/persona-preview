'use client';

import { WorkspaceSidebar } from './WorkspaceSidebar';
import { useSidebar } from './WorkspaceShellContext';

export function WorkspaceShell({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();
  const cls = [
    'workspace-shell',
    'flex h-screen w-screen overflow-hidden',
    collapsed ? 'is-collapsed' : '',
    mobileOpen ? 'is-open' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cls} onClick={(e) => {
      // close mobile sidebar when clicking the dim overlay (which is a pseudo-element)
      if (mobileOpen && (e.target as HTMLElement).classList.contains('workspace-shell')) {
        closeMobile();
      }
    }}>
      <WorkspaceSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}

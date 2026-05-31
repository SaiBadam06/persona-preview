'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import NavLink from '../NavLink';
import { Menu, PanelLeft, Settings, Share2, Eye } from 'lucide-react';

import { MOCK_MEETINGS } from './mockData';
import { useSidebar } from './WorkspaceShellContext';

interface WorkspaceTopBarProps {
  crumb?: string;
  title?: string;
  showShare?: boolean;
}

export function WorkspaceTopBar({ crumb, title, showShare = false }: WorkspaceTopBarProps): React.JSX.Element {
  const pathname = usePathname();
  const search = useSearchParams();
  const { collapsed, toggleCollapsed, openMobile } = useSidebar();

  const buildHref = (key: string, value: string): string => {
    const params = new URLSearchParams(search.toString());
    params.set(key, value);
    return `${pathname}?${params.toString()}`;
  };

  const live = MOCK_MEETINGS.find((m) => m.status === 'recording');

  return (
    <header className="workspace-topbar">
      <div className="workspace-topbar-title">
        {/* Mobile: hamburger to open sidebar */}
        <button
          type="button"
          onClick={openMobile}
          className="workspace-sidebar-toggle md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>
        {/* Desktop: collapse / expand sidebar */}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="workspace-sidebar-toggle hidden md:inline-flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeft className="h-4 w-4" />
        </button>
        {crumb && <span className="crumb">{crumb}</span>}
        {crumb && title && <span className="crumb">·</span>}
        {title && <span>{title}</span>}
      </div>
      <div className="workspace-topbar-actions">
        {live && (
          <NavLink href={`/workspace/meeting/${live.id}`} className="workspace-live-pill">
            <span className="dot" aria-hidden />
            <span>{live.title}</span>
            <span className="workspace-live-elapsed">· 14:21</span>
          </NavLink>
        )}
        <NavLink href={buildHref('view', 'visitor')} className="workspace-topbar-btn" scroll={false}>
          <Eye className="h-4 w-4" />
          View as visitor
        </NavLink>
        {showShare && (
          <NavLink href={buildHref('drawer', 'persona')} className="workspace-topbar-btn is-primary" scroll={false}>
            <Share2 className="h-3.5 w-3.5" />
            Share
          </NavLink>
        )}
        <NavLink href={buildHref('settings', 'general')} className="workspace-topbar-btn" aria-label="Settings" scroll={false}>
          <Settings className="h-4 w-4" />
        </NavLink>
      </div>
    </header>
  );
}

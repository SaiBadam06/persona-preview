'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  openMobile: () => void;
  closeMobile: () => void;
}

const SidebarCtx = createContext<SidebarState | null>(null);

const STORAGE_KEY = 'personaon-workspace-sidebar';

export function WorkspaceSidebarProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'collapsed') setCollapsed(true);
    } catch { /* ignore */ }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((v) => {
      const next = !v;
      try { localStorage.setItem(STORAGE_KEY, next ? 'collapsed' : 'expanded'); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <SidebarCtx.Provider value={{ collapsed, mobileOpen, toggleCollapsed, openMobile, closeMobile }}>
      {children}
    </SidebarCtx.Provider>
  );
}

export function useSidebar(): SidebarState {
  const ctx = useContext(SidebarCtx);
  if (!ctx) {
    return {
      collapsed: false,
      mobileOpen: false,
      toggleCollapsed: () => {},
      openMobile: () => {},
      closeMobile: () => {},
    };
  }
  return ctx;
}

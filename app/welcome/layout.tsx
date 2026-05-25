import React from 'react';
import '../workspace/workspace-tokens.css';

export const metadata = {
  title: 'PersonaOn — Welcome',
};

export const dynamic = 'force-dynamic';

export default function WelcomeLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="workspace-root" style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}

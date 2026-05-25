'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ArrowUp } from 'lucide-react';

type PromptMode = 'memory' | 'persona';

interface PromptInputProps {
  placeholder?: string;
  defaultMode?: PromptMode;
  trailingAction?: ReactNode;
}

const MODE_PLACEHOLDER: Record<PromptMode, string> = {
  memory: 'Ask anything about your meetings, people, or memory…',
  persona: 'Ask what a visitor would — see what your persona would answer publicly.',
};

export function PromptInput({ placeholder, defaultMode = 'memory', trailingAction }: PromptInputProps): React.JSX.Element {
  const [value, setValue] = useState('');
  const [mode, setMode] = useState<PromptMode>(defaultMode);
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value]);

  const effectivePlaceholder = placeholder ?? MODE_PLACEHOLDER[mode];

  return (
    <div className="workspace-prompt">
      <form
        className="workspace-prompt-shell"
        style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!value.trim()) return;
          setValue('');
        }}
      >
        <div className="workspace-prompt-modes">
          <button
            type="button"
            className={`workspace-prompt-mode ${mode === 'memory' ? 'is-active' : ''}`}
            onClick={() => setMode('memory')}
          >
            <span className="dot" />
            My memory
          </button>
          <button
            type="button"
            className={`workspace-prompt-mode ${mode === 'persona' ? 'is-active' : ''}`}
            onClick={() => setMode('persona')}
          >
            <span className="dot" />
            My persona (preview)
          </button>
          {trailingAction && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
              {trailingAction}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <textarea
            ref={ref}
            className="workspace-prompt-input"
            placeholder={effectivePlaceholder}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (value.trim()) setValue('');
              }
            }}
          />
          <button
            type="submit"
            className="workspace-prompt-send"
            disabled={!value.trim()}
            aria-label="Send"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

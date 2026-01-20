import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  callback: () => void;
  description?: string;
}

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcut(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ key, ctrlKey, metaKey, shiftKey, callback }) => {
        const isCtrlKey = ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const isMetaKey = metaKey ? event.metaKey : true;
        const isShiftKey = shiftKey ? event.shiftKey : !event.shiftKey;

        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          isCtrlKey &&
          isMetaKey &&
          isShiftKey
        ) {
          event.preventDefault();
          callback();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

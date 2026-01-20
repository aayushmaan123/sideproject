import { useState, useEffect } from 'react';

const SESSION_STORAGE_KEY = 'ai-website-builder-session-id';

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Hook to manage user session
 * Generates and persists session_id in localStorage
 */
export function useSession() {
  const [sessionId, setSessionId] = useState<string>(() => {
    // Try to load from localStorage on initial render
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    return stored || generateSessionId();
  });

  // Persist to localStorage whenever sessionId changes
  useEffect(() => {
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }, [sessionId]);

  // Function to reset session (for testing or user logout)
  const resetSession = () => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
  };

  return {
    sessionId,
    resetSession,
  };
}

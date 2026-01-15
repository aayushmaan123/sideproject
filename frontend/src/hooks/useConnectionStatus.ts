import { useState, useEffect } from 'react';

export type ConnectionStatus = 'connected' | 'disconnected' | 'checking';

/**
 * Hook to monitor backend connection status
 */
export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [triggerCheck, setTriggerCheck] = useState(0);

  const checkConnection = () => {
    setTriggerCheck(prev => prev + 1);
  };

  // Effect that runs the actual check
  useEffect(() => {
    let cancelled = false;

    const performCheck = async () => {
      if (cancelled) return;
      setStatus('checking');
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/`, {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000), // 5 second timeout for health check
        });
        
        if (!cancelled) {
          setStatus(response.ok ? 'connected' : 'disconnected');
          setLastChecked(new Date());
        }
      } catch {
        if (!cancelled) {
          setStatus('disconnected');
          setLastChecked(new Date());
        }
      }
    };

    void performCheck();

    // Periodic health check every 30 seconds
    const interval = setInterval(() => {
      void performCheck();
    }, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [triggerCheck]);

  return {
    status,
    lastChecked,
    checkConnection,
    isConnected: status === 'connected',
    isDisconnected: status === 'disconnected',
    isChecking: status === 'checking',
  };
}

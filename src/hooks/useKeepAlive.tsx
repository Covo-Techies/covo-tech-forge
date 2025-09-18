import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface KeepAliveConfig {
  enabled?: boolean;
  intervalMinutes?: number;
  onPingSuccess?: (response: any) => void;
  onPingError?: (error: any) => void;
}

export const useKeepAlive = ({
  enabled = true,
  intervalMinutes = 8, // Ping every 8 minutes by default
  onPingSuccess,
  onPingError
}: KeepAliveConfig = {}) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(enabled);

  const sendKeepAlivePing = async () => {
    try {
      console.log('Sending keep-alive ping...');
      
      const { data, error } = await supabase.functions.invoke('keep-alive', {
        body: { timestamp: new Date().toISOString() }
      });

      if (error) throw error;

      console.log('Keep-alive ping successful:', data);
      onPingSuccess?.(data);
      
      return data;
    } catch (error) {
      console.error('Keep-alive ping failed:', error);
      onPingError?.(error);
      throw error;
    }
  };

  const startKeepAlive = () => {
    if (!isActiveRef.current) return;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Send initial ping
    sendKeepAlivePing().catch(() => {
      // Continue even if first ping fails
    });

    // Set up periodic pinging
    intervalRef.current = setInterval(() => {
      if (isActiveRef.current) {
        sendKeepAlivePing().catch(() => {
          // Continue even if ping fails
        });
      }
    }, intervalMinutes * 60 * 1000); // Convert minutes to milliseconds

    console.log(`Keep-alive started with ${intervalMinutes} minute intervals`);
  };

  const stopKeepAlive = () => {
    isActiveRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    console.log('Keep-alive stopped');
  };

  const restartKeepAlive = () => {
    stopKeepAlive();
    isActiveRef.current = true;
    startKeepAlive();
  };

  useEffect(() => {
    isActiveRef.current = enabled;
    
    if (enabled) {
      startKeepAlive();
    } else {
      stopKeepAlive();
    }

    // Cleanup on unmount
    return () => {
      stopKeepAlive();
    };
  }, [enabled, intervalMinutes]);

  // Handle page visibility changes to pause/resume keep-alive
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        // Page became visible, ensure keep-alive is running
        if (!intervalRef.current) {
          startKeepAlive();
        }
      } else if (document.visibilityState === 'hidden') {
        // Page became hidden, but keep running in background
        // Keep-alive should continue to prevent inactivity
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network online, resuming keep-alive');
      if (enabled && !intervalRef.current) {
        startKeepAlive();
      }
    };

    const handleOffline = () => {
      console.log('Network offline, pausing keep-alive');
      stopKeepAlive();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enabled]);

  return {
    sendKeepAlivePing,
    startKeepAlive,
    stopKeepAlive,
    restartKeepAlive,
    isActive: isActiveRef.current && !!intervalRef.current
  };
};

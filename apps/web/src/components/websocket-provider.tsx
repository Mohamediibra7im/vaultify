"use client";

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { connectSocket, disconnectSocket } from '@/lib/websocket';

// Listen for 'notification' and 'secret:changed' events
// Show toast on secret changes
import { toast } from 'sonner';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);

    socket.on('notification', (data: any) => {
      toast(data.title, { description: data.message });
    });

    socket.on('secret:changed', (data: any) => {
      toast(`Secret ${data.action}: ${data.secretKey}`, {
        description: `In ${data.environmentName}`,
      });
    });

    return () => {
      disconnectSocket();
    };
  }, [token]);

  return <>{children}</>;
}

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export function connectSocket(token: string, workspaceId?: string) {
  if (socket?.connected) return socket;

  socket = io(`${WS_URL}/ws`, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    socket?.emit('subscribe', { workspaceId });
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}

export function subscribeToWorkspace(workspaceId: string) {
  const socket = getSocket();
  if (socket?.connected) {
    socket.emit('subscribe', { workspaceId });
  }
}

export function useWorkspaceSubscription(workspaceId?: string) {
  useEffect(() => {
    if (!workspaceId) return;
    subscribeToWorkspace(workspaceId);
  }, [workspaceId]);
}

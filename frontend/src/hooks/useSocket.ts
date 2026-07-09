'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useSocket(
  event: string,
  handler: (data: any) => void,
  deps: any[] = [],
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (socketRef.current?.connected) return;
    socketRef.current = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socketRef.current.on(event, handler);

    return () => {
      socketRef.current?.off(event, handler);
    };
  }, [event, ...deps]);
}

'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import * as Y from 'yjs';
import { useAuthStore } from './stores';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export function useRealtime(reviewId: string) {
  const socketRef = useRef<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const user = useAuthStore((s) => s.user);
  const [ydoc] = useState(() => new Y.Doc());

  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit('review:join', {
      reviewId,
      userId: user.id,
      userName: user.name,
      color: user.avatarColor,
    });

    socket.on('users:active', (users: any[]) => {
      setActiveUsers(users);
    });

    socket.on('code:updated', (update: ArrayBuffer) => {
      Y.applyUpdate(ydoc, new Uint8Array(update));
    });

    ydoc.on('update', (update) => {
      socket.emit('code:change', { reviewId, changes: update.buffer });
    });

    return () => {
      socket.disconnect();
    };
  }, [reviewId, user, ydoc]);

  return { activeUsers, ydoc, socket: socketRef.current };
}

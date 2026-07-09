'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import * as Y from 'yjs';
import { useAuthStore } from './stores';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export interface ActiveUser {
  reviewId: string;
  userId: string;
  userName: string;
  color: string;
}

export function useRealtime(reviewId: string) {
  const socketRef = useRef<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
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

    socket.on('users:active', (users: ActiveUser[]) => {
      setActiveUsers(users);
    });

    socket.on('code:updated', (update: ArrayBuffer) => {
      Y.applyUpdate(ydoc, new Uint8Array(update));
    });

    const handleYjsUpdate = (update: Uint8Array) => {
      socket.emit('code:change', { reviewId, changes: update.buffer });
    };

    ydoc.on('update', handleYjsUpdate);

    return () => {
      ydoc.off('update', handleYjsUpdate);
      socket.disconnect();
    };
  }, [reviewId, user, ydoc]);

  return { activeUsers, ydoc, socket: socketRef.current };
}

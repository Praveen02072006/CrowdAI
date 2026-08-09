import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
  (typeof window !== 'undefined' && (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'))
    ? 'http://localhost:3001'
    : 'https://crowdai-pdki.onrender.com');

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('🔗 Socket.IO connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket.IO connection error:', err.message);
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

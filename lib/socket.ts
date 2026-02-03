import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: {
        token,
      },
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });
  }

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

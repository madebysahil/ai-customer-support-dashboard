import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '@/lib/api';

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socketInstance) {
      const token = getAccessToken();
      socketInstance = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000', {
        auth: { token },
        withCredentials: true,
        autoConnect: false, // Wait until we explicitly connect
      });
    }

    if (!socketInstance.connected) {
      socketInstance.connect();
    }

    setSocket(socketInstance);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);

    setIsConnected(socketInstance.connected);

    return () => {
      socketInstance?.off('connect', onConnect);
      socketInstance?.off('disconnect', onDisconnect);
    };
  }, []);

  return { socket, isConnected };
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { getAccessToken } from '@/lib/api';

let socketInstance: Socket | null = null;
let socketPromise: Promise<Socket> | null = null;
let isDisposed = false;
let socketGeneration = 0;

/**
 * Initializes or retrieves the singleton Socket.io client on-demand.
 * Dynamically imports 'socket.io-client' so the 115 KB vendor bundle
 * is only requested on routes that actually establish socket listeners.
 * 
 * Guards against logout race conditions: if disconnectSocket() is called
 * while the dynamic import is in-flight, initialization is aborted and
 * no socket instance is created or connected.
 */
export async function getOrCreateSocket(): Promise<Socket> {
  isDisposed = false;
  if (socketInstance) {
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
    return socketInstance;
  }

  if (socketPromise) {
    return socketPromise;
  }

  const currentGen = socketGeneration;

  socketPromise = (async () => {
    const { io } = await import('socket.io-client');

    // Abort if logout was triggered while dynamic import was awaiting
    if (isDisposed || currentGen !== socketGeneration) {
      throw new Error('Socket initialization cancelled by logout');
    }

    const token = getAccessToken();

    if (!socketInstance) {
      socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001', {
        auth: { token },
        withCredentials: true,
        autoConnect: false,
      });
    }

    // Secondary check in case disconnectSocket was called right after instantiation
    if (isDisposed || currentGen !== socketGeneration) {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
      throw new Error('Socket initialization cancelled by logout');
    }

    if (!socketInstance.connected) {
      socketInstance.connect();
    }

    return socketInstance;
  })();

  try {
    return await socketPromise;
  } finally {
    socketPromise = null;
  }
}

/**
 * Custom React hook managing the singleton socket lifecycle.
 * Ensures synchronous event listener cleanup on unmount, preventing
 * EventEmitter listener leaks and unmounted component state updates.
 */
export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(socketInstance);
  const [isConnected, setIsConnected] = useState<boolean>(socketInstance?.connected || false);

  useEffect(() => {
    let isCancelled = false;
    let activeSock: Socket | null = null;
    let onConnect: (() => void) | null = null;
    let onDisconnect: (() => void) | null = null;

    getOrCreateSocket()
      .then((sock) => {
        if (isCancelled) return;
        activeSock = sock;
        setSocket(sock);
        setIsConnected(sock.connected);

        onConnect = () => setIsConnected(true);
        onDisconnect = () => setIsConnected(false);

        sock.on('connect', onConnect);
        sock.on('disconnect', onDisconnect);
      })
      .catch(() => {
        // Silently handled: socket initialization was cancelled by logout or network failure
      });

    return () => {
      isCancelled = true;
      if (activeSock && onConnect && onDisconnect) {
        activeSock.off('connect', onConnect);
        activeSock.off('disconnect', onDisconnect);
      }
    };
  }, []);

  return { socket, isConnected };
};

/**
 * Disconnects and resets the singleton Socket.io client.
 * Flags in-flight initialization promises to abort immediately upon resolution.
 */
export const disconnectSocket = () => {
  isDisposed = true;
  socketGeneration++;
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
  socketPromise = null;
};

// Global event listener for decoupled logout trigger (eliminates AuthContext static import)
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    disconnectSocket();
  });
}

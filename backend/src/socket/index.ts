import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { JwtPayload } from '../middleware/requireAuth';
import { registerChatHandlers } from './chat.handler';

// Extend Socket interface to include authenticated user
export interface AuthenticatedSocket extends Socket {
  user: JwtPayload;
}

let ioInstance: Server | null = null;

export const getSocketServer = (): Server | null => ioInstance;

export const initializeSocket = (server: HttpServer): Server => {
  const io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Missing token'));
    }
    
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
      (socket as AuthenticatedSocket).user = payload;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.user.sub;
    
    logger.info(`Socket connected`, { socketId: socket.id, userId });

    // Join personal agent room for global presence and direct notifications
    authSocket.join(`agent_${userId}`);
    
    // Broadcast presence update (Agent came online)
    io.emit('presence:update', { userId, status: 'ONLINE' });

    // Register modular event handlers
    registerChatHandlers(io, authSocket);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected`, { socketId: socket.id, userId });
      io.emit('presence:update', { userId, status: 'OFFLINE' });
    });
  });

  ioInstance = io;
  return io;
};

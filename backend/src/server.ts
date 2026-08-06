import http from 'http';
import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { initializeSocket } from './socket';

const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

const PORT = env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`🔌 Socket.io configured successfully`);
});

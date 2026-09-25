// tests/e2e/helpers/in-memory-backend.mjs
import { Duplex } from 'stream';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInitialData, createMockPrisma } from './test-store.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../../');

// Load environment variables from backend/.env if available
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dotenvModule = require('dotenv');
dotenvModule.config({ path: path.join(rootDir, 'backend/.env') });

// Ensure fallback values for test environment
process.env.PORT = process.env.PORT || '5001';
process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/testdb';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_super_secure_jwt_access_secret_12345';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_super_secure_jwt_refresh_secret_12345';
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test_gemini_api_key_mock';

export let currentStore = createInitialData();
global.prisma = createMockPrisma(currentStore);

export function resetBackendStore() {
  currentStore = createInitialData();
  global.prisma = createMockPrisma(currentStore);
}

let cachedApp = null;

export async function getBackendApp() {
  if (cachedApp) return cachedApp;
  const appModule = require(path.join(rootDir, 'backend/dist/app.js'));
  cachedApp = appModule.default || appModule;
  return cachedApp;
}

export function createMockSocket() {
  const socket = new Duplex({
    read() {},
    write(chunk, enc, cb) { cb(); }
  });
  socket.remoteAddress = '127.0.0.1';
  socket.remotePort = 54321;
  socket.address = () => ({ address: '127.0.0.1', port: 54321 });
  socket.encrypted = false;
  socket.writable = true;
  socket.readable = true;
  return socket;
}

export function dispatchRequest(app, options = {}) {
  return new Promise((resolve) => {
    const socket = createMockSocket();
    const req = new http.IncomingMessage(socket);
    req.method = (options.method || 'GET').toUpperCase();
    req.url = options.url || '/';

    const payload = options.body !== undefined
      ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body))
      : null;

    const normalizedHeaders = {};
    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        normalizedHeaders[key.toLowerCase()] = value;
      }
    }

    const headers = {
      host: 'localhost',
      ...(payload ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload).toString() } : {}),
      ...normalizedHeaders
    };

    req.headers = headers;

    const res = new http.ServerResponse(req);
    const chunks = [];

    res.write = (chunk) => {
      if (chunk) chunks.push(Buffer.from(chunk));
      return true;
    };

    res.end = (chunk) => {
      if (chunk) chunks.push(Buffer.from(chunk));
      const rawBody = Buffer.concat(chunks).toString();
      let parsedJson = null;
      try {
        parsedJson = JSON.parse(rawBody);
      } catch {
        parsedJson = null;
      }

      resolve({
        statusCode: res.statusCode,
        statusText: res.statusMessage,
        headers: res.getHeaders(),
        rawBody,
        body: parsedJson,
        json: () => parsedJson
      });
    };

    app(req, res);

    process.nextTick(() => {
      if (payload) {
        req.push(payload);
      }
      req.push(null);
    });
  });
}

export async function loginAs(app, email = 'admin@example.com', password = 'Password123!') {
  const res = await dispatchRequest(app, {
    method: 'POST',
    url: '/api/v1/auth/login',
    body: { email, password }
  });

  if (res.statusCode !== 200) {
    throw new Error(`Login failed for ${email} with status ${res.statusCode}: ${res.rawBody}`);
  }

  const { accessToken, user } = res.body;
  const setCookie = res.headers['set-cookie'];
  return {
    accessToken,
    user,
    setCookie,
    authHeader: { Authorization: `Bearer ${accessToken}` }
  };
}

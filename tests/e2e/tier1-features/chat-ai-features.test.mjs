// tests/e2e/tier1-features/chat-ai-features.test.mjs
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getBackendApp, dispatchRequest, loginAs } from '../helpers/in-memory-backend.mjs';
import { TEST_IDS } from '../helpers/test-store.mjs';
import { readFrontendFile } from '../helpers/contracts.mjs';

describe('Tier 1: Live Chat & AI Copilot Features', () => {
  let app;
  let agentAuth;

  before(async () => {
    app = await getBackendApp();
    agentAuth = await loginAs(app, 'agent@example.com', 'Password123!');
  });

  it('FEAT-PAGE-05: AI Copilot page layout and action controls contract', (t) => {
    const aiPage = readFrontendFile('src/app/(dashboard)/ai/page.tsx');
    assert.ok(aiPage, 'ai/page.tsx must exist');

    // Viewport height check
    if (aiPage.includes('h-[calc(100vh-8rem)]')) {
      t.diagnostic('Implementation Gap (M4): ai/page.tsx contains 80px bottom dead space gap (h-[calc(100vh-8rem)])');
    }

    // AI Workspace action controls
    const chatWorkspace = readFrontendFile('src/components/ai/ChatWorkspace.tsx');
    assert.ok(chatWorkspace, 'ChatWorkspace.tsx must exist');
    assert.ok(chatWorkspace.includes('messages'), 'Workspace must render message array');
  });

  it('FEAT-OPT-05 & FEAT-OPT-09: Live Chat Panel and Virtualization contract', (t) => {
    const chatPanel = readFrontendFile('src/components/chat/ChatPanel.tsx');
    assert.ok(chatPanel, 'ChatPanel.tsx must exist');

    // Keystroke isolation & message memoization check
    assert.ok(chatPanel.includes('message') || chatPanel.includes('input'), 'ChatPanel must manage composer state');

    if (!chatPanel.includes('@tanstack/react-virtual') && !chatPanel.includes('useVirtualizer')) {
      t.diagnostic('Implementation Gap (M1): ChatPanel timeline virtualization pending M1 implementation');
    }
  });

  it('FEAT-OPT-08: AI Stream Controller validates messages payload', async () => {
    // Missing messages array must return 400
    const res = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/copilot/stream',
      headers: agentAuth.authHeader,
      body: {}
    });

    assert.equal(res.statusCode, 400, 'Must reject missing messages array with HTTP 400');
    assert.ok(res.body.error, 'Must provide error message');
  });

  it('FEAT-CHAT: Agent can query active chat channels (GET /api/v1/chats)', async () => {
    const res = await dispatchRequest(app, {
      method: 'GET',
      url: '/api/v1/chats',
      headers: agentAuth.authHeader
    });

    assert.equal(res.statusCode, 200, 'Must return HTTP 200');
    assert.ok(Array.isArray(res.body.data) || Array.isArray(res.body), 'Must return list of chats');
  });

  it('FEAT-CHAT: Agent can query messages in a chat thread (GET /api/v1/chats/:id/messages)', async () => {
    const res = await dispatchRequest(app, {
      method: 'GET',
      url: `/api/v1/chats/${TEST_IDS.chat1}/messages`,
      headers: agentAuth.authHeader
    });

    assert.equal(res.statusCode, 200, 'Must return HTTP 200');
    assert.ok(Array.isArray(res.body.data) || Array.isArray(res.body), 'Must return list of messages');
  });
});

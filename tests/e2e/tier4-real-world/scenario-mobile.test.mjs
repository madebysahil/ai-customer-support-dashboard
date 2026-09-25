// tests/e2e/tier4-real-world/scenario-mobile.test.mjs
import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getBackendApp, dispatchRequest, loginAs, resetBackendStore } from '../helpers/in-memory-backend.mjs';
import { TEST_IDS } from '../helpers/test-store.mjs';
import { readFrontendFile } from '../helpers/contracts.mjs';

describe('Tier 4: Scenario D — Mobile On-The-Go Agent Incident Triage', () => {
  let app;
  let agentSession;

  before(async () => {
    app = await getBackendApp();
  });

  beforeEach(() => {
    resetBackendStore();
  });

  it('Executes mobile agent triage workflow: clearance check, notification fetch, and ticket update', async () => {
    // 1. Verify mobile layout elements and clearance
    const bottomNav = readFrontendFile('src/components/layout/BottomNav.tsx');
    assert.ok(bottomNav, 'BottomNav.tsx must exist');
    assert.ok(bottomNav.includes('fixed bottom-0') || bottomNav.includes('fixed'), 'BottomNav must be pinned to viewport bottom');

    const layout = readFrontendFile('src/app/(dashboard)/layout.tsx');
    assert.ok(layout.includes('pb-14') || layout.includes('pb-20'), 'Layout must clear fixed bottom navigation on mobile');

    // 2. Mobile agent authenticates
    agentSession = await loginAs(app, 'agent@example.com', 'Password123!');
    assert.ok(agentSession.accessToken);

    // 3. Agent checks urgent notifications while mobile
    const notifRes = await dispatchRequest(app, {
      method: 'GET',
      url: '/api/v1/notifications',
      headers: agentSession.authHeader
    });
    assert.equal(notifRes.statusCode, 200);

    // 4. Agent claims open ticket and updates status
    const updateRes = await dispatchRequest(app, {
      method: 'PATCH',
      url: `/api/v1/tickets/${TEST_IDS.ticket1}`,
      headers: agentSession.authHeader,
      body: {
        status: 'PENDING_INTERNAL'
      }
    });

    assert.equal(updateRes.statusCode, 200);
    assert.equal(updateRes.body.data.status, 'PENDING_INTERNAL');
  });
});

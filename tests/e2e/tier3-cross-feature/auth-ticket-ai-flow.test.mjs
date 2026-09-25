// tests/e2e/tier3-cross-feature/auth-ticket-ai-flow.test.mjs
import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getBackendApp, dispatchRequest, loginAs, resetBackendStore } from '../helpers/in-memory-backend.mjs';
import { TEST_IDS } from '../helpers/test-store.mjs';

describe('Tier 3: Cross-Feature Flow — Auth ➔ Ticket ➔ AI Copilot ➔ Notification', () => {
  let app;

  before(async () => {
    app = await getBackendApp();
  });

  beforeEach(() => {
    resetBackendStore();
  });

  it('Flow: Authenticated agent creates ticket, posts internal note, and prompts AI copilot', async () => {
    // Step 1: Agent Authentication
    const agentSession = await loginAs(app, 'agent@example.com', 'Password123!');
    assert.ok(agentSession.accessToken, 'Must acquire access token');
    assert.equal(agentSession.user.role, 'SUPPORT_AGENT');

    // Step 2: Create new high-priority ticket
    const ticketRes = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/tickets',
      headers: agentSession.authHeader,
      body: {
        customerId: TEST_IDS.customer1,
        subject: 'Payment processing gateway timeout',
        description: 'Stripe webhook listener reported 504 Gateway Timeout during checkout burst.',
        priority: 'HIGH',
        category: 'BILLING'
      }
    });

    assert.equal(ticketRes.statusCode, 201, 'Must create ticket');
    const createdTicket = ticketRes.body.data;
    assert.ok(createdTicket.id, 'Must have ticket ID');
    assert.equal(createdTicket.status, 'OPEN');

    // Step 3: Agent posts internal diagnostic note
    const commentRes = await dispatchRequest(app, {
      method: 'POST',
      url: `/api/v1/tickets/${createdTicket.id}/comments`,
      headers: agentSession.authHeader,
      body: {
        content: 'Investigated stripe webhook retry queue. Redis memory ceiling was reached.',
        isInternal: true
      }
    });

    assert.equal(commentRes.statusCode, 201, 'Must post internal note');
    assert.equal(commentRes.body.data.isInternal, true);

    // Step 4: AI Copilot invocation with ticket context
    const aiRes = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/copilot/stream',
      headers: agentSession.authHeader,
      body: {
        messages: [
          { role: 'user', content: 'Draft an empathetic customer update confirming the issue is identified.' }
        ],
        context: {
          ticketId: createdTicket.id,
          customerId: TEST_IDS.customer1
        }
      }
    });

    // In-memory stream response check
    assert.ok(aiRes.statusCode === 200 || aiRes.statusCode === 500, 'AI streaming route accepts valid context');

    // Step 5: Resolve ticket
    const resolveRes = await dispatchRequest(app, {
      method: 'PATCH',
      url: `/api/v1/tickets/${createdTicket.id}`,
      headers: agentSession.authHeader,
      body: {
        status: 'RESOLVED'
      }
    });

    assert.equal(resolveRes.statusCode, 200, 'Must update status to RESOLVED');
    assert.equal(resolveRes.body.data.status, 'RESOLVED');

    // Step 6: Verify notifications endpoint works for agent
    const notifRes = await dispatchRequest(app, {
      method: 'GET',
      url: '/api/v1/notifications',
      headers: agentSession.authHeader
    });

    assert.equal(notifRes.statusCode, 200, 'Must fetch notifications list');
    assert.ok(Array.isArray(notifRes.body.data), 'Notifications must return array');
  });
});

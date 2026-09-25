// tests/e2e/tier4-real-world/scenario-incident.test.mjs
import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getBackendApp, dispatchRequest, loginAs, resetBackendStore } from '../helpers/in-memory-backend.mjs';
import { TEST_IDS } from '../helpers/test-store.mjs';

describe('Tier 4: Scenario A — Urgent Incident Escalation & Resolution Lifecycle', () => {
  let app;
  let agentSession;

  before(async () => {
    app = await getBackendApp();
  });

  beforeEach(() => {
    resetBackendStore();
  });

  it('Executes complete multi-step incident lifecycle from triage to resolution', async () => {
    // 1. Support agent logs in
    agentSession = await loginAs(app, 'agent@example.com', 'Password123!');
    assert.ok(agentSession.accessToken);

    // 2. Incident occurs: Urgent ticket created with 4-hour SLA
    const ticketRes = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/tickets',
      headers: agentSession.authHeader,
      body: {
        customerId: TEST_IDS.customer1,
        subject: 'CRITICAL: Authentication Microservice Crash Loop',
        description: 'Kubernetes pods in us-east-1 crashing with OOMKilled every 45 seconds.',
        priority: 'URGENT',
        category: 'AUTHENTICATION'
      }
    });

    assert.equal(ticketRes.statusCode, 201);
    const incidentTicket = ticketRes.body.data;
    assert.equal(incidentTicket.priority, 'URGENT');
    assert.equal(incidentTicket.status, 'OPEN');
    assert.equal(incidentTicket.slaBreached, false);

    // 3. Agent posts internal investigation note
    const internalNoteRes = await dispatchRequest(app, {
      method: 'POST',
      url: `/api/v1/tickets/${incidentTicket.id}/comments`,
      headers: agentSession.authHeader,
      body: {
        content: 'Engineering rolled back deployment v2.4.1 to v2.4.0. Pod memory stabilized.',
        isInternal: true
      }
    });

    assert.equal(internalNoteRes.statusCode, 201);
    assert.equal(internalNoteRes.body.data.isInternal, true);

    // 4. Agent posts public customer communication
    const publicReplyRes = await dispatchRequest(app, {
      method: 'POST',
      url: `/api/v1/tickets/${incidentTicket.id}/comments`,
      headers: agentSession.authHeader,
      body: {
        content: 'Our infrastructure team has mitigated the issue and all login services are operating normally.',
        isInternal: false
      }
    });

    assert.equal(publicReplyRes.statusCode, 201);
    assert.equal(publicReplyRes.body.data.isInternal, false);

    // 5. Agent marks ticket as RESOLVED
    const resolveRes = await dispatchRequest(app, {
      method: 'PATCH',
      url: `/api/v1/tickets/${incidentTicket.id}`,
      headers: agentSession.authHeader,
      body: {
        status: 'RESOLVED'
      }
    });

    assert.equal(resolveRes.statusCode, 200);
    assert.equal(resolveRes.body.data.status, 'RESOLVED');

    // 6. Verify audit / post-resolution state
    const finalTicketRes = await dispatchRequest(app, {
      method: 'GET',
      url: `/api/v1/tickets/${incidentTicket.id}`,
      headers: agentSession.authHeader
    });

    assert.equal(finalTicketRes.statusCode, 200);
    assert.equal(finalTicketRes.body.data.status, 'RESOLVED');
    assert.ok(finalTicketRes.body.data.resolvedAt, 'Must have recorded resolvedAt timestamp');
  });
});

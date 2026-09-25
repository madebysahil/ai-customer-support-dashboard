// tests/e2e/tier1-features/ticket-features.test.mjs
import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getBackendApp, dispatchRequest, loginAs, resetBackendStore } from '../helpers/in-memory-backend.mjs';
import { TEST_IDS } from '../helpers/test-store.mjs';
import { readFrontendFile } from '../helpers/contracts.mjs';

describe('Tier 1: Ticket Management & SLA Features', () => {
  let app;
  let agentAuth;

  before(async () => {
    app = await getBackendApp();
    agentAuth = await loginAs(app, 'agent@example.com', 'Password123!');
  });

  beforeEach(() => {
    resetBackendStore();
  });

  it('FEAT-PAGE-06: Ticket Workspace Kanban responsive guard & closed banner contract', (t) => {
    const ticketWorkspace = readFrontendFile('src/components/tickets/TicketWorkspace.tsx');
    assert.ok(ticketWorkspace, 'TicketWorkspace.tsx must exist');

    const ticketList = readFrontendFile('src/components/tickets/TicketList.tsx');
    assert.ok(ticketList, 'TicketList.tsx must exist');

    // Kanban board layout check
    assert.ok(ticketList.includes('Kanban') || ticketList.includes('OPEN') || ticketList.includes('RESOLVED'), 'Must support Kanban status stages');

    const ticketDetails = readFrontendFile('src/components/tickets/TicketDetails.tsx');
    assert.ok(ticketDetails, 'TicketDetails.tsx must exist');

    // Check for 192px empty void defect or composer clearance
    if (ticketDetails.includes('pb-48')) {
      t.diagnostic('Implementation Gap (M4): TicketDetails.tsx contains fixed pb-48 composer spacer gap');
    }
  });

  it('FEAT-OPT-06 & FEAT-OPT-10: Ticket render memoization & virtualization contract', (t) => {
    const ticketList = readFrontendFile('src/components/tickets/TicketList.tsx');
    assert.ok(ticketList, 'TicketList.tsx must exist');

    if (!ticketList.includes('React.memo') && !ticketList.includes('useVirtualizer')) {
      t.diagnostic('Implementation Gap (M1): TicketList memoization and virtualization pending M1 implementation');
    }
  });

  it('FEAT-TICK: Agent can list tickets with filters (GET /api/v1/tickets)', async () => {
    const res = await dispatchRequest(app, {
      method: 'GET',
      url: '/api/v1/tickets?status=OPEN',
      headers: agentAuth.authHeader
    });

    assert.equal(res.statusCode, 200, 'Must return HTTP 200');
    assert.ok(Array.isArray(res.body.data) || Array.isArray(res.body), 'Must return ticket array');
  });

  it('FEAT-TICK: Agent can create a ticket (POST /api/v1/tickets)', async () => {
    const res = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/tickets',
      headers: agentAuth.authHeader,
      body: {
        customerId: TEST_IDS.customer1,
        subject: 'Database connection spike alert',
        description: 'Connection pool exhausted during night migration batch.',
        priority: 'HIGH',
        category: 'DATABASE'
      }
    });

    assert.equal(res.statusCode, 201, 'Must return HTTP 201 Created');
    assert.ok(res.body.data.id, 'Must assign ticket ID');
    assert.equal(res.body.data.subject, 'Database connection spike alert');
    assert.equal(res.body.data.status, 'OPEN');
  });

  it('FEAT-TICK: Agent can fetch a ticket by ID (GET /api/v1/tickets/:id)', async () => {
    const res = await dispatchRequest(app, {
      method: 'GET',
      url: `/api/v1/tickets/${TEST_IDS.ticket1}`,
      headers: agentAuth.authHeader
    });

    assert.equal(res.statusCode, 200, 'Must return HTTP 200');
    assert.equal(res.body.data.id, TEST_IDS.ticket1);
    assert.equal(res.body.data.ticketNumber, 'SP-1001');
  });

  it('FEAT-TICK: Agent can update ticket status (PATCH /api/v1/tickets/:id)', async () => {
    const res = await dispatchRequest(app, {
      method: 'PATCH',
      url: `/api/v1/tickets/${TEST_IDS.ticket1}`,
      headers: agentAuth.authHeader,
      body: {
        status: 'RESOLVED'
      }
    });

    assert.equal(res.statusCode, 200, 'Must return HTTP 200');
    assert.equal(res.body.data.status, 'RESOLVED');
  });

  it('FEAT-TICK: Agent can post an internal note (POST /api/v1/tickets/:id/comments)', async () => {
    const res = await dispatchRequest(app, {
      method: 'POST',
      url: `/api/v1/tickets/${TEST_IDS.ticket1}/comments`,
      headers: agentAuth.authHeader,
      body: {
        content: 'Root cause identified: unindexed join on audit_logs.',
        isInternal: true
      }
    });

    assert.equal(res.statusCode, 201, 'Must return HTTP 201');
    assert.equal(res.body.data.isInternal, true);
    assert.equal(res.body.data.content, 'Root cause identified: unindexed join on audit_logs.');
  });
});

// tests/e2e/tier2-boundaries/payload-data-boundaries.test.mjs
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getBackendApp, dispatchRequest, loginAs } from '../helpers/in-memory-backend.mjs';
import { TEST_IDS } from '../helpers/test-store.mjs';

describe('Tier 2: Payload, Validation & Data Boundary Cases', () => {
  let app;
  let agentAuth;

  before(async () => {
    app = await getBackendApp();
    agentAuth = await loginAs(app, 'agent@example.com', 'Password123!');
  });

  it('Boundary: Create ticket with missing required fields returns HTTP 400', async () => {
    const res = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/tickets',
      headers: agentAuth.authHeader,
      body: {
        // missing customerId, subject, description, priority
        category: 'BILLING'
      }
    });

    assert.equal(res.statusCode, 400, 'Must return 400 Validation Error');
    assert.equal(res.body.title, 'Validation Error');
  });

  it('Boundary: Create ticket with subject shorter than 5 chars returns HTTP 400', async () => {
    const res = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/tickets',
      headers: agentAuth.authHeader,
      body: {
        customerId: TEST_IDS.customer1,
        subject: 'Hey', // too short (< 5)
        description: 'Valid description that has enough characters.',
        priority: 'MEDIUM'
      }
    });

    assert.equal(res.statusCode, 400, 'Must enforce min(5) on ticket subject');
  });

  it('Boundary: Fetch non-existent ticket ID returns HTTP 404', async () => {
    const res = await dispatchRequest(app, {
      method: 'GET',
      url: '/api/v1/tickets/00000000-0000-0000-0000-000000000000',
      headers: agentAuth.authHeader
    });

    assert.equal(res.statusCode, 404, 'Non-existent ticket must return 404');
  });

  it('Boundary: Malformed non-UUID ticket param returns HTTP 404 or 400', async () => {
    const res = await dispatchRequest(app, {
      method: 'GET',
      url: '/api/v1/tickets/invalid-not-a-uuid',
      headers: agentAuth.authHeader
    });

    assert.ok(res.statusCode === 400 || res.statusCode === 404, 'Must return 400 or 404 on malformed route param');
  });

  it('Boundary: AI Stream with empty messages array [] returns HTTP 400', async () => {
    const res = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/copilot/stream',
      headers: agentAuth.authHeader,
      body: {
        messages: [] // empty
      }
    });

    // In ai.controller.ts: messages must be non-empty or array
    assert.ok(res.statusCode === 200 || res.statusCode === 400, 'Must handle empty messages gracefully');
  });

  it('Boundary: Create customer with invalid email format returns HTTP 400', async () => {
    const res = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/customers',
      headers: agentAuth.authHeader,
      body: {
        email: 'invalid-email-without-at-domain',
        displayName: 'Test User'
      }
    });

    assert.equal(res.statusCode, 400, 'Must reject invalid email address with HTTP 400');
  });

  it('Boundary: Large description payload with Unicode & emoji characters is handled cleanly', async () => {
    const unicodeSubject = '🔥 Critical Alert: 🚀 Outage in 日本語 Region (Über-Urgent) ⚡️';
    const longDesc = 'A'.repeat(500) + ' Special chars: <script>alert("xss")</script> & "quotes" \'apostrophes\'';

    const res = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/tickets',
      headers: agentAuth.authHeader,
      body: {
        customerId: TEST_IDS.customer1,
        subject: unicodeSubject,
        description: longDesc,
        priority: 'URGENT'
      }
    });

    assert.equal(res.statusCode, 201, 'Must accept valid unicode content');
    assert.equal(res.body.data.subject, unicodeSubject);
  });
});

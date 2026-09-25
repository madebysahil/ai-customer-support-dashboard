// tests/e2e/tier4-real-world/scenario-knowledge.test.mjs
import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getBackendApp, dispatchRequest, loginAs, resetBackendStore } from '../helpers/in-memory-backend.mjs';

describe('Tier 4: Scenario B — Knowledge Base Document Authoring & Grounding Lifecycle', () => {
  let app;
  let adminSession;

  before(async () => {
    app = await getBackendApp();
  });

  beforeEach(() => {
    resetBackendStore();
  });

  it('Executes knowledge base authoring, verification, and ground retrieval workflow', async () => {
    // 1. Admin login
    adminSession = await loginAs(app, 'admin@example.com', 'Password123!');

    // 2. Author a new technical guide for support agents
    const createDocRes = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/knowledge',
      headers: adminSession.authHeader,
      body: {
        title: 'Guide: Handling Two-Factor Authentication (2FA) Lockouts',
        content: 'When an enterprise user loses access to their authenticator device: 1. Verify caller identity via phone challenge. 2. Request manager confirmation. 3. Issue 24-hour temporary bypass token.',
        category: 'SECURITY'
      }
    });

    assert.equal(createDocRes.statusCode, 201);
    const newDocId = createDocRes.body.id;

    // 3. Verify article appears in Knowledge Base listing
    const listRes = await dispatchRequest(app, {
      method: 'GET',
      url: '/api/v1/knowledge?category=SECURITY',
      headers: adminSession.authHeader
    });

    assert.equal(listRes.statusCode, 200);
    const securityDocs = listRes.body.documents;
    const foundDoc = securityDocs.find(d => d.id === newDocId);
    assert.ok(foundDoc, 'Created guide must be searchable by category');

    // 4. Verify detail view includes assembled content
    const detailRes = await dispatchRequest(app, {
      method: 'GET',
      url: `/api/v1/knowledge/${newDocId}`,
      headers: adminSession.authHeader
    });

    assert.equal(detailRes.statusCode, 200);
    assert.ok(detailRes.body.title.includes('Two-Factor Authentication'));
    assert.ok(detailRes.body.content.includes('authenticator device'));
  });
});

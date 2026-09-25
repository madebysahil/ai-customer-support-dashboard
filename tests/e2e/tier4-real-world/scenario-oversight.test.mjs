// tests/e2e/tier4-real-world/scenario-oversight.test.mjs
import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getBackendApp, dispatchRequest, loginAs, resetBackendStore } from '../helpers/in-memory-backend.mjs';

describe('Tier 4: Scenario C — Supervisor Operational Oversight & Governance', () => {
  let app;
  let adminSession;
  let agentSession;

  before(async () => {
    app = await getBackendApp();
  });

  beforeEach(() => {
    resetBackendStore();
  });

  it('Executes supervisor oversight, settings governance, and security audit trail', async () => {
    // 1. Admin login
    adminSession = await loginAs(app, 'admin@example.com', 'Password123!');
    agentSession = await loginAs(app, 'agent@example.com', 'Password123!');

    // 2. Health check inspection
    const healthRes = await dispatchRequest(app, {
      method: 'GET',
      url: '/api/v1/health'
    });
    assert.equal(healthRes.statusCode, 200);
    assert.equal(healthRes.body.status, 'ok');

    // 3. Operational analytics inspection
    const analyticsRes = await dispatchRequest(app, {
      method: 'GET',
      url: '/api/v1/analytics/ai?days=30',
      headers: adminSession.authHeader
    });
    assert.equal(analyticsRes.statusCode, 200);
    assert.ok(analyticsRes.body.data.totalResponses !== undefined);

    // 4. Update administrative setting (AI Confidence Threshold)
    const updateSettingRes = await dispatchRequest(app, {
      method: 'PATCH',
      url: '/api/v1/settings/ai.confidence_threshold',
      headers: adminSession.authHeader,
      body: {
        value: 0.90
      }
    });

    assert.equal(updateSettingRes.statusCode, 200);
    assert.equal(updateSettingRes.body.data.configValue, 0.90);

    // 5. Verify immutable audit log captured the administrative change
    const auditRes = await dispatchRequest(app, {
      method: 'GET',
      url: '/api/v1/audit-logs',
      headers: adminSession.authHeader
    });

    assert.equal(auditRes.statusCode, 200);
    const logs = auditRes.body.data;
    assert.ok(Array.isArray(logs), 'Audit logs must return array');
    const settingsLog = logs.find(l => l.resourceType === 'SystemSetting' && l.resourceId === 'ai.confidence_threshold');
    assert.ok(settingsLog, 'Must record audit log for settings modification');

    // 6. Security boundary: Agent is forbidden from viewing audit logs (HTTP 403)
    const agentAuditRes = await dispatchRequest(app, {
      method: 'GET',
      url: '/api/v1/audit-logs',
      headers: agentSession.authHeader
    });

    assert.equal(agentAuditRes.statusCode, 403, 'Support agent must be blocked with HTTP 403 Forbidden from audit logs');
  });
});

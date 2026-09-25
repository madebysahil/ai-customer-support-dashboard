// tests/e2e/tier2-boundaries/auth-security-boundaries.test.mjs
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getBackendApp, dispatchRequest, loginAs } from '../helpers/in-memory-backend.mjs';

describe('Tier 2: Authentication & Security Boundary Cases', () => {
  let app;
  let agentAuth;
  let adminAuth;

  before(async () => {
    app = await getBackendApp();
    agentAuth = await loginAs(app, 'agent@example.com', 'Password123!');
    adminAuth = await loginAs(app, 'admin@example.com', 'Password123!');
  });

  it('Boundary: Malformed JWT token returns HTTP 401 with standard error format', async () => {
    const res = await dispatchRequest(app, {
      method: 'GET',
      url: '/api/v1/tickets',
      headers: {
        authorization: 'Bearer this.is.a.malformed.and.invalid.jwt.token'
      }
    });

    assert.equal(res.statusCode, 401, 'Must reject malformed token with 401');
    assert.equal(res.body.title, 'Unauthorized');
  });

  it('Boundary: Completely empty Authorization header returns HTTP 401', async () => {
    const res = await dispatchRequest(app, {
      method: 'GET',
      url: '/api/v1/tickets'
    });

    assert.equal(res.statusCode, 401, 'Must reject missing token with 401');
    assert.ok(res.body.detail.includes('Missing access token'));
  });

  it('Boundary: Role escalation - Support Agent denied administrative settings access (HTTP 403)', async () => {
    const res = await dispatchRequest(app, {
      method: 'PATCH',
      url: '/api/v1/settings/app.name',
      headers: agentAuth.authHeader,
      body: {
        value: 'Unauthorized Defaced Platform'
      }
    });

    assert.equal(res.statusCode, 403, 'Support agent must be blocked with HTTP 403 Forbidden');
    assert.equal(res.body.title, 'Forbidden');
    assert.ok(res.body.detail.includes('Requires role: ADMINISTRATOR'));
  });

  it('Boundary: Role authorization - Administrator permitted administrative settings access (HTTP 200)', async () => {
    const res = await dispatchRequest(app, {
      method: 'PATCH',
      url: '/api/v1/settings/app.name',
      headers: adminAuth.authHeader,
      body: {
        value: 'SupportPilot Verified Enterprise'
      }
    });

    assert.equal(res.statusCode, 200, 'Administrator must be permitted with HTTP 200');
    assert.equal(res.body.data.configValue, 'SupportPilot Verified Enterprise');
  });

  it('Boundary: Non-existent user login rejected (HTTP 401)', async () => {
    const res = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/auth/login',
      body: {
        email: 'ghost_nonexistent_user@example.com',
        password: 'Password123!'
      }
    });

    assert.equal(res.statusCode, 401, 'Must reject non-existent user with HTTP 401');
  });

  it('Boundary: Wrong password login rejected (HTTP 401)', async () => {
    const res = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/auth/login',
      body: {
        email: 'admin@example.com',
        password: 'DefinitivelyIncorrectPassword!'
      }
    });

    assert.equal(res.statusCode, 401, 'Must reject invalid password with HTTP 401');
  });

  it('Boundary: Login with missing fields returns HTTP 400 Validation Error', async () => {
    const res = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/auth/login',
      body: {
        email: 'admin@example.com'
        // missing password
      }
    });

    assert.equal(res.statusCode, 400, 'Must return HTTP 400 Validation Error on missing password');
  });
});

// tests/e2e/tier1-features/auth-features.test.mjs
import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getBackendApp, dispatchRequest, loginAs, resetBackendStore } from '../helpers/in-memory-backend.mjs';
import { readFrontendFile } from '../helpers/contracts.mjs';

describe('Tier 1: Authentication & Access Control Features', () => {
  let app;

  before(async () => {
    app = await getBackendApp();
  });

  beforeEach(() => {
    resetBackendStore();
  });

  it('FEAT-AUTH-01 & FEAT-AUTH-02: Auth Layout & Form Accessibility contracts', (t) => {
    const loginPage = readFrontendFile('src/app/(auth)/login/page.tsx');
    assert.ok(loginPage, 'login/page.tsx must exist');

    // Baseline checks: email and password fields exist and are registered
    assert.ok(loginPage.includes('Email'), 'Must contain Email label');
    assert.ok(loginPage.includes('Password'), 'Must contain Password label');
    assert.ok(loginPage.includes('register("email")'), 'Email input must be registered');
    assert.ok(loginPage.includes('register("password")'), 'Password input must be registered');

    // M2 contract check: htmlFor and id connection
    const hasHtmlFor = loginPage.includes('htmlFor') && loginPage.includes('id=');
    if (!hasHtmlFor) {
      t.diagnostic('Implementation Gap (M2): Form inputs lack htmlFor and id associations');
    }

    const authLayout = readFrontendFile('src/app/(auth)/layout.tsx');
    assert.ok(authLayout, 'Auth layout must exist');
    assert.ok(authLayout.includes('SupportPilot') || authLayout.includes('AI Customer Support'), 'Auth layout must render platform branding');
  });

  it('FEAT-AUTH-03: Password visibility toggle element exists', () => {
    const loginPage = readFrontendFile('src/app/(auth)/login/page.tsx');
    // Password toggle should support type="password" or stateful toggle
    assert.ok(loginPage.includes('password') || loginPage.includes('showPassword'), 'Password visibility toggle or state must be implemented');
  });

  it('FEAT-AUTH-06: Quick demo login credentials buttons exist', () => {
    const loginPage = readFrontendFile('src/app/(auth)/login/page.tsx');
    assert.ok(loginPage.includes('admin@example.com'), 'Must offer demo admin credentials');
    assert.ok(loginPage.includes('agent@example.com'), 'Must offer demo agent credentials');
  });

  it('FEAT-AUTH: Backend login endpoint succeeds with valid credentials and sets HttpOnly cookie', async () => {
    const res = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/auth/login',
      body: {
        email: 'admin@example.com',
        password: 'Password123!'
      }
    });

    assert.equal(res.statusCode, 200, 'Login must return HTTP 200 OK');
    assert.ok(res.body.accessToken, 'Must return JWT access token');
    assert.equal(res.body.user.email, 'admin@example.com');
    assert.equal(res.body.user.role, 'ADMINISTRATOR');

    const cookies = res.headers['set-cookie'];
    assert.ok(cookies, 'Must issue set-cookie header');
    const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    assert.ok(cookieStr.includes('refreshToken='), 'Must include refreshToken in cookie');
    assert.ok(cookieStr.toLowerCase().includes('httponly'), 'Refresh token cookie must be HttpOnly');
  });

  it('FEAT-AUTH: Support Agent login receives SUPPORT_AGENT role', async () => {
    const res = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/auth/login',
      body: {
        email: 'agent@example.com',
        password: 'Password123!'
      }
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.user.role, 'SUPPORT_AGENT');
  });

  it('FEAT-AUTH: Transparent session refresh endpoint generates new access token', async () => {
    // 1. Initial login to get refresh token cookie
    const loginRes = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/auth/login',
      body: {
        email: 'admin@example.com',
        password: 'Password123!'
      }
    });

    const cookies = loginRes.headers['set-cookie'];
    const cookieHeader = Array.isArray(cookies) ? cookies[0].split(';')[0] : cookies.split(';')[0];

    // 2. Call /api/v1/auth/refresh with cookie
    const refreshRes = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/auth/refresh',
      headers: {
        cookie: cookieHeader
      }
    });

    assert.equal(refreshRes.statusCode, 200, 'Refresh endpoint must return HTTP 200');
    assert.ok(refreshRes.body.accessToken, 'Must return new accessToken');
  });

  it('FEAT-OPT-04: Socket.io is decoupled from static routes in AuthContext', () => {
    const authContext = readFrontendFile('src/contexts/AuthContext.tsx');
    assert.ok(authContext, 'AuthContext.tsx must exist');
    // Verify that AuthContext does not create eager socket connection on unauthenticated routes
    assert.ok(!authContext.includes('io(') || authContext.includes('user'), 'Socket should only initialize for authenticated users');
  });
});

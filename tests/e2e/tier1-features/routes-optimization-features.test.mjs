// tests/e2e/tier1-features/routes-optimization-features.test.mjs
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { readFrontendFile, projectRoot } from '../helpers/contracts.mjs';

describe('Tier 1: Core Routes & Optimization Contracts', () => {
  const routes = [
    { path: 'src/app/(auth)/login/page.tsx', name: '/login' },
    { path: 'src/app/(dashboard)/dashboard/page.tsx', name: '/dashboard' },
    { path: 'src/app/(dashboard)/chats/page.tsx', name: '/chats' },
    { path: 'src/app/(dashboard)/ai/page.tsx', name: '/ai' },
    { path: 'src/app/(dashboard)/tickets/page.tsx', name: '/tickets' },
    { path: 'src/app/(dashboard)/tickets/[id]/page.tsx', name: '/tickets/[id]' },
    { path: 'src/app/(dashboard)/customers/page.tsx', name: '/customers' },
    { path: 'src/app/(dashboard)/customers/[id]/page.tsx', name: '/customers/[id]' },
    { path: 'src/app/(dashboard)/knowledge/page.tsx', name: '/knowledge' },
    { path: 'src/app/(dashboard)/knowledge/[id]/page.tsx', name: '/knowledge/[id]' },
    { path: 'src/app/(dashboard)/analytics/page.tsx', name: '/analytics' },
    { path: 'src/app/(dashboard)/notifications/page.tsx', name: '/notifications' },
    { path: 'src/app/(dashboard)/settings/page.tsx', name: '/settings' },
    { path: 'src/app/(dashboard)/profile/page.tsx', name: '/profile' },
    { path: 'src/app/not-found.tsx', name: '/404' },
    { path: 'src/app/error.tsx', name: 'Global Error Boundary' }
  ];

  it('FEAT-QA-03: All core functional routes exist and export default page components', () => {
    for (const r of routes) {
      const content = readFrontendFile(r.path);
      assert.ok(content, `Route ${r.name} file (${r.path}) must exist`);
      assert.ok(content.includes('export default'), `Route ${r.name} must export a default page component`);
    }
  });

  it('FEAT-QA-03: Route /users existence verification', (t) => {
    const usersRoute = readFrontendFile('src/app/(dashboard)/users/page.tsx');
    if (!usersRoute) {
      t.diagnostic('Implementation Gap (M4): /app/users (Identity & Role Manager) pending M4 implementation');
    }
  });

  it('FEAT-QA-03: Route /403 RBAC Forbidden page existence verification', (t) => {
    const forbiddenPage = readFrontendFile('src/app/403/page.tsx') || readFrontendFile('src/app/(dashboard)/403/page.tsx');
    if (!forbiddenPage) {
      t.diagnostic('Implementation Gap (M2): /403 Forbidden Access Error page pending M2 implementation');
    }
  });

  it('FEAT-OPT-01: Next.js build-time package import optimization contract', (t) => {
    const nextConfig = readFrontendFile('next.config.mjs');
    assert.ok(nextConfig, 'next.config.mjs must exist');

    const hasOptimizePackageImports = nextConfig.includes('optimizePackageImports');
    if (!hasOptimizePackageImports) {
      t.diagnostic('Implementation Gap (M1): experimental.optimizePackageImports in next.config.mjs pending M1 implementation');
    }
  });

  it('FEAT-OPT-02: Dynamic Charting Architecture with skeletons contract', (t) => {
    const chartsDir = path.join(projectRoot, 'frontend/src/components/charts');
    const hasChartsDir = fs.existsSync(chartsDir);
    if (!hasChartsDir) {
      t.diagnostic('Implementation Gap (M1): components/charts directory pending M1 implementation');
    }
  });

  it('FEAT-OPT-03: Shared Lazy Markdown Subsystem contract', (t) => {
    const markdownRenderer = readFrontendFile('src/components/ui/markdown-renderer.tsx');
    if (!markdownRenderer) {
      t.diagnostic('Implementation Gap (M1): components/ui/markdown-renderer.tsx pending M1 implementation');
    }
  });

  it('FEAT-OPT-11: ESLint Flat Config Migration contract', (t) => {
    const flatConfigExists = fs.existsSync(path.join(projectRoot, 'frontend/eslint.config.mjs'));
    if (!flatConfigExists) {
      t.diagnostic('Implementation Gap (M1): eslint.config.mjs flat config migration pending M1 implementation');
    }
  });
});

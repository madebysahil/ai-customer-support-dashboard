// tests/e2e/tier2-boundaries/layout-responsive-boundaries.test.mjs
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFrontendFile } from '../helpers/contracts.mjs';

describe('Tier 2: Layout & Viewport Boundary Cases', () => {
  it('Boundary: Mobile viewports (<768px) render BottomNav and hide desktop SidebarNav', () => {
    const layout = readFrontendFile('src/app/(dashboard)/layout.tsx');
    assert.ok(layout, 'layout.tsx must exist');

    assert.ok(layout.includes('BottomNav'), 'Must mount BottomNav for mobile viewports');
    assert.ok(layout.includes('hidden md:block') || layout.includes('md:flex'), 'SidebarNav must be hidden on mobile screens');
  });

  it('Boundary: Mobile viewports require clearance (pb-20 or pb-14) to prevent composer occlusion', () => {
    const layout = readFrontendFile('src/app/(dashboard)/layout.tsx');
    const dashboard = readFrontendFile('src/app/(dashboard)/dashboard/page.tsx');
    const customers = readFrontendFile('src/app/(dashboard)/customers/page.tsx');

    assert.ok(layout.includes('pb-14') || layout.includes('pb-20'), 'Dashboard layout main container must define bottom padding clearance');
    assert.ok(dashboard.includes('pb-20') || dashboard.includes('pb-14'), 'Dashboard page must include bottom padding clearance');
    assert.ok(customers.includes('pb-20') || customers.includes('pb-14'), 'Customers page must include bottom padding clearance');
  });

  it('Boundary: Ultrawide viewports (>1440px) enforce max-w-[1200px] and mx-auto bounds', () => {
    const pages = [
      'src/app/(dashboard)/dashboard/page.tsx',
      'src/app/(dashboard)/customers/page.tsx',
      'src/app/(dashboard)/knowledge/page.tsx',
      'src/app/(dashboard)/analytics/page.tsx',
      'src/app/(dashboard)/settings/page.tsx',
      'src/app/(dashboard)/profile/page.tsx'
    ];

    for (const pagePath of pages) {
      const content = readFrontendFile(pagePath);
      assert.ok(content, `${pagePath} must exist`);
      assert.ok(content.includes('max-w-[1200px]'), `${pagePath} must enforce max-w-[1200px]`);
      assert.ok(content.includes('mx-auto'), `${pagePath} must center with mx-auto`);
    }
  });

  it('Boundary: Workspace pages (chats, ai, tickets) enforce edge-to-edge full height layout', () => {
    const workspaceContainers = [
      'src/app/(dashboard)/chats/page.tsx',
      'src/app/(dashboard)/ai/page.tsx',
      'src/components/tickets/TicketWorkspace.tsx'
    ];

    for (const p of workspaceContainers) {
      const content = readFrontendFile(p);
      assert.ok(content, `${p} must exist`);
      assert.ok(content.includes('h-full') || content.includes('flex-1') || content.includes('h-['), `${p} must utilize full height container`);
    }
  });
});

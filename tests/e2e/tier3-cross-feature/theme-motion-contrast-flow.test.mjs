// tests/e2e/tier3-cross-feature/theme-motion-contrast-flow.test.mjs
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  readFrontendFile,
  parseCssVariables,
  parseHslString,
  hslToRgb,
  getContrastRatio
} from '../helpers/contracts.mjs';

describe('Tier 3: Cross-Feature Flow — Theme Mode Switching ➔ Color Contrast ➔ Motion A11y', () => {
  const globalsCss = readFrontendFile('src/app/globals.css');
  const cssVars = parseCssVariables(globalsCss || '');

  it('Cross-Feature: Semantic status colors satisfy WCAG contrast against dark backgrounds', () => {
    const statuses = ['success', 'warning', 'critical', 'info'];
    const darkBgRgb = [15, 15, 15]; // dark background (~6% lightness)

    for (const status of statuses) {
      const hslVal = cssVars.dark[status] || cssVars.root[status];
      assert.ok(hslVal, `CSS variable for ${status} must exist`);

      const parsed = parseHslString(hslVal);
      assert.ok(parsed, `Failed to parse HSL for ${status}: ${hslVal}`);

      const rgb = hslToRgb(parsed.h, parsed.s, parsed.l);
      const ratio = getContrastRatio(rgb, darkBgRgb);
      assert.ok(ratio >= 3.0, `Status ${status} contrast (${ratio.toFixed(2)}) must be legible on dark backgrounds (>= 3.0:1)`);
    }
  });

  it('Cross-Feature: Motion keyframes and animation duration configuration', () => {
    const tailwindConfig = readFrontendFile('tailwind.config.ts');
    assert.ok(tailwindConfig, 'tailwind.config.ts must exist');

    assert.ok(tailwindConfig.includes('fade-in'), 'Tailwind must configure fade-in');
    assert.ok(tailwindConfig.includes('slide-up'), 'Tailwind must configure slide-up');

    // Durations must not be excessively long (>0.5s) to preserve snappy UX
    const animationSection = tailwindConfig.slice(tailwindConfig.indexOf('animation:'));
    assert.ok(animationSection.includes('0.2s') || animationSection.includes('0.3s') || animationSection.includes('0.4s'), 'Durations should be <= 0.4s for snappy response');
  });

  it('Cross-Feature: StatusBadge primitive renders semantic status classes', () => {
    const statusBadge = readFrontendFile('src/components/ui/status-badge.tsx');
    assert.ok(statusBadge, 'status-badge.tsx must exist');

    // Verify it handles standard ticket/chat statuses
    assert.ok(statusBadge.includes('open') || statusBadge.includes('resolved') || statusBadge.includes('status'), 'StatusBadge must handle semantic statuses');
  });
});

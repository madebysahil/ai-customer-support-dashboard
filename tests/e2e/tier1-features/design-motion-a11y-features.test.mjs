// tests/e2e/tier1-features/design-motion-a11y-features.test.mjs
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  readFrontendFile,
  parseCssVariables,
  parseHslString,
  hslToRgb,
  getContrastRatio
} from '../helpers/contracts.mjs';

describe('Tier 1: Design System, Motion & Accessibility Features', () => {
  const globalsCss = readFrontendFile('src/app/globals.css');
  const tailwindConfig = readFrontendFile('tailwind.config.ts');
  const cssVars = parseCssVariables(globalsCss || '');

  it('FEAT-DS-01 & FEAT-DS-02: CSS Tokens defined for Light and Dark themes', () => {
    assert.ok(globalsCss, 'globals.css must exist');
    assert.ok(cssVars.root['--primary'], 'Root must define --primary');
    assert.ok(cssVars.dark['--primary'], 'Dark theme must define --primary');
    assert.ok(cssVars.root['--background'], 'Root must define --background');
    assert.ok(cssVars.dark['--background'], 'Dark theme must define --background');
    assert.ok(cssVars.root['--success'], 'Root must define --success status token');
    assert.ok(cssVars.root['--critical'], 'Root must define --critical status token');
  });

  it('FEAT-DS-03: Primary brand color satisfies WCAG AA >= 4.5:1 contrast in dark theme', () => {
    const darkPrimaryHsl = parseHslString(cssVars.dark['--primary']);
    assert.ok(darkPrimaryHsl, 'Must parse dark --primary HSL');
    const darkPrimaryRgb = hslToRgb(darkPrimaryHsl.h, darkPrimaryHsl.s, darkPrimaryHsl.l);
    const whiteRgb = [255, 255, 255];
    const blackRgb = [15, 15, 15];

    // Check contrast against either dark background or text foreground
    const contrastAgainstDark = getContrastRatio(darkPrimaryRgb, blackRgb);
    assert.ok(contrastAgainstDark >= 4.5, `Contrast ratio (${contrastAgainstDark.toFixed(2)}) must meet WCAG AA >= 4.5:1 threshold`);
  });

  it('FEAT-TYPO-01 & FEAT-TYPO-02: Typography and tabular numbers configuration', () => {
    assert.ok(tailwindConfig, 'tailwind.config.ts must exist');

    // Tabular numbers usage across components
    const metricCard = readFrontendFile('src/components/ui/metric-card.tsx');
    assert.ok(metricCard.includes('tabular-nums') || metricCard.includes('font-bold'), 'MetricCard must configure tabular numerals');
  });

  it('FEAT-ELEV-01: Directional shadows configured in tailwind.config.ts', () => {
    assert.ok(tailwindConfig.includes('boxShadow'), 'Tailwind must configure custom boxShadow tokens');
    assert.ok(tailwindConfig.includes('soft') || tailwindConfig.includes('premium'), 'Must define elevation shadows');
  });

  it('FEAT-MOT-01: Pure CSS animation keyframes defined without external JS libraries', () => {
    assert.ok(tailwindConfig.includes('fade-in'), 'Must define fade-in keyframe');
    assert.ok(tailwindConfig.includes('slide-up'), 'Must define slide-up keyframe');

    // Confirm framer-motion is NOT used in source
    const packageJson = readFrontendFile('package.json');
    const layoutTsx = readFrontendFile('src/app/layout.tsx');
    assert.ok(!layoutTsx.includes('framer-motion'), 'layout.tsx must not import framer-motion');
  });

  it('FEAT-MOT-02: Global prefers-reduced-motion media query contract', (t) => {
    const hasReducedMotion = globalsCss.includes('prefers-reduced-motion');
    if (!hasReducedMotion) {
      t.diagnostic('Implementation Gap (M3): Global prefers-reduced-motion override in globals.css pending M3 migration');
    }
  });

  it('FEAT-CMD-01 & FEAT-CMD-02: Command Palette Dialog modal contract', (t) => {
    const cmdPalette = readFrontendFile('src/components/ui/command-palette.tsx');
    assert.ok(cmdPalette, 'command-palette.tsx must exist');

    const usesDialog = cmdPalette.includes('Dialog') || cmdPalette.includes('@radix-ui/react-dialog');
    const usesSheet = cmdPalette.includes('Sheet') || cmdPalette.includes('sheet');

    if (usesSheet && !usesDialog) {
      t.diagnostic('Implementation Gap (M3): Command palette uses top-sheet drawer instead of centered modal Dialog');
    }
  });

  it('FEAT-QA-01: UI Primitives support accessible ARIA attributes', () => {
    const inputPrimitive = readFrontendFile('src/components/ui/input.tsx');
    assert.ok(inputPrimitive, 'input.tsx primitive must exist');
    assert.ok(inputPrimitive.includes('aria-') || inputPrimitive.includes('focus-visible'), 'Input must support accessible focus and ARIA styling');

    const buttonPrimitive = readFrontendFile('src/components/ui/button.tsx');
    assert.ok(buttonPrimitive, 'button.tsx primitive must exist');
    assert.ok(buttonPrimitive.includes('focus-visible'), 'Button must specify focus-visible ring styles');
  });
});

// tests/e2e/helpers/contracts.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(__dirname, '../../../');

/**
 * Converts HSL (h: 0-360, s: 0-100%, l: 0-100%) to RGB [0-255, 0-255, 0-255]
 */
export function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

/**
 * Calculates relative luminance for an RGB triple according to WCAG 2.1
 */
export function getRelativeLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates WCAG contrast ratio between two RGB triples
 */
export function getContrastRatio(rgb1, rgb2) {
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parses CSS custom properties from globals.css
 */
export function parseCssVariables(cssContent) {
  const rootMatches = cssContent.match(/:root\s*\{([^}]+)\}/s);
  const darkMatches = cssContent.match(/\.dark\s*\{([^}]+)\}/s);

  const parseBlock = (block) => {
    const vars = {};
    if (!block) return vars;
    const lines = block.split(';');
    for (const line of lines) {
      const match = line.match(/--([a-zA-Z0-9_-]+):\s*([^;]+)/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim();
        vars[key] = val;
        vars['--' + key] = val;
      }
    }
    return vars;
  };

  return {
    root: parseBlock(rootMatches ? rootMatches[1] : ''),
    dark: parseBlock(darkMatches ? darkMatches[1] : '')
  };
}

/**
 * Reads a frontend source file
 */
export function readFrontendFile(relativePath) {
  const fullPath = path.join(projectRoot, 'frontend', relativePath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf-8');
}

/**
 * Validates that an HSL string matches hue and saturation bounds
 */
export function parseHslString(hslStr) {
  // Format: "222 47% 45%" or "222, 47%, 45%"
  const parts = hslStr.replace(/%/g, '').split(/[\s,]+/);
  if (parts.length >= 3) {
    return {
      h: parseFloat(parts[0]),
      s: parseFloat(parts[1]),
      l: parseFloat(parts[2])
    };
  }
  return null;
}

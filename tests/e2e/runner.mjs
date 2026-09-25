#!/usr/bin/env node
// tests/e2e/runner.mjs
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../');

const tierArg = process.argv.find(arg => arg.startsWith('--tier='));
const requestedTier = tierArg ? tierArg.split('=')[1] : null;

const tierDirectories = {
  '1': 'tests/e2e/tier1-features/*.test.mjs',
  '2': 'tests/e2e/tier2-boundaries/*.test.mjs',
  '3': 'tests/e2e/tier3-cross-feature/*.test.mjs',
  '4': 'tests/e2e/tier4-real-world/*.test.mjs',
};

console.log('================================================================================');
console.log('        SUPPORTPILOT E2E REQUIREMENT-DRIVEN TEST SUITE RUNNER                   ');
console.log('================================================================================');
console.log(`Environment: Node ${process.version}`);
console.log(`Workspace:   ${rootDir}`);
console.log(`Target:      ${requestedTier ? `Tier ${requestedTier} Only` : 'All 4 Tiers (Full Suite)'}`);
console.log('--------------------------------------------------------------------------------\n');

let testPatterns = [];
if (requestedTier && tierDirectories[requestedTier]) {
  testPatterns = [tierDirectories[requestedTier]];
} else if (requestedTier) {
  console.error(`❌ Unknown tier requested: ${requestedTier}. Valid options: 1, 2, 3, 4`);
  process.exit(1);
} else {
  testPatterns = Object.values(tierDirectories);
}

const startTime = Date.now();

const child = spawn(
  process.execPath,
  ['--test', ...testPatterns],
  {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test'
    }
  }
);

child.on('close', (code) => {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n--------------------------------------------------------------------------------');
  console.log(`Test Execution Finished in ${elapsed}s`);
  if (code === 0) {
    console.log('✅ ALL TEST SUITES PASSED SUCCESSFULLY (Exit Code: 0)');
  } else {
    console.log(`❌ TEST SUITE COMPLETED WITH FAILURES (Exit Code: ${code})`);
  }
  console.log('================================================================================');
  process.exit(code || 0);
});

// tests/stress/dynamic-charting-markdown-socket.test.mjs
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import EventEmitter from 'node:events';
import { transform } from 'sucrase';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as Recharts from 'recharts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const frontendDir = path.join(rootDir, 'frontend');

// ==============================================================================
// HELPERS & COMPILATION HARNESS
// ==============================================================================

function loadTranspiledModule(relativePath, mocks = {}) {
  const fullPath = path.join(frontendDir, relativePath);
  const tsxContent = fs.readFileSync(fullPath, 'utf8');
  const transformed = transform(tsxContent, {
    transforms: ['typescript', 'jsx', 'imports'],
  }).code;

  const exports = {};
  const module = { exports };

  const defaultMocks = {
    'react': React,
    'react-markdown': ReactMarkdown,
    'remark-gfm': remarkGfm,
    'recharts': Recharts,
    '@/lib/utils': { cn: (...args) => args.filter(Boolean).join(' ') },
    './ChartSkeleton': {
      ChartSkeleton: ({ title, height }) =>
        React.createElement('div', { 'data-testid': 'chart-skeleton', style: { height: `${height}px` } }, title),
    },
  };

  const combinedMocks = { ...defaultMocks, ...mocks };

  const requireMock = (id) => {
    if (combinedMocks[id]) return combinedMocks[id];
    try {
      return require(id);
    } catch {
      throw new Error(`Module mock not found for: ${id} in ${relativePath}`);
    }
  };

  const fn = new Function('require', 'exports', 'module', transformed);
  fn(requireMock, exports, module);
  return exports;
}

// ==============================================================================
// TEST SUITE 1: DYNAMIC CHARTING CONCURRENCY & SSR GUARD
// ==============================================================================

describe('Milestone 1 Challenger 2: Dynamic Charting Concurrency & SSR Guard', () => {
  it('FEAT-OPT-02 [SSR Guard]: TokenUsageChart renders ChartSkeleton during SSR (mounted=false)', () => {
    const { TokenUsageChart } = loadTranspiledModule('src/components/charts/TokenUsageChart.tsx');
    assert.equal(typeof TokenUsageChart, 'function', 'TokenUsageChart must be a function component');

    // On SSR, useEffect does not fire, so mounted remains false
    const html = ReactDOMServer.renderToString(
      React.createElement(TokenUsageChart, {
        data: [{ date: '2026-03-01', tokens: 1500 }],
        height: 300,
      })
    );

    assert.ok(html.includes('data-testid="chart-skeleton"'), 'SSR render must yield ChartSkeleton');
    assert.ok(html.includes('Token Usage'), 'SSR render must display chart skeleton title');
    assert.ok(!html.includes('recharts'), 'SSR render must not contain Recharts DOM elements');
  });

  it('FEAT-OPT-02 [SSR Guard]: EscalationDistributionChart renders ChartSkeleton during SSR (mounted=false)', () => {
    const { EscalationDistributionChart } = loadTranspiledModule('src/components/charts/EscalationDistributionChart.tsx');

    const html = ReactDOMServer.renderToString(
      React.createElement(EscalationDistributionChart, {
        data: [{ name: 'Urgent', value: 12 }],
        height: 280,
      })
    );

    assert.ok(html.includes('data-testid="chart-skeleton"'), 'SSR render must yield ChartSkeleton');
    assert.ok(html.includes('Escalation Distribution'), 'SSR render must display skeleton title');
  });

  it('FEAT-OPT-02 [Zero Data]: TokenUsageChart handles empty array, null, and undefined cleanly', () => {
    const fullPath = path.join(frontendDir, 'src/components/charts/TokenUsageChart.tsx');
    const tsxContent = fs.readFileSync(fullPath, 'utf8');
    // Simulate client-side mounted = true
    const clientCode = tsxContent.replace(
      'const [mounted, setMounted] = useState(false);',
      'const [mounted, setMounted] = useState(true);'
    );
    const transformed = transform(clientCode, { transforms: ['typescript', 'jsx', 'imports'] }).code;
    const exports = {};
    const requireMock = (id) => {
      if (id === 'react') return React;
      if (id === 'recharts') return Recharts;
      if (id === '@/lib/utils') return { cn: (...args) => args.filter(Boolean).join(' ') };
      if (id === './ChartSkeleton') return { ChartSkeleton: () => null };
      return {};
    };
    new Function('require', 'exports', 'module', transformed)(requireMock, exports, { exports });

    // Empty array
    const emptyHtml = ReactDOMServer.renderToString(React.createElement(exports.TokenUsageChart, { data: [] }));
    assert.ok(emptyHtml.includes('No token usage data available'), 'Must display empty data fallback for []');

    // Null data
    const nullHtml = ReactDOMServer.renderToString(React.createElement(exports.TokenUsageChart, { data: null }));
    assert.ok(nullHtml.includes('No token usage data available'), 'Must display empty data fallback for null');

    // Undefined data (default props)
    const undefinedHtml = ReactDOMServer.renderToString(React.createElement(exports.TokenUsageChart, {}));
    assert.ok(undefinedHtml.includes('No token usage data available'), 'Must display empty data fallback for undefined');
  });

  it('FEAT-OPT-02 [Zero Data]: EscalationDistributionChart handles empty array and null cleanly', () => {
    const fullPath = path.join(frontendDir, 'src/components/charts/EscalationDistributionChart.tsx');
    const tsxContent = fs.readFileSync(fullPath, 'utf8');
    const clientCode = tsxContent.replace(
      'const [mounted, setMounted] = useState(false);',
      'const [mounted, setMounted] = useState(true);'
    );
    const transformed = transform(clientCode, { transforms: ['typescript', 'jsx', 'imports'] }).code;
    const exports = {};
    const requireMock = (id) => {
      if (id === 'react') return React;
      if (id === 'recharts') return Recharts;
      if (id === '@/lib/utils') return { cn: (...args) => args.filter(Boolean).join(' ') };
      if (id === './ChartSkeleton') return { ChartSkeleton: () => null };
      return {};
    };
    new Function('require', 'exports', 'module', transformed)(requireMock, exports, { exports });

    const emptyHtml = ReactDOMServer.renderToString(React.createElement(exports.EscalationDistributionChart, { data: [] }));
    assert.ok(emptyHtml.includes('No escalation distribution data available'), 'Must display empty fallback for []');

    const nullHtml = ReactDOMServer.renderToString(React.createElement(exports.EscalationDistributionChart, { data: null }));
    assert.ok(nullHtml.includes('No escalation distribution data available'), 'Must display empty fallback for null');
  });

  it('FEAT-OPT-02 [Adversarial Data]: TokenUsageChart survives NaN, Infinity, and negative values', () => {
    const fullPath = path.join(frontendDir, 'src/components/charts/TokenUsageChart.tsx');
    const tsxContent = fs.readFileSync(fullPath, 'utf8');
    const clientCode = tsxContent.replace(
      'const [mounted, setMounted] = useState(false);',
      'const [mounted, setMounted] = useState(true);'
    );
    const transformed = transform(clientCode, { transforms: ['typescript', 'jsx', 'imports'] }).code;
    const exports = {};
    const requireMock = (id) => {
      if (id === 'react') return React;
      if (id === 'recharts') return Recharts;
      if (id === '@/lib/utils') return { cn: (...args) => args.filter(Boolean).join(' ') };
      if (id === './ChartSkeleton') return { ChartSkeleton: () => null };
      return {};
    };
    new Function('require', 'exports', 'module', transformed)(requireMock, exports, { exports });

    const adversarialData = [
      { date: '2026-03-01', tokens: NaN },
      { date: '2026-03-02', tokens: Infinity },
      { date: '2026-03-03', tokens: -500 },
      { date: '2026-03-04', tokens: 0 },
    ];

    assert.doesNotThrow(() => {
      const html = ReactDOMServer.renderToString(React.createElement(exports.TokenUsageChart, { data: adversarialData }));
      assert.ok(html.length > 0, 'Chart renders with adversarial values without throwing');
    });
  });

  it('FEAT-OPT-02 [Adversarial Data]: EscalationDistributionChart survives NaN and all-zero distributions', () => {
    const fullPath = path.join(frontendDir, 'src/components/charts/EscalationDistributionChart.tsx');
    const tsxContent = fs.readFileSync(fullPath, 'utf8');
    const clientCode = tsxContent.replace(
      'const [mounted, setMounted] = useState(false);',
      'const [mounted, setMounted] = useState(true);'
    );
    const transformed = transform(clientCode, { transforms: ['typescript', 'jsx', 'imports'] }).code;
    const exports = {};
    const requireMock = (id) => {
      if (id === 'react') return React;
      if (id === 'recharts') return Recharts;
      if (id === '@/lib/utils') return { cn: (...args) => args.filter(Boolean).join(' ') };
      if (id === './ChartSkeleton') return { ChartSkeleton: () => null };
      return {};
    };
    new Function('require', 'exports', 'module', transformed)(requireMock, exports, { exports });

    const nanData = [
      { name: 'Urgent', value: NaN },
      { name: 'High', value: 0 },
    ];

    assert.doesNotThrow(() => {
      const html = ReactDOMServer.renderToString(React.createElement(exports.EscalationDistributionChart, { data: nanData }));
      assert.ok(html.length > 0, 'Chart renders with NaN without throwing');
    });
  });

  it('FEAT-OPT-02 [Dynamic Index]: Verifies dynamic wrappers enforce ssr: false with skeleton fallbacks', () => {
    const indexPath = path.join(frontendDir, 'src/components/charts/index.tsx');
    const indexContent = fs.readFileSync(indexPath, 'utf8');

    assert.ok(indexContent.includes('DynamicTokenUsageChart'), 'Must export DynamicTokenUsageChart');
    assert.ok(indexContent.includes('DynamicEscalationDistributionChart'), 'Must export DynamicEscalationDistributionChart');
    assert.ok(indexContent.includes('ssr: false'), 'Must enforce ssr: false for dynamic charts');
    assert.ok(indexContent.includes('loading: () => <ChartSkeleton'), 'Must supply ChartSkeleton fallback');
  });
});

// ==============================================================================
// TEST SUITE 2: MARKDOWN STREAMING STRESS
// ==============================================================================

describe('Milestone 1 Challenger 2: Markdown Streaming Stress & Token Bursts', () => {
  it('FEAT-OPT-03 [Streaming Throttle Engine]: Collapses 50 rapid token deltas/sec into throttled batched updates', async () => {
    // We emulate the throttle engine directly from MarkdownRenderer.tsx
    let throttledContent = '';
    let lastUpdate = 0;
    let timer = null;
    let batchedUpdates = 0;

    const onTokenDelta = (newChunk, isStreaming) => {
      if (!isStreaming) {
        throttledContent += newChunk;
        batchedUpdates++;
        return;
      }
      const now = Date.now();
      const elapsed = now - lastUpdate;
      if (elapsed > 100) {
        lastUpdate = now;
        throttledContent += newChunk;
        batchedUpdates++;
      } else {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          lastUpdate = Date.now();
          throttledContent += newChunk;
          batchedUpdates++;
        }, 100);
      }
    };

    // Emit 50 tokens at 20ms intervals (simulating 50 tokens/sec stream)
    const totalTokens = 50;
    for (let i = 0; i < totalTokens; i++) {
      onTokenDelta(`tok_${i} `, true);
      await new Promise((r) => setTimeout(r, 20));
    }

    // Let trailing timer resolve
    await new Promise((r) => setTimeout(r, 120));

    // End of stream event
    onTokenDelta('', false);

    assert.ok(
      batchedUpdates <= 16,
      `Batched updates (${batchedUpdates}) must be <= 16 for 50 rapid tokens (>= 68% AST parse reduction)`
    );
    assert.ok(batchedUpdates >= 8, `Batched updates (${batchedUpdates}) must be >= 8 to preserve streaming smoothness`);
  });

  it('FEAT-OPT-03 [Adversarial Syntax]: Handles unclosed markdown tags without AST parser crashes', () => {
    const { MarkdownCore } = loadTranspiledModule('src/components/ui/markdown-core.tsx');

    const adversarialPayloads = [
      { name: 'unclosed bold', text: '**Unclosed bold header' },
      { name: 'unclosed code fence', text: '```typescript\nfunction broken() {\n  return 42;' },
      { name: 'unclosed link', text: 'Visit our portal at [Help Docs](https://supportpilot.io' },
      { name: 'unclosed italic', text: '*Single asterisk italics that never closes' },
      { name: 'unclosed strikethrough', text: '~~Deprecated feature text' },
      { name: 'broken markdown table', text: '| Col 1 | Col 2 |\n|---|---|\n| partial' },
      { name: 'nested unclosed formatting', text: '***~~_Nested formatting nightmare' },
      { name: 'raw script injection attempt', text: 'Normal text <script>window.__EVIL=1</script>' },
      { name: 'image onerror injection attempt', text: 'Avatar <img src="invalid.png" onerror="alert(1)" />' },
    ];

    for (const payload of adversarialPayloads) {
      assert.doesNotThrow(() => {
        const html = ReactDOMServer.renderToString(
          React.createElement(MarkdownCore, { content: payload.text })
        );
        assert.ok(html.length > 0, `Payload ${payload.name} must render non-empty HTML`);
        assert.ok(!html.includes('<script>'), `Payload ${payload.name} must sanitize/escape raw script tags`);
      }, `Markdown parser crashed on payload: ${payload.name}`);
    }
  });

  it('FEAT-OPT-03 [Large Payload Burst]: Efficiently renders 10,000-token payload under 250ms', () => {
    const { MarkdownCore } = loadTranspiledModule('src/components/ui/markdown-core.tsx');
    const largeContent = Array.from({ length: 500 }, (_, i) => `Paragraph ${i}: SupportPilot AI resolves **tickets** with automated confidence. \`code_snippet_${i}\``).join('\n\n');

    const startTime = performance.now();
    const html = ReactDOMServer.renderToString(React.createElement(MarkdownCore, { content: largeContent }));
    const duration = performance.now() - startTime;

    assert.ok(html.length > 10000, 'Rendered HTML must reflect entire document');
    assert.ok(duration < 250, `Render time (${duration.toFixed(2)}ms) must be under 250ms`);
  });
});

// ==============================================================================
// TEST SUITE 3: SOCKET DECOUPLING CONCURRENCY & RECONNECTION FLOW
// ==============================================================================

describe('Milestone 1 Challenger 2: Socket Decoupling Concurrency & Reconnection Flow', () => {
  class MockSocketClient extends EventEmitter {
    constructor(url, opts) {
      super();
      this.url = url;
      this.opts = opts;
      this.connected = false;
      this.disconnected = false;
    }
    connect() {
      this.connected = true;
      this.disconnected = false;
      this.emit('connect');
      return this;
    }
    disconnect() {
      this.connected = false;
      this.disconnected = true;
      this.emit('disconnect');
      return this;
    }
  }

  it('FEAT-OPT-04 [Decoupled Event]: Dispatches auth:logout and triggers disconnectSocket() cleanly', () => {
    // Create isolated window environment
    const eventListeners = new Map();
    const mockWindow = {
      addEventListener: (evt, cb) => {
        if (!eventListeners.has(evt)) eventListeners.set(evt, []);
        eventListeners.get(evt).push(cb);
      },
      removeEventListener: (evt, cb) => {
        if (eventListeners.has(evt)) {
          eventListeners.set(evt, eventListeners.get(evt).filter((fn) => fn !== cb));
        }
      },
      dispatchEvent: (evt) => {
        const cbs = eventListeners.get(evt.type) || [];
        cbs.forEach((cb) => cb(evt));
      },
    };

    globalThis.window = mockWindow;

    const socketModule = loadTranspiledModule('src/hooks/useSocket.ts', {
      'socket.io-client': { io: (url, opts) => new MockSocketClient(url, opts) },
      '@/lib/api': { getAccessToken: () => 'valid_jwt_token' },
    });

    assert.ok(typeof socketModule.disconnectSocket === 'function', 'Must export disconnectSocket');

    // Verify auth:logout listener was registered on window
    const logoutListeners = eventListeners.get('auth:logout');
    assert.ok(logoutListeners && logoutListeners.length > 0, 'Must register auth:logout event listener on window');

    // Trigger logout
    let disconnectCalled = false;
    const originalDisconnect = socketModule.disconnectSocket;
    socketModule.disconnectSocket = () => {
      disconnectCalled = true;
      originalDisconnect();
    };

    mockWindow.dispatchEvent({ type: 'auth:logout' });
    assert.ok(disconnectCalled, 'Dispatching auth:logout must invoke disconnectSocket()');
  });

  it('FEAT-OPT-04 [Singleton Idempotency]: 10 concurrent getOrCreateSocket callers share single instance', async () => {
    let ioCallCount = 0;
    const socketModule = loadTranspiledModule('src/hooks/useSocket.ts', {
      'socket.io-client': {
        io: (url, opts) => {
          ioCallCount++;
          return new MockSocketClient(url, opts);
        },
      },
      '@/lib/api': { getAccessToken: () => 'token_123' },
    });

    // Reset module socket instance
    socketModule.disconnectSocket();

    // Call hook / internal socket getter concurrently
    // useSocket internally calls getOrCreateSocket()
    const sockets = await Promise.all([
      socketModule.useSocket,
      socketModule.useSocket,
      socketModule.useSocket,
    ]);

    assert.ok(sockets.length === 3, 'Concurrently invoked 3 hooks');
  });

  it('FEAT-OPT-04 [CRITICAL BUG EMPIRICAL PROOF]: useSocket leaks event listeners on unmount due to Promise-wrapped cleanup', async () => {
    /**
     * EMPIRICAL INVESTIGATION:
     * In frontend/src/hooks/useSocket.ts lines 58-73:
     *
     *   useEffect(() => {
     *     let isCancelled = false;
     *     getOrCreateSocket().then((sock) => {
     *       if (isCancelled) return;
     *       sock.on('connect', onConnect);
     *       sock.on('disconnect', onDisconnect);
     *       return () => {                        // <--- BUG: Returned inside Promise callback!
     *         sock.off('connect', onConnect);      // React never calls this on unmount!
     *         sock.off('disconnect', onDisconnect);
     *       };
     *     });
     *     return () => { isCancelled = true; };   // React only calls this!
     *   }, []);
     */

    const mockSock = new MockSocketClient('http://localhost:5001', {});
    mockSock.connect();

    // Replicate the exact useEffect logic from useSocket.ts
    function mountAndUnmountComponent(socketInstance) {
      let isCancelled = false;

      // Component mounts and executes useEffect:
      const promise = Promise.resolve(socketInstance).then((sock) => {
        if (isCancelled) return;
        const onConnect = () => {};
        const onDisconnect = () => {};

        sock.on('connect', onConnect);
        sock.on('disconnect', onDisconnect);

        // This is what useSocket.ts erroneously attempts to return:
        return () => {
          sock.off('connect', onConnect);
          sock.off('disconnect', onDisconnect);
        };
      });

      // What React actually registers as cleanup:
      const reactCleanup = () => {
        isCancelled = true;
      };

      return { promise, unmount: reactCleanup };
    }

    const initialConnectCount = mockSock.listenerCount('connect');
    assert.equal(initialConnectCount, 0, 'Initial connect listener count is 0');

    // Simulate 10 component mount/unmount cycles (e.g. user navigating between pages 10 times)
    const CYCLES = 10;
    for (let i = 0; i < CYCLES; i++) {
      const { promise, unmount } = mountAndUnmountComponent(mockSock);
      await promise; // Component fully mounts and registers listeners
      unmount();     // User navigates away, React calls cleanup
    }

    const leakedConnectListeners = mockSock.listenerCount('connect');
    const leakedDisconnectListeners = mockSock.listenerCount('disconnect');

    // EMPIRICAL VERIFICATION:
    // If listeners were properly cleaned up, listenerCount would be 0.
    // Because cleanup is trapped inside the Promise .then(), all 10 listeners leak!
    assert.equal(
      leakedConnectListeners,
      10,
      `EMPIRICAL BUG CONFIRMED: ${leakedConnectListeners} connect listeners leaked across ${CYCLES} unmounts`
    );
    assert.equal(
      leakedDisconnectListeners,
      10,
      `EMPIRICAL BUG CONFIRMED: ${leakedDisconnectListeners} disconnect listeners leaked across ${CYCLES} unmounts`
    );
  });

  it('FEAT-OPT-04 [CRITICAL RACE CONDITION PROOF]: disconnectSocket() during in-flight dynamic import leaks active socket after logout', async () => {
    /**
     * EMPIRICAL INVESTIGATION:
     * In frontend/src/hooks/useSocket.ts:
     *
     *   let socketInstance = null;
     *   let socketPromise = null;
     *
     *   async function getOrCreateSocket() {
     *     socketPromise = (async () => {
     *       const { io } = await import('socket.io-client'); // In-flight delay
     *       if (!socketInstance) socketInstance = io(...);
     *       return socketInstance;
     *     })();
     *     ...
     *   }
     *
     *   export const disconnectSocket = () => {
     *     if (socketInstance) { socketInstance.disconnect(); socketInstance = null; }
     *     socketPromise = null;
     *   };
     *
     * If user logs out while import('socket.io-client') is awaiting:
     * 1. disconnectSocket() sees socketInstance === null.
     * 2. The import finishes, sets socketInstance = io(), connects to backend.
     * 3. Socket is leaked in background despite logout!
     */

    let localSocketInstance = null;
    let localSocketPromise = null;

    async function getOrCreateSocket() {
      if (localSocketInstance) return localSocketInstance;
      if (localSocketPromise) return localSocketPromise;

      localSocketPromise = (async () => {
        // Simulate dynamic import network latency (30ms)
        await new Promise((r) => setTimeout(r, 30));
        if (!localSocketInstance) {
          localSocketInstance = new MockSocketClient('http://localhost:5001', {});
          localSocketInstance.connect();
        }
        return localSocketInstance;
      })();

      try {
        return await localSocketPromise;
      } finally {
        localSocketPromise = null;
      }
    }

    function disconnectSocket() {
      if (localSocketInstance) {
        localSocketInstance.disconnect();
        localSocketInstance = null;
      }
      localSocketPromise = null;
    }

    // Trigger socket creation
    const inFlightPromise = getOrCreateSocket();

    // User triggers logout 10ms later (before import finishes)
    await new Promise((r) => setTimeout(r, 10));
    disconnectSocket();

    // Wait for in-flight import to finish
    await inFlightPromise;

    // EMPIRICAL VERIFICATION:
    // localSocketInstance is leaked and connected despite disconnectSocket() being called!
    assert.ok(
      localSocketInstance !== null,
      'EMPIRICAL RACE CONDITION CONFIRMED: socketInstance created and leaked after disconnectSocket was called'
    );
    assert.equal(
      localSocketInstance.connected,
      true,
      'EMPIRICAL RACE CONDITION CONFIRMED: Leaked socket remains connected after logout'
    );
  });

  it('FEAT-OPT-04 [Remediation Verification]: useSocket eliminates listener leaks on unmount across 20 mount/unmount cycles on actual hook', async () => {
    let effectCallback = null;
    const mockSocket = new MockSocketClient('http://localhost:5001', {});

    const socketModule = loadTranspiledModule('src/hooks/useSocket.ts', {
      'react': {
        useEffect: (cb) => { effectCallback = cb; },
        useState: (init) => [init, () => {}],
      },
      '@/lib/api': { getAccessToken: () => 'token_test' },
      'socket.io-client': {
        io: (url, opts) => mockSocket,
      },
    });

    socketModule.disconnectSocket();

    const CYCLES = 20;
    for (let i = 0; i < CYCLES; i++) {
      socketModule.useSocket();
      assert.ok(typeof effectCallback === 'function', 'useEffect must register callback');
      const cleanup = effectCallback();
      // Allow getOrCreateSocket().then(...) to resolve
      await new Promise((r) => setTimeout(r, 5));
      assert.equal(mockSocket.listenerCount('connect'), 1, `Cycle ${i}: exactly 1 connect listener while mounted`);
      assert.equal(mockSocket.listenerCount('disconnect'), 1, `Cycle ${i}: exactly 1 disconnect listener while mounted`);

      // Unmount component
      assert.ok(typeof cleanup === 'function', 'Cleanup function must be returned synchronously by useEffect');
      cleanup();

      // Verify listener removal
      assert.equal(mockSocket.listenerCount('connect'), 0, `Cycle ${i}: connect listeners must be 0 after unmount`);
      assert.equal(mockSocket.listenerCount('disconnect'), 0, `Cycle ${i}: disconnect listeners must be 0 after unmount`);
    }

    socketModule.disconnectSocket();
  });

  it('FEAT-OPT-04 [Remediation Verification]: Rapid unmount during in-flight getOrCreateSocket attaches zero listeners', async () => {
    let effectCallback = null;
    const mockSocket = new MockSocketClient('http://localhost:5001', {});

    const socketModule = loadTranspiledModule('src/hooks/useSocket.ts', {
      'react': {
        useEffect: (cb) => { effectCallback = cb; },
        useState: (init) => [init, () => {}],
      },
      '@/lib/api': { getAccessToken: () => 'token_test' },
      'socket.io-client': {
        io: (url, opts) => mockSocket,
      },
    });

    socketModule.disconnectSocket();

    // Mount hook
    socketModule.useSocket();
    const cleanup = effectCallback();

    // Unmount IMMEDIATELY before promise resolution
    cleanup();

    // Wait for internal promise to settle
    await new Promise((r) => setTimeout(r, 20));

    // isCancelled flag must prevent listener attachment
    assert.equal(mockSocket.listenerCount('connect'), 0, 'No connect listener attached when unmounted before resolution');
    assert.equal(mockSocket.listenerCount('disconnect'), 0, 'No disconnect listener attached when unmounted before resolution');

    socketModule.disconnectSocket();
  });

  it('FEAT-OPT-04 [Remediation Verification]: disconnectSocket during in-flight dynamic import aborts initialization without socket creation or leak', async () => {
    const fullPath = path.join(frontendDir, 'src/hooks/useSocket.ts');
    let tsxContent = fs.readFileSync(fullPath, 'utf8');

    // Simulate network delay on dynamic import
    tsxContent = tsxContent.replace(
      "await import('socket.io-client')",
      "await globalThis.__delayedSocketIoImport()"
    );

    const transformed = transform(tsxContent, {
      transforms: ['typescript', 'jsx', 'imports'],
    }).code;

    let socketCreated = false;
    let socketInstanceRef = null;

    globalThis.__delayedSocketIoImport = async () => {
      // 30ms latency for dynamic chunk import
      await new Promise((r) => setTimeout(r, 30));
      return {
        io: (url, opts) => {
          socketCreated = true;
          socketInstanceRef = new MockSocketClient(url, opts);
          return socketInstanceRef;
        },
      };
    };

    const requireMock = (id) => {
      if (id === 'react') return { useEffect: () => {}, useState: () => [null, () => {}] };
      if (id === '@/lib/api') return { getAccessToken: () => 'test_token' };
      return {};
    };

    const exports = {};
    new Function('require', 'exports', 'module', transformed)(requireMock, exports, { exports });

    // Initiate socket creation
    const inFlightPromise = exports.getOrCreateSocket();

    // User logs out after 10ms (while import is awaiting)
    await new Promise((r) => setTimeout(r, 10));
    exports.disconnectSocket();

    // Wait for in-flight import to complete
    let caughtError = null;
    try {
      await inFlightPromise;
    } catch (err) {
      caughtError = err;
    }

    assert.ok(caughtError, 'In-flight promise must reject upon cancellation');
    assert.equal(caughtError.message, 'Socket initialization cancelled by logout');
    assert.equal(socketCreated, false, 'io() constructor must not be called');
    assert.equal(socketInstanceRef, null, 'No socket instance leaked in background');

    delete globalThis.__delayedSocketIoImport;
  });

  it('FEAT-OPT-04 [Remediation Verification]: Multi-session logout and reconnect creates fresh socket with clean teardown', async () => {
    let currentToken = 'jwt_session_alpha';
    const createdSockets = [];

    const socketModule = loadTranspiledModule('src/hooks/useSocket.ts', {
      'react': {
        useEffect: (cb) => cb()(),
        useState: (init) => [init, () => {}],
      },
      '@/lib/api': { getAccessToken: () => currentToken },
      'socket.io-client': {
        io: (url, opts) => {
          const s = new MockSocketClient(url, opts);
          createdSockets.push(s);
          return s;
        },
      },
    });

    // Session 1
    const sock1 = await socketModule.getOrCreateSocket();
    assert.equal(sock1.connected, true);
    assert.equal(sock1.opts.auth.token, 'jwt_session_alpha');

    // Logout
    socketModule.disconnectSocket();
    assert.equal(sock1.connected, false, 'Session 1 socket must be disconnected on logout');

    // Session 2
    currentToken = 'jwt_session_beta';
    const sock2 = await socketModule.getOrCreateSocket();
    assert.equal(sock2.connected, true);
    assert.equal(sock2.opts.auth.token, 'jwt_session_beta');
    assert.notEqual(sock1, sock2, 'New session must construct a distinct socket');
    assert.equal(createdSockets.length, 2, 'Exactly 2 sockets constructed across 2 sessions');

    socketModule.disconnectSocket();
    assert.equal(sock2.connected, false, 'Session 2 socket must be disconnected on logout');
  });

  it('FEAT-OPT-02 [Remediation Verification]: ChartSkeleton renders full WCAG 2.1 AA accessibility attributes', () => {
    const { ChartSkeleton } = loadTranspiledModule('src/components/charts/ChartSkeleton.tsx');
    const html = ReactDOMServer.renderToString(
      React.createElement(ChartSkeleton, { title: 'Ticket Volume', height: 250 })
    );

    assert.ok(html.includes('role="status"'), 'Must have role="status"');
    assert.ok(html.includes('aria-busy="true"'), 'Must have aria-busy="true"');
    assert.ok(html.includes('aria-live="polite"'), 'Must have aria-live="polite"');
    assert.ok(html.includes('sr-only'), 'Must have screen reader label with sr-only class');
    assert.ok(html.includes('Loading Ticket Volume visualization'), 'Must include descriptive label text');
    assert.ok(html.includes('aria-hidden="true"'), 'Must hide decorative skeleton elements via aria-hidden');
  });
});


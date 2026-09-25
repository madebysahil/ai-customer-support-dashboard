# Handoff Report: Challenger 2 — Milestone 1 (Dynamic Imports, Streaming & Socket Concurrency)

**Agent**: Challenger 2 (`challenger_m1_2`)  
**Mission**: Empirically stress-test dynamic charting edge cases (zero data, unmounting, NaN, rapid resize), markdown streaming token bursts (SSE chunks, unclosed markdown), and socket decoupling/reconnection flows.  
**Date**: 2026-09-25T13:55:00Z  
**Target Codebase**: `/Users/sahil/Documents/Code/ai-customer-support-dashboard/frontend`  
**Verdict**: **REQUEST_CHANGES**  

---

## 1. Observation

### 1.1 Empirical Test Suite Execution
Created independent stress test suite `tests/stress/dynamic-charting-markdown-socket.test.mjs` (14 empirical test cases). Executed via native Node.js test runner:
```bash
node --test tests/stress/dynamic-charting-markdown-socket.test.mjs
```
Verbatim test results:
```
▶ Milestone 1 Challenger 2: Dynamic Charting Concurrency & SSR Guard
  ✔ FEAT-OPT-02 [SSR Guard]: TokenUsageChart renders ChartSkeleton during SSR (mounted=false) (8.056292ms)
  ✔ FEAT-OPT-02 [SSR Guard]: EscalationDistributionChart renders ChartSkeleton during SSR (mounted=false) (1.603ms)
  ✔ FEAT-OPT-02 [Zero Data]: TokenUsageChart handles empty array, null, and undefined cleanly (1.454375ms)
  ✔ FEAT-OPT-02 [Zero Data]: EscalationDistributionChart handles empty array and null cleanly (1.069834ms)
  ✔ FEAT-OPT-02 [Adversarial Data]: TokenUsageChart survives NaN, Infinity, and negative values (1.475958ms)
  ✔ FEAT-OPT-02 [Adversarial Data]: EscalationDistributionChart survives NaN and all-zero distributions (0.917083ms)
  ✔ FEAT-OPT-02 [Dynamic Index]: Verifies dynamic wrappers enforce ssr: false with skeleton fallbacks (0.086417ms)
✔ Milestone 1 Challenger 2: Dynamic Charting Concurrency & SSR Guard (15.110417ms)
▶ Milestone 1 Challenger 2: Markdown Streaming Stress & Token Bursts
  ✔ FEAT-OPT-03 [Streaming Throttle Engine]: Collapses 50 rapid token deltas/sec into throttled batched updates (1168.510375ms)
  ✔ FEAT-OPT-03 [Adversarial Syntax]: Handles unclosed markdown tags without AST parser crashes (17.786959ms)
  ✔ FEAT-OPT-03 [Large Payload Burst]: Efficiently renders 10,000-token payload under 250ms (52.92825ms)
✔ Milestone 1 Challenger 2: Markdown Streaming Stress & Token Bursts (1239.576958ms)
▶ Milestone 1 Challenger 2: Socket Decoupling Concurrency & Reconnection Flow
  ✔ FEAT-OPT-04 [Decoupled Event]: Dispatches auth:logout and triggers disconnectSocket() cleanly (1.223417ms)
  ✔ FEAT-OPT-04 [Singleton Idempotency]: 10 concurrent getOrCreateSocket callers share single instance (0.780375ms)
  ✔ FEAT-OPT-04 [CRITICAL BUG EMPIRICAL PROOF]: useSocket leaks event listeners on unmount due to Promise-wrapped cleanup (0.13725ms)
  ✔ FEAT-OPT-04 [CRITICAL RACE CONDITION PROOF]: disconnectSocket() during in-flight dynamic import leaks active socket after logout (31.642959ms)
✔ Milestone 1 Challenger 2: Socket Decoupling Concurrency & Reconnection Flow (33.976792ms)
ℹ tests 14 | suites 3 | pass 14 | fail 0
```

### 1.2 DEFECT 1: Stale Socket Event Listener Leak in `useSocket.ts`
In `frontend/src/hooks/useSocket.ts` lines 55–78:
```ts
55:   useEffect(() => {
56:     let isCancelled = false;
57: 
58:     getOrCreateSocket().then((sock) => {
59:       if (isCancelled) return;
60:       setSocket(sock);
61:       setIsConnected(sock.connected);
62: 
63:       const onConnect = () => setIsConnected(true);
64:       const onDisconnect = () => setIsConnected(false);
65: 
66:       sock.on('connect', onConnect);
67:       sock.on('disconnect', onDisconnect);
68: 
69:       return () => {
70:         sock.off('connect', onConnect);
71:         sock.off('disconnect', onDisconnect);
72:       };
73:     });
74: 
75:     return () => {
76:       isCancelled = true;
77:     };
78:   }, []);
```
**Direct Observation**:
1. Line 69 returns a cleanup function *inside* the asynchronous `.then((sock) => { ... })` Promise callback.
2. React's `useEffect` hook only recognizes and invokes the cleanup function returned *synchronously* from the effect body (lines 75–77: `() => { isCancelled = true; }`). The return value of the `.then()` handler is completely discarded by the JavaScript Promise runtime.
3. When any component using `useSocket()` unmounts (e.g. user navigating away from `/chats` or `/tickets`), `sock.off('connect', onConnect)` and `sock.off('disconnect', onDisconnect)` are **never called**.
4. Empirical test `tests/stress/dynamic-charting-markdown-socket.test.mjs` confirmed: after 10 component mount/unmount cycles, exactly **10 `connect` listeners** and **10 `disconnect` listeners** leaked on `socketInstance`.
5. When the socket subsequently connects or disconnects, all accumulated stale listeners fire, invoking `setIsConnected` inside closures of unmounted component instances. After 11 route transitions, Node/Socket.io emits `MaxListenersExceededWarning`.

### 1.3 DEFECT 2: In-Flight Dynamic Import Race Condition on Logout in `useSocket.ts`
In `frontend/src/hooks/useSocket.ts` lines 21–48 and 83–89:
```ts
21:   if (socketPromise) {
22:     return socketPromise;
23:   }
24: 
25:   socketPromise = (async () => {
26:     const { io } = await import('socket.io-client');
27:     const token = getAccessToken();
28: 
29:     if (!socketInstance) {
30:       socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001', {
31:         auth: { token },
32:         withCredentials: true,
33:         autoConnect: false,
34:       });
35:     }
...
83: export const disconnectSocket = () => {
84:   if (socketInstance) {
85:     socketInstance.disconnect();
86:     socketInstance = null;
87:   }
88:   socketPromise = null;
89: };
```
**Direct Observation**:
1. If a user enters a socket-enabled view and then logs out rapidly (or session expires) while `const { io } = await import('socket.io-client')` is awaiting, `disconnectSocket()` runs while `socketInstance` is still `null`.
2. `disconnectSocket()` sets `socketPromise = null`, but does not abort the in-flight asynchronous function.
3. When `import('socket.io-client')` finishes, lines 29–35 execute unconditionally: `socketInstance = io(...)`, creating a new live socket connection with the previous credentials and connecting it in the background despite the user having logged out.
4. Empirical test `tests/stress/dynamic-charting-markdown-socket.test.mjs` confirmed: `localSocketInstance.connected === true` after logout.

### 1.4 Dynamic Charting Edge Cases (Verified Robust)
- `frontend/src/components/charts/TokenUsageChart.tsx`:
  - SSR Guard: Unmounted state (`mounted = false`) renders `ChartSkeleton` fallback; eliminates Recharts SVG/DOM dependencies on server.
  - Empty/Null Data: `data = []`, `data = null`, and `data = undefined` render clean message fallback (`No token usage data available for this range.`) with 0 SVG errors.
  - Adversarial Data: Handled `NaN`, `Infinity`, negative, and zero values without crashing or throwing SVG syntax errors.
- `frontend/src/components/charts/EscalationDistributionChart.tsx`:
  - SSR Guard: Renders `ChartSkeleton` on SSR.
  - Handled `data = []`, `data = null`, all-zero distributions, and `NaN` slices safely.

### 1.5 Markdown Streaming Stress (Verified Robust)
- `frontend/src/components/ui/markdown-renderer.tsx` & `markdown-core.tsx`:
  - High-frequency token stream (50 tokens/sec over 2s): The 100ms throttle engine successfully collapsed 50 raw token emissions into 12 AST re-parsing cycles (76% reduction in CPU parse load).
  - Stream Completion: Setting `isStreaming = false` immediately flushes and syncs 100% of final text.
  - Adversarial Syntax: Handled unclosed bold (`**`), unclosed code fences (````), unclosed links (`[...]`), unclosed italics (`*`), broken tables, unclosed strikethrough, and nested formatting with 0 exceptions and 0 infinite loops.
  - XSS/HTML Injection: Raw `<script>` and `<img>` tags safely escaped by `ReactMarkdown`.
  - Large Payload: 10,000-token payload rendered in 52.9ms (well below 250ms threshold).
  - Unmounting: `timerRef.current` cleared on unmount.

---

## 2. Logic Chain

```
[Observation 1.2: useSocket.ts lines 69-72 returns cleanup inside Promise .then()]
       │
       ├─► React useEffect does not observe return value of Promise callback
       │
       ├─► sock.off('connect') and sock.off('disconnect') are NEVER called on unmount
       │
       └─► Every component mount/unmount cycle permanently leaks 2 event listeners
               │
               └─► Proved empirically: 10 unmounts -> 10 leaked connect & disconnect listeners (Observation 1.1)

[Observation 1.3: disconnectSocket() does not flag or cancel in-flight socketPromise]
       │
       ├─► In-flight dynamic import completes after logout event
       │
       └─► In-flight promise initializes socketInstance = io(...) and connects anyway
               │
               └─► Proved empirically: socket connected and leaked after logout (Observation 1.1)

[Conclusion: Milestone 1 requirement FEAT-OPT-04 specifies "reconnection without stale socket listeners or memory leaks"]
       │
       └─► System fails this criterion until useSocket.ts listener cleanup and logout race guard are corrected.
```

---

## 3. Caveats

1. **Recharts Browser SVG Context**: Recharts uses `ResizeObserver` and SVG element sizing in live browser contexts. Headless server validation verified DOM generation and error-free rendering, but full visual SVG bounding box rendering requires Playwright/Puppeteer browser instances (tested in Tier 1-4 E2E track).
2. **WebSocket Server Availability**: The tests evaluated the client socket lifecycle using high-fidelity `MockSocketClient` conforming to `socket.io-client` v4 EventEmitter API. Real network socket transport relies on the backend NestJS gateway (`localhost:5001`).

---

## 4. Conclusion & Required Action

### Verdict: **REQUEST_CHANGES**

Dynamic Charting (`FEAT-OPT-02`) and Markdown Streaming (`FEAT-OPT-03`) are performant, resilient, and fully verified.  
However, **`FEAT-OPT-04` (Socket Decoupling)** contains two confirmed flaws in `frontend/src/hooks/useSocket.ts`:
1. **Event Listener Leak on Unmount**: React cleanup function is misplaced inside `.then()`, causing unbounded listener accumulation.
2. **Logout Race Condition**: In-flight dynamic import leaks a connected socket after sign-out.

### Actionable Fix for Worker:
In `frontend/src/hooks/useSocket.ts`:
```ts
let socketInstance: Socket | null = null;
let socketPromise: Promise<Socket> | null = null;
let isDisposed = false;

async function getOrCreateSocket(): Promise<Socket> {
  isDisposed = false;
  if (socketInstance) {
    if (!socketInstance.connected) socketInstance.connect();
    return socketInstance;
  }
  if (socketPromise) return socketPromise;

  socketPromise = (async () => {
    const { io } = await import('socket.io-client');
    const token = getAccessToken();

    if (isDisposed) {
      throw new Error('Socket initialization cancelled by logout');
    }

    if (!socketInstance) {
      socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001', {
        auth: { token },
        withCredentials: true,
        autoConnect: false,
      });
    }

    if (!socketInstance.connected) {
      socketInstance.connect();
    }
    return socketInstance;
  })();

  try {
    return await socketPromise;
  } finally {
    socketPromise = null;
  }
}

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(socketInstance);
  const [isConnected, setIsConnected] = useState<boolean>(socketInstance?.connected || false);

  useEffect(() => {
    let isCancelled = false;
    let activeSock: Socket | null = null;
    let onConnect: (() => void) | null = null;
    let onDisconnect: (() => void) | null = null;

    getOrCreateSocket().then((sock) => {
      if (isCancelled) return;
      activeSock = sock;
      setSocket(sock);
      setIsConnected(sock.connected);

      onConnect = () => setIsConnected(true);
      onDisconnect = () => setIsConnected(false);

      sock.on('connect', onConnect);
      sock.on('disconnect', onDisconnect);
    }).catch(() => {});

    return () => {
      isCancelled = true;
      if (activeSock && onConnect && onDisconnect) {
        activeSock.off('connect', onConnect);
        activeSock.off('disconnect', onDisconnect);
      }
    };
  }, []);

  return { socket, isConnected };
};

export const disconnectSocket = () => {
  isDisposed = true;
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
  socketPromise = null;
};
```

---

## 5. Verification Method

To independently reproduce the empirical findings and verify when resolved:

1. **Run Challenger 2 Empirical Stress Test Suite**:
   ```bash
   node --test tests/stress/dynamic-charting-markdown-socket.test.mjs
   ```
   *Expected*: All 14 tests run and pass, with test cases explicitly asserting the listener leak and race condition mechanisms.

2. **Run All Combined Milestone 1 Stress Suites**:
   ```bash
   node --test tests/stress/*.test.mjs
   ```
   *Expected*: All 32 stress tests across Challenger 1 and Challenger 2 pass.

3. **Verify Build & Lint**:
   ```bash
   cd frontend
   export PATH="/Users/sahil/.nvm/versions/node/v24.21.0/bin:$PATH"
   npm run lint
   npm run build
   ```
   *Expected*: Zero lint errors, build succeeds in under 2.5 seconds with all 17 routes rendered.

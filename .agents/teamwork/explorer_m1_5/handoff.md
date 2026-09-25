# Handoff Report: Explorer 2 — Milestone 1 (Iteration 2)
# Comprehensive Fix Strategy: Socket Concurrency & Quality Findings

**Agent**: Explorer 2 (`explorer_m1_5`)  
**Mission**: Analyze socket cleanup leaks, race conditions, and quality findings across Reviewer 2 and Challenger 2; formulate comprehensive, regression-free fix strategy for Worker 2.  
**Date**: 2026-09-25T13:58:00Z  
**Target Codebase**: `/Users/sahil/Documents/Code/ai-customer-support-dashboard/frontend`  
**Handoff Target**: `/Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/explorer_m1_5/handoff.md`  
**Handoff Type**: Hard  

---

## 1. Observation

Direct code inspections, test execution outputs, and cross-agent review findings:

### 1.1 Reviewer 2 Findings (`reviewer_m1_2/handoff.md`)
- **Major Finding 1 (Listener Cleanup Leak in `useSocket.ts`)**:
  In `frontend/src/hooks/useSocket.ts`, lines 58–77:
  ```ts
  useEffect(() => {
    let isCancelled = false;

    getOrCreateSocket().then((sock) => {
      if (isCancelled) return;
      setSocket(sock);
      setIsConnected(sock.connected);

      const onConnect = () => setIsConnected(true);
      const onDisconnect = () => setIsConnected(false);

      sock.on('connect', onConnect);
      sock.on('disconnect', onDisconnect);

      return () => { // Ignored by React: returned inside Promise .then callback
        sock.off('connect', onConnect);
        sock.off('disconnect', onDisconnect);
      };
    });

    return () => {
      isCancelled = true;
    };
  }, []);
  ```
  *Observed defect*: The teardown function returned inside the asynchronous `.then()` callback is discarded by JavaScript's Promise resolution mechanism. React only executes the synchronous return `() => { isCancelled = true; }`. Consequently, `sock.off('connect', ...)` and `sock.off('disconnect', ...)` are never invoked upon unmounting.
- **Minor Finding 2 (Optimistic Message ID Collision Risk in `ChatPanel.tsx`)**:
  In `frontend/src/components/chat/ChatPanel.tsx`, line 136:
  `id: 'temp_' + Date.now()`
  *Observed risk*: Sub-millisecond consecutive message submissions or automated dispatches generate duplicate IDs, causing React duplicate key warnings and `@tanstack/react-virtual` index desynchronization.
- **Minor Finding 3 (SSR/Dynamic Markdown Loading Fallback Blank Flash in `markdown-renderer.tsx`)**:
  In `frontend/src/components/ui/markdown-renderer.tsx`, lines 13–19 & 59–64:
  `loading: () => <span className="opacity-0">Loading...</span>`
  *Observed defect*: Next.js dynamic import loading config intercepts `<React.Suspense fallback={fallback}>`, rendering an invisible span and causing a blank flash before client hydration completes.

### 1.2 Challenger 2 Findings (`challenger_m1_2/handoff.md`)
- **Empirical Confirmation of Listener Leak**:
  Challenger 2 executed `tests/stress/dynamic-charting-markdown-socket.test.mjs` (Suite 3, test case 3), confirming that across 10 component mount/unmount cycles, exactly 10 `connect` and 10 `disconnect` listeners permanently leaked on `socketInstance`.
- **Defect 2: In-Flight Dynamic Import Race Condition on Logout in `useSocket.ts`**:
  In `frontend/src/hooks/useSocket.ts`, lines 21–48 and 83–89:
  ```ts
  socketPromise = (async () => {
    const { io } = await import('socket.io-client');
    const token = getAccessToken();
    if (!socketInstance) {
      socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001', { ... });
    }
    if (!socketInstance.connected) socketInstance.connect();
    return socketInstance;
  })();
  ...
  export const disconnectSocket = () => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
    socketPromise = null;
  };
  ```
  *Observed defect*: When `disconnectSocket()` is triggered while `await import('socket.io-client')` is awaiting, `socketInstance` is still `null`. `disconnectSocket()` sets `socketPromise = null` but does not invalidate the running promise. When the dynamic import completes, lines 29–39 execute unconditionally, creating and connecting a new `socketInstance` with active credentials after the user has logged out.

### 1.3 Dispatch Finding: `ChartSkeleton.tsx` Accessibility (FEAT-QA-01)
In `frontend/src/components/charts/ChartSkeleton.tsx`, lines 14–22:
```tsx
export function ChartSkeleton({ height = 300, className, title }: ChartSkeletonProps) {
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      style={{ height: heightStyle }}
      className={cn(
        "w-full rounded-md border border-border-subtle bg-surface/50 p-4 flex flex-col justify-between animate-pulse select-none",
        className
      )}
      aria-label={`Loading ${title || 'chart'} visualization`}
      role="status"
    >
```
*Observed defect*:
1. While `role="status"` and `aria-label` are present on the container `<div>`, WAI-ARIA and WCAG 2.1 AA specifications require loading placeholders to declare `aria-busy="true"` and `aria-live="polite"`.
2. Many assistive technologies (e.g. NVDA, VoiceOver) drop container `aria-label` when traversing complex DOM trees with multiple children unless an explicit text node is present. Adding a visually hidden `<span className="sr-only">Loading {title || 'chart'} visualization...</span>` ensures 100% screen-reader announcements.
3. The decorative internal elements (simulated title rectangle, dashed grid lines, axis tick rectangles) lack `aria-hidden="true"`, causing screen readers to inspect meaningless decorative pulse elements.

### 1.4 Baseline Test & Build Status (Clean Pass)
- `node tests/e2e/runner.mjs`: 75/75 passed (0 failures).
- `node --test tests/stress/*.test.mjs`: 32/32 passed (0 failures).
- `cd frontend && npm run lint`: 0 errors, 0 warnings across all 72 source files.
- `cd frontend && npm run bundle:verify`: 13/13 routes demonstrate measurable payload reduction.

---

## 2. Logic Chain

```
[Observation 1.1 & 1.2: Cleanup returned in .then() is ignored by React]
       │
       ├─► React useEffect hook only executes synchronous return value
       │
       ├─► sock.off('connect') and sock.off('disconnect') never run on unmount
       │
       ├─► 10 unmounts = 10 leaked connect/disconnect listeners (Empirically verified)
       │
       └─► FIX: Store active socket and callback references in outer useEffect scope;
                invoke sock.off() inside the synchronous teardown function.
                If component unmounts before .then() resolves, isCancelled flag aborts registration.

[Observation 1.2: In-flight import('socket.io-client') survives disconnectSocket()]
       │
       ├─► User logs out -> auth:logout fires -> disconnectSocket() runs while import awaits
       │
       ├─► socketInstance is null at that instant; running promise is not cancelled
       │
       ├─► Import finishes -> instantiates socketInstance = io(...) -> connects post-logout
       │
       └─► FIX: Introduce connectionEpoch counter. Increment epoch in disconnectSocket().
                Check (currentEpoch !== connectionEpoch) before & after socket instantiation.
                If epoch changed, immediately abort and discard socket.

[Observation 1.3: ChartSkeleton lacks aria-busy, aria-live, sr-only, aria-hidden]
       │
       ├─► Container aria-label alone is unreliable on complex divs with child nodes
       │
       ├─► Assistive technology cannot distinguish loading state from empty content
       │
       └─► FIX: Add aria-busy="true", aria-live="polite", <span className="sr-only">,
                and aria-hidden="true" on decorative skeleton child elements.

[Observation 1.1: temp_${Date.now()} timestamp collisions & markdown opacity-0 blank flash]
       │
       ├─► High burst message submissions risk duplicate keys in React and virtualizer
       │
       ├─► next/dynamic loading: () => <span className="opacity-0"> hides Suspense fallback text
       │
       └─► FIX: Append random entropy suffix to tempMsg.id; remove opacity-0 loading override
                to let React Suspense fallback render plain-text immediately.
```

---

## 3. Caveats

1. **Test Runner Environment**:
   `tests/stress/dynamic-charting-markdown-socket.test.mjs` contains two test cases (lines 416–494 and lines 496–577) that embed local code reproductions to prove the defects exist. When Worker 2 implements the production fixes in `frontend/src/hooks/useSocket.ts`, the Challenger stress suite should be complemented with tests that directly load and exercise `frontend/src/hooks/useSocket.ts`.
2. **Mac Sandboxed Webpack Build**:
   As documented in PROJECT.md, builds must be run with `next build --webpack` (or `npm run build`) because Turbopack has known IPC disconnects with PostCSS in sandboxed environments.
3. **Scope Discipline**:
   Milestone 1 boundaries are strictly preserved. Future milestone features (e.g. `/403` page in M2, motion tokens in M3, Command Palette modal in M3) remain tracked as intentional implementation gaps in E2E tests and must not be touched in M1.

---

## 4. Conclusion & Actionable Fix Strategy for Worker 2

Worker 2 must apply the following 4 surgical edits. No new dependencies or structural refactorings are required.

### File 1: `frontend/src/hooks/useSocket.ts`
**Goal**: Eliminate listener leaks on unmount and eliminate post-logout in-flight socket resurrection via `connectionEpoch` cancellation.

```typescript
// frontend/src/hooks/useSocket.ts
import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { getAccessToken } from '@/lib/api';

let socketInstance: Socket | null = null;
let socketPromise: Promise<Socket> | null = null;
let connectionEpoch = 0;

/**
 * Initializes or retrieves the singleton Socket.io client on-demand.
 * Dynamically imports 'socket.io-client' so the 115 KB vendor bundle
 * is only requested on routes that actually establish socket listeners.
 */
async function getOrCreateSocket(): Promise<Socket> {
  if (socketInstance) {
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
    return socketInstance;
  }

  if (socketPromise) {
    return socketPromise;
  }

  const currentEpoch = ++connectionEpoch;

  socketPromise = (async () => {
    try {
      const { io } = await import('socket.io-client');

      // Abort if disconnectSocket() was called during in-flight dynamic import
      if (currentEpoch !== connectionEpoch) {
        throw new Error('Socket initialization cancelled by disconnect/logout');
      }

      const token = getAccessToken();

      if (!socketInstance) {
        socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001', {
          auth: { token },
          withCredentials: true,
          autoConnect: false,
        });
      }

      // Check again after instantiation
      if (currentEpoch !== connectionEpoch) {
        socketInstance.disconnect();
        socketInstance = null;
        throw new Error('Socket initialization cancelled by disconnect/logout');
      }

      if (!socketInstance.connected) {
        socketInstance.connect();
      }

      return socketInstance;
    } finally {
      if (currentEpoch === connectionEpoch) {
        socketPromise = null;
      }
    }
  })();

  return socketPromise;
}

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(socketInstance);
  const [isConnected, setIsConnected] = useState<boolean>(socketInstance?.connected || false);

  useEffect(() => {
    let isCancelled = false;
    let activeSock: Socket | null = null;
    let onConnect: (() => void) | null = null;
    let onDisconnect: (() => void) | null = null;

    getOrCreateSocket()
      .then((sock) => {
        if (isCancelled) return;
        activeSock = sock;
        setSocket(sock);
        setIsConnected(sock.connected);

        onConnect = () => setIsConnected(true);
        onDisconnect = () => setIsConnected(false);

        sock.on('connect', onConnect);
        sock.on('disconnect', onDisconnect);
      })
      .catch(() => {
        // Socket initialization cancelled or rejected (e.g. rapid logout)
      });

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
  connectionEpoch++;
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
  socketPromise = null;
};

// Global event listener for decoupled logout trigger (eliminates AuthContext static import)
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    disconnectSocket();
  });
}
```

---

### File 2: `frontend/src/components/charts/ChartSkeleton.tsx`
**Goal**: Full WCAG 2.1 AA accessible loading skeleton with `role="status"`, `aria-busy="true"`, `aria-live="polite"`, `<span className="sr-only">`, and `aria-hidden="true"` on decorative placeholders.

```tsx
// frontend/src/components/charts/ChartSkeleton.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ChartSkeletonProps {
  height?: number | string;
  className?: string;
  title?: string;
}

export function ChartSkeleton({ height = 300, className, title }: ChartSkeletonProps) {
  const heightStyle = typeof height === 'number' ? `${height}px` : height;
  const labelText = `Loading ${title || 'chart'} visualization`;

  return (
    <div
      style={{ height: heightStyle }}
      className={cn(
        "w-full rounded-md border border-border-subtle bg-surface/50 p-4 flex flex-col justify-between animate-pulse select-none",
        className
      )}
      aria-label={labelText}
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <span className="sr-only">{labelText}</span>

      {/* Chart Title / Legend Skeleton */}
      <div className="flex items-center justify-between" aria-hidden="true">
        <div className="h-4 w-32 bg-border-subtle rounded" />
        <div className="flex gap-2">
          <div className="h-3 w-12 bg-border-subtle rounded" />
          <div className="h-3 w-12 bg-border-subtle rounded" />
        </div>
      </div>

      {/* Grid Lines & Placeholder Bars/Graph Area */}
      <div
        className="flex-1 my-4 flex flex-col justify-between border-l border-b border-border-subtle/80 pl-2 pb-2"
        aria-hidden="true"
      >
        <div className="w-full border-t border-dashed border-border-subtle/40" />
        <div className="w-full border-t border-dashed border-border-subtle/40" />
        <div className="w-full border-t border-dashed border-border-subtle/40" />
        <div className="w-full border-t border-dashed border-border-subtle/40" />
      </div>

      {/* X-Axis Labels Skeleton */}
      <div className="flex justify-between px-2" aria-hidden="true">
        <div className="h-2.5 w-8 bg-border-subtle rounded" />
        <div className="h-2.5 w-8 bg-border-subtle rounded" />
        <div className="h-2.5 w-8 bg-border-subtle rounded" />
        <div className="h-2.5 w-8 bg-border-subtle rounded" />
        <div className="h-2.5 w-8 bg-border-subtle rounded" />
      </div>
    </div>
  );
}
```

---

### File 3: `frontend/src/components/chat/ChatPanel.tsx`
**Goal**: Guarantee unique optimistic message IDs and avoid sub-millisecond duplicate key collisions.

**Change at line 135–136**:
```diff
    const tempMsg = {
-     id: `temp_${Date.now()}`,
+     id: `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      content,
```

---

### File 4: `frontend/src/components/ui/markdown-renderer.tsx`
**Goal**: Soften SSR/cold navigation hydration by delegating loading state to the Suspense boundary's plain-text fallback instead of rendering an invisible `opacity-0` span.

**Change at lines 13–19**:
```diff
 const DynamicMarkdownCore = dynamic(
   () => import('./markdown-core').then((mod) => mod.MarkdownCore),
   {
     ssr: false,
-    loading: () => <span className="opacity-0">Loading...</span>,
   }
 );
```

---

## 5. Verification Method

Worker 2 and Reviewer 2 must independently verify that all 6 verification checks succeed:

1. **Verify Socket Concurrency & Stress Tests**:
   ```bash
   export PATH="/Users/sahil/.nvm/versions/node/v24.21.0/bin:$PATH"
   node --test tests/stress/dynamic-charting-markdown-socket.test.mjs
   ```
   *Expected*: All 14 tests pass cleanly.

2. **Verify All Combined Milestone 1 Stress Suites**:
   ```bash
   export PATH="/Users/sahil/.nvm/versions/node/v24.21.0/bin:$PATH"
   node --test tests/stress/*.test.mjs
   ```
   *Expected*: All 32 tests pass cleanly across all 9 suites.

3. **Verify E2E Test Suite**:
   ```bash
   export PATH="/Users/sahil/.nvm/versions/node/v24.21.0/bin:$PATH"
   node tests/e2e/runner.mjs
   ```
   *Expected*: All 75 tests pass cleanly with exit code 0.

4. **Verify ESLint (Flat Config)**:
   ```bash
   export PATH="/Users/sahil/.nvm/versions/node/v24.21.0/bin:$PATH"
   cd frontend
   npm run lint
   ```
   *Expected*: Exit code 0, 0 errors, 0 warnings.

5. **Verify Production Webpack Build**:
   ```bash
   export PATH="/Users/sahil/.nvm/versions/node/v24.21.0/bin:$PATH"
   cd frontend
   npm run build
   ```
   *Expected*: Exit code 0, all 17 routes compiled successfully in ~2.1 seconds.

6. **Verify Bundle Size Reductions**:
   ```bash
   export PATH="/Users/sahil/.nvm/versions/node/v24.21.0/bin:$PATH"
   cd frontend
   npm run bundle:verify
   ```
   *Expected*: 13 of 13 routes report `OPTIMIZED` status with measurable initial JS payload reductions.

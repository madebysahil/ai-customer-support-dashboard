# BRIEFING — 2026-09-25T13:58:00Z

## Mission
Analyze socket listener leak and logout race condition in frontend/src/hooks/useSocket.ts, and formulate exact, complete, robust code replacement.

## 🔒 My Identity
- Archetype: teamwork_preview_explorer
- Roles: Socket Lifecycle & Leak Remediation Explorer
- Working directory: /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/explorer_m1_4
- Original parent: 9208bc5c-35bb-4b98-a924-ffa8c70049ce
- Milestone: Milestone 1 (Iteration 2)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement directly in source code
- Produce structured analysis report and exact replacement code in handoff report
- Synchronously clean up connect/disconnect event listeners in useEffect
- Cancel or ignore in-flight socketPromise when disconnectSocket() is called
- Preserve backwards compatibility with ChatPanel.tsx and NotificationBell.tsx

## Current Parent
- Conversation ID: 9208bc5c-35bb-4b98-a924-ffa8c70049ce
- Updated: 2026-09-25T13:58:00Z

## Investigation State
- **Explored paths**:
  - `frontend/src/hooks/useSocket.ts` (current implementation)
  - `frontend/src/components/chat/ChatPanel.tsx` (consumer of useSocket)
  - `frontend/src/components/notifications/NotificationBell.tsx` (consumer of useSocket)
  - `frontend/src/contexts/AuthContext.tsx` (`auth:logout` event dispatcher)
  - `frontend/src/lib/api.ts` (getAccessToken synchronous token getter)
  - `.agents/teamwork/challenger_m1_2/handoff.md` (gate failure report)
  - `tests/stress/dynamic-charting-markdown-socket.test.mjs` (stress tests)
- **Key findings**:
  - Defect 1: `useSocket.ts` lines 69-72 return cleanup inside `.then(...)` callback. React `useEffect` ignores promise return values, executing only synchronous cleanup (`isCancelled = true`), permanently leaking 2 listeners (`connect`, `disconnect`) per mount/unmount cycle.
  - Defect 2: `disconnectSocket()` sets `socketInstance = null` and `socketPromise = null`, but fails to cancel the in-flight `import('socket.io-client')` promise. Upon resolution, it creates and connects a background socket with old credentials after sign-out.
- **Unexplored areas**: None; problem scope fully explored and verified.

## Key Decisions Made
- Formulate synchronous cleanup closure in `useEffect` tracking `activeSock`, `onConnect`, `onDisconnect` with `isCancelled` early exit.
- Implement dual guard (`isDisposed` flag + `socketGeneration` counter) in `getOrCreateSocket` and `disconnectSocket` to guarantee immediate cancellation and ABA safety if users log out during dynamic import.
- Maintain full interface backwards compatibility: `{ socket, isConnected }`, `disconnectSocket`, and window `auth:logout` listener.

## Artifact Index
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/explorer_m1_4/handoff.md — Complete analysis report and exact code replacement
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/explorer_m1_4/progress.md — Liveness heartbeat
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/explorer_m1_4/DISPATCH.md — Task dispatch record

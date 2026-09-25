# Dispatch to Worker 2: Milestone 1 (Iteration 2 Remediation)

## Identity & Role
- Archetype: teamwork_preview_worker
- Role: Bundle & Socket Remediation Implementer
- Working directory: /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/worker_m1_2
- Parent: Project Orchestrator (orchestrator_1)

## Mandatory Documents
1. /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/ORIGINAL_REQUEST.md
2. /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/orchestrator_1/PROJECT.md
3. Remediation Blueprints:
   - /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/explorer_m1_4/handoff.md
   - /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/explorer_m1_5/handoff.md

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Tasks to Implement

### 1. Socket Lifecycle & Leak Remediation in `frontend/src/hooks/useSocket.ts`
Apply the exact replacement code from `explorer_m1_4/handoff.md` and `challenger_m1_2/handoff.md`:
- Introduce `isDisposed` flag and `socketGeneration` counter to guard against logout race condition during in-flight dynamic import.
- In `useEffect`:
  - Declare variables `activeSock: Socket | null = null`, `onConnect: (() => void) | null = null`, `onDisconnect: (() => void) | null = null`.
  - Inside `.then((sock) => { ... })`: check `if (isCancelled) return;` before attaching listeners.
  - Return the synchronous cleanup function from `useEffect`:
    ```ts
    return () => {
      isCancelled = true;
      if (activeSock && onConnect && onDisconnect) {
        activeSock.off('connect', onConnect);
        activeSock.off('disconnect', onDisconnect);
      }
    };
    ```
- In `disconnectSocket()`:
  - Set `isDisposed = true`, disconnect and nullify `socketInstance`, nullify `socketPromise`.

### 2. Minor Accessibility Polish in `frontend/src/components/charts/ChartSkeleton.tsx`
- Ensure `<div role="status" aria-busy="true" aria-live="polite" ...>`
- Add `<span className="sr-only">Loading {title || 'chart'} visualization</span>`

## Verification Requirements
Run and document in your handoff report:
1. `node --test tests/stress/dynamic-charting-markdown-socket.test.mjs` -> All 14 tests must pass.
2. `node --test tests/stress/virtualization-keystroke.test.mjs` -> All 18 tests must pass.
3. `npm run lint` in `frontend/` -> 0 errors, 0 warnings.
4. `npx next build --webpack` in `frontend/` -> Exit code 0 across all 17 routes.
5. `node tests/e2e/runner.mjs` in root -> 75/75 tests pass (100%).

Write your handoff report to:
`/Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/worker_m1_2/handoff.md`

Notify parent via send_message when complete.

# Dispatch to Worker 1: Milestone 1 (Bundle & Runtime Optimization)

## Identity & Role
- Archetype: teamwork_preview_worker
- Role: Bundle & Runtime Optimization Implementer
- Working directory: /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/worker_m1_1
- Parent: Project Orchestrator (orchestrator_1)

## Mandatory Documents to Read First
1. /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/ORIGINAL_REQUEST.md
2. /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/orchestrator_1/PROJECT.md
3. Explorer Reports:
   - /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/explorer_m1_1/handoff.md (Lucide, ESLint flat config, bundle measurement)
   - /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/explorer_m1_2/handoff.md (Dynamic charts, lazy markdown, socket decoupling)
   - /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/explorer_m1_3/handoff.md (Keystroke isolation, memoization, virtualization)

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Detailed Tasks to Implement

### 1. Tooling & Linting (FEAT-OPT-01, FEAT-OPT-11, FEAT-OPT-12)
- In `frontend/next.config.mjs`:
  Configure `experimental.optimizePackageImports: ["lucide-react", "date-fns"]`. Keep `transpilePackages: ["lucide-react"]`.
- In `frontend/eslint.config.mjs`:
  Create the flat config conforming to ESLint v10 + Next.js 16 + React 19 as designed by Explorer M1-1. Ensure `settings: { react: { version: "19.2" } }` is set. Ignore `.next/**`, `node_modules/**`, `scripts/**`, `dist/**`.
- In `frontend/package.json`:
  Update `"lint": "eslint src"`. Add `"@tanstack/react-virtual": "^3.13.0"` to dependencies.
- In `frontend/scripts/measure-bundle.mjs`:
  Create the bundle measurement script from Explorer M1-1.

### 2. Dynamic Imports & Bundle Splitting (FEAT-OPT-02, FEAT-OPT-03, FEAT-OPT-04)
- Create `frontend/src/components/charts/`:
  - `ChartSkeleton.tsx`: Polished skeleton matching chart heights (300px/280px).
  - `TokenUsageChart.tsx`: Area chart implementation with client mount guard.
  - `EscalationDistributionChart.tsx`: Donut/Pie chart implementation.
  - `AreaVolumeChart.tsx` & `SentimentDonutChart.tsx` (for Dashboard use in M4).
  - `index.ts`: Dynamic exports via `next/dynamic` (`ssr: false`) with `ChartSkeleton` fallback.
- In `frontend/src/app/(dashboard)/analytics/page.tsx`:
  Replace eager Recharts imports with dynamic imports from `@/components/charts`.
- Create `frontend/src/components/ui/markdown-renderer.tsx`:
  Lazy loader for `react-markdown` and `remark-gfm` with fallback. Replace eager `react-markdown` imports in:
  - `frontend/src/components/ai/ChatWorkspace.tsx`
  - `frontend/src/components/chat/ChatPanel.tsx`
  - `frontend/src/components/tickets/TicketAiAssistant.tsx`
  - `frontend/src/components/tickets/TicketDetails.tsx`
- In `frontend/src/hooks/useSocket.ts` and `frontend/src/contexts/AuthContext.tsx`:
  Decouple static import of `socket.io-client` from `AuthContext` root bundle so unauthenticated routes (`/login`) do not load 115 KB socket.io. Use dynamic `await import('socket.io-client')` in `useSocket.ts`.

### 3. Keystroke Isolation, Memoization & Virtualization (FEAT-OPT-05 to FEAT-OPT-10)
- In `frontend/src/components/chat/`:
  - Implement `ChatComposer.tsx` isolating textarea keystroke state and throttled typing emissions.
  - Implement `ChatMessageItem.tsx` wrapped in `React.memo` with custom equality check.
  - Update `ChatPanel.tsx` to use `ChatComposer` and `ChatMessageItem`, memoizing action callbacks with `useCallback`.
  - Implement `@tanstack/react-virtual` virtualization (`useVirtualizer`) in `ChatPanel.tsx` with dynamic measurement (`measureElement`) and sticky auto-scroll guard.
- In `frontend/src/components/tickets/`:
  - Implement `TicketCommentComposer.tsx` in `TicketDetails.tsx` isolating comment keystrokes and mutation.
  - In `TicketList.tsx`: Memoize `ticketsByStatus` with `useMemo([tickets])`. Extract `TicketListItem.tsx` and `TicketKanbanCard.tsx` wrapped in `React.memo`.
  - Implement `@tanstack/react-virtual` virtualization for list view mode in `TicketList.tsx`.
- In `frontend/src/components/chat/ConversationList.tsx`:
  - Add 200ms debounce to search query filtering.
  - Extract `ConversationListItem.tsx` with `React.memo`.
- In `frontend/src/components/ai/ChatWorkspace.tsx` and `TicketAiAssistant.tsx`:
  - Decouple streaming SSE token buffer into dedicated `StreamingAiBubble` so historical message nodes remain static during active streaming.
- In `frontend/src/app/(dashboard)/users/page.tsx`:
  - Implement table virtualization with top/bottom spacer rows for the audit log table.

## Verification Requirements
Run and document in your handoff report:
1. `npm install` (to install `@tanstack/react-virtual`).
2. `npm run lint` -> Must pass with 0 errors and 0 warnings.
3. `npx next build --webpack` (or `npm run build`) -> Must build successfully with exit code 0.
4. `node scripts/measure-bundle.mjs` -> Capture chunk measurements and verify initial JS bundle reduction.

Write your complete handoff report to:
`/Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/worker_m1_1/handoff.md`

Notify parent via send_message when complete.

## 2026-09-25T13:24:41Z
You are Worker 1 for Milestone 1 (Bundle & Runtime Optimization).
Implement all Milestone 1 features (FEAT-OPT-01 to FEAT-OPT-12).
Run verification:
- npm run lint (0 errors)
- next build --webpack (exit code 0)
- node scripts/measure-bundle.mjs (bundle reduction measured)
Write handoff report and notify parent.

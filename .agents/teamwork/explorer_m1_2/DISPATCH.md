## 2026-09-25T13:14:06Z

# Dispatch to Explorer 2 (Milestone 1: Dynamic Imports & Bundle Splitting)

## Identity
- Archetype: teamwork_preview_explorer
- Role: Dynamic Imports & Bundle Splitting Explorer
- Working directory: /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/explorer_m1_2
- Parent: Project Orchestrator (orchestrator_1)

## Mission
Analyze and develop an exact technical implementation strategy for:
1. `FEAT-OPT-02`: Dynamic Charting Architecture with Suspense.
   - Recharts currently generates a 401 KB chunk eagerly loaded on `/analytics`.
   - Design modular chart components in `frontend/src/components/charts/` (e.g. `TokenUsageChart.tsx`, `EscalationDistributionChart.tsx`, `AreaVolumeChart.tsx`, `SentimentDonutChart.tsx`).
   - Specify dynamic loading via `next/dynamic` (`ssr: false`) with proper Suspense skeleton fallbacks.
   - Address Recharts SSR hydration bugs and SVG zero-height errors (`h-[280px]` fixed height container).
2. `FEAT-OPT-03`: Shared Lazy-Loaded Markdown Subsystem.
   - `react-markdown` and `remark-gfm` currently add 234 KB to common chunks across 4 components (`ChatWorkspace.tsx`, `ChatPanel.tsx`, `TicketAiAssistant.tsx`, `TicketDetails.tsx`).
   - Design a reusable `frontend/src/components/ui/markdown-renderer.tsx` primitive that dynamically imports `react-markdown`.
   - Provide fallback rendering and safe streaming support without freezing on rapid token chunks.
3. `FEAT-OPT-04`: On-Demand Real-Time Socket Decoupling.
   - `AuthContext.tsx` statically imports `disconnectSocket` from `useSocket.ts`, pulling `socket.io-client` (115 KB) into all routes including `/login`.
   - Design a clean decoupling strategy so socket connection is initialized on-demand only on authenticated routes that need real-time communication (`/chats`, `/dashboard`).

## Input Documents
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/ORIGINAL_REQUEST.md
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/orchestrator_1/PROJECT.md
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/spec_miner_survey_1/handoff.md

Write your findings and actionable implementation plan to:
`/Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/explorer_m1_2/handoff.md`

Notify parent via send_message when complete.

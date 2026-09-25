# Dispatch to Spec Miner 1: Bundle & Runtime Optimization (Phases 1 & 2)

## Identity
- Archetype: teamwork_preview_spec_miner
- Role: Bundle & Runtime Spec Miner
- Working directory: /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/spec_miner_survey_1
- Parent: Orchestrator (orchestrator_1)

## Mission & Scope
Investigate the authoritative sources of truth for Phases 1 & 2:
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/ORIGINAL_REQUEST.md
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/SOFTWARE_DESIGN_DOCUMENT.md (Phases 1 & 2 sections)
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/audit_report.md
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/PROJECT_DETAILS.md
- Existing frontend codebase in /Users/sahil/Documents/Code/ai-customer-support-dashboard/frontend

## Requirements to Map
1. Lucide tree-shaking:
   - How are icons imported across frontend components? Are there barrel imports (`import { ... } from 'lucide-react'`) vs direct/optimized imports?
   - What is the exact recommendation from SOFTWARE_DESIGN_DOCUMENT.md and audit_report.md?
2. Dynamic imports of heavy libraries:
   - Identify usages of `recharts`, `react-markdown`, syntax highlighters, or other heavy dependencies.
   - Which components load them eagerly? Where can `React.lazy` / dynamic imports and suspense boundaries be introduced?
3. Component memoization & render optimization:
   - Which components suffer from unnecessary re-renders?
   - Identify tables, ticket lists, charts, chat feeds, or complex views needing `React.memo`, `useMemo`, or `useCallback`.
4. List virtualization:
   - Which lists/tables have high row counts (e.g. tickets, customers, audit logs, chat history)?
   - Requirements around `@tanstack/react-virtual` or existing virtualization.
5. Baseline build & bundle metrics:
   - Check build configuration (vite.config.ts, tsconfig.json, package.json).
   - What scripts exist for building/linting/analyzing bundle size?
   - Document pre-optimization baseline expectations and measurement methodology.

## Deliverables
Write a comprehensive report to:
`/Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/spec_miner_survey_1/handoff.md`
following the standard handoff format:
- Observation (detailed inventory of findings with file paths and line references)
- Logic Chain (technical reasoning, dependency relationships, and optimization strategy)
- Caveats & Risks (pitfalls, potential regressions, Vite/bundler quirks)
- Feature Inventory Items (numbered list of specific requirements/features for PROJECT.md § Feature Inventory)
- Verification Method (how to measure bundle size reduction, verify build and lint)

Notify parent via send_message when complete.

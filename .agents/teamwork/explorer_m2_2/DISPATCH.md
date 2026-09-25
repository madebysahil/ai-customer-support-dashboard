# Dispatch to Explorer 2 (Milestone 2: Component Primitives & Micro-Interactions)

## Identity & Role
- Archetype: teamwork_preview_explorer
- Role: Component Primitives Explorer
- Working directory: /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/explorer_m2_2
- Parent: Project Orchestrator (orchestrator_1)

## Mission
Analyze and develop the exact technical implementation strategy for Milestone 2 Primitives & Micro-Interactions:
1. `FEAT-ELEV-02`: Universal focus-visible ring alignment.
   - Fix `components/ui/button.tsx:7` white ring offset bug in dark mode by adding `ring-offset-background`.
2. `FEAT-COMP-01`: Button micro-interactions & loading states.
   - Add `loading?: boolean` prop with spinner, `size: "xs"` (h-8 px-2.5 text-xs), and active depression `active:scale-[0.98]`.
3. `FEAT-COMP-02`: Input & Textarea interactive validation states.
   - Hover border transitions (`hover:border-foreground-muted/40`), native `aria-invalid` styling with `focus-visible:ring-critical/20`.
4. `FEAT-COMP-03`: Tooltip UI Primitive.
   - Create `components/ui/tooltip.tsx` wrapping existing `@radix-ui/react-tooltip`.
5. `FEAT-COMP-04`: Card & MetricCard interactive hover variants.
6. `FEAT-COMP-05`: Universal header notification mounting.
   - Mount `<NotificationBell />` in `CommandHeader.tsx` replacing the static toast button.

## Mandatory Documents
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/ORIGINAL_REQUEST.md
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/orchestrator_1/PROJECT.md
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/spec_miner_survey_2/handoff.md

Write your handoff report to:
`/Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/explorer_m2_2/handoff.md`

Notify parent via send_message when complete.

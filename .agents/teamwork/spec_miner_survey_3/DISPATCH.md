# Dispatch to Spec Miner 3: Motion, Page Overhauls & QA (Phases 7 to 12)

## Identity
- Archetype: teamwork_preview_spec_miner
- Role: Motion & Pages Spec Miner
- Working directory: /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/spec_miner_survey_3
- Parent: Orchestrator (orchestrator_1)

## Mission & Scope
Investigate the authoritative sources of truth for Phases 7 through 12:
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/ORIGINAL_REQUEST.md
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/SOFTWARE_DESIGN_DOCUMENT.md (Phases 7 to 12 sections)
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/audit_report.md
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/PROJECT_DETAILS.md
- Existing frontend pages, routes, navigation, and modal components in /Users/sahil/Documents/Code/ai-customer-support-dashboard/frontend

## Requirements to Map
1. Phase 7: CSS-First Motion System:
   - Hard constraint: NO new JS animation libraries (e.g. no framer-motion, no gsap). Must be pure CSS / Tailwind animations.
   - Core motion tokens: durations, easing curves (cubic-bezier), keyframe animations (fade-in, slide-up, scale-in).
   - Mandatory requirement: `prefers-reduced-motion` support across all animated elements.
2. Phase 8: Page Transitions & Staggered List Entrances:
   - Route transitions or container-level page entrances.
   - Staggered entrances for list items, card grids, table rows, and activity feeds using CSS custom properties (`--stagger-delay`).
3. Phase 9: Command Palette Overhaul:
   - Current command palette implementation (e.g. Sheet/sidebar vs Centered Modal).
   - Requirements to convert/replace with centered modal (Cmd+K / Ctrl+K), keyboard navigation, search grouping, backdrop blur, animations.
4. Phase 10: Dashboard Page Revamp:
   - Dashboard layout, KPI metric cards, charts, recent activity, live feed, quick actions, responsive grid.
5. Phase 11: Detail Pages Overhaul:
   - AI Copilot / AI Assistant page, Tickets list & detail view, Customers list & profile view, Knowledge Base, Settings.
   - Layout, visual hierarchy, metadata display, action bars, empty states, error states.
6. Phase 12: QA, Accessibility & Robustness:
   - ARIA roles, labels, keyboard navigation (tab order, focus trap, Escape key handling).
   - Route verification: Dashboard, AI, Tickets, Customers, Knowledge, Settings, Login.
   - Zero console errors, responsive layouts (mobile, tablet, desktop).

## Deliverables
Write a comprehensive report to:
`/Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/spec_miner_survey_3/handoff.md`
following the standard handoff format:
- Observation (component hierarchy, animation setup, route structure, accessibility audit)
- Logic Chain (motion architecture, component revamp sequence, testing strategy)
- Caveats & Risks (layout shift, CSS animation performance, focus management, screen reader compatibility)
- Feature Inventory Items (numbered list of specific requirements/features for PROJECT.md § Feature Inventory)
- Verification Method (how to verify motion, command palette, route loading, accessibility)

Notify parent via send_message when complete.

# Dispatch to Spec Miner 2: Design System & UI Polish (Phases 3 to 6)

## Identity
- Archetype: teamwork_preview_spec_miner
- Role: Design System & Polish Spec Miner
- Working directory: /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/spec_miner_survey_2
- Parent: Orchestrator (orchestrator_1)

## Mission & Scope
Investigate the authoritative sources of truth for Phases 3, 4, 5 & 6:
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/ORIGINAL_REQUEST.md
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/SOFTWARE_DESIGN_DOCUMENT.md (Phases 3, 4, 5, 6 sections)
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/audit_report.md
- /Users/sahil/Documents/Code/ai-customer-support-dashboard/PROJECT_DETAILS.md
- Existing frontend design system and UI components in /Users/sahil/Documents/Code/ai-customer-support-dashboard/frontend

## Requirements to Map
1. Phase 3: Color Palette Refinement (Blue-tinted warm grays):
   - Current color palette in Tailwind config (tailwind.config.js / tailwind.config.ts / globals.css / CSS variables).
   - What are the exact blue-tinted warm gray hex/hsl/oklch values specified in SOFTWARE_DESIGN_DOCUMENT.md?
   - Neutral scales, primary/accent colors, semantic colors (success, warning, error, info), dark mode vs light mode mappings.
2. Phase 4: Typography & Spacing Standardization:
   - Font family configuration (Inter, Plus Jakarta Sans, Geist, system fallbacks).
   - Type scale (sizes, line heights, font weights, letter spacing) and headings hierarchy.
   - Spacing scale and container widths.
3. Phase 5: Shadows, Borders & Component Micro-interactions:
   - Elevation/shadow tokens (subtle layered shadows, colored glows, active/hover states).
   - Border radiuses, border colors, focus-visible rings (accessibility-compliant contrast).
   - Micro-interactions for buttons, badges, inputs, selects, toggles, cards, dropdowns, tooltips.
4. Phase 6: Login Experience Polish:
   - Current Login page implementation (frontend/src/pages/Login or similar).
   - Brand representation, card styling, visual polish, social/SSO auth mockups, validation states, accessibility, keyboard navigation.

## Deliverables
Write a comprehensive report to:
`/Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/spec_miner_survey_2/handoff.md`
following the standard handoff format:
- Observation (token definitions, component audits, style files, line references)
- Logic Chain (token architecture, cascade strategy, component refactoring sequence)
- Caveats & Risks (visual regressions, dark mode contrast issues, Tailwind class collisions)
- Feature Inventory Items (numbered list of specific requirements/features for PROJECT.md § Feature Inventory)
- Verification Method (how to verify color contrast, typography consistency, UI states)

Notify parent via send_message when complete.

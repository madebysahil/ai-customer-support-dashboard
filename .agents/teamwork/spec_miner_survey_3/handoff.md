# Specification Mining Report & Handoff: Phases 7 to 12
**Domain**: CSS-First Motion System, Page Transitions, Centered Command Palette, Dashboard Revamp, Detail Pages Overhaul & QA/Accessibility  
**Agent**: Spec Miner 3 (`spec_miner_survey_3`)  
**Target Codebase**: `/Users/sahil/Documents/Code/ai-customer-support-dashboard/frontend`  
**Authoritative References**: `ORIGINAL_REQUEST.md`, `SOFTWARE_DESIGN_DOCUMENT.md` (Sections 3.5, 3.6, 7, 8, 9, 10, 16, 17, 18, 19, 26), `audit_report.md`, `PROJECT_DETAILS.md`  
**Date**: 2026-09-25T18:38:00Z  

---

## 1. Observation

Direct empirical inspection of the repository source files, configuration manifests, and build tooling reveals the following concrete baseline facts:

### 1.1 Motion System & CSS Animation Setup
* **`frontend/package.json`**:
  * `"tailwindcss-animate": "^1.0.7"` is present.
  * `"@radix-ui/react-dialog": "^1.0.5"`, `"@radix-ui/react-dropdown-menu": "^2.0.6"`, `"@radix-ui/react-popover": "^1.1.23"` are installed.
  * `framer-motion` and `gsap` are absent from runtime code (satisfying the hard constraint: **NO JS animation libraries**).
* **`frontend/tailwind.config.ts` (lines 97–120)**:
  * Currently only defines: `accordion-down`, `accordion-up`, `fade-in` (`0.3s ease-out`), and `slide-up` (`0.4s ease-out`).
  * Missing: `scale-in` / `zoom-in`, `slide-down`, `pulse-subtle`, standard easing curve tokens (e.g., cubic-bezier timing functions), standard transition duration tokens (`duration-fast`, `duration-normal`, `duration-slow`), and staggered delay utilities.
* **`frontend/src/app/globals.css` (lines 1–121)**:
  * Defines HSL design tokens for colors, borders, and radius (`--radius: 6px`).
  * **Zero motion tokens** defined in `:root` or `.dark`.
  * **Zero `@media (prefers-reduced-motion: reduce)` overrides**, violating the mandatory accessibility requirement across all animated UI components.

### 1.2 Command Palette Implementation
* **`frontend/src/components/ui/command-palette.tsx` (lines 1–72)**:
  * Implemented using `Sheet` and `SheetContent side="top" className="w-full sm:max-w-xl mx-auto mt-20 p-0 rounded-lg shadow-lg border"` instead of a centered modal dialog.
  * Searches only **7 static routes** in a flat list: `Dashboard`, `Inbox`, `Tickets`, `Customers`, `Analytics`, `Knowledge Base`, `Settings`.
  * Omits critical application routes: `/ai` (AI Assistant), `/notifications`, `/profile`, `/users`.
  * **No keyboard navigation**: Lacks `ArrowUp`, `ArrowDown`, and `Enter` key handling. Items are only selectable via mouse click.
  * **No category grouping**: Navigation routes, operational actions, and data entities are lumped into a single unranked list.
  * **No backdrop blur**: Overlay uses default sheet opacity without backdrop-blur token styling.

### 1.3 Dashboard Page Implementation (`/dashboard`)
* **`frontend/src/app/(dashboard)/dashboard/page.tsx` (lines 1–214)**:
  * **Metrics Grid**: Renders only 3 cards (`Open Tickets`, `Live Chats`, `AI Resolution`) in a `sm:grid-cols-2 lg:grid-cols-3` layout. Missing the 4th core KPI scorecard mandated by SDD § 9.1 (e.g. `Average First Response Time (FRT)` or `Global CSAT Score`).
  * **Trend Indicators**: Scorecards lack delta trajectory badges (`+5.2% this week`, `-40% vs human`, positive/negative trend colors).
  * **Telemetry Charts**: Lines 200–210 render an empty placeholder card ("Advanced Reporting: Time-series metrics and sentiment analysis are currently being provisioned. Button: Awaiting Connection"). The multi-series Area Chart (24-hour conversational volume vs AI resolution) and Live Sentiment Trend Donut Chart defined in SDD § 9.1 and § 9.2 are completely missing.
  * **Operational Execution Tier**: SDD § 9.1 mandates a 3-column split: (1) Live Conversation Queue, (2) Real-Time Activity Feed / Audit Stream, and (3) Quick Actions Panel (New Ticket, Add FAQ, Emergency Out, Export Report). Currently, only Priority Queue and Active Chats are rendered; Activity Feed and Quick Actions are absent.
  * **Layout**: Container lacks smooth staggered card entrance animation.

### 1.4 Detail Pages Implementation
* **AI Copilot Workspace (`/ai`, `app/(dashboard)/ai/page.tsx` & `components/ai/`)**:
  * Multi-pane shell exists with `SidebarHistory`, `ChatWorkspace`, and `ContextPanel`.
  * Height constraint: Outer container uses `flex h-full bg-background rounded-tl-lg overflow-hidden border-t border-l`. Audit report verified an 80px bottom dead space gap on specific viewport scales when inner containers use fixed calc heights.
  * Empty state in `ChatWorkspace.tsx` and `ContextPanel.tsx` uses raw `animate-in fade-in zoom-in duration-500` without reduced-motion fallbacks.
  * Lacks action bar controls for one-click prompt templates, session search, or quick export.
* **Tickets Workspace (`/tickets` & `/tickets/[id]`, `components/tickets/`)**:
  * `TicketWorkspace.tsx` toggles between `list` and `kanban` views.
  * In Kanban mode, a `min-w-max` container with 5 status columns (`OPEN`, `PENDING_INTERNAL`, `PENDING_CLIENT`, `RESOLVED`, `CLOSED`) causes horizontal clipping on tablet viewports and sidebar collapse issues.
  * `TicketDetails.tsx` (line 184): When `ticket.status === 'CLOSED'`, the composer is hidden without a replacement status banner or resolution summary, leaving a blank 192px empty void.
  * Ticket items lack staggered entrance transitions when filtering or switching view modes.
* **Customer Directory & Profile (`/customers` & `/customers/[id]`)**:
  * `/customers`: Standard table layout with pagination, search, and delete modal. Table rows render abruptly without staggered entrance animations.
  * `/customers/[id]`: Card renders "Total Value: N/A" and "Recent Tickets: Ticket history is not available right now. Button: Go to Inbox" instead of linking directly to associated customer tickets.
* **Knowledge Base (`/knowledge` & `/knowledge/[id]`)**:
  * `/knowledge`: Grid renders document cards with status badges and category chips. Cards lack staggered entrance animations.
  * `/knowledge/[id]`: Displays raw document text and pipeline stepper. Re-index button is non-functional (no mutation hook bound).
* **Settings Studio (`/settings`, `app/(dashboard)/settings/page.tsx`)**:
  * Vertical tabs layout with 6 tabs: `General`, `Appearance`, `Notifications`, `AI Preferences`, `Security`, `Workspace`.
  * `Notifications`, `Security`, and `Workspace` render static "Coming Soon" empty states.
  * `General` and `AI Preferences` have read-only inputs for non-admins, but lack dirty form tracking, validation feedback, and clear save confirmation toasts.

### 1.5 Accessibility, QA & Route Compilation
* **Radix Primitives**: Radix Dialog, DropdownMenu, Tabs, and Popover primitives are installed and provide foundational ARIA attributes.
* **Missing ARIA metadata**: Several icon-only buttons (theme toggle, search triggers, ticket drag handles) lack accessible labels (`aria-label`) or descriptions.
* **Focus Management**: The current top-sheet Command Palette does not implement focus-trap confinement or return focus to the omnibar trigger on close.
* **Route Verification**:
  * Build executed with `npx next build --webpack`: **All 17 application routes compile cleanly with zero TypeScript errors** (`/`, `/_not-found`, `/ai`, `/analytics`, `/chats`, `/customers`, `/customers/[id]`, `/dashboard`, `/knowledge`, `/knowledge/[id]`, `/login`, `/notifications`, `/profile`, `/settings`, `/tickets`, `/tickets/[id]`, `/users`).
  * Note on Turbopack: Default `next build` with Turbopack triggers a child-process PostCSS spawn error in the sandboxed CLI environment; `--webpack` builds synchronously and successfully.

---

## 2. Logic Chain

```
Authoritative Spec (ORIGINAL_REQUEST.md + SDD § 3.5, 3.6, 7-12, 26 + Audit Report)
   │
   ├─► R3 / Phase 7: Pure CSS Motion System (Tailwind keyframes + CSS custom properties)
   │     ├─ Exclude JS animation runtimes (0 bundle overhead, 60fps GPU acceleration via transform/opacity)
   │     ├─ Motion tokens: Standardize durations (150ms/250ms/350ms) and cubic-bezier curves
   │     └─ Strict prefers-reduced-motion: reduce override across all keyframes and transitions
   │
   ├─► R3 / Phase 8: Page Transitions & Staggered List Entrances
   │     ├─ Main content container entrance (fade-in + slight slide-up, 200ms)
   │     └─ CSS-driven stagger delays (--stagger-delay: 50ms) for list items, card grids, table rows
   │
   ├─► R3 / Phase 9: Command Palette Overhaul
   │     ├─ Replace Sheet top-drawer with centered Dialog modal (Cmd+K / Ctrl+K)
   │     ├─ Implement full keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
   │     └─ Categorized result groups (Navigation, Quick Actions, Tickets, Customers, Knowledge)
   │
   ├─► R4 / Phase 10: Dashboard Page Revamp
   │     ├─ Expand to 4-column responsive KPI deck with delta trend badges
   │     ├─ Mount Recharts Area Chart (24h volume) + Donut Chart (Sentiment)
   │     └─ Implement 3-column operational deck: Priority Queue + Real-time Activity Feed + Quick Actions
   │
   ├─► R4 / Phase 11: Detail Pages Overhaul
   │     ├─ AI Copilot: Viewport height fix, action bar (regenerate/edit/copy), empty states
   │     ├─ Tickets: Fix Kanban horizontal container, add closed ticket banner
   │     ├─ Customers: Relational ticket links, CSAT display
   │     ├─ Knowledge Base: Functional re-index trigger, category filter chips, staggered grid
   │     └─ Settings: Replace "Coming Soon" stubs with interactive preference controls
   │
   └─► R4 / Phase 12: QA, Accessibility & Robustness
         ├─ ARIA compliance (dialog roles, sr-only labels, focus trapping)
         ├─ Responsive viewport clearance (BottomNav mobile clearance pb-16)
         └─ Verified zero-error compilation across all 17 routes
```

### 2.1 Motion Architecture Strategy
1. **Zero External Dependencies**: By utilizing `tailwindcss-animate` combined with custom CSS variables and Tailwind keyframes in `tailwind.config.ts` and `globals.css`, full motion capabilities are achieved with **0 KB added JS runtime bundle**.
2. **GPU Compositing Rule**: All custom keyframe animations (`fade-in`, `slide-up`, `slide-down`, `scale-in`) must strictly animate `opacity` and `transform` (`translateY`, `scale`). Animating properties that trigger layout re-calculation (`top`, `height`, `width`, `margin`) is forbidden.
3. **Accessibility Mandate**: Enforce a global `@media (prefers-reduced-motion: reduce)` block in `globals.css` that sets `animation-duration: 0.01ms !important`, `animation-iteration-count: 1 !important`, and `transition-duration: 0.01ms !important`.

### 2.2 Staggered List Entrance Mechanics
- Staggered entrances can be applied cleanly using inline custom properties:
  ```html
  <div style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }} className="animate-fade-in-up" />
  ```
  or utility classes with CSS variables `--stagger: 0, 1, 2...`.
- Applied targets:
  - Dashboard: KPI cards (4 items), Priority Queue rows, Activity Feed items.
  - Tickets: List view rows, Kanban cards.
  - Customers: Table rows.
  - Knowledge Base: Document grid cards.

### 2.3 Centered Command Palette Conversion
- Convert from `@/components/ui/sheet` to `@radix-ui/react-dialog` centered modal.
- Structure:
  - `DialogOverlay` with `bg-black/50 backdrop-blur-sm animate-fade-in`.
  - `DialogContent` centered at `top-[20%] sm:top-[25%] left-1/2 -translate-x-1/2 w-full max-w-xl shadow-2xl rounded-xl border bg-surface`.
  - Input with omni-search query parsing.
  - Keyboard navigation state tracking `selectedIndex` across flattened grouped items.
  - Groupings:
    - **Navigation** (`Dashboard`, `Inbox / Chats`, `AI Assistant`, `Tickets`, `Customers`, `Analytics`, `Knowledge Base`, `Notifications`, `Settings`, `Users`).
    - **Quick Actions** (`Create New Ticket`, `Add Knowledge Document`, `Toggle Dark/Light Mode`, `Log Out`).
    - **Quick Filters / Entities** (Filter high-priority tickets, view open chats).

---

## 3. Caveats & Risks

1. **Turbopack Build Flake in Sandboxed CLI**:
   - Running `next build` without flags defaults to Next.js 16 Turbopack, which panics when spawning a child node worker for PostCSS in restricted sandbox environments.
   - *Mitigation*: The build script or build verification command must run `next build --webpack` (or update npm build script to use `--webpack` during optimization phases) to ensure reproducible zero-exit builds.
2. **Layout Shift from Entrances**:
   - Improperly configured staggered animations can cause elements to render momentarily at full opacity before jumping to opacity 0 if keyframes are not configured with `animation-fill-mode: both` or `backwards`.
   - *Mitigation*: Ensure all entrance utility classes include `fill-mode-backwards` or `forwards` and default to `opacity: 0` before animation starts.
3. **Double Scrollbars on Workspace Pages**:
   - Multi-pane workspace pages (`/chats`, `/ai`, `/tickets`) rely on isolated pane scrolling. If the root `<main>` container also overflows, nested dual scrollbars appear.
   - *Mitigation*: Keep `<main className="flex-1 overflow-hidden ...">` on workspace routes or ensure children manage their own internal `overflow-y-auto`.
4. **Mobile BottomNav Occlusion**:
   - `BottomNav` is fixed with `h-14` at the bottom of the viewport on mobile screens (`< md`). Content containers must maintain `pb-20` (or `pb-safe`) to prevent the composer or action buttons from being blocked.
5. **Recharts Responsive Container Warning**:
   - Recharts `<ResponsiveContainer width="100%" height="100%">` emits console warnings if the parent container does not have an explicit pixel or percentage height during initial mount.
   - *Mitigation*: Wrap chart containers in an explicit height container (e.g. `className="h-[280px] w-full min-h-[280px]"`).

---

## 4. Features Discovered & Edge Cases

### Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Motion System | Pure CSS Motion Tokens | Custom CSS variables for durations (`--duration-fast`, `--duration-normal`) and bezier curves (`--ease-spring`, `--ease-smooth`) | CSS variables in `:root` / `.dark` | Smooth hardware-accelerated transitions | Fallback to `ease-in-out` | `tailwind.config.ts`, `globals.css` |
| 2 | Motion System | Keyframe Animations | Reusable keyframes: `fade-in`, `slide-up`, `slide-down`, `scale-in` | Tailwind classes (`animate-fade-in`, `animate-slide-up`, `animate-scale-in`) | Visual DOM transitions | Defaults to standard display if disabled | SDD § 14, `tailwind.config.ts` |
| 3 | Motion System | `prefers-reduced-motion` Enforcement | Accessible media query zeroing animation durations for motion-sensitive users | System OS accessibility preference | Instant UI state changes without motion | No animation triggered; instant render | ORIGINAL_REQUEST.md R3, WCAG 2.1 AA |
| 4 | Page Transitions | Container-Level Entrance Animation | Smooth entry transition on page change for main content container | Next.js route change / pathname change | Smooth fade and 4px slide-up | Graceful instant display if reduced motion | SDD § 8.1, DISPATCH § 2 |
| 5 | Page Transitions | Staggered List & Grid Entrances | Cascading entrance animation for cards, table rows, and activity feeds using CSS delays | Index property / `--stagger-delay: 50ms` | Staggered sequential appearance of list items | Items render simultaneously if stagger fails | ORIGINAL_REQUEST.md R3, SDD § 14.1 |
| 6 | Command Palette | Centered Modal Dialog | Replaces top Sheet with centered floating dialog overlay | Keyboard shortcut (`Cmd+K` / `Ctrl+K`) or omnibar click | Centered modal with backdrop blur overlay | Closes on backdrop click or Escape | DISPATCH § 3, SDD § 9.1 |
| 7 | Command Palette | Keyboard Navigation Engine | Full arrow key navigation (`ArrowUp`, `ArrowDown`) and `Enter` activation | Keydown events inside dialog | Visual active highlight, route push on Enter | Ignores invalid keycodes; traps tab focus | WCAG AA, SDD § 3.5 |
| 8 | Command Palette | Grouped Search Results | Categorization into Navigation, Quick Actions, and Knowledge/Support entities | Query string input | Grouped result sections with section headers | Renders "No results found" empty state | SDD § 9.1, `command-palette.tsx` |
| 9 | Dashboard Revamp | 4-Column Responsive KPI Deck | Scorecards: AI Automation Rate, Escalation Queue, Avg FRT Velocity, Global CSAT | Real-time / aggregated analytics telemetry | 4 metric scorecards with delta trajectory badges | Displays loading skeleton during query | SDD § 9.1, § 9.2, `dashboard/page.tsx` |
| 10 | Dashboard Revamp | Ingress vs AI Multi-Series Area Chart | 24h dynamic window chart plotting conversation ingress vs AI resolution volume | Historical hourly time series data | Responsive Recharts Area Chart with tooltips | Displays empty chart placeholder if no data | SDD § 9.1, `analytics/page.tsx` |
| 11 | Dashboard Revamp | Sentiment Donut & Critical Alert Display | Donut chart displaying Positive/Neutral/Negative split with alert thresholds | Sentiment distribution metrics | Recharts Pie/Donut Chart with colored legend | Renders neutral baseline if 0 conversations | SDD § 9.1, § 9.2 |
| 12 | Dashboard Revamp | Real-Time Activity Audit Feed | Asynchronous scrolling feed of system events (closed ticket, AI resolution, SLA alert) | Activity event stream / log items | Chronological event list with relative timestamps | Empty state if no recent events | SDD § 9.1, § 9.2 |
| 13 | Dashboard Revamp | Quick Action Command Panel | Ergonomic 4-button action bar: [+] New Ticket, [^] Add FAQ, [!] Emergency Escalate, [$] Export Report | Button clicks / shortcut keys | Trigger modals or route push | Buttons disable when mutations are pending | SDD § 9.1, § 9.2 |
| 14 | Detail Pages | AI Copilot Viewport Fix | Elimination of dead space, clean height chaining, multi-pane responsive split | Viewport resize, chat session select | Edge-to-edge workspace fitting viewport | Internal scrollbar on message timeline | Audit report § Layout, `ai/page.tsx` |
| 15 | Detail Pages | AI Copilot Action Controls | Stop streaming button, prompt regenerate, message edit, and copy response actions | User interactions during/after AI stream | Aborts fetch reader, re-triggers prompt | Displays toast error if SSE stream fails | `ChatWorkspace.tsx`, `ai/page.tsx` |
| 16 | Detail Pages | Ticket Kanban Responsive Guard | Prevents 1504px board compression in sidebar; responsive scroll container | Viewport scale, viewMode switch | Horizontal scroll on narrow screens; full width | Drag & drop updates status via mutation | Audit report § Anti-patterns, `TicketList.tsx` |
| 17 | Detail Pages | Ticket Detail Closed Status Banner | Replaces 192px empty void with informative resolution banner on closed tickets | Ticket with `status === 'CLOSED'` | Read-only resolution info & reopen button | Prevents accidental reply submission | Audit report § Layout, `TicketDetails.tsx` |
| 18 | Detail Pages | Customer 360 Relational Linking | Customer profile links to associated active tickets, displays CSAT score | Customer ID route param | Metric cards & navigable ticket list | Displays empty state if no tickets found | SDD § 8.1, `customers/[id]/page.tsx` |
| 19 | Detail Pages | Knowledge Base Ingestion Pipeline | Visual pipeline stepper (Uploaded, Extracted, Chunked, Embedded) with functional re-index | Document ID, re-index button click | Status indicator update & query invalidation | Error alert banner if indexing fails | SDD § 19, `knowledge/[id]/page.tsx` |
| 20 | Detail Pages | Settings Comprehensive Tabs | Interactive settings for Appearance, Notifications, AI thresholds, Security, and Workspace | Form input changes, save buttons | Persisted settings with query invalidation | Input validation errors displayed inline | SDD § 10, `settings/page.tsx` |
| 21 | QA & A11y | Accessible ARIA Labels & Roles | `role="dialog"`, `aria-modal="true"`, `aria-label` on icon buttons, screen-reader text | Screen reader / assistive technology | Semantic DOM tree with WCAG AA compliance | None | SDD § 3.5, ORIGINAL_REQUEST.md R4 |
| 22 | QA & A11y | Mobile BottomNav Clearance | Automatic `pb-20` padding clearance across all scrollable main views | Mobile viewport `< 768px` | Unobstructed composers, inputs, and action bars | Prevents element clipping behind fixed bar | Audit report § Layout Integrity |

### Edge Cases
| # | Feature | Input | Observed Behavior | Required Handling / Mitigation |
|---|---------|-------|-------------------|--------------------------------|
| 1 | Motion System | OS prefers-reduced-motion is enabled | CSS keyframe animations may cause vestibular discomfort if active | Set all animation and transition durations to `0.01ms` via `@media (prefers-reduced-motion: reduce)`. |
| 2 | Command Palette | User hits `Cmd+K` repeatedly or while modal is opening | Multiple keydown triggers could desynchronize modal open state | Debounce / toggle open state cleanly: `setIsCmdkOpen((open) => !open)` with event cancellation `e.preventDefault()`. |
| 3 | Command Palette | User presses `ArrowDown` at the bottom of the list or `ArrowUp` at top | Index could overflow or underflow available search results | Wrap selection index circular: `(prev + 1) % totalItems` and `(prev - 1 + totalItems) % totalItems`. |
| 4 | Command Palette | User submits search query matching 0 items | Empty list renders blank sheet | Display dedicated `<EmptyState icon={Search} title="No results found" description="Try searching for another keyword or command." />`. |
| 5 | Staggered Animations | Dynamic list with 50+ items (e.g. ticket list) | High index counts (50 * 50ms = 2.5s) delay items at the bottom | Cap max stagger delay: `Math.min(index * 40, 400)ms`. Items beyond index 10 animate concurrently. |
| 6 | Dashboard Charts | Recharts rendered in hidden tab or unmeasured container | Recharts throws negative width/height console errors | Ensure parent has fixed `h-[280px]` and render chart only after component mount or with explicit fallback. |
| 7 | Ticket Details | Ticket is `CLOSED` and agent attempts to comment | Composer was hidden leaving empty void; no indication of closed status | Render clear banner: "This ticket has been marked as CLOSED. [Reopen Ticket] to continue conversation." |
| 8 | Ticket Kanban | Screen resized to mobile / tablet width | 5 Kanban columns squish into unreadable vertical slivers | Wrap in `overflow-x-auto min-w-full pb-4` so columns retain minimum width (`w-72`) with horizontal scroll. |
| 9 | Customer Detail | Customer has 0 tickets or 0 chats | Detail page showed hardcoded mock string "Ticket history is not available" | Render clean empty state linking to "Create Ticket" or "Initiate Chat". |
| 10 | Settings Page | Non-admin agent attempts to edit global tenant settings | Fields were read-only but lacked visual hint why editing is blocked | Display badge "Read-Only (Admin Restricted)" and disable inputs with tooltip explanation. |
| 11 | Next.js Build | `npm run build` executed in sandbox environment | Next.js 16 Turbopack fails child-process spawn for PostCSS | Execute with `--webpack` flag (`next build --webpack`), which builds 100% cleanly. |

---

## 5. Conclusion

The specification mining for Phases 7 to 12 reveals clear, actionable requirements that bridge the architectural promises of the Software Design Document and the current codebase state:
1. **Motion System (Phase 7 & 8)**: Must be implemented using pure CSS/Tailwind tokens with strict reduced-motion overrides. Zero external JS animation libraries are needed or permitted.
2. **Command Palette (Phase 9)**: Must be replaced with a centered `@radix-ui/react-dialog` modal offering full keyboard traversal (`ArrowUp`/`ArrowDown`/`Enter`) and search categorization.
3. **Dashboard (Phase 10)**: Must be upgraded from its current 3-card, no-chart state to a complete operational hub with 4 responsive KPI cards (with trend badges), multi-series Area and Sentiment Donut charts, a live activity feed, and a 4-button quick action panel.
4. **Detail Pages (Phase 11)**: All five core detail surfaces (`/ai`, `/tickets`, `/customers`, `/knowledge`, `/settings`) require visual hierarchy refinement, layout bounding fixes, and full state handling (empty states, closed states, active filters).
5. **QA & Accessibility (Phase 12)**: All 17 routes compile cleanly with TypeScript. ARIA attributes, focus trapping, and mobile bottom clearance must be systematically finalized.

---

## 6. Verification Method

### 6.1 Independent Automated Commands
Execute from repository root (`/Users/sahil/Documents/Code/ai-customer-support-dashboard/frontend`):

```bash
# 1. Ensure nvm node is in PATH
export PATH="/Users/sahil/.nvm/versions/node/v24.21.0/bin:$PATH"

# 2. Verify Next.js production build across all 17 routes
npx next build --webpack
# Expected output:
# ✓ Compiled successfully
# ✓ Generating static pages (15/15)
# ✓ Finalizing page optimization
# Exit code: 0

# 3. Verify TypeScript static types
npx tsc --noEmit
# Expected output: Exit code 0, zero type errors.
```

### 6.2 Manual Inspection Checklist
* **Motion & Reduced Motion**:
  1. Inspect `frontend/src/app/globals.css` and `tailwind.config.ts` for motion tokens.
  2. Toggle OS "Reduce motion" preference (or emulate via Chrome DevTools Rendering tab: `Emulate CSS media feature prefers-reduced-motion: reduce`). Confirm all animations cease immediately.
* **Command Palette**:
  1. Press `Cmd+K` (Mac) or `Ctrl+K` (Windows).
  2. Verify centered modal appears with backdrop blur.
  3. Use `ArrowDown` and `ArrowUp` to navigate results; press `Enter` to confirm navigation.
  4. Press `Escape` to close and verify focus returns to trigger element.
* **Dashboard Revamp**:
  1. Navigate to `/dashboard`.
  2. Verify 4 KPI scorecards render with trend badges.
  3. Verify Area Chart and Sentiment Donut Chart render without console errors.
  4. Verify Activity Feed and Quick Actions bar are interactive.
* **Detail Pages**:
  1. `/ai`: Verify no dead space void at bottom; chat streaming and action buttons functional.
  2. `/tickets`: Verify list view and Kanban board toggle; check closed ticket detail banner.
  3. `/customers`: Verify customer table and customer 360 profile navigation.
  4. `/knowledge`: Verify document grid, category filter tabs, and document detail stepper.
  5. `/settings`: Verify all 6 tabs render cleanly with interactive controls.

### 6.3 Invalidation Conditions
This specification report is invalidated if:
* Any new JavaScript animation runtime (e.g. `framer-motion`, `gsap`) is introduced.
* The Command Palette remains implemented as a top-sheet drawer rather than a centered modal.
* The Dashboard omits telemetry charts or 4th KPI metric scorecard.
* Any route fails to compile under Next.js build.

# Project: SupportPilot AI Customer Support Dashboard Optimization & UI/UX Polish

## Architecture
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS.
- **Layers & Boundaries**:
  - `frontend/src/app/globals.css`: Design tokens (CSS custom properties) for light and dark modes, root motion variables, and global `@media (prefers-reduced-motion: reduce)` accessibility override.
  - `frontend/tailwind.config.ts`: Tailwind configuration extending colors, font families (`font-sans`, `font-mono`), keyframes (`fade-in`, `slide-up`, `scale-in`), durations, and shadow tokens.
  - `frontend/next.config.mjs` & `eslint.config.mjs`: Build-time package optimization (`optimizePackageImports` for `lucide-react`, `date-fns`), route rewrites, and ESLint flat config.
  - `frontend/src/components/ui/`: Atomic UI primitives (`button.tsx`, `input.tsx`, `tooltip.tsx`, `markdown-renderer.tsx`, `command-palette.tsx`, `empty-state.tsx`, `metric-card.tsx`).
  - `frontend/src/components/charts/`: Modular lazy-loaded Recharts visualizations (`AreaChart`, `DonutChart`) loaded via `next/dynamic` (`ssr: false`).
  - `frontend/src/components/layout/`: Global layout components (`CommandHeader.tsx`, `SidebarNav.tsx`, `BottomNav.tsx`, `NotificationBell.tsx`).
  - `frontend/src/app/(dashboard)/`: Page routes (`dashboard`, `ai`, `tickets`, `customers`, `knowledge`, `settings`, `analytics`, `notifications`, `users`, `profile`).
  - `frontend/src/app/(auth)/`: Authentication routes (`login/page.tsx`, `layout.tsx`).

## Code Layout & Write Ownership
| Milestone | Dedicated File / Directory Boundaries |
|-----------|---------------------------------------|
| M1: Bundle & Runtime Optimization | `frontend/next.config.mjs`, `frontend/eslint.config.mjs`, `frontend/package.json`, `frontend/src/components/ui/markdown-renderer.tsx`, `frontend/src/components/charts/`, `frontend/src/components/chat/ChatPanel.tsx`, `frontend/src/components/chat/ConversationList.tsx`, `frontend/src/components/tickets/TicketDetails.tsx`, `frontend/src/components/tickets/TicketList.tsx`, `frontend/src/contexts/AuthContext.tsx`, `frontend/src/hooks/useSocket.ts` |
| M2: Design System & Tokens | `frontend/src/app/globals.css` (color tokens, autofill, focus tokens), `frontend/tailwind.config.ts` (fonts, shadows, radiuses), `frontend/src/app/layout.tsx`, `frontend/src/components/ui/button.tsx`, `frontend/src/components/ui/input.tsx`, `frontend/src/components/ui/textarea.tsx`, `frontend/src/components/ui/tooltip.tsx`, `frontend/src/components/layout/CommandHeader.tsx` (notification bell mount), `frontend/src/app/(auth)/layout.tsx`, `frontend/src/app/(auth)/login/page.tsx` |
| M3: Motion & Command Palette | `frontend/src/app/globals.css` (motion tokens, reduced motion override), `frontend/tailwind.config.ts` (animation keyframes, easing curves, durations), `frontend/src/components/ui/command-palette.tsx`, `frontend/src/app/(dashboard)/layout.tsx` (container entrance animation) |
| M4: Dashboard & Detail Pages | `frontend/src/app/(dashboard)/dashboard/page.tsx`, `frontend/src/app/(dashboard)/ai/page.tsx`, `frontend/src/components/ai/`, `frontend/src/app/(dashboard)/tickets/`, `frontend/src/app/(dashboard)/customers/`, `frontend/src/app/(dashboard)/knowledge/`, `frontend/src/app/(dashboard)/settings/` |
| M-E2E: E2E Testing Suite | `e2e/`, `tests/e2e/`, or test directory in project root; opaque-box HTTP/CLI tests exercising all 17 routes and features |

## Feature Inventory
Every feature from the Survey phase is mapped to an authoritative milestone below.

| # | Code | Feature | Description | Milestone | Source |
|---|------|---------|-------------|-----------|--------|
| 1 | FEAT-OPT-01 | Next.js Package Import Optimization | Configure `experimental.optimizePackageImports` in `next.config.mjs` for `lucide-react` and `date-fns` | M1 | Spec Miner 1 |
| 2 | FEAT-OPT-02 | Dynamic Charting Architecture | Split Recharts into `components/charts/` and load dynamically via `next/dynamic` (`ssr: false`) with skeletons | M1 | Spec Miner 1 |
| 3 | FEAT-OPT-03 | Shared Lazy Markdown Subsystem | Create `components/ui/markdown-renderer.tsx` to lazy load `react-markdown` and `remark-gfm` across chat and ticket views | M1 | Spec Miner 1 |
| 4 | FEAT-OPT-04 | On-Demand Socket.io Decoupling | Decouple `socket.io-client` from `AuthContext` to prevent loading 115 KB on unauthenticated or static routes | M1 | Spec Miner 1 |
| 5 | FEAT-OPT-05 | Chat Feed & Composer Keystroke Isolation | Isolate input state in `ChatPanel.tsx`; memoize message bubbles with `React.memo` to eliminate keystroke re-renders | M1 | Spec Miner 1 |
| 6 | FEAT-OPT-06 | Ticket Workspace Render Optimization | Memoize status groups in `TicketList.tsx`; extract `TicketCommentComposer` in `TicketDetails.tsx` | M1 | Spec Miner 1 |
| 7 | FEAT-OPT-07 | Conversation Queue Memoization | Wrap `ConversationListItem` in `React.memo` and debounce search filter computation | M1 | Spec Miner 1 |
| 8 | FEAT-OPT-08 | AI Streaming Token Isolation | Separate streaming token deltas from historical message nodes in `ChatWorkspace.tsx` and `TicketAiAssistant.tsx` | M1 | Spec Miner 1 |
| 9 | FEAT-OPT-09 | Chat Timeline Virtualization | Install and configure `@tanstack/react-virtual` in `ChatPanel.tsx` with dynamic measurement | M1 | Spec Miner 1 |
| 10 | FEAT-OPT-10 | Ticket & Audit List Virtualization | Apply `@tanstack/react-virtual` to list mode in `TicketList.tsx` and audit log in `users/page.tsx` | M1 | Spec Miner 1 |
| 11 | FEAT-OPT-11 | ESLint Flat Config Migration | Create `eslint.config.mjs` conforming to ESLint v10 standards and update `"lint": "eslint src"` | M1 | Spec Miner 1 |
| 12 | FEAT-OPT-12 | Automated Bundle Size Delta Verification | Establish reproducible measurement script verifying measurable initial JS payload reduction | M1 | Spec Miner 1 |
| 13 | FEAT-DS-01 | Blue-Tinted Warm Gray Light Theme | Calibrate CSS variables in `:root` (`globals.css`) with subtle slate-warm undertone (Hue 214°–220°, Sat 14%–20%) | M2 | Spec Miner 2 |
| 14 | FEAT-DS-02 | Blue-Tinted Obsidian Dark Theme | Calibrate CSS variables in `.dark` (`globals.css`) to obsidian palette (Hue 222°–224°, Sat 35%–50%) | M2 | Spec Miner 2 |
| 15 | FEAT-DS-03 | Primary & Semantic Color WCAG Compliance | Tune `--primary` (45% light, 52% dark) for >= 4.5:1 contrast against white text; verify semantic badges | M2 | Spec Miner 2 |
| 16 | FEAT-TYPO-01 | Tailwind Font Family Configuration | Define `sans: ['var(--font-sans)', 'Inter', 'sans-serif']` and `mono` in `tailwind.config.ts`; wire in `layout.tsx` | M2 | Spec Miner 2 |
| 17 | FEAT-TYPO-02 | Universal Tabular Numbers Standard | Apply `tabular-nums` across metrics, tables, tickets, timestamps, and SLA timers | M2 | Spec Miner 2 |
| 18 | FEAT-TYPO-03 | Type Scale & Heading Hierarchy Enforcement | Disciplined 6-tier type hierarchy scale across all view templates | M2 | Spec Miner 2 |
| 19 | FEAT-ELEV-01 | Multi-Layer Elevation & Dark Inset Highlights | Layered directional shadows with dark-mode top inset border highlights (`inset 0 1px 0 0 rgba(255,255,255,0.06)`) | M2 | Spec Miner 2 |
| 20 | FEAT-ELEV-02 | Universal Focus-Visible Ring Alignment | Fix `button.tsx` dark mode white ring offset with `ring-offset-background`; standardize focus rings | M2 | Spec Miner 2 |
| 21 | FEAT-COMP-01 | Button Micro-Interactions & Loading States | Add `loading?: boolean` spinner, `size: "xs"`, and `active:scale-[0.98]` tactile click feedback in `button.tsx` | M2 | Spec Miner 2 |
| 22 | FEAT-COMP-02 | Input & Textarea Interactive States | Hover border transitions and native `aria-invalid` error borders with `focus-visible:ring-critical/20` | M2 | Spec Miner 2 |
| 23 | FEAT-COMP-03 | Tooltip UI Primitive | Implement `components/ui/tooltip.tsx` wrapping existing `@radix-ui/react-tooltip` with styled dark surface | M2 | Spec Miner 2 |
| 24 | FEAT-COMP-04 | Card & MetricCard Interactive Hover Variants | Optional interactive hover variant (`hover:border-border-hover hover:shadow-md`) | M2 | Spec Miner 2 |
| 25 | FEAT-COMP-05 | Dynamic Notification Bell Mounting | Mount live `<NotificationBell />` in `CommandHeader.tsx` replacing dummy button | M2 | Spec Miner 2 |
| 26 | FEAT-AUTH-01 | Brand Identity & Auth Layout Polish | Modern SVG brand emblem in `app/(auth)/layout.tsx` with platform title and enterprise subtitle | M2 | Spec Miner 2 |
| 27 | FEAT-AUTH-02 | Form Field Accessibility & Label Associations | Connect `htmlFor` and `id` on login form inputs; connect field error messages via `aria-describedby` | M2 | Spec Miner 2 |
| 28 | FEAT-AUTH-03 | Password Visibility Toggle | Add one-click eye toggle (`<Eye />` / `<EyeOff />`) with accessible label to password input | M2 | Spec Miner 2 |
| 29 | FEAT-AUTH-04 | Input Error Ring & Validation Feedback | Inline error alert icon and visual error ring on validation failure | M2 | Spec Miner 2 |
| 30 | FEAT-AUTH-05 | Enterprise SSO & Social Login Mockups | "Continue with Google" and "Single Sign-On (SAML / Okta)" buttons with separator | M2 | Spec Miner 2 |
| 31 | FEAT-AUTH-06 | Enhanced Quick Demo Credential Injector | Polished Demo Admin and Demo Agent buttons with role badges and disabled submit state | M2 | Spec Miner 2 |
| 32 | FEAT-AUTH-07 | Browser Autofill Style Normalization | CSS autofill overrides in `globals.css` to prevent browser pale yellow/blue background distortion | M2 | Spec Miner 2 |
| 33 | FEAT-MOT-01 | Pure CSS Motion Tokens & Keyframes | Define `fade-in`, `slide-up`, `slide-down`, `scale-in` keyframes and duration/easing variables in CSS/Tailwind | M3 | Spec Miner 3 |
| 34 | FEAT-MOT-02 | Global `prefers-reduced-motion` Enforcement | Global media query setting animation and transition durations to `0.01ms` for motion-sensitive users | M3 | Spec Miner 3 |
| 35 | FEAT-MOT-03 | Container Page Entrance Animations | Smooth entry transition on page change for main content container (fade-in + 4px slide-up) | M3 | Spec Miner 3 |
| 36 | FEAT-MOT-04 | Staggered List & Grid Entrances | Cascading entrance animations using CSS delays (`--stagger-delay: 50ms`, capped at 400ms) | M3 | Spec Miner 3 |
| 37 | FEAT-CMD-01 | Centered Modal Command Palette | Replace Sheet top-drawer with centered Dialog modal (`@radix-ui/react-dialog`) with backdrop blur | M3 | Spec Miner 3 |
| 38 | FEAT-CMD-02 | Command Palette Keyboard Navigation Engine | Full keyboard traversal (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`, circular wrap) and focus trapping | M3 | Spec Miner 3 |
| 39 | FEAT-CMD-03 | Command Palette Categorized Search Results | Categorize search results into Navigation, Quick Actions, and Support Entities with section headers | M3 | Spec Miner 3 |
| 40 | FEAT-PAGE-01 | Dashboard 4-Column Responsive KPI Deck | 4 metric scorecards (AI Automation, Open Escalations, Avg FRT, Global CSAT) with delta trajectory badges | M4 | Spec Miner 3 |
| 41 | FEAT-PAGE-02 | Dashboard Multi-Series Area Chart | 24-hour dynamic window chart plotting conversation ingress vs AI resolution volume via Recharts | M4 | Spec Miner 3 |
| 42 | FEAT-PAGE-03 | Dashboard Sentiment Donut Chart & Alerts | Sentiment distribution donut chart (Positive/Neutral/Negative) with alert thresholds | M4 | Spec Miner 3 |
| 43 | FEAT-PAGE-04 | Dashboard Operational Deck & Quick Actions | Priority Queue, Real-Time Activity Feed, and 4-shortcut Quick Actions Bar ([+] Ticket, [^] FAQ, [!] Escalate, [$] Export) | M4 | Spec Miner 3 |
| 44 | FEAT-PAGE-05 | AI Copilot Workspace Viewport & Action Controls | Viewport height bounds fix (no dead space void) and prompt action controls bar (stop, regenerate, edit, copy) | M4 | Spec Miner 3 |
| 45 | FEAT-PAGE-06 | Ticket Kanban Responsive Guard & Closed Banner | Horizontal scroll container for Kanban board on narrow viewports; resolution banner for closed tickets | M4 | Spec Miner 3 |
| 46 | FEAT-PAGE-07 | Customer 360 Relational Linking | Customer profile links to associated active tickets, displays CSAT score and contact metadata | M4 | Spec Miner 3 |
| 47 | FEAT-PAGE-08 | Knowledge Base Pipeline & Category Filters | Visual ingestion pipeline stepper with functional re-index button and category filter chips | M4 | Spec Miner 3 |
| 48 | FEAT-PAGE-09 | Settings Studio Comprehensive Tabs | Interactive settings for Appearance, Notifications, AI Preferences, Security, and Workspace | M4 | Spec Miner 3 |
| 49 | FEAT-QA-01 | Accessible ARIA Labels, Dialog Roles & Focus Traps | WCAG 2.1 AA semantic ARIA attributes, dialog roles, and screen-reader labels across all components | M4 | Spec Miner 3 |
| 50 | FEAT-QA-02 | Mobile Viewport BottomNav Clearance | Automatic `pb-20` padding clearance across all scrollable main views on mobile viewports | M4 | Spec Miner 3 |
| 51 | FEAT-QA-03 | 17-Route Verification & Zero-Console-Error Certification | All 17 core routes build, load, and run cleanly without console errors or hydration mismatches | M-Final | Spec Miner 3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Bundle & Runtime Optimization | Lucide tree-shaking, Recharts dynamic import, lazy MarkdownRenderer, socket decoupling, memoization, virtualization, ESLint flat config | none | DONE |
| M2 | Design System & UI Foundations | Blue-tinted warm gray & obsidian palettes, typography standardization, elevation tokens & dark inset highlights, button/input micro-interactions, tooltip primitive, login polish | none | PLANNED |
| M3 | CSS Motion System & Centered Command Palette | Pure CSS motion tokens & keyframes, prefers-reduced-motion override, page transitions, staggered entrances, centered modal command palette with keyboard nav | M2 | PLANNED |
| M4 | Dashboard & Detail Pages Overhaul | Dashboard 4 KPIs + Area/Donut charts + Activity Feed + Quick Actions; AI Copilot, Tickets Kanban, Customer 360, Knowledge Base, Settings, ARIA accessibility | M1, M2, M3 | PLANNED |
| M-E2E | Requirement-Driven E2E Test Suite Track | Independent opaque-box test runner & test cases (Tiers 1-4) published to TEST_READY.md | none | DONE |
| M-Final | E2E 100% Pass & Tier 5 Adversarial Hardening | Pass 100% E2E tests (Tiers 1-4) + Tier 5 Challenger whitebox stress tests + final build/lint/bundle verification | M1, M2, M3, M4, M-E2E | PLANNED |

## Interface Contracts
### M1 (Bundle Optimization) ↔ M4 (Dashboard & Pages)
- **`components/charts/`**:
  - `TokenUsageChart`: Props `{ data: Array<{ time: string, volume: number, aiResolved: number }>, className?: string }`
  - `SentimentDonutChart`: Props `{ data: Array<{ name: string, value: number, color: string }>, className?: string }`
  - Both components must support dynamic import via `next/dynamic` (`ssr: false`) and provide a default skeleton placeholder matching height.
- **`components/ui/markdown-renderer.tsx`**:
  - `MarkdownRenderer`: Props `{ content: string, className?: string }`. Lazily loads `react-markdown` and `remark-gfm`.

### M2 (Design System) ↔ M3 (Motion) ↔ M4 (Dashboard & Pages)
- **CSS Variables & Utility Classes**:
  - Backgrounds: `bg-background`, `bg-background-subtle`, `bg-surface`, `bg-surface-raised`
  - Foregrounds: `text-foreground`, `text-foreground-muted`, `text-foreground-subtle`
  - Borders: `border-border`, `border-border-subtle`, `border-border-hover`
  - Status: `text-success bg-success/10`, `text-warning bg-warning/10`, `text-critical bg-critical/10`, `text-info bg-info/10`
  - Shadows: `shadow-soft`, `shadow-premium`, `shadow-popover`, `shadow-modal`
  - Focus Ring: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background`
  - Motion: `animate-fade-in`, `animate-slide-up`, `animate-scale-in`, `transition-all duration-normal ease-smooth`
  - Reduced Motion: `@media (prefers-reduced-motion: reduce)` zeroes all durations globally.

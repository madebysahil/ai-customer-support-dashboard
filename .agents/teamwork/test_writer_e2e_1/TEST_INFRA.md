# TEST_INFRA.md — E2E Test Suite Infrastructure & Architecture Specification

**Project:** SupportPilot AI Customer Support Dashboard  
**Author:** E2E Test Suite Architect & Writer (`test_writer_e2e_1`)  
**Workspace:** `/Users/sahil/Documents/Code/ai-customer-support-dashboard`  
**Test Directory:** `/Users/sahil/Documents/Code/ai-customer-support-dashboard/tests/e2e`  
**Date:** 2026-09-25  

---

## 1. Executive Summary & Test Philosophy

This document defines the architectural specification, verification channels, feature matrix, and 4-tier test hierarchy for the end-to-end (E2E) testing track of SupportPilot AI Customer Support Dashboard.

### Core Principles
1. **Opaque-Box & Requirement-Driven**:
   Tests are derived exclusively from user requirements (`ORIGINAL_REQUEST.md`), architectural specifications (`SOFTWARE_DESIGN_DOCUMENT.md`), and public interface contracts (`PROJECT.md`). Tests exercise the application through its public entry points (HTTP REST endpoints, Server-Sent Events, Socket.io protocols, Next.js page routes, DOM/ARIA structures, and CLI commands) without coupling to internal private functions or implementation minutiae.

2. **Zero-Facade Guarantee**:
   Facade tests (mock assertions that pass unconditionally without executing real logic) are strictly prohibited. Every test asserts against authoritative inputs, mathematical/logical invariants, or live server responses.

3. **Progressive Testability & Independence**:
   Every test file and test case is completely self-contained, initializes its own execution state, avoids inter-test ordering dependencies, and cleans up artifacts upon completion. Tests run reliably across both development environments and headless CI pipelines.

4. **Adversarial Hardening**:
   Beyond happy paths, tests intentionally inject malformed payloads, unicode/script injection attempts, boundary conditions, expired credentials, and viewport extremes to verify robust error containment and graceful degradation.

---

## 2. Multi-Channel Verification Architecture

To verify the system comprehensively without heavy, brittle browser binaries (e.g. Chrome/WebKit headless downloads), the E2E test suite employs a 5-channel verification engine:

```
+-----------------------------------------------------------------------------------+
|                         E2E TEST RUNNER (`runner.mjs`)                            |
+-----------------------------------------------------------------------------------+
       |                    |                    |                   |
       v                    v                    v                   v
+--------------+   +-----------------+   +---------------+   +------------------+
| Channel 1:   |   | Channel 2:      |   | Channel 3:    |   | Channel 4:       |
| HTTP & API   |   | Next.js Routes  |   | Design System |   | Motion & A11y    |
| Contracts    |   | & SSR DOM Trees |   | & CSS Tokens  |   | Specifications   |
+--------------+   +-----------------+   +---------------+   +------------------+
       |                    |                    |                   |
       | REST CRUD          | Route HTTP 200     | HSL Color Tokens  | Keyframe Syntax  |
       | JWT & Refresh      | Container Bounds   | Contrast Ratios   | Reduced Motion   |
       | SSE Streaming      | Responsive Classes | Tabular Nums      | ARIA Attributes  |
       | Role-Based RBAC    | BottomNav Padding  | Elevation Shadows | Dialog / Traps   |
       +--------------------+--------------------+-------------------+------------------+
                                     |
                                     v
                        +---------------------------+
                        | Channel 5:                |
                        | Build & Config Governance |
                        | - optimizePackageImports  |
                        | - ESLint flat config      |
                        | - Bundle verification     |
                        +---------------------------+
```

### Channel 1: HTTP API & Stream Protocol Validation
- **Authentication**: JWT access token issuance, HttpOnly refresh cookies, transparent session rotation, 401 interception.
- **REST Endpoints**: CRUD operations across `/api/v1/tickets`, `/api/v1/customers`, `/api/v1/knowledge`, `/api/v1/chats`, `/api/v1/analytics`, `/api/v1/settings`, `/api/v1/users`, `/api/v1/audit-logs`.
- **SSE Streaming**: Validates Server-Sent Events from `/api/v1/ai/stream`, verifying `data: {"token": "..."}`, latency, and closure headers.
- **RBAC Enforcement**: Validates role access tiers (Admin, Manager, Support Agent) and `403 Forbidden` responses.

### Channel 2: Next.js Routes & Shell Layout Bounds
- Verifies accessibility and HTTP 200/307 resolution of all 17 specified routes (`/login`, `/dashboard`, `/chats`, `/chats/[id]`, `/ai`, `/tickets`, `/tickets/[id]`, `/customers`, `/customers/[id]`, `/knowledge`, `/knowledge/[id]`, `/analytics`, `/notifications`, `/settings`, `/users`, `/profile`, `/403`, `/404`).
- Validates layout constraints: Standard pages must enforce `max-w-[1200px] w-full mx-auto` and `pb-20 md:pb-6`; workspace pages (`/chats`, `/ai`, `/tickets`) must enforce edge-to-edge `h-full` without outer viewport clipping.

### Channel 3: Design System Tokens & WCAG Contrast
- Verifies CSS custom variables in `globals.css`:
  - Light mode: Slate-warm grays (Hue 214°–220°, Saturation 14%–20%).
  - Dark mode: Obsidian palette (Hue 222°–224°, Saturation 35%–50%).
  - Primary color: Minimum 4.5:1 contrast against white text in both light and dark themes.
  - Typography: Universal application of `tabular-nums` on KPI metric values, timestamps, and SLA timers.
  - Elevation: Directional multi-layer shadows (`shadow-soft`, `shadow-premium`) and dark-mode inset highlights (`inset 0 1px 0 0 rgba(255,255,255,0.06)`).

### Channel 4: Motion & Accessibility (A11y) Verification
- Pure CSS keyframe animations: `fade-in`, `slide-up`, `slide-down`, `scale-in` with zero runtime JS animation library dependencies.
- Global `@media (prefers-reduced-motion: reduce)` override zeroing animation and transition durations.
- ARIA semantics: `aria-invalid`, `aria-describedby`, `role="dialog"`, `role="status"`, focus ring visibility.

### Channel 5: Build & Bundle Optimization Governance
- Verification of `next.config.mjs` containing `experimental.optimizePackageImports` for `lucide-react` and `date-fns`.
- Verification of dynamic imports with skeletons (`components/charts/TokenUsageChart`, `components/charts/SentimentDonutChart`).
- Verification of lazy markdown renderer subsystem (`components/ui/markdown-renderer.tsx`).

---

## 3. The 4-Tier Test Architecture

```
+-----------------------------------------------------------------------------------+
|                        TIER 4: REAL-WORLD SCENARIOS (E2E)                         |
|   Multi-step user journeys: Customer Incident, FAQ Ingestion, Admin Audit, Mobile |
+-----------------------------------------------------------------------------------+
                                         ^
                                         |
+-----------------------------------------------------------------------------------+
|                    TIER 3: CROSS-FEATURE COMBINATIONS (INTEGRATION)               |
|   Pairwise interactions: Auth+Tickets+AI, Theme+Contrast, Reduced-Motion+DOM, etc |
+-----------------------------------------------------------------------------------+
                                         ^
                                         |
+-----------------------------------------------------------------------------------+
|                    TIER 2: BOUNDARY & CORNER CASES (ROBUSTNESS)                   |
|   Malformed tokens, empty states, max payloads, SLA timeouts, 403/404 fallbacks   |
+-----------------------------------------------------------------------------------+
                                         ^
                                         |
+-----------------------------------------------------------------------------------+
|                    TIER 1: FEATURE COVERAGE (ISOLATION)                           |
|   51 individual features tested in isolation (Happy paths & interface contracts)  |
+-----------------------------------------------------------------------------------+
```

### Tier 1: Feature Coverage (Isolation)
Tests every single core feature from the Feature Inventory in isolation.
- Focus: Happy-path inputs, contract satisfaction, expected HTTP status codes, correct DOM attributes, valid design tokens.
- Scope: 51 features spanning M1, M2, M3, M4, and core routes.

### Tier 2: Boundary & Corner Cases (Robustness)
Tests resilience under adversarial and atypical conditions.
- Focus: Zero-length inputs, extreme string lengths (10,000+ characters), special character escaping (XSS vectors, HTML tags, SQL meta-characters), invalid/expired JWT tokens, negative numeric values, simultaneous concurrent actions, missing relational entities, and offline fallbacks.

### Tier 3: Cross-Feature Combinations (Integration)
Tests interoperability between distinct subsystems.
- Focus:
  - Auth Flow ➔ Ticket Creation ➔ AI Co-pilot Suggestion ➔ Notification Dispatch.
  - Customer Entity Creation ➔ Association with Ticket ➔ Verification in Customer 360 Timeline.
  - Knowledge Base Ingestion Pipeline ➔ Semantic Vector Indexing ➔ AI Copilot RAG Grounding.
  - Dark Theme Mode Toggle ➔ Contrast Compliance ➔ Inset Highlight Rendering.
  - Command Palette Search ➔ Route Traversal ➔ Context Clearing.

### Tier 4: Real-World Scenarios (End-to-End User Journeys)
Tests realistic, high-value end-to-end customer support operations across multiple pages.
- **Scenario A: Urgent Incident Escalation Lifecycle**
  Customer initiates live query ➔ AI sentiment drops below -0.5 ➔ Escalation trigger fires ➔ Support Agent claims chat ➔ Agent inspects AI summary ➔ Generates suggested reply ➔ Resolves chat and transitions to closed ticket with resolution banner.
- **Scenario B: Knowledge Manager Authoring & Grounding**
  Manager logs in ➔ Ingests troubleshooting document ➔ Ingestion pipeline steps (Uploaded ➔ Extracted ➔ Chunked ➔ Indexed) ➔ Agent queries Copilot ➔ Copilot returns grounded citation.
- **Scenario C: Supervisor Operations & Executive Oversight**
  Admin logs in ➔ Inspects 4-column KPI scorecards (Automation Rate, FRT, CSAT, Escalations) ➔ Reviews Area Chart & Sentiment Donut Chart ➔ Checks Priority Queue ➔ Executes Quick Action ➔ Verifies audit log entry.
- **Scenario D: Mobile Support Agent On-The-Go**
  Agent accesses dashboard on 375px mobile viewport ➔ BottomNav renders without occluding composers ➔ Quick status toggle to Away ➔ Claims pending ticket.

---

## 4. Feature Inventory Matrix (51 Features)

| Feature Code | Name | Description | Primary Tier | Verification Method |
|---|---|---|---|---|
| `FEAT-OPT-01` | Package Import Optimization | `optimizePackageImports` in `next.config.mjs` | Tier 1 | Channel 5 / Ast Parse |
| `FEAT-OPT-02` | Dynamic Charting Architecture | Lazy Recharts in `components/charts/` | Tier 1 | Channel 5 / Dynamic Import Check |
| `FEAT-OPT-03` | Shared Lazy Markdown Subsystem | Lazy `react-markdown` in `markdown-renderer.tsx` | Tier 1 | Channel 5 / Contract Verification |
| `FEAT-OPT-04` | On-Demand Socket Decoupling | Decouple Socket.io from AuthContext | Tier 1 | Channel 1 / Ingress Guard |
| `FEAT-OPT-05` | Chat Composer Keystroke Isolation | Local input state & memoized bubbles | Tier 1 | Channel 2 / Component Contract |
| `FEAT-OPT-06` | Ticket Workspace Render Optimization | Memoized status groups & composer extraction | Tier 1 | Channel 2 / Component Contract |
| `FEAT-OPT-07` | Conversation Queue Memoization | Memoized items & debounced search | Tier 1 | Channel 2 / Component Contract |
| `FEAT-OPT-08` | AI Streaming Token Isolation | Isolated streaming token deltas | Tier 1 | Channel 1 / SSE Stream Inspector |
| `FEAT-OPT-09` | Chat Timeline Virtualization | Virtualized chat list container | Tier 1 | Channel 2 / Layout Tree |
| `FEAT-OPT-10` | Ticket & Audit List Virtualization | Virtualized ticket and audit tables | Tier 1 | Channel 2 / Layout Tree |
| `FEAT-OPT-11` | ESLint Flat Config Migration | `eslint.config.mjs` compliance | Tier 1 | Channel 5 / CLI Execution |
| `FEAT-OPT-12` | Automated Bundle Delta Verification | Measurement of initial JS payload reduction | Tier 1 | Channel 5 / Build Telemetry |
| `FEAT-DS-01` | Blue-Tinted Warm Gray Light Theme | `:root` CSS variables (Hue 214°–220°, Sat 14%–20%) | Tier 1 | Channel 3 / CSS Variable Evaluation |
| `FEAT-DS-02` | Blue-Tinted Obsidian Dark Theme | `.dark` CSS variables (Hue 222°–224°, Sat 35%–50%) | Tier 1 | Channel 3 / CSS Variable Evaluation |
| `FEAT-DS-03` | Color WCAG Compliance | Primary >= 4.5:1 contrast against white | Tier 1 | Channel 3 / Contrast Calculation |
| `FEAT-TYPO-01` | Tailwind Font Family Configuration | `font-sans` Inter & `font-mono` | Tier 1 | Channel 3 / Tailwind Config Assert |
| `FEAT-TYPO-02` | Universal Tabular Numbers Standard | `tabular-nums` on metrics, tables, SLA timers | Tier 1 | Channel 3 / DOM Class Inspection |
| `FEAT-TYPO-03` | Type Scale & Heading Hierarchy | Disciplined 6-tier type scale | Tier 1 | Channel 3 / Typography Tree |
| `FEAT-ELEV-01` | Multi-Layer Elevation & Dark Insets | Layered directional shadows & top inset border | Tier 1 | Channel 3 / Shadow Variable Check |
| `FEAT-ELEV-02` | Focus-Visible Ring Alignment | `ring-offset-background` focus styling | Tier 1 | Channel 4 / Focus Ring Styling |
| `FEAT-COMP-01` | Button Micro-Interactions | `loading` spinner, `xs` size, `active:scale-[0.98]` | Tier 1 | Channel 4 / Button Variant Props |
| `FEAT-COMP-02` | Input & Textarea Interactive States | `aria-invalid` borders and focus rings | Tier 1 | Channel 4 / ARIA & Border States |
| `FEAT-COMP-03` | Tooltip UI Primitive | Dark surface tooltip wrapping Radix primitive | Tier 1 | Channel 4 / Component Tree |
| `FEAT-COMP-04` | Card & MetricCard Hover Variants | Interactive hover border & shadow transitions | Tier 1 | Channel 3 / Class Verification |
| `FEAT-COMP-05` | Dynamic Notification Bell Mounting | Mounted `NotificationBell` in `CommandHeader` | Tier 1 | Channel 2 / Layout Tree Check |
| `FEAT-AUTH-01` | Brand Identity & Auth Layout | SVG emblem with platform & enterprise titles | Tier 1 | Channel 2 / DOM Tree Check |
| `FEAT-AUTH-02` | Form Field Accessibility | `htmlFor`/`id` and `aria-describedby` links | Tier 1 | Channel 4 / A11y Tree Validation |
| `FEAT-AUTH-03` | Password Visibility Toggle | Accessible eye toggle button on password input | Tier 1 | Channel 2 / Interactive Element Check |
| `FEAT-AUTH-04` | Input Error Ring & Validation | Inline error alert icon and visual error ring | Tier 1 | Channel 4 / Error State Rendering |
| `FEAT-AUTH-05` | Enterprise SSO & Social Mockups | Google and SAML/Okta login options | Tier 1 | Channel 2 / UI Elements |
| `FEAT-AUTH-06` | Quick Demo Credential Injector | Demo Admin & Demo Agent quick buttons | Tier 1 | Channel 2 / Button Behavior |
| `FEAT-AUTH-07` | Browser Autofill Normalization | Clean background overrides for autofill inputs | Tier 1 | Channel 3 / CSS Autofill Rules |
| `FEAT-MOT-01` | Pure CSS Motion Tokens | `fade-in`, `slide-up`, `scale-in` keyframes | Tier 1 | Channel 4 / Keyframe Spec |
| `FEAT-MOT-02` | Global `prefers-reduced-motion` | 0.01ms duration override for reduced motion | Tier 1 | Channel 4 / Media Query Contract |
| `FEAT-MOT-03` | Container Page Entrance Animations | Smooth container entrance transition | Tier 1 | Channel 4 / Layout Motion Classes |
| `FEAT-MOT-04` | Staggered List & Grid Entrances | Cascading entrance animations with delay caps | Tier 1 | Channel 4 / CSS Delay Variables |
| `FEAT-CMD-01` | Centered Modal Command Palette | Centered Dialog modal replacing Sheet drawer | Tier 1 | Channel 2 / Modal Placement & Dialog |
| `FEAT-CMD-02` | Command Palette Keyboard Engine | Arrow key traversal, Enter, Escape, wrap | Tier 1 | Channel 4 / Keyboard Handler Spec |
| `FEAT-CMD-03` | Command Palette Categorized Search | Navigation, Quick Actions, Support Entities | Tier 1 | Channel 2 / Search Result Groups |
| `FEAT-PAGE-01` | Dashboard Responsive KPI Deck | 4 metric scorecards with delta badges | Tier 1 | Channel 2 / Metric Card Deck |
| `FEAT-PAGE-02` | Dashboard Multi-Series Area Chart | 24-hour dynamic window conversation chart | Tier 1 | Channel 2 / Chart Container Render |
| `FEAT-PAGE-03` | Dashboard Sentiment Donut Chart | Sentiment distribution with alert thresholds | Tier 1 | Channel 2 / Donut Chart Render |
| `FEAT-PAGE-04` | Dashboard Operational Deck & Actions | Priority Queue, Activity Feed, Quick Actions | Tier 1 | Channel 2 / Dashboard Operational Grid |
| `FEAT-PAGE-05` | AI Copilot Viewport & Action Controls | Viewport bounds fix and prompt action bar | Tier 1 | Channel 2 / Height Bounds & Actions |
| `FEAT-PAGE-06` | Ticket Kanban Responsive Guard | Horizontal scroll guard & closed banner | Tier 1 | Channel 2 / Kanban Responsive Sizing |
| `FEAT-PAGE-07` | Customer 360 Relational Linking | Customer profile links to active tickets | Tier 1 | Channel 2 / Relational Link Chips |
| `FEAT-PAGE-08` | Knowledge Base Pipeline & Filters | Pipeline stepper & category filter chips | Tier 1 | Channel 2 / Stepper & Filters |
| `FEAT-PAGE-09` | Settings Studio Comprehensive Tabs | Interactive settings tabs across 5 sections | Tier 1 | Channel 2 / Tabs Navigation & Inputs |
| `FEAT-QA-01` | Accessible ARIA Labels & Dialog Roles | WCAG AA compliant labels, roles, and traps | Tier 1 | Channel 4 / Screen Reader Tree |
| `FEAT-QA-02` | Mobile BottomNav Clearance | `pb-20` clearance on mobile viewports | Tier 1 | Channel 2 / Responsive Padding |
| `FEAT-QA-03` | 17-Route Verification & Zero Errors | Clean build, HTTP 200, zero console errors | Tier 1 | Channels 1 & 2 / Route Verification |

---

## 5. Test Suite File Manifest & Organization

All E2E test source code is located in the project's root `tests/e2e/` directory:

```
tests/e2e/
├── runner.mjs                          # Standalone CLI test runner orchestrator
├── helpers/
│   ├── api-client.mjs                  # Lightweight HTTP & SSE client for test cases
│   ├── contracts.mjs                   # Invariant validators for design tokens & schemas
│   └── test-env.mjs                    # Environment bootstrap & port detection
├── tier1-features/
│   ├── auth-features.test.mjs          # FEAT-AUTH-01 through 07, FEAT-OPT-04
│   ├── dashboard-features.test.mjs     # FEAT-PAGE-01 through 04, FEAT-COMP-04
│   ├── chat-ai-features.test.mjs       # FEAT-OPT-05, FEAT-OPT-08, FEAT-PAGE-05
│   ├── ticket-features.test.mjs        # FEAT-OPT-06, FEAT-PAGE-06
│   ├── customer-knowledge.test.mjs     # FEAT-PAGE-07, FEAT-PAGE-08
│   ├── design-motion-a11y.test.mjs     # FEAT-DS, FEAT-TYPO, FEAT-MOT, FEAT-CMD, FEAT-QA
│   └── routes-optimization.test.mjs    # FEAT-QA-03, FEAT-OPT-01, 02, 03, 11, 12
├── tier2-boundaries/
│   ├── auth-boundary.test.mjs          # Malformed JWT, expired sessions, brute force
│   ├── data-boundary.test.mjs          # Extreme payload sizes, empty collections, UTF-8
│   └── layout-boundary.test.mjs        # Responsive breakpoints (320px, 768px, 1440px)
├── tier3-cross-feature/
│   ├── auth-ticket-ai.test.mjs         # Auth ➔ Ticket ➔ AI Assistant ➔ Notification
│   ├── knowledge-rag-chat.test.mjs     # Doc ingestion ➔ Vector retrieval ➔ Chat suggestion
│   └── theme-motion-layout.test.mjs    # Dark theme + reduced motion + responsive layout
└── tier4-real-world/
│   ├── scenario-incident.test.mjs      # End-to-end urgent customer incident workflow
│   ├── scenario-knowledge.test.mjs     # End-to-end knowledge authoring & grounding
│   └── scenario-oversight.test.mjs     # Executive supervisor monitoring & quick actions
```

---

## 6. Execution Command & CI Integration

The test suite runs with zero third-party installation required using standard Node.js:

```bash
# Run the complete 4-tier E2E test suite
node tests/e2e/runner.mjs

# Or run individual tiers
node tests/e2e/runner.mjs --tier=1
node tests/e2e/runner.mjs --tier=2
node tests/e2e/runner.mjs --tier=3
node tests/e2e/runner.mjs --tier=4

# Or execute with Node.js built-in test runner
node --test tests/e2e/**/*.test.mjs
```

### Exit Codes:
- `0`: All test suites passed successfully.
- `1`: One or more test suites failed or encountered an uncaught error.

---

## 7. Status & Readiness Publication
Upon completion of the implementation and local execution verification, `TEST_READY.md` will be generated in the working directory documenting final coverage counts, test run telemetry, and handover status.

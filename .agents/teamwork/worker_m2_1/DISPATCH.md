# Dispatch: Milestone 2 Implementation (Design System & UI Foundations)

**Target Agent**: `worker_m2_1` (teamwork_preview_worker)  
**Parent Agent**: Project Orchestrator (`orchestrator_1` / ID: `9208bc5c-35bb-4b98-a924-ffa8c70049ce`)  
**Working Directory**: `/Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/worker_m2_1`  
**Authoritative User Request**: `/Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/ORIGINAL_REQUEST.md`  
**Project Scope Document**: `/Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/orchestrator_1/PROJECT.md`  

---

## Explorer References (MANDATORY READING)
Read the comprehensive findings and drop-in code blueprints prepared by the 3 Milestone 2 Explorers:
1. `/Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/explorer_m2_1/handoff.md` (Tokens, Theme, Typography & Elevation)
2. `/Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/explorer_m2_2/handoff.md` (Component Primitives, Focus Rings, Tooltip & Notification Bell)
3. `/Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/explorer_m2_3/handoff.md` (Auth Layout, Login Page, Accessibility & Autofill)

---

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

---

## Exclusive File Boundaries
You own and may edit the following files exclusively:
1. `frontend/src/app/globals.css`
2. `frontend/tailwind.config.ts`
3. `frontend/src/app/layout.tsx`
4. `frontend/src/components/ui/button.tsx`
5. `frontend/src/components/ui/input.tsx`
6. `frontend/src/components/ui/textarea.tsx`
7. `frontend/src/components/ui/tooltip.tsx` (New file)
8. `frontend/src/components/ui/card.tsx`
9. `frontend/src/components/ui/metric-card.tsx`
10. `frontend/src/components/layout/CommandHeader.tsx`
11. `frontend/src/components/notifications/NotificationBell.tsx` (styling alignment if needed)
12. `frontend/src/app/(auth)/layout.tsx`
13. `frontend/src/app/(auth)/login/page.tsx`
14. Key telemetry displays requiring `tabular-nums`:
    - `frontend/src/components/tickets/TicketList.tsx`
    - `frontend/src/components/tickets/TicketDetails.tsx`
    - `frontend/src/components/ai/AiBadge.tsx`
    - `frontend/src/components/layout/SidebarNav.tsx`

---

## Detailed Task Requirements

### 1. Theme Tokens & Color Palette (`globals.css` & `tailwind.config.ts`)
- **Light Mode (`:root`)**:
  - Blue-tinted warm gray palette:
    - `--background: 210 20% 98%;`
    - `--background-subtle: 210 20% 96%;`
    - `--surface: 0 0% 100%;`
    - `--surface-raised: 210 25% 99%;`
    - `--foreground: 222 47% 11%;`
    - `--foreground-muted: 215 16% 47%;`
    - `--foreground-subtle: 215 14% 60%;`
    - `--border: 214 20% 90%;`
    - `--border-subtle: 214 20% 94%;`
    - `--primary: 222 47% 45%;` (WCAG AA > 4.5:1 against white)
    - `--primary-foreground: 0 0% 100%;`
- **Dark Mode (`.dark`)**:
  - Obsidian palette:
    - `--background: 222 47% 7%;` (Obsidian navy-black)
    - `--background-subtle: 222 44% 5%;`
    - `--surface: 222 40% 10%;`
    - `--surface-raised: 222 35% 13%;`
    - `--foreground: 210 40% 98%;`
    - `--foreground-muted: 215 20% 65%;`
    - `--foreground-subtle: 215 16% 45%;`
    - `--border: 220 20% 16%;`
    - `--border-subtle: 220 20% 12%;`
    - `--primary: 217 91% 60%;` with accessible contrast, or `--primary: 222 55% 50%` with `--primary-foreground: 0 0% 100%` meeting WCAG AA >= 4.5:1.
- **Autofill Normalization (`globals.css`)**:
  - Add Chrome/WebKit autofill normalization in `@layer base`:
    ```css
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    textarea:-webkit-autofill,
    textarea:-webkit-autofill:hover,
    textarea:-webkit-autofill:focus,
    select:-webkit-autofill,
    select:-webkit-autofill:hover,
    select:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0px 1000px hsl(var(--surface)) inset !important;
      -webkit-text-fill-color: hsl(var(--foreground)) !important;
      caret-color: hsl(var(--foreground)) !important;
      transition: background-color 5000s ease-in-out 0s;
    }
    ```
- **Semantic Color Mapping in `tailwind.config.ts`**:
  - Ensure `critical: { DEFAULT: "hsl(var(--critical))", foreground: "hsl(var(--critical-foreground))" }` is defined in `theme.extend.colors`.

### 2. Typography & Fonts (`tailwind.config.ts` & `layout.tsx`)
- In `tailwind.config.ts`:
  - Add `fontFamily` under `theme.extend`:
    ```ts
    fontFamily: {
      sans: ['var(--font-sans)', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
    },
    ```
- In `app/layout.tsx`:
  - Wire Inter variable: `const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })`
  - Update `body`: `<body className={`${inter.variable} ${inter.className} font-sans min-h-screen antialiased`}>`
- In `TicketList.tsx`, `TicketDetails.tsx`, `AiBadge.tsx`, `SidebarNav.tsx`:
  - Apply `tabular-nums` to numeric metrics, ticket IDs, badges, and timestamps.

### 3. Layered Elevation & Dark Mode Top Inset Border Highlights
- In `tailwind.config.ts`:
  - Extend `boxShadow` with `xs`, `sm`, `md`, `lg`, `xl`, `popover`, `modal`, and dark border highlights (`inset 0 1px 0 0 rgba(255, 255, 255, 0.06)`).

### 4. Component Primitives & Micro-Interactions
- `button.tsx`:
  - Add `focus-visible:ring-offset-background` to `buttonVariants`.
  - Update transition to `transition duration-150 ease-out` so `active:scale-[0.98]` depresses smoothly.
  - Add `size: xs: "h-8 rounded-md px-2.5 text-xs"`.
  - Add `loading?: boolean` prop to `ButtonProps`.
  - When `loading` is true: `disabled={disabled || loading}`, `aria-busy={loading ? "true" : undefined}`, prepend `<Loader2 className="mr-2 h-4 w-4 animate-spin" />`.
- `input.tsx` & `textarea.tsx`:
  - Add `hover:border-foreground-muted/50`.
  - Add `aria-[invalid=true]:border-critical aria-[invalid=true]:focus-visible:ring-critical/20`.
- `tooltip.tsx`:
  - Create `frontend/src/components/ui/tooltip.tsx` wrapping `@radix-ui/react-tooltip`.
- `card.tsx` & `metric-card.tsx`:
  - Add optional `interactive?: boolean` prop for hover lift with `motion-reduce:transition-none motion-reduce:hover:transform-none`.
- `CommandHeader.tsx`:
  - Replace the static mock toast button with dynamic `<NotificationBell />` from `@/components/notifications/NotificationBell`.
  - Verify sizing aligns seamlessly with header buttons (`h-8 w-8`).

### 5. Auth Experience & Login Polish
- `app/(auth)/layout.tsx`:
  - Modern geometric SVG brand emblem with subtle gradient/glow.
  - Subtitle: `"Enterprise AI Customer Support & Copilot Platform"`.
- `app/(auth)/login/page.tsx`:
  - Explicitly connect `<label htmlFor="email">` to `<Input id="email" />` and `<label htmlFor="password">` to `<Input id="password" />`.
  - Connect error messages using `aria-describedby` and pass `aria-invalid={!!form.formState.errors.email}`.
  - Add password visibility toggle with `<Eye />` and `<EyeOff />`.
  - Add Google and SAML SSO mockup buttons ("Continue with Google", "Continue with SAML SSO").
  - Enhance demo login credential buttons with role badges and disable during form submit.

---

## Verification Commands
Worker must execute:
1. `npm run lint` in `frontend/` (MUST pass with 0 errors and 0 warnings)
2. `npx next build --webpack` in `frontend/` (MUST compile with 0 errors across all 17 routes)
3. `node tests/e2e/runner.mjs` in root (MUST pass 100%, 75/75 tests)
4. Check `node --test tests/e2e/tier1-features/auth-features.test.mjs` specifically to ensure `FEAT-AUTH-01` and `FEAT-AUTH-02` pass with 0 gap diagnostics!

Write your complete handoff report to:
`/Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/worker_m2_1/handoff.md`

Notify parent via `send_message` when complete.

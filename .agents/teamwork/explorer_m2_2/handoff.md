# Milestone 2 Explorer 2 Handoff Report: Component Primitives & Micro-Interactions

**Target System**: SupportPilot AI Customer Support Dashboard  
**Domain**: Milestone 2 Component Primitives, Micro-Interactions, Focus Ring Standardization & Dynamic Header Notifications  
**Author**: Explorer 2 (Component Primitives & Micro-Interactions Explorer)  
**Date**: 2026-09-25T14:40:00Z  
**File Location**: `/Users/sahil/Documents/Code/ai-customer-support-dashboard/.agents/teamwork/explorer_m2_2/handoff.md`  
**Parent Agent**: Project Orchestrator (`orchestrator_1` / ID: `9208bc5c-35bb-4b98-a924-ffa8c70049ce`)  

---

## 1. Observation

Direct code inspections and empirical compiler validations performed across `frontend/src`:

### 1.1 `frontend/src/components/ui/button.tsx` (FEAT-ELEV-02, FEAT-COMP-01)
1. **Focus Ring Offset Defect on Line 7**:
   ```tsx
   // button.tsx:6-8
   const buttonVariants = cva(
     "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
   ```
   - In Tailwind CSS, `focus-visible:ring-offset-2` injects `--tw-ring-offset-width: 2px; --tw-ring-offset-color: #fff;` by default.
   - When focused in dark mode (`.dark`), the button displays an offset ring in `#ffffff` against the dark surface (`hsl(222, 40%, 9%)`), creating a white halo effect.
   - In contrast, `input.tsx:12`, `textarea.tsx:13`, and `tabs.tsx:32, 47` all include `ring-offset-background` (`--tw-ring-offset-color: hsl(var(--background))`).
2. **Missing Active Animation Transition on Line 7**:
   - `buttonVariants` specifies `transition-colors duration-150 ease-out`. In CSS, `transition-colors` transitions only `color`, `background-color`, `border-color`, `text-decoration-color`, `fill`, and `stroke`.
   - The tactile depression `active:scale-[0.98]` modifies the `transform` property; therefore, under `transition-colors`, the scale depression snaps instantly without smooth easing.
3. **Missing `xs` Size Variant on Lines 18-23**:
   - `buttonVariants` size variant object:
     ```tsx
     size: {
       default: "h-10 px-4 py-2",
       sm: "h-9 rounded-md px-3",
       lg: "h-11 rounded-md px-8",
       icon: "h-10 w-10",
     }
     ```
   - No `xs` size is defined. Across `frontend/src`, components currently resort to ad-hoc classes such as `className="text-xs h-7"` (`ContextPanel.tsx:104`), `className="h-8 px-2 text-xs"` (`TicketAiAssistant.tsx:232`), or `className="h-8"` (`dashboard/page.tsx:115`).
4. **Missing Loading State Prop on Lines 32-50**:
   - `ButtonProps` interface and `Button` implementation lack a `loading?: boolean` prop.
   - Currently, components implement ad-hoc spinners manually (e.g. `TicketDetails.tsx:82`: `{addComment.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Send className="h-3 w-3 mr-1.5" />}`).
   - Buttons do not automatically set `disabled={disabled || loading}` or `aria-busy={loading ? "true" : undefined}`.

### 1.2 `frontend/src/components/ui/input.tsx` & `textarea.tsx` (FEAT-COMP-02)
1. **Missing Hover Affordance**:
   - `input.tsx:12`:
     `"flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"`
   - `textarea.tsx:13`:
     `"flex min-h-[80px] w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150"`
   - Neither component defines hover styling (`hover:border-...`), leaving inputs visually static when the cursor hovers over them.
2. **Missing Native `aria-invalid` Styling & PostCSS Selector Audit**:
   - Neither component contains any CSS rule for `aria-invalid`. When form validation fails, inputs have no visual indicator (red border or ring) unless developers write manual custom classes.
   - Empirical test executed via PostCSS with `tailwindcss`:
     - Test 1: `@apply aria-invalid:border-critical` exited with error:
       `The aria-invalid:border-critical class does not exist.` (Tailwind CSS v3 does not include `invalid` in its built-in boolean ARIA list).
     - Test 2: `aria-[invalid=true]:border-destructive` compiled successfully to:
       `.aria-\[invalid\=true\]\:border-destructive[aria-invalid="true"] { border-color: hsl(var(--destructive)) }`
     - Test 3: `aria-[invalid=true]:border-critical` compiled to empty CSS because `critical` was missing from `theme.extend.colors` in `frontend/tailwind.config.ts:20-86`.
     - Test 4: When `critical: { DEFAULT: "hsl(var(--critical))", foreground: "hsl(var(--critical-foreground))" }` was provided to Tailwind config, `aria-[invalid=true]:border-critical` compiled cleanly to:
       `.aria-\[invalid\=true\]\:border-critical[aria-invalid="true"] { border-color: hsl(var(--critical)); }`
       `.aria-\[invalid\=true\]\:focus-visible\:ring-critical\/20:focus-visible[aria-invalid="true"] { --tw-ring-color: hsl(var(--critical) / 0.2); }`

### 1.3 `frontend/src/components/ui/tooltip.tsx` (FEAT-COMP-03)
1. **Package Verification**:
   - `frontend/package.json:21` declares `"@radix-ui/react-tooltip": "^1.0.7"`.
   - Node import inspection verified exports: `Provider`, `Root`, `Trigger`, `Content`, `Arrow`, `Portal`, `createTooltipScope`.
2. **Missing Component File**:
   - `frontend/src/components/ui/tooltip.tsx` does NOT exist in the repository.
   - Components needing tooltips currently rely on browser-native `title="..."` attributes (e.g. `ChatWorkspace.tsx:109, 112, 191`), which are unstyled, delayed (1–2 seconds), and inaccessible on touch devices.

### 1.4 `frontend/src/components/ui/card.tsx` & `metric-card.tsx` (FEAT-COMP-04)
1. **Card Component**:
   - `card.tsx:4-8` renders a static `div` with `rounded-lg border bg-surface text-foreground shadow-sm`.
   - It provides no variant or prop for interactive cards that respond to user hover.
2. **MetricCard Component**:
   - `metric-card.tsx:17-45` wraps `Card` with `overflow-hidden`.
   - Lacks an `interactive?: boolean` prop for clickable metric scorecards (e.g. clicking "Open Escalations" to navigate directly to the filtered ticket queue).
3. **Reduced Motion Constraint**:
   - `ORIGINAL_REQUEST.md` R3 and `PROJECT.md:109-110` mandate that all animations and transforms must respect `prefers-reduced-motion: reduce`. Card hover elevation (`hover:-translate-y-0.5`) must be disabled when motion is reduced.

### 1.5 `frontend/src/components/layout/CommandHeader.tsx` & `NotificationBell.tsx` (FEAT-COMP-05)
1. **Static Dummy Button in `CommandHeader.tsx:126-135`**:
   ```tsx
   <Button 
     variant="ghost" 
     size="icon" 
     className="relative rounded-md h-8 w-8 text-foreground-muted hover:text-foreground hover:bg-background-subtle"
     onClick={() => toast({ title: "You have 2 new high-priority tickets!" })}
   >
     <Bell className="h-4 w-4" />
     <span className="absolute right-1.5 top-1.5 flex h-1.5 w-1.5 rounded-full bg-critical border border-surface" />
     <span className="sr-only">Toggle notifications</span>
   </Button>
   ```
   - Hardcoded toast alert on click; unread indicator is a static red dot with no real counts or data.
2. **Orphaned Live Component in `frontend/src/components/notifications/NotificationBell.tsx`**:
   - Implements full TanStack Query integration (`useUnreadCount`, `useNotifications`, `useMarkRead`) and live Socket.io invalidation on `notification:received`.
   - Renders a Popover displaying real notifications, unread count badge with ping animation, and click-to-read mutation.
   - Component is completely unreferenced and unused anywhere in the codebase.
   - Sizing in `NotificationBell.tsx:36-37` defaults to `size="icon"` with `<Bell className="h-5 w-5" />`, which is larger than the `h-8 w-8` / `h-4 w-4` icon button styling of the surrounding header controls in `CommandHeader.tsx`.

---

## 2. Logic Chain

```mermaid
graph TD
    A[Milestone 2 Component Primitives] --> B[button.tsx Polish]
    A --> C[input.tsx & textarea.tsx Interactive States]
    A --> D[tooltip.tsx UI Primitive]
    A --> E[card.tsx & metric-card.tsx Hover Variants]
    A --> F[Dynamic Notification Bell in CommandHeader]

    B --> B1[Observation 1.1.1: Missing ring-offset-background]
    B1 --> B2[Add focus-visible:ring-offset-background -> Eliminates dark mode white halo]
    B --> B3[Observation 1.1.2: transition-colors skips transform]
    B3 --> B4[Switch to transition duration-150 ease-out -> Enables smooth active:scale depression]
    B --> B5[Observation 1.1.3: Ad-hoc sizes in toolbars]
    B5 --> B6[Add size: xs: 'h-8 rounded-md px-2.5 text-xs']
    B --> B7[Observation 1.1.4: Ad-hoc loading spinners]
    B7 --> B8[Add loading prop, auto-disabled, aria-busy, and Loader2 spinner]

    C --> C1[Observation 1.2.1: No hover state]
    C1 --> C2[Add hover:border-foreground-muted/40 with transition]
    C --> C3[Observation 1.2.2: Missing aria-invalid styling]
    C3 --> C4[Add aria-[invalid=true]:border-critical and focus-visible:ring-critical/20]

    D --> D1[Observation 1.3: Missing tooltip.tsx primitive]
    D1 --> D2[Wrap @radix-ui/react-tooltip with 150ms delay, dark surface, Radix origin animations]
    D2 --> D3[Mount TooltipProvider in Providers.tsx for zero-boilerplate consumption]

    E --> E1[Observation 1.4: Static cards]
    E1 --> E2[Add interactive prop: hover:shadow-md, hover:-translate-y-0.5, active:translate-y-0]
    E2 --> E3[Add motion-reduce:hover:translate-y-0 for WCAG reduced motion compliance]

    F --> F1[Observation 1.5: Static dummy button in CommandHeader]
    F1 --> F2[Mount dynamic NotificationBell in CommandHeader.tsx]
    F2 --> F3[Normalize NotificationBell button styling to match header h-8 w-8 controls]
```

### 2.1 Reasoning Steps

1. **Step 1 (Focus Ring Alignment - FEAT-ELEV-02)**:
   - *Direct link to Observation 1.1.1*: `button.tsx` omitted `ring-offset-background`. Adding `focus-visible:ring-offset-background` ensures that Tailwind computes `--tw-ring-offset-color: hsl(var(--background))` when focused. In dark mode, the ring offset blends seamlessly with the dark canvas, matching `input.tsx` and `tabs.tsx`.
2. **Step 2 (Button Micro-interactions - FEAT-COMP-01)**:
   - *Direct link to Observation 1.1.2 & 1.1.3 & 1.1.4*: Switching base class from `transition-colors` to `transition duration-150 ease-out` allows `active:scale-[0.98]` to animate physically. Adding `size: "xs"` gives compact toolbars and action bars a standardized 32px height button. Adding `loading?: boolean` standardizes the pending state: `<Loader2 className="animate-spin ..." />`, `disabled={disabled || loading}`, and `aria-busy={loading ? "true" : undefined}`. For `size="icon"`, replacing the icon with the spinner prevents layout blowup.
3. **Step 3 (Input & Textarea Interactive Validation - FEAT-COMP-02)**:
   - *Direct link to Observation 1.2.1 & 1.2.2*: Adding `hover:border-foreground-muted/40` gives subtle tactile feedback on hover. Using `aria-[invalid=true]:border-critical aria-[invalid=true]:focus-visible:ring-critical/20` ties directly to standard React Hook Form / HTML `aria-invalid` attributes without requiring bespoke component wrappers.
4. **Step 4 (Radix Tooltip Primitive - FEAT-COMP-03)**:
   - *Direct link to Observation 1.3*: Building `components/ui/tooltip.tsx` on top of `@radix-ui/react-tooltip` provides an accessible floating tooltip. Styling it with `bg-foreground text-background text-xs px-2.5 py-1.5 rounded-md shadow-md` delivers high contrast against any underlying surface in both light and dark themes. Adding `<TooltipProvider delayDuration={150}>` inside `Providers.tsx` enables global tooltip usage with zero boilerplate.
5. **Step 5 (Card Interactive Variants - FEAT-COMP-04)**:
   - *Direct link to Observation 1.4*: Adding `interactive?: boolean` to `Card` and `MetricCard` enables a clean hover lift (`hover:shadow-md hover:-translate-y-0.5 active:translate-y-0`) without breaking existing static card layouts. Including `motion-reduce:hover:translate-y-0 motion-reduce:transition-none` guarantees strict compliance with `prefers-reduced-motion`.
6. **Step 6 (Dynamic Notification Header - FEAT-COMP-05)**:
   - *Direct link to Observation 1.5*: Replacing the dummy button in `CommandHeader.tsx` with `<NotificationBell />` connects the universal header to real unread counts and Socket.io events. Adjusting `NotificationBell`'s button to `h-8 w-8` preserves header visual balance.

---

## 3. Caveats

1. **Tailwind Color Token Dependency**:
   - `aria-[invalid=true]:border-critical` requires that `critical` is present in `theme.extend.colors` of `tailwind.config.ts`. We verified that while `globals.css` defines `--critical`, `tailwind.config.ts` currently omits `critical`.
   - *Remediation*: We provide the exact fallback class and notify Explorer 1 / Worker to ensure `critical: { DEFAULT: "hsl(var(--critical))", foreground: "hsl(var(--critical-foreground))" }` is included in `tailwind.config.ts`.
2. **Radix Slot Children Constraint**:
   - When `asChild={true}` is passed to `Button`, Radix `Slot` clones props onto its single direct React element child. If `loading={true}` simultaneously attempts to inject `<Loader2 />` as a second child, Radix throws `React.Children.only expected to receive a single React element child`.
   - *Remediation*: In our `Button` implementation, when `asChild` is true, we bypass the spinner injection and render `<Slot>` directly.
3. **No New Dependencies**:
   - All proposed components use already-installed packages (`@radix-ui/react-tooltip`, `@radix-ui/react-popover`, `@radix-ui/react-slot`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`). No package additions are permitted.

---

## 4. Conclusion & Exact Technical Specifications

### 4.1 FEAT-ELEV-02 & FEAT-COMP-01: `frontend/src/components/ui/button.tsx`

**Target File**: `/Users/sahil/Documents/Code/ai-customer-support-dashboard/frontend/src/components/ui/button.tsx`  
**Write Strategy**: Full drop-in replacement.

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-transparent text-foreground hover:bg-muted",
        secondary: "border border-border bg-surface text-foreground shadow-sm hover:bg-muted",
        ghost: "text-foreground-muted hover:text-foreground hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-8 rounded-md px-2.5 text-xs",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading ? "true" : undefined}
        {...props}
      >
        {loading && (
          <Loader2
            className={cn(
              "animate-spin",
              size === "icon" ? "h-4 w-4" : size === "xs" ? "h-3.5 w-3.5 mr-1.5" : "h-4 w-4 mr-2"
            )}
          />
        )}
        {size === "icon" && loading ? null : children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

---

### 4.2 FEAT-COMP-02: `frontend/src/components/ui/input.tsx` & `textarea.tsx`

#### `frontend/src/components/ui/input.tsx`
**Target File**: `/Users/sahil/Documents/Code/ai-customer-support-dashboard/frontend/src/components/ui/input.tsx`  
**Write Strategy**: Full drop-in replacement.

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground transition duration-150 ease-out hover:border-foreground-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-critical aria-[invalid=true]:focus-visible:ring-critical/20 aria-[invalid=true]:focus-visible:border-critical",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

#### `frontend/src/components/ui/textarea.tsx`
**Target File**: `/Users/sahil/Documents/Code/ai-customer-support-dashboard/frontend/src/components/ui/textarea.tsx`  
**Write Strategy**: Full drop-in replacement.

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground transition duration-150 ease-out hover:border-foreground-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-critical aria-[invalid=true]:focus-visible:ring-critical/20 aria-[invalid=true]:focus-visible:border-critical",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
```

---

### 4.3 FEAT-COMP-03: `frontend/src/components/ui/tooltip.tsx`

**Target File**: `/Users/sahil/Documents/Code/ai-customer-support-dashboard/frontend/src/components/ui/tooltip.tsx` (New Primitive)  
**Write Strategy**: Create new file.

```tsx
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipArrow = TooltipPrimitive.Arrow

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md border border-border bg-foreground text-background px-2.5 py-1.5 text-xs shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-95 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 origin-[--radix-tooltip-content-transform-origin]",
        className
      )}
      {...props}
    >
      {children}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipArrow }
```

#### Global `TooltipProvider` Wiring in `frontend/src/components/providers/Providers.tsx`
**Target File**: `/Users/sahil/Documents/Code/ai-customer-support-dashboard/frontend/src/components/providers/Providers.tsx`

```tsx
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={150}>
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  )
}
```

---

### 4.4 FEAT-COMP-04: `frontend/src/components/ui/card.tsx` & `metric-card.tsx`

#### `frontend/src/components/ui/card.tsx`
**Target File**: `/Users/sahil/Documents/Code/ai-customer-support-dashboard/frontend/src/components/ui/card.tsx`  
**Write Strategy**: Full drop-in replacement.

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-border bg-surface text-foreground shadow-sm",
        interactive &&
          "cursor-pointer transition-all duration-200 hover:border-border-hover hover:border-foreground-muted/30 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 motion-reduce:hover:translate-y-0 motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

#### `frontend/src/components/ui/metric-card.tsx`
**Target File**: `/Users/sahil/Documents/Code/ai-customer-support-dashboard/frontend/src/components/ui/metric-card.tsx`  
**Write Strategy**: Full drop-in replacement.

```tsx
import * as React from "react"
import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  interactive?: boolean
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
  interactive = false,
  ...props
}: MetricCardProps) {
  return (
    <Card
      interactive={interactive}
      className={cn("overflow-hidden", className)}
      {...props}
    >
      <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-foreground-muted">{title}</p>
          {Icon && <Icon className="h-4 w-4 text-foreground-subtle" />}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
          {trend && (
            <p className="text-xs text-foreground-muted">
              <span
                className={cn(
                  "font-medium tabular-nums",
                  trend.positive === true ? "text-success" : 
                  trend.positive === false ? "text-critical" : "text-foreground"
                )}
              >
                {trend.value > 0 ? "+" : ""}{trend.value}%
              </span>{" "}
              {trend.label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

### 4.5 FEAT-COMP-05: `frontend/src/components/notifications/NotificationBell.tsx` & `CommandHeader.tsx`

#### `frontend/src/components/notifications/NotificationBell.tsx`
**Target File**: `/Users/sahil/Documents/Code/ai-customer-support-dashboard/frontend/src/components/notifications/NotificationBell.tsx`  
**Write Strategy**: Full drop-in replacement.

```tsx
"use client"

import { useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useUnreadCount, useNotifications, useMarkRead } from "@/hooks/useNotifications"
import { useSocket } from "@/hooks/useSocket"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps = {}) {
  const { data: countData } = useUnreadCount();
  const { data: inboxData } = useNotifications();
  const markRead = useMarkRead();
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;
    const handleNotification = () => {
      // Optimistically update counts and inbox
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    socket.on("notification:received", handleNotification);
    return () => {
      socket.off("notification:received", handleNotification);
    };
  }, [socket, queryClient]);

  const count = countData?.data?.count || 0;
  const notifications = inboxData?.data || [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative rounded-md h-8 w-8 text-foreground-muted hover:text-foreground hover:bg-background-subtle",
            className
          )}
        >
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-critical opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-critical" />
            </span>
          )}
          <span className="sr-only">Notifications ({count} unread)</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="font-semibold text-sm text-foreground">Notifications</h4>
          {count > 0 && <span className="text-xs text-foreground-muted">{count} unread</span>}
        </div>
        <div className="flex flex-col max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-foreground-muted">No new notifications</div>
          ) : (
            notifications.map((n: any) => (
              <Link
                key={n.id}
                href={n.linkUrl || '#'}
                onClick={() => !n.isRead && markRead.mutate(n.id)}
                className={cn(
                  "p-4 border-b border-border-subtle last:border-0 hover:bg-muted/50 transition-colors",
                  !n.isRead && "bg-primary/5"
                )}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className={cn("text-sm font-medium", n.priorityTier === 'CRITICAL' && "text-critical")}>
                      {n.title}
                    </span>
                    {!n.isRead && <span className="h-2 w-2 bg-primary rounded-full mt-1.5 shrink-0" />}
                  </div>
                  <p className="text-xs text-foreground-muted line-clamp-2">{n.message}</p>
                  <span className="text-[10px] text-foreground-subtle mt-1">{new Date(n.createdAt).toLocaleTimeString()}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

#### Modification in `frontend/src/components/layout/CommandHeader.tsx`
**Target File**: `/Users/sahil/Documents/Code/ai-customer-support-dashboard/frontend/src/components/layout/CommandHeader.tsx`  
**Write Strategy**: Edit lines 16, 43, and 126-135.

1. **Import `NotificationBell`**:
   Add to imports:
   ```tsx
   import { NotificationBell } from "@/components/notifications/NotificationBell"
   ```
2. **Replace Dummy Button at lines 126–135**:
   Replace:
   ```tsx
             <Button 
               variant="ghost" 
               size="icon" 
               className="relative rounded-md h-8 w-8 text-foreground-muted hover:text-foreground hover:bg-background-subtle"
               onClick={() => toast({ title: "You have 2 new high-priority tickets!" })}
             >
               <Bell className="h-4 w-4" />
               <span className="absolute right-1.5 top-1.5 flex h-1.5 w-1.5 rounded-full bg-critical border border-surface" />
               <span className="sr-only">Toggle notifications</span>
             </Button>
   ```
   With:
   ```tsx
             <NotificationBell />
   ```
3. Remove unused `toast` from line 43 (`import { toast } from "@/components/ui/toaster"` is only used on that removed line).

---

## 5. Verification Method

To independently verify the implementation:

### 5.1 Static Verification Commands
Run inside `frontend/`:
```bash
PATH=/Users/sahil/.nvm/versions/node/v24.21.0/bin:$PATH npm run lint
PATH=/Users/sahil/.nvm/versions/node/v24.21.0/bin:$PATH npm run build
```
Both commands must complete with exit code 0.

### 5.2 Dark Mode Focus Ring Offset Verification (FEAT-ELEV-02)
1. Launch dev server and open in browser.
2. Toggle theme to **Dark** mode.
3. Use the keyboard (`Tab` key) to focus across buttons in `CommandHeader` and the dashboard view.
4. Verify: The 2px focus ring offset renders with `--tw-ring-offset-color: hsl(var(--background))` matching the dark background without any bright white halo.

### 5.3 Button Micro-interactions & Loading Verification (FEAT-COMP-01)
1. Inspect `button.tsx` in a test harness or page.
2. Test `<Button loading={true}>Submit</Button>`:
   - Verify `<Loader2 className="animate-spin ..." />` renders before the button text.
   - Verify `aria-busy="true"` attribute is present in DOM.
   - Verify button is automatically disabled (`disabled` attribute and `pointer-events-none`).
3. Test `<Button size="xs">Filter</Button>`:
   - Verify element computed height is 32px (`h-8`), padding is 10px (`px-2.5`), font size is 12px (`text-xs`).
4. Test clicking any button:
   - Verify the `active:scale-[0.98]` physical depression animates smoothly over 150ms.

### 5.4 Input/Textarea Interactive Validation Verification (FEAT-COMP-02)
1. Hover cursor over any input or textarea:
   - Verify border darkens smoothly to `border-foreground-muted/40`.
2. Inspect input with `aria-invalid="true"`:
   - Verify border turns to `--critical` red (`hsl(0 72% 51%)` in light mode, `hsl(0 72% 58%)` in dark mode).
   - Press `Tab` into the invalid input: verify focus ring turns red with 20% opacity (`ring-critical/20`).

### 5.5 Radix Tooltip Primitive Verification (FEAT-COMP-03)
1. Import `Tooltip`, `TooltipTrigger`, `TooltipContent` in a view:
   ```tsx
   <Tooltip>
     <TooltipTrigger asChild>
       <Button variant="ghost" size="icon"><Sun className="h-4 w-4" /></Button>
     </TooltipTrigger>
     <TooltipContent>Switch to Dark Mode</TooltipContent>
   </Tooltip>
   ```
2. Hover over the button:
   - Tooltip appears with 150ms delay.
   - Tooltip renders on a dark surface (`bg-foreground text-background`) with rounded corners and subtle drop shadow.
   - Directional slide-in animation executes cleanly.

### 5.6 Card & MetricCard Interactive Hover Verification (FEAT-COMP-04)
1. Add `interactive={true}` to a `Card` or `MetricCard`.
2. Hover over the card:
   - Cursor changes to `pointer`.
   - Card raises by 2px (`-translate-y-0.5`) with `shadow-md` and border highlight over 200ms.
3. Test in OS with `prefers-reduced-motion: reduce`:
   - Verify the `-translate-y-0.5` transform is disabled (`motion-reduce:hover:translate-y-0`).

### 5.7 Dynamic Notification Bell Verification (FEAT-COMP-05)
1. Inspect the universal header (`CommandHeader`):
   - Verify the notification bell renders an `h-4 w-4` icon inside an `h-8 w-8` ghost button.
   - If unread notifications exist, verify the pulsing ping dot renders in the top right.
2. Click the bell:
   - Popover opens displaying live notification items, unread count header, and timestamps.
   - Clicking an unread notification triggers `markRead.mutate()` and invalidates query cache.
   - Zero hardcoded toasts appear.

---
*Report formulated and verified by Explorer 2.*

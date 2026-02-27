# AGENTS.md — react-strip-menu

## Project Overview

TypeScript React component library providing an animated strip/dropdown menu.
Published to npm as `react-strip-menu`. Zero runtime dependencies — only `react` and `react-dom` as peers.

**Monorepo** managed by Bun workspaces.

## Repository Structure

```
package.json              # Workspace root (private)
packages/
  react-strip-menu/       # Library package (published to npm)
    src/
      index.ts               # Barrel export with "use client" directive
      types.ts               # All exported types and internal interfaces
      ReactStripMenu.tsx      # Main public component
      DropdownsWrapper.tsx    # Internal sub-component (dropdown content slider)
      useMenuState.ts         # Custom hook: hover state machine via useReducer
      useReducedMotion.ts     # Custom hook: prefers-reduced-motion media query
      __tests__/
        setup.ts              # Test setup: jest-dom matchers + matchMedia mock
        useMenuState.test.ts  # Unit tests for state machine hook
        ReactStripMenu.test.tsx # Component tests (rendering, ARIA, mouse, keyboard)
    dist/                    # Build output (ESM + CJS + DTS), gitignored
    tsup.config.ts           # Build configuration
    vitest.config.ts         # Vitest test configuration
    tsconfig.json            # TypeScript configuration
    package.json             # Library package manifest
  demo/                    # Demo app (Vite + React)
    src/
      index.tsx              # Demo entry point
      index.css              # Demo styles
    index.html               # Vite HTML entry
    vite.config.ts           # Vite configuration
    package.json             # Demo package manifest
```

## Build Commands

All commands run from the **repository root**.

```bash
# Install dependencies (all workspaces)
bun install

# Type-check (no emit)
bun run lint

# Build library (outputs ESM + CJS + DTS to packages/react-strip-menu/dist/)
bun run build

# Both lint + build + test (runs on prepublishOnly)
bun run --filter react-strip-menu prepublishOnly

# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run a single test file
bunx vitest run src/__tests__/useMenuState.test.ts --config packages/react-strip-menu/vitest.config.ts
```

### Demo App

The demo app in `packages/demo/` uses Vite + React. It links to the local library via `workspace:*`.

```bash
# Start demo dev server (port 3456)
bun run dev

# Build demo for production
cd packages/demo && bun run build
```

## Testing

Tests use **Vitest** with **jsdom** environment, **@testing-library/react**, and **@testing-library/user-event**.

```bash
# Run all tests once
bun run test          # runs: vitest run

# Watch mode (re-runs on file changes)
bun run test:watch    # runs: vitest

# Run a single test file
bunx vitest run src/__tests__/ReactStripMenu.test.tsx --config packages/react-strip-menu/vitest.config.ts
```

### Test Structure

- `src/__tests__/setup.ts` — Global setup: `@testing-library/jest-dom` matchers + `window.matchMedia` mock (jsdom lacks matchMedia)
- `src/__tests__/useMenuState.test.ts` — Unit tests for the `useMenuState` reducer/hook (7 tests)
- `src/__tests__/ReactStripMenu.test.tsx` — Component integration tests: rendering, ARIA attributes, mouse interaction, keyboard navigation, error handling (14 tests)

### Adding New Tests

- Place test files in `packages/react-strip-menu/src/__tests__/` as `*.test.ts` or `*.test.tsx`
- Setup file is auto-loaded via `vitest.config.ts` (`setupFiles`)
- Use `@testing-library/react` for component tests, `renderHook` from the same package for hook tests
- Use `userEvent.setup()` for keyboard/interaction tests (preferred over `fireEvent` for realistic event sequences)

## Linting / Type Checking

```bash
# Type-check all source files
bun run lint          # runs: tsc --noEmit
```

No ESLint or Prettier configured. Formatting is manual — follow existing conventions.

## TypeScript Configuration

- **Strict mode**: Enabled (`"strict": true`)
- **Target**: ES2022
- **Module**: ESNext with `"moduleResolution": "bundler"`
- **JSX**: `react-jsx` (automatic runtime — no `import React` needed)
- **Declaration files + maps**: Generated (`"declaration": true`, `"declarationMap": true`)
- **Source maps**: Enabled
- **Key strict flags**: `noUncheckedIndexedAccess`, `noImplicitOverride`,
  `verbatimModuleSyntax`, `isolatedModules`

## Code Style Guidelines

### Formatting

- **Indentation**: 2 spaces
- **Quotes**: Double quotes (`"`) for strings and imports
- **Semicolons**: Always
- **Trailing commas**: Used in multi-line argument lists and arrays
- **Line length**: No enforced limit, keep lines reasonable

### Imports

Order (observed convention):
1. React hooks: `import { useState, useCallback } from "react"`
2. Type-only imports: `import type { CSSProperties, ReactElement } from "react"`
3. Internal modules: `import { useMenuState } from "./useMenuState"`
4. Internal types: `import type { MenuState } from "./types"`

**MUST use `import type` for type-only imports** — enforced by `verbatimModuleSyntax`.

### Exports

- **Named exports only** — no default exports
- Types and components re-exported from `src/index.ts` barrel
- Entry point: `src/index.ts`

### Components

- **Function declarations** for components (not arrow functions)
- **Props typed via named interfaces** defined in `src/types.ts`
- Internal components (e.g. `DropdownsWrapper`) are exported from their file
  but NOT re-exported from `src/index.ts`

```typescript
// Public — exported from index.ts
export function ReactStripMenu({ ...props }: ReactStripMenuProps) { ... }

// Internal — exported from file, not from index.ts
export function DropdownsWrapper({ ...props }: DropdownsWrapperProps) { ... }
```

### Naming Conventions

| Element             | Convention      | Example                              |
|---------------------|-----------------|--------------------------------------|
| Components          | PascalCase      | `ReactStripMenu`, `DropdownsWrapper` |
| Types / Interfaces  | PascalCase      | `FadeInMode`, `ReactStripMenuProps`   |
| Hooks               | `use` prefix    | `useMenuState`                       |
| Functions/variables | camelCase       | `isAncestor`, `dropdownIndex`        |
| Refs                | `xxxRef` suffix | `rootRef`, `popoverRef`              |
| Event handlers      | `handle` prefix | `handleMouseOver`, `handleMouseLeave`|
| Callbacks (props)   | `on` prefix     | `onOpen`, `onClose`                  |

### Hooks Usage

- `useReducer` for complex multi-field state (see `useMenuState.ts`)
- `useRef<HTMLDivElement>(null)` with explicit generic and null initializer
- `useCallback` for all event handlers with correct dependency arrays
- `useLayoutEffect` for synchronous DOM measurements only
- Dependency arrays are always complete and correct

### Styling Approach

- **No CSS-in-JS runtime** — pure inline styles via React `style` prop
- Dynamic values (duration, transforms) computed in JS, applied as inline styles
- No CSS files, no className-based animation — all transitions via `style.transition`
- CSS custom properties NOT used (all values passed as props)

### Error Handling

- Prop validation via `console.error` (not `throw`) — does not crash the React tree:
  ```typescript
  if (childArray.length !== dropdowns.length) {
    console.error(`[ReactStripMenu] children count mismatch...`);
  }
  ```

### State Management

- Hover state machine is centralized in `useMenuState.ts` using `useReducer`
- Three actions: `OPEN`, `CLOSE`, `HIDE`
- Visibility controlled via React state (`isVisible`), NOT via direct DOM mutation
- Close timer stored in a ref and properly cleaned up

## Package Publishing

- **ESM-first** with CJS fallback: `"type": "module"` in package.json
- Entry points via `exports` field:
  - ESM: `./dist/index.js` (types: `./dist/index.d.ts`)
  - CJS: `./dist/index.cjs` (types: `./dist/index.d.cts`)
- `sideEffects: false` for tree-shaking
- Published files: `dist/` only (no source shipped)
- Validate before publish: `npx publint && npx @arethetypeswrong/cli --pack`
- Publish from `packages/react-strip-menu/`: `cd packages/react-strip-menu && npm publish`

## Key Constraints

1. **No runtime dependencies** — only `react` and `react-dom` as peer deps
2. **ES2022 target** — consumers transpile further if needed
3. **`"use client"` directive** — compatible with Next.js App Router / RSC
4. **React 18 + 19** — peer dep range `^18.0.0 || ^19.0.0`
5. **Vitest for testing** — jsdom environment, @testing-library/react
6. **Bun** — package manager and script runner
7. **Bun workspaces** — monorepo with `packages/*`
8. **No CI/CD** — no GitHub Actions configured
9. **No formatter** — follow existing conventions manually

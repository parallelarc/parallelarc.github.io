# Evaluation and Testing Strategy

This document describes how automated tests are organized in the `terminal-portfolio` project and how the Engineer AI should extend them when changing behaviour.

---

## 1. Tooling overview

- **Test runner**: Vitest
- **DOM / React testing utilities**: React Testing Library (`@testing-library/react`) and `@testing-library/jest-dom` matchers.
- **Environment**: `jsdom` is used to simulate the browser environment.

These tools collectively allow you to test React components, user interactions, and terminal behaviour in a realistic but fully automated way.

---

## 2. Test layout in the repository

Key locations:

- `src/test/`
  - `Terminal.spec.tsx` – main test suite for the terminal component and core behaviours.
  - `setup.ts` – shared test environment setup (e.g. extending expect with jest-dom, global configuration).
- `src/utils/test-utils.tsx`
  - Helpers for rendering components and reusing common test setup.

When adding new tests, prefer to:

- Reuse utilities from `src/utils/test-utils.tsx`.
- Keep feature-specific tests colocated with the most relevant suite (often `Terminal.spec.tsx` for terminal behaviour).

---

## 3. Running tests

Use the following commands from the project root:

- **Watch mode (for local development):**
  - `pnpm test`

- **Single run (for CI or quick verification):**
  - `pnpm test:once`

- **With coverage reporting:**
  - `pnpm coverage`

Coverage reports help identify untested areas, especially when introducing new commands or modifying terminal input handling.

---

## 4. What is currently covered

While the exact assertions live in `src/test/Terminal.spec.tsx`, the following areas are typically covered:

- Rendering of the terminal shell and prompt (`Terminal` and related components).
- Handling of command input and display of command history.
- Behaviour for unknown commands (e.g. "command not found" messaging).
- Keyboard navigation for command history (e.g. ArrowUp/ArrowDown) and shortcuts.
- Autocomplete-related behaviours where applicable.

When changing these areas, you should review the existing tests and update or add cases accordingly.

---

## 5. Adding or updating tests

When you modify behaviour, especially in these areas:

- `src/components/Terminal.tsx`
- `src/components/commands/*`
- `src/hooks/useTheme.ts`
- `src/utils/funcs.ts`

You should:

1. **Identify the observable behaviours** affected by your change.
2. **Update or add tests** that:
   - Render the relevant component(s) using Testing Library.
   - Simulate user input or interactions (e.g. typing a command, pressing keys).
   - Assert the resulting DOM output or state using jest-dom matchers.
3. **Keep tests focused on behaviour**, not implementation details:
   - Prefer user-visible effects (text in the terminal, prompts, etc.) over internal state inspection.

---

## 6. Evaluation beyond automated tests

- The `public/lighthouse-result.svg` file contains a snapshot of Lighthouse scores from a previous run.
- When making performance- or accessibility-sensitive changes, consider:
  - Running Lighthouse again in your browser.
  - Verifying that major scores (Performance, Accessibility, Best Practices, SEO) remain acceptable.

For most day-to-day changes, keeping unit/component tests green and behaviourally accurate is sufficient.

---

## 7. Expectations for Engineer AI

- **Do not reduce test coverage** when modifying existing behaviours; instead, keep or improve it.
- For new features or commands:
  - Add at least one meaningful test case that exercises the typical user path.
- Ensure `pnpm test:once` (and ideally `pnpm coverage`) passes before reporting the task as completed.

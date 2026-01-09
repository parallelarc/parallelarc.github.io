# Engineering Principles for `terminal-portfolio`

This document expands on the short principles listed in `AGENTS.md` and provides concrete guidelines for implementing and evolving the `terminal-portfolio` project.

The primary goals are:

- Keep the codebase **simple, predictable, and easy to extend**.
- Ensure the terminal UI remains **responsive, accessible, and robust**.

---

## 1. Core design principles

### 1.1 KISS / YAGNI

- Prefer the **simplest design that satisfies current requirements**.
- Avoid introducing new architectural layers (e.g. global state management libraries, custom routing systems) unless there is a clear, repeated need.
- When in doubt, **defer abstraction** until at least two or three concrete use-cases justify it.

### 1.2 DRY (Dont Repeat Yourself)

- Reuse existing utilities and patterns:
  - Terminal input and history management patterns from `src/components/Terminal.tsx`.
  - Autocomplete and parsing helpers from `src/utils/funcs.ts`.
  - Theming patterns from `src/hooks/useTheme.ts` and `src/components/styles/`.
- If you find logic duplicated in multiple commands or components, extract a helper function, hook, or component in an appropriate module.

### 1.3 Pragmatic SOLID

- **Single Responsibility**:
  - Components should focus on a single concern (e.g. terminal, output, a specific command, or a layout element).
  - Hooks should encapsulate reusable stateful logic (e.g. theme management).
- **Open/Closed**:
  - Prefer extending behaviour by adding new commands or components rather than modifying many existing ones.
  - Keep central dispatch logic (e.g. in `Terminal` and `Output`) small and table-driven where possible.
- **Interface Segregation / Dependency Inversion** (adapted to this project):
  - Expose minimal, focused props and contexts.
  - Avoid tight coupling between unrelated commands or features.

---

## 2. React and component-level guidelines

- Use **functional components** with hooks.
- Keep component trees shallow and readable; avoid deeply nested JSX when simple subcomponents would help.
- Prefer passing **data and callbacks via props or context** over relying on global variables.
- When adding new commands:
  - Follow existing patterns in `src/components/commands/`.
  - Keep each command self-contained and focused on its display logic.
  - Avoid embedding complex global state changes inside command components; route such concerns through `Terminal` or dedicated utilities where appropriate.

---

## 3. State management and side effects

- Let `src/components/Terminal.tsx` remain the **single source of truth** for:
  - The current input value.
  - Command history.
  - Autocomplete hints and pointer/index state.
- Use hooks (`useState`, `useEffect`, `useCallback`, etc.) judiciously:
  - Keep effect dependencies minimal but correct.
  - Avoid heavy work inside render paths; move it to memoized functions or effects if needed.
- For browser-side side effects (e.g. event listeners, DOM manipulation):
  - Use `useEffect` with proper cleanup.
  - Follow existing patterns in `App.tsx` and `Terminal.tsx`.

---

## 4. Theming and styling principles

- Continue using **`styled-components`** for styling.
- Reuse theme variables and mixins from existing theme files under `src/components/styles/`.
- When adding new visual elements:
  - Extend existing styled-components or create new ones in a style module, not inline styles.
  - Ensure new components respect the active theme (e.g. use theme colours from props).
- Maintain **accessibility**:
  - Preserve sufficient colour contrast for text and important UI elements.
  - Ensure focus visibility for interactive elements.

---

## 5. Testing and quality

- Tests are an essential part of this project, not an afterthought.
- For any non-trivial behaviour change (especially in `Terminal` or commands):
  - Update existing tests in `src/test/Terminal.spec.tsx`, or
  - Add new test cases to cover new paths.
- Follow Testing Library best practices:
  - Prefer user-centric queries (e.g. by text, role, label) over internal implementation details.
  - Assert on observable behaviour (output text, focus changes, ARIA attributes) instead of component internals.
- Use coverage reports (`pnpm coverage`) to spot untested behaviours in critical areas.

---

## 6. Logging and error handling

- Logging:
  - Avoid leaving `console.log` / `console.error` in committed code unless there is a strong justification.
  - For debugging, use temporary logs but remove them before merging.
- Error handling:
  - When interacting with external resources (e.g. network requests, navigation helpers), fail gracefully.
  - Provide clear, user-friendly feedback in the terminal when an operation cannot be completed.

---

## 7. Git and formatting workflow

- Husky and lint-staged are configured to run checks on staged files.
- Expectations:
  - Code should pass ESLint (`pnpm lint`).
  - Code should be formatted with Prettier (`pnpm format` / `pnpm format:check`).
- Do not disable existing lint rules or bypass checks without a strong, documented reason.

---

## 8. When to ask for human input

The Engineer AI should ask the human for clarification when:

- Requirements for new commands or sections of the portfolio are ambiguous (e.g. unclear copy, design, or branding constraints).
- A change would significantly alter the user experience (e.g. changing keyboard shortcuts, altering major themes).
- Introducing new dependencies or libraries is being considered.

Keep questions focused and concrete, referencing specific files and behaviours you intend to modify.

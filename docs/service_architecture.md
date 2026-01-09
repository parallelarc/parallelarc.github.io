# Service Architecture Overview

This document provides a high-level view of how the `terminal-portfolio` application is structured and where core responsibilities live. It is intended to help the Engineer AI quickly find the right modules when implementing or debugging features.

---

## 1. High-level architecture

- **Type of application**: Single-page frontend application (SPA).
- **Primary purpose**: Present a personal portfolio through a terminal-style user interface.
- **Execution environment**: Runs entirely in the browser, built and served as static assets.
- **Main responsibilities**:
  - Render a terminal-like UI that accepts user commands.
  - Maintain command history, autocomplete suggestions, and keyboard shortcuts.
  - Display portfolio information (about, projects, socials, etc.) based on commands.
  - Provide theme switching and PWA/offline capabilities.

There is no dedicated backend component in this repository; any external interactions (e.g. navigating to external URLs) are initiated from the frontend.

---

## 2. Core runtime flow

1. **HTML shell**
   - `index.html` – Vite HTML entry, contains the root DOM node where the React app is mounted.

2. **React bootstrap**
   - `src/main.tsx`
     - Standard Vite/React entry point.
     - Creates the React root and renders `<App />`.

3. **Global app shell & theming**
   - `src/App.tsx`
     - Provides a context for theme switching (`themeContext`).
     - Wraps the app in `ThemeProvider` from `styled-components`.
     - Applies global styles via `GlobalStyle` from `src/components/styles/GlobalStyle`.
     - Renders the `<Terminal />` component once the theme is loaded.

4. **Terminal behaviour and rendering**
   - `src/components/Terminal.tsx`
     - Owns the terminal input element and command history state.
     - Defines the list of supported commands (name, description, and metadata).
     - Handles keyboard events for:
       - Submitting commands.
       - Navigating command history (ArrowUp/ArrowDown).
       - Triggering shortcuts (e.g. autocomplete, clear history).
     - Manages hints / suggestions for autocomplete.
     - Dispatches recognised commands to the `Output` component, passing relevant context.

5. **Command implementations and output**
   - `src/components/Output.tsx`
     - Renders the appropriate command-specific output component or content based on terminal state.
   - `src/components/commands/`
     - Contains React components or modules for each individual command (e.g. `about`, `projects`, `socials`, `themes`).
     - Encapsulates the UI and content for each command.

---

## 3. Supporting modules

- **Terminal styling and layout**
  - `src/components/styles/`
    - Contains styled-components definitions for the terminal wrapper, prompt, input, output, and other UI elements.
    - Includes `GlobalStyle` for global CSS resets and base typography.

- **Theming and persistence**
  - `src/hooks/useTheme.ts`
    - Responsible for selecting, loading, and switching between visual themes.
    - Typically interacts with helper functions (e.g. storage utilities) to persist the chosen theme between sessions.
  - `src/utils/storage.ts`
    - Wraps browser storage access (e.g. `localStorage`), if needed, behind a small utility API.

- **Generic utilities**
  - `src/utils/funcs.ts`
    - Provides shared helper functions used by terminal logic, such as:
      - Autocomplete helpers (e.g. `argTab`).
      - String parsing or formatting related to commands.
  - `src/utils/test-utils.tsx`
    - Provides helpers for rendering components in tests.

- **Testing**
  - `src/test/Terminal.spec.tsx`
    - Main test suite verifying core terminal behaviour.
  - `src/test/setup.ts`
    - Sets up the testing environment (e.g. configuring jsdom, jest-dom, etc.).

---

## 4. Adding or modifying commands

When you need to add a new command or change existing command behaviour, follow these guidelines:

1. **Command registry**
   - Update the list of supported commands in `src/components/Terminal.tsx` (command name, description, and any metadata such as tab spacing).

2. **Implementation**
   - Add or update a component/module under `src/components/commands/` that implements the UI and logic for the command.
   - Keep each command component focused on presenting information and delegating complex logic to utilities if needed.

3. **Output routing**
   - Ensure `Output` knows how to render the new or updated command by mapping the command name to the appropriate component.

4. **Testing**
   - Add or update tests in `src/test/Terminal.spec.tsx` to cover:
     - Typing the command.
     - Expected output rendered in the terminal.
     - Any relevant keyboard interactions.

---

## 5. Theming and appearance

- Themes are driven by:
  - The theme hook: `src/hooks/useTheme.ts`.
  - Theme objects and styled-components definitions under `src/components/styles/`.
- Typical responsibilities include:
  - Persisting the last selected theme between page loads.
  - Updating CSS custom properties or styled-components theme values.
  - Synchronising browser UI colours (e.g. meta `theme-color`) with the active theme.

When adding or modifying themes:

- Reuse existing patterns and theme shape.
- Ensure terminal foreground/background contrast remains accessible.
- Test across multiple themes to confirm that new components respect theme styles.

---

## 6. Assets and PWA-related files

- **Assets and icons** live under `public/`, including:
  - Favicon and touch icons.
  - `site.webmanifest` for PWA configuration.
  - `safari-pinned-tab.svg` and other platform-specific metadata.
  - `sat-naing-terminal-og.png` for social sharing previews.
  - `lighthouse-result.svg` containing a snapshot of Lighthouse metrics.

Vite serves files under `public/` as static assets available from the root path.

---

## 7. Summary for Engineer AI

- Start with `src/App.tsx` and `src/components/Terminal.tsx` to understand core runtime behaviour.
- Use `src/components/commands/` for command-specific UI and content.
- Use `src/hooks/useTheme.ts` and `src/components/styles/` for theming changes.
- Use `src/test/Terminal.spec.tsx` and `docs/evaluation.md` to guide test updates.
- Consult `docs/engineering_principles.md` for detailed coding guidelines before introducing new patterns.

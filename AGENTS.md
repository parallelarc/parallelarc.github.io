# Engineer AI Guide – `terminal-portfolio`

This document is injected into every Engineer AI session. It explains **where to look, how to work, and which docs/commands to use first** when editing this repository.

---

## 0. Project summary

- **What this is**: A terminal-style personal portfolio website implemented as a single-page React + TypeScript app.
- **Primary features**:
  - Command-line interface with history, autocomplete, and keyboard shortcuts.
  - Multiple visual themes and PWA/offline support.
  - Tested with Vitest and React Testing Library.

For an end-user overview and screenshots, see `README.md`.

---

## 1. Information discovery strategy (how to get oriented)

**Recommended lookup order when you start a task:**

1. **Scan key entry files / components**
   - Start with these files to understand the main execution flow:
     - `src/main.tsx` – Vite entry that mounts the React app.
     - `src/App.tsx` – Global theme context, `ThemeProvider`, and root layout.
     - `src/components/Terminal.tsx` – Core terminal logic: command input, history, autocomplete, and dispatching to output.
   - Use code search for relevant keywords (e.g. command names, theme names, component names) before reading random files.

2. **Jump to the module group that matches your task**
   - **Terminal behaviour / commands**:
     - `src/components/Terminal.tsx`
     - `src/components/commands/*` – concrete implementations of each command.
     - `src/utils/funcs.ts` – shared helpers (e.g. autocomplete helpers, parsing).
   - **Theming / styling**:
     - `src/hooks/useTheme.ts`
     - `src/components/styles/*` – styled-components themes and layout styles.
   - **Tests / evaluation**:
     - `src/test/Terminal.spec.tsx`
     - See `docs/evaluation.md` for how tests are organized.

3. **Consult the docs under `docs/*`**
   - `docs/building_the_project.md` – how to install dependencies, run dev, build, and lint.
   - `docs/service_architecture.md` – high-level architecture and where major responsibilities live.
   - `docs/evaluation.md` – how to run and extend tests.
   - `docs/engineering_principles.md` – detailed engineering guidelines.

4. **Only then ask the human for missing context**
   - Focus questions on **product intent, design constraints, or content choices** that are not obvious from the code or docs.
   - Prefer a **small number of high-value, concrete questions** over many open-ended ones.

**Practices to avoid:**

- Do **not** perform large-scale refactors (e.g. changing command routing or theme system) without:
  - A clear reason tied to requirements.
  - An explicit plan.
  - Corresponding test updates.
- Do **not** introduce new state-management libraries or styling frameworks without human approval.
- Do **not** rewrite large portions of user-facing text or branding without confirming requirements.

---

## 2. Tech stack & runtime overview

- **Language**: TypeScript
- **Frontend framework**: React 18
- **Bundler / dev server**: Vite
- **Styling**: `styled-components` (+ project-specific themes under `src/components/styles`)
- **Testing**: Vitest, React Testing Library, `@testing-library/jest-dom`
- **Package manager**: A `pnpm-lock.yaml` is present; examples use `pnpm`. You may adapt commands to `npm`/`yarn` if preferred.
- **Runtime**:
  - Built as a static SPA that runs entirely in the browser.
  - Deployed as static assets (see `README.md` for original Netlify usage and Lighthouse scores).

For concrete commands and workflows, see `docs/building_the_project.md`.

---

## 3. Repository structure (high-level map)

Focus on these paths first; the tree is intentionally condensed and omits assets/boilerplate.

```text
./
├─ index.html                 # Vite HTML entry
├─ package.json               # Scripts and dependencies
├─ pnpm-lock.yaml             # pnpm lockfile
├─ README.md                  # Upstream project readme
├─ AGENTS.md                  # This guide (for Engineer AI)
├─ docs/                      # Project-specific engineering docs
│  ├─ building_the_project.md
│  ├─ evaluation.md
│  ├─ service_architecture.md
│  └─ engineering_principles.md
├─ public/                    # Static assets (icons, manifest, Lighthouse report, og image, ...)
└─ src/
   ├─ main.tsx                # React entry, mounts <App />
   ├─ App.tsx                 # Theme provider, global layout, mounts <Terminal />
   ├─ components/
   │  ├─ Terminal.tsx         # Terminal UI and command dispatcher
   │  ├─ Output.tsx           # Renders command outputs
   │  ├─ TermInfo.tsx         # Prompt / path section of the terminal
   │  ├─ Usage.tsx            # Static usage instructions
   │  ├─ commands/            # One component (or module) per command
   │  └─ styles/              # styled-components theme and layout definitions
   ├─ hooks/
   │  └─ useTheme.ts          # Theme loading and switching logic
   ├─ utils/
   │  ├─ funcs.ts             # Utility functions (e.g. autocomplete helpers)
   │  ├─ storage.ts           # Persistence helpers (e.g. browser storage wrappers)
   │  └─ test-utils.tsx       # Testing helpers
   └─ test/
      ├─ Terminal.spec.tsx    # Main test suite for the terminal behaviour
      └─ setup.ts             # Test environment setup
```

If you need more detail on responsibilities and data flow, see `docs/service_architecture.md`.

---

## 4. Common tasks & entrypoint commands

All example commands below use **pnpm**. If you use `npm`, replace `pnpm` with `npm` and use the equivalent script names.

- **Install dependencies**
  - `pnpm install`

- **Run the development server**
  - `pnpm dev`
  - Vite defaults to `http://localhost:5173` (unless configured otherwise in `vite.config.ts`).

- **Build for production**
  - `pnpm build`

- **Preview the built app locally**
  - `pnpm preview`

- **Run the full test suite (watch mode or single run)**
  - `pnpm test` – run tests in watch mode.
  - `pnpm test:once` – run tests once and exit.

- **Run tests with coverage**
  - `pnpm coverage`

- **Lint and formatting checks**
  - `pnpm lint` – run ESLint on the project.
  - `pnpm format:check` – run Prettier in check mode.
  - `pnpm format` – auto-format with Prettier.

For more detailed build and testing notes, see `docs/building_the_project.md` and `docs/evaluation.md`.

---

## 5. Key conventions & engineering principles (short version)

**General design principles**

- **KISS / YAGNI**
  - Prefer the simplest solution that satisfies the current requirement.
  - Avoid speculative abstractions or new layers unless there is a clear, recurring need.

- **DRY**
  - If you find the same terminal logic (e.g. parsing, command dispatch, theme toggling) repeated, extract a helper or shared component instead of copying code.

- **SOLID-inspired, but pragmatic**
  - Keep components and hooks focused on one responsibility.
  - Avoid "god components" that handle input, rendering, and complex side effects all at once.

**React- and frontend-specific conventions**

- Prefer **functional components with hooks** over classes.
- Keep **Terminal** the single source of truth for command history; avoid duplicating history state in child components.
- When adding new commands, follow patterns from existing entries under `src/components/commands`.

**Logging & error handling (frontend context)**

- Handle obvious error conditions (e.g. invalid input for new commands, failed async operations) gracefully in the UI.
- Avoid noisy `console.log` in committed code; use them temporarily during debugging and remove or gate them before merging.

More detailed principles, examples, and anti-patterns are documented in `docs/engineering_principles.md`.

---

## 6. Documentation entrypoints (`docs/*`)

When working on tasks, prefer to consult these docs (plus code search) **before** asking humans:

- `docs/building_the_project.md`
  - How to set up the environment, run the dev server, build, lint, and format the code.

- `docs/evaluation.md`
  - How tests are structured, which parts of the app are covered, and how to add new tests.

- `docs/service_architecture.md`
  - High-level architecture of the terminal app, including where core behaviors live.

- `docs/engineering_principles.md`
  - Detailed engineering guidelines and examples specific to this repository.

---

## 7. Collaboration workflow with the Engineer AI

The expected workflow for most tasks is a four-phase loop:

1. **Understand**
   - Restate the task goal and success criteria in your own words.
   - Identify which parts of the codebase and docs are likely relevant.

2. **Plan**
   - Before editing code, write 3–7 bullet points describing your approach (files to touch, behaviours to add/change, tests to update).
   - Call out risky areas (e.g. terminal input handling, theme switching) and how you will verify them.

3. **Execute**
   - Implement changes in small, verifiable steps.
   - Keep tests passing; update or add tests when you change behaviours (especially in `Terminal.tsx` and `src/components/commands/*`).

4. **Report**
   - Summarize which files were changed and what behaviours were affected.
   - Provide concrete validation steps (e.g. terminal commands to type, URLs to open, test commands to run).

**Language preferences**

- For communication with human collaborators: default to **Simplified Chinese** unless explicitly asked otherwise.
- For long-lived documentation and comments intended for the Engineer AI (including this file and all `docs/*.md`): always use **English**.

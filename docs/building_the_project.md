# Building and Running the Project

This document explains how to set up, build, and run the `terminal-portfolio` React application, and which commands the Engineer AI should use most often.

The examples below use **pnpm** because a `pnpm-lock.yaml` is present. You can adapt commands to `npm` or `yarn` if needed.

---

## 1. Prerequisites

- **Node.js**
  - Use an active LTS or later (e.g. Node 18+). Vite and modern React features expect a relatively recent Node version.
- **Package manager**
  - `pnpm` installed globally (`npm install -g pnpm`) or via your preferred method.
- **Environment**
  - This is a purely frontend SPA. No backend services are required to run the core app locally.

---

## 2. Install dependencies

From the project root:

- Install dependencies (recommended):
  - `pnpm install`

Notes:

- This will install both runtime dependencies (`react`, `react-dom`, `styled-components`, etc.) and dev dependencies (Vite, Vitest, ESLint, Prettier, Testing Library, etc.).
- If you prefer `npm`, run `npm install`; the scripts in `package.json` are compatible.

---

## 3. Run the development server

- Start the dev server:
  - `pnpm dev`
- Default behaviour:
  - Vite will start a dev server, typically on `http://localhost:5173`.

When making code changes, the dev server supports hot module replacement, so changes will be reflected in the browser immediately.

---

## 4. Build for production

- Create an optimized production build:
  - `pnpm build`

What this does:

- Runs TypeScript compilation.
- Builds the optimized bundle with Vite.
- Outputs static assets to the default Vite output directory (commonly `dist/`).

These artifacts can then be deployed to any static hosting platform.

---

## 5. Preview the production build

After running `pnpm build`, you can locally preview the built site using Vite's preview server:

- `pnpm preview`

This serves the contents of the production build on a local port, enabling you to check for issues that only appear in the optimized build.

---

## 6. Linting and formatting

The project uses ESLint and Prettier, with Husky and lint-staged configured to enforce checks on commits.

- Run ESLint on the project:
  - `pnpm lint`

- Check formatting (no modifications):
  - `pnpm format:check`

- Auto-format code using Prettier:
  - `pnpm format`

Engineer AI expectations:

- Keep the codebase **lint-clean**.
- Run `pnpm lint` and `pnpm format:check` (or rely on CI) before submitting significant changes.
- If adding new files, follow existing ESLint/Prettier conventions.

---

## 7. Running tests

Testing in this repo is based on **Vitest** and **React Testing Library**.

Core commands:

- Run tests in watch mode:
  - `pnpm test`

- Run the suite once and exit:
  - `pnpm test:once`

- Run tests with coverage:
  - `pnpm coverage`

For details on how tests are structured and how to extend them, see `docs/evaluation.md`.

---

## 8. Recommended workflow for Engineer AI

- **For small changes (e.g. copy change, minor styling):**
  - `pnpm dev` – run dev server.
  - Make changes and visually confirm behaviour in the browser.
  - Run `pnpm test:once` if the change touches core logic (e.g. terminal input or commands).

- **For behavioural changes in the terminal or commands:**
  - `pnpm dev` – to iterate interactively.
  - Update or add relevant tests under `src/test/`.
  - Run `pnpm test:once` or `pnpm coverage`.

- **Before merging or submitting a major change:**
  - `pnpm lint`
  - `pnpm format:check`
  - `pnpm test:once`
  - Optionally `pnpm build` to ensure the production build succeeds.

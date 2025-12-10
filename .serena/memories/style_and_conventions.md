# Style and Conventions
- **Language/Framework**: React 18 + TypeScript with functional components and hooks only.
- **Styling**: styled-components; theme objects under `src/components/styles`. Respect existing theme shapes and accessibility contrast.
- **State**: Terminal.tsx is single source of truth for input, history, hints; reuse helper utilities instead of duplicating logic.
- **Principles**: KISS, YAGNI, DRY, pragmatic SOLID. Commands should be small, focused components under `src/components/commands`.
- **Testing**: Vitest + React Testing Library in `src/test`. Prefer user-centric assertions (text, roles) and keep terminal behaviours covered.
- **Code quality**: ESLint + Prettier enforced via Husky/lint-staged. Avoid stray console logs.
- **Docs references**: `docs/engineering_principles.md`, `docs/service_architecture.md` outline architecture and guidelines.
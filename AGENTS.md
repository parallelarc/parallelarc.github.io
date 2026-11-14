# Agent working agreement

This portfolio provides browse and terminal interfaces. Read
[CONTRIBUTING.md](CONTRIBUTING.md) for commands and verification, and
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for code ownership and data flow.

## Product contracts

- Preserve the terminal / Claude Code visual style and the separate browse and
  terminal modes. Only explicit mode controls switch modes; executing commands
  must stay in the terminal.
- Mobile browsing must work through taps without typing. Browse mode has bottom
  navigation and no prompt; terminal mode has a prompt and no bottom navigation.
  Navigation labels display `/xxx` once, without a duplicate caption.
- Preserve shareable hash URLs, browser back/forward, article deep links, and
  restoration of blog category, loaded count, and scroll position.
- Keep interface copy in English. Preserve article titles/bodies in their
  original language. Do not rewrite personal introduction, project details, or
  other authored content unless the task requests it.
- Keep native textarea editing, IME composition, selection, and multiline input.
  The block caret blinks and reverses the covered character's colors; typing or
  moving the caret makes it visible immediately. Hide the custom caret during
  selection and IME composition.
- Preserve visible keyboard focus, accessible names, and usable touch targets
  (at least 44px for primary controls). Verify layout changes in a real browser.
- Keep copying explicit: native text selection/copy and the article's Copy link
  button remain available. Selecting text alone must not write to the clipboard.

## Engineering principles

- **Keep it simple:** use the existing React components, DOM behavior, hooks,
  Zustand stores, and styled-components. Prefer CSS for simple animation.
  Introduce a dependency or abstraction only to solve a demonstrated need in the
  current task. Extend React and native DOM behavior for interface needs.
- **One source of truth:** authored site data lives in `src/content/siteData/`;
  blog configuration lives in `src/config/blog.ts`. Share these with both UI
  modes and AI context instead of copying content or configuration.
- **Keep responsibilities separate:** hash navigation owns pages and mode
  changes; the terminal store owns command execution and AI response state.
  Share content components without coupling command execution to navigation.
- **Keep changes focused:** preserve unrelated user edits. Avoid broad format
  changes, speculative extension points, and unrelated refactors. Use precise
  TypeScript types and short comments explaining non-obvious reasons.
- **Make failures visible:** show actionable loading/error/retry states. Keep
  previously loaded content usable where possible; do not present failures as
  successful empty results.
- **Test observable behavior:** cover meaningful state transitions, error paths,
  and boundary conditions. Avoid tests that merely repeat implementation details.
  Use browser review for spacing, focus, caret rendering, and touch behavior.

## Working process

1. Inspect Git status and the relevant entry points before editing. For changes
   spanning responsibilities, briefly state the intended behavior and affected
   contracts, then proceed within the user's authorized scope.
2. Implement the smallest complete change. Document assumptions and ask only
   when a missing decision blocks progress.
3. Run the relevant checks from [CONTRIBUTING.md](CONTRIBUTING.md). For code
   changes, include `npm run build`, lint/format checks on changed files,
   and relevant tests. For documentation-only changes, check formatting, links,
   and command/path accuracy; a frontend rebuild is unnecessary.
4. Report what changed, what was verified, and what remains unresolved. Separate
   existing failures from regressions. A passing focused suite is not a passing
   full suite; consult the documented baseline rather than hiding old failures.
5. Update documentation when behavior, configuration, or commands change. Keep
   English and Chinese README product/setup facts aligned; detailed engineering
   guidance belongs in its linked document, not duplicated in every entry point.

## Credentials, generated files, and publishing

- Keep internal implementation plans and scratch notes local. Do not include
  `plan/` in commits or documentation indexes.
- Treat frontend environment variables as public. Never put provider secrets in
  `VITE_*` or `OPENAI_*` variables in the frontend environment. Keep provider
  credentials in Worker secrets or ignored `.dev.vars`.
- Use the existing blog snapshot or mocked network responses for routine UI
  checks. Do not send real paid LLM requests merely to test layout or navigation.
- `public/blog.json` is generated from Issues. Regenerate it only when needed
  for the task; do not hand-edit authored articles through the snapshot. Keep
  `dist/`, credentials, local configuration, and temporary artifacts untracked.
- Commit or push when requested for the current task, staging only relevant
  files. Inspect the resulting diff and verify the remote branch after pushing.
  A successful push does not prove successful deployment; check the workflow
  before claiming the site is deployed.
- **Every Git tag operation requires explicit user confirmation in advance.**
  Name the repository, exact tag, and target commit before creating, pushing,
  moving, overwriting, or deleting a tag. Approval to release or push does not
  authorize choosing a version or manipulating tags.

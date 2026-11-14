# Development and maintenance

Use this guide for setup, verification, and deployment. Product constraints and
agent workflow live in [AGENTS.md](AGENTS.md); entry points and data ownership
live in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Setup and local preview

Use Node.js 20.x (at least 20.19, as required by Vite) and npm. The workflows
select the 20.x line:

```bash
npm ci
VITE_BLOG_DATA_SOURCE=static npm run dev
```

This uses `public/blog.json` and does not require credentials. The terminal and
browse UI can be tested without a running LLM service. For an optional local AI
proxy, follow [cloudflare/README.md](cloudflare/README.md).

To build and serve the frontend with the existing snapshot:

```bash
VITE_BLOG_DATA_SOURCE=static npm run build
npm run preview
```

Restart Vite after changing environment configuration.

## Configuration and content

### Frontend configuration

Vite reads local frontend settings from ignored `.env.local` or the shell. All
client-exposed values must be safe to publish. Vite exposes `VITE_*` settings to the browser; this prefix is not a safe
place for a provider secret. Use Worker secrets / `.dev.vars` for those keys.

| Variable                                                                               | Meaning / current default                                                         |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `VITE_BLOG_DATA_SOURCE`                                                                | `static` uses a snapshot; otherwise the GitHub API is used                        |
| `VITE_BLOG_STATIC_URL`                                                                 | Snapshot URL; `/blog.json`                                                        |
| `VITE_GITHUB_OWNER`                                                                    | Issue owner; `parallelarc`                                                        |
| `VITE_GITHUB_BLOG_REPO`                                                                | Issue repository name; `parallelarc.github.io`                                    |
| `VITE_GITHUB_BLOG_LABEL`                                                               | Required blog label; `blog`                                                       |
| `VITE_LLM_PROXY_URL`                                                                   | Public streaming proxy endpoint; configure for AI conversation                    |
| `VITE_LLM_PROVIDER`                                                                    | `openai`, `anthropic`, or `anthropic-compatible`; workflows default to the latter |
| `VITE_LLM_OPENAI_MODEL`, `VITE_LLM_ANTHROPIC_MODEL`, `VITE_LLM_ANTHROPIC_COMPAT_MODEL` | Optional model overrides for the corresponding provider                           |

See `src/config/blog.ts`, `src/utils/llm.ts`, and `.env.local.example` for the
implementation. Public GitHub Issues can be read without a browser token;
avoid configuring `VITE_GITHUB_TOKEN` for the public site.

### Editing content

- Personal introduction, projects, contact, and welcome data:
  `src/content/siteData/`. Change this data only when the task calls for content
  edits. The UI and AI context both consume it.
- Articles: GitHub Issues with the `blog` label. Preserve titles and bodies in
  their authored language.
- Snapshot: generated `public/blog.json`. Review its diff after regeneration;
  do not use it as a second place to edit articles.

### Regenerating the blog snapshot

The generator requires `BLOG_GITHUB_TOKEN` or `GITHUB_TOKEN` in its process
environment. It is a Node script and does not load `.env.local` itself. With a
token already configured in the shell or CI:

```bash
BLOG_GITHUB_REPO=parallelarc/parallelarc.github.io \
BLOG_GITHUB_LABEL=blog \
npm run blog:generate
```

`npm run build` compiles the frontend using the existing snapshot.
Run `npm run blog:generate` explicitly to refresh content. Each deployment
workflow generates once before building.

`public/llms.txt` is a short, maintained link list pointing to GitHub content and
[the reading guide](docs/READING_GUIDE.md). The header's For agents link and the
no-JavaScript fallback also point to that guide. Update these links together if
the repository or guide moves. No additional article representations are generated.

## Verification

Choose checks that cover the changed behavior. Current scripts are defined in
`package.json`. Run checks explicitly before committing; there is no commit hook.

| Change                        | Checks                                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Documentation                 | Prettier on changed Markdown, local link/path checks, command accuracy                                           |
| Frontend code                 | `npm run build`, ESLint and Prettier on changed files, relevant Vitest tests                                     |
| Navigation, input, or layout  | Frontend checks plus the browser review below                                                                    |
| Shared code or broad refactor | Full `npm run test:once` and `npm run lint`, with baseline failures reported                                     |
| Worker / deployment           | Relevant configuration or request checks plus workflow evidence; frontend build alone does not verify the Worker |

Current regression suites:

```bash
npx vitest run \
  src/test/Terminal.spec.tsx \
  src/hooks/useBrowseNavigation.spec.ts \
  src/components/TerminalComposer.spec.tsx \
  src/commands/ai/index.spec.tsx \
  src/utils/content/contextBuilder.spec.ts \
  src/components/ProjectAlbum.spec.tsx \
  src/stores/blogStore.spec.ts \
  src/utils/llm.spec.ts
```

Examples of file-scoped checks (replace paths with the files you changed):

```bash
npx eslint src/components/TerminalComposer.tsx
npx prettier --check AGENTS.md CONTRIBUTING.md
```

`npm test` starts watch mode; `npm run test:once` is the full one-shot run.
Avoid whole-repository formatting when unrelated files would be rewritten.
Routine UI tests should mock AI/network responses rather than invoke paid models.

Keep `@testing-library/dom` compatible with `@testing-library/react` so React
Testing Library and user-event share one DOM configuration and its `act`
wrappers. Check `npm ls @testing-library/dom` when updating test dependencies.

### Browser review

Review at a compact width such as 390px and a desktop width such as 1440px;
include 320px when changing navigation or input layout. For mobile keyboard or
IME changes, also use an actual device/input method where available and state
the scope of any simulated checks.

| Area            | Expected behavior                                                                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial mode    | No hash: compact screens browse, desktop uses terminal; `#/` and `#/terminal` override that default                                                         |
| Mode controls   | Only header controls switch modes; terminal commands and welcome shortcuts stay in terminal mode                                                            |
| Mobile controls | Browse has `/xxx` navigation and no prompt; terminal has a prompt and no browse navigation; no forced keyboard when opening the touch command menu          |
| Blog            | Category, load more, onsite reading, direct article link, refresh, back/forward, and return-to-list position work                                           |
| Editing         | Selection, paste, multiline input, history recall followed by editing, completion, and IME confirmation work                                                |
| Caret           | Blinks with the covered character reversed; immediately visible after typing/moving; no extra bar during the off phase; hidden during selection/composition |
| Layout          | No horizontal page overflow, clipped controls, hidden focus, or unusable touch targets                                                                      |
| Project albums  | Four-photo preview, full-image viewer, touch/keyboard navigation, modal focus containment, and focus/scroll restoration on close                            |
| Failures        | Loading, empty, not-found, and retry states remain usable; failed refresh preserves loaded content                                                          |

### Verification baseline

Checked on 2026-11-14. Recheck before treating these results as current status.

- The full `npm run test:once` run passes: 10 files, 69 tests. Terminal integration
  covers current commands, AI routing and failures, usage, clearing history,
  completion, draft restoration, touch commands, and blog filtering/retry/exit.
  Album tests cover preview selection, wheel navigation, close/cancel, swipes, image
  retry, empty/single-photo data, and cleanup on unmount.
- `npm run test:content` covers snapshot pagination with mocked
  GitHub responses; no live GitHub or provider requests are needed.
- `npm run lint` has no errors or warnings.
- Workflow changes should validate YAML and shell syntax and exercise changed
  snapshots, unchanged issue updates, manual dispatch, rejected pushes, and
  rejected deploy requests. Use an isolated Git remote and mocked HTTP endpoint
  for local checks; confirm a live Actions run after an authorized push.

## Deployment and delivery

| Workflow / command                        | Trigger and responsibility                                                                                            |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/deploy.yml`            | Push to `main` or manual dispatch; regenerate blog data, build, and deploy the frontend to GitHub Pages               |
| `.github/workflows/deploy-cloudflare.yml` | Manual dispatch; deploy the Worker, then build and deploy Cloudflare Pages                                            |
| `.github/workflows/update-blog.yml`       | Issue events / manual dispatch; regenerate the snapshot, commit and push changes, then explicitly dispatch deployment |
| `npm run cf:worker:deploy`                | Deploy the Worker independently; does not deploy the frontend                                                         |

Blog updates run serially against `main`. A changed snapshot must be pushed
successfully before deployment is dispatched; push and HTTP errors fail the
workflow. An unchanged issue update skips deployment, while a manual run can
request deployment without a content change.

Explicit dispatch is required because pushes made with `GITHUB_TOKEN` do not
start push-triggered workflows; `workflow_dispatch` is a supported exception.
See [GitHub's workflow triggering rules](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).

The deployment workflows currently build and deploy; they do not run ESLint or
Vitest. Use the checks above before delivery. GitHub Pages can serve the frontend
while a separately deployed Worker handles AI conversation.

Frontend build settings for GitHub Actions are repository **Variables** with
`VITE_*` names. Set `VITE_LLM_PROXY_URL` to the actual public Worker endpoint.
The browser uses only this proxy, including during local development.
Provider adapters and credentials belong to the Worker. Cloudflare deployment additionally
uses `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` **Secrets** and optional
`CLOUDFLARE_PAGES_PROJECT` **Variable**. Provider keys belong in Worker secrets.

When a commit/push is requested, review the staged diff and include only the
task's files. After pushing, verify the remote commit. To report a successful
deployment, verify the workflow's commit SHA and conclusion, then smoke-test the
live site. A cached page or a successful frontend build does not prove the AI
provider is healthy. Follow the tag confirmation rule in [AGENTS.md](AGENTS.md).

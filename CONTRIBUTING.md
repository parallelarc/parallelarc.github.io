# Development and maintenance

Use this guide for setup, verification, and deployment. Product constraints and
agent workflow live in [AGENTS.md](AGENTS.md); entry points and data ownership
live in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Setup and local preview

Use Node.js 20.x (at least 20.19, as required by Vite) and npm. The workflows
select the 20.x line:

```bash
npm ci
npm run blog:generate
VITE_BLOG_DATA_SOURCE=static npm run dev
```

Generate blog assets once with a build-time GitHub token in `GITHUB_TOKEN` or
`BLOG_GITHUB_TOKEN`. The generated `public/blog/` directory stays local. Both browse and terminal interfaces run entirely in the browser.

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
place for a credential. Supply GitHub credentials only to the build process.

| Variable                 | Meaning / current default                                             |
| ------------------------ | --------------------------------------------------------------------- |
| `VITE_BLOG_DATA_SOURCE`  | `static` uses generated blog assets; otherwise the GitHub API is used |
| `VITE_BLOG_STATIC_URL`   | Index URL; `/blog/index.json`                                         |
| `VITE_GITHUB_OWNER`      | Issue owner; `parallelarc`                                            |
| `VITE_GITHUB_BLOG_REPO`  | Issue repository name; `parallelarc.github.io`                        |
| `VITE_GITHUB_BLOG_LABEL` | Required blog label; `blog`                                           |

See `src/config/blog.ts` and `.env.local.example` for the
implementation. Public GitHub Issues can be read without a browser token;
avoid configuring `VITE_GITHUB_TOKEN` for the public site.

### Editing content

- Personal introduction, projects, contact, and welcome data:
  `src/content/siteData/`. Change this data only when the task calls for content
  edits. Browse and terminal interfaces both consume it.
- Articles: GitHub Issues with the `blog` label. Preserve titles and bodies in
  their authored language.
- Generated assets: `public/blog/index.json` lists metadata, content-addressed
  `posts/*.json` files hold individual bodies, and `search-*.json` supports full-text
  search. These files are ignored by Git. Edit the original Issues.

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
The reader fetches one body when opened; the terminal loads search data on its
first query. Body and search filenames include content hashes for cache refresh.
Run `npm run blog:generate` explicitly to refresh content. Each deployment
workflow generates once before building.

`public/llms.txt` is a short, maintained link list pointing to GitHub content and
[the reading guide](docs/READING_GUIDE.md). The header's For agents link and the
no-JavaScript fallback also point to that guide. Update these links together if
the repository or guide moves. No additional article representations are generated.

## Verification

Choose checks that cover the changed behavior. Current scripts are defined in
`package.json`. Run checks explicitly before committing; there is no commit hook.

| Change                        | Checks                                                                       |
| ----------------------------- | ---------------------------------------------------------------------------- |
| Documentation                 | Prettier on changed Markdown, local link/path checks, command accuracy       |
| Frontend code                 | `npm run build`, ESLint and Prettier on changed files, relevant Vitest tests |
| Navigation, input, or layout  | Frontend checks plus the browser review below                                |
| Shared code or broad refactor | Full `npm run test:once` and `npm run lint`, with baseline failures reported |
| Deployment                    | Validate workflow configuration and confirm the authorized workflow run.     |

Current regression suites:

```bash
npx vitest run \
  src/test/Terminal.spec.tsx \
  src/hooks/useBrowseNavigation.spec.ts \
  src/components/TerminalComposer.spec.tsx \
  src/components/ProjectAlbum.spec.tsx \
  src/stores/blogStore.spec.ts
```

Examples of file-scoped checks (replace paths with the files you changed):

```bash
npx eslint src/components/TerminalComposer.tsx
npx prettier --check AGENTS.md CONTRIBUTING.md
```

`npm test` starts watch mode; `npm run test:once` is the full one-shot run.
Avoid whole-repository formatting when unrelated files would be rewritten.
Routine UI tests should use mocked network responses.

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
  covers commands, unknown input, usage, clearing history,
  completion, draft restoration, touch commands, and blog filtering/retry/exit.
  Album tests cover preview selection, wheel navigation, close/cancel, swipes, image
  retry, empty/single-photo data, and cleanup on unmount.
- `npm run test:content` covers snapshot pagination with mocked
  GitHub responses.
- `npm run lint` has no errors or warnings.
- Workflow changes should validate YAML and shell syntax and exercise changed
  generated assets, manual dispatch, and
  rejected deploy requests. Use an isolated Git remote and mocked HTTP endpoint
  for local checks; confirm a live Actions run after an authorized push.

## Deployment and delivery

| Workflow / command                  | Trigger and responsibility                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `.github/workflows/deploy.yml`      | Push to `main` or manual dispatch; regenerate blog data, build, and deploy the frontend to GitHub Pages |
| `.github/workflows/update-blog.yml` | Issue events / manual dispatch; request a deployment that regenerates blog assets                       |

Blog updates dispatch the deployment workflow. The deploy job checks out the
latest source, regenerates the index, article bodies, and search data, and
publishes them as build artifacts. A failed generation or dispatch fails the run.

The GitHub Pages workflow builds and deploys the static site. Run tests and lint
locally before delivery. Frontend settings use repository Variables with safe
`VITE_*` values. GitHub build credentials come from the workflow token.

When a commit/push is requested, review the staged diff and include only the
task's files. After pushing, verify the remote commit. To report a successful
deployment, verify the workflow's commit SHA and conclusion, then smoke-test the
live site. A successful local build does not prove that the live deployment succeeded. Follow the tag confirmation rule in [AGENTS.md](AGENTS.md).

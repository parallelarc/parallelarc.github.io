# Foxiv's Terminal Portfolio

A personal website with a terminal interface and a click-first browsing mode.
Built with React, TypeScript, Vite, styled-components, and Zustand.

[Live site](https://parallelarc.github.io) · [简体中文](README.zh-CN.md) ·
[Development guide](CONTRIBUTING.md) · [Agent instructions](AGENTS.md)

## Using the site

- **Browse:** open the blog, filter categories, load more posts, and read articles
  without typing. Returning to the list retains its category and position.
- **Terminal:** use commands, history, and completion.
  The native text input supports selection, multiline editing, and IME input;
  its block cursor blinks and reverses the colors of the character it covers.
- **Switch modes explicitly:** use `>_ terminal` or `← browse` in the header.
  Commands inside the terminal stay in the terminal.
- **Project photos:** preview four images, then open the complete album. Swipe,
  use arrow keys, or tap the controls to browse; close to return to your place.
  Hover over the cover or viewer to switch photos with horizontal trackpad
  gestures or a mouse drag. Vertical scrolling keeps working on the page.

Without a hash URL, compact screens start in browse mode and desktop screens
start in terminal mode. Explicit links preserve the chosen mode:

| URL                      | Destination                       |
| ------------------------ | --------------------------------- |
| `#/`                     | Browse home, including on desktop |
| `#/blogs`                | Blog list                         |
| `#/blogs/<issue-number>` | Article reader                    |
| `#/projects`             | Projects                          |
| `#/about`                | About and contact                 |
| `#/contact`              | Contact                           |
| `#/terminal`             | Terminal on any screen size       |

Interface copy is English. Article titles and bodies retain their original
language.

## Local development

Use Node.js 20.19 or later in the 20.x line, matching the deployment workflows,
and npm with the committed lockfile. Generate local blog assets with a build-time GitHub token in `GITHUB_TOKEN` or
`BLOG_GITHUB_TOKEN`:

```bash
npm ci
npm run blog:generate
VITE_BLOG_DATA_SOURCE=static npm run dev
```

To build and preview using those generated assets:

```bash
VITE_BLOG_DATA_SOURCE=static npm run build
npm run preview
```

`npm run build` uses the existing snapshot. Run `npm run blog:generate`
explicitly to generate the metadata index, individual article bodies, and on-demand
search data under `public/blog/`. Generated files are excluded from Git. See [configuration and verification](CONTRIBUTING.md).

## Reading with agents

The header's **For agents** link opens the [GitHub reading guide](docs/READING_GUIDE.md).
A short `/llms.txt` points to the guide, blog Issues, and repository. GitHub holds
the original articles; the site does not generate separate article pages or
Markdown copies. Existing hash links and both interactive modes remain available.

## Terminal commands

| Command     | Description                                        |
| ----------- | -------------------------------------------------- |
| `/about`    | Personal introduction                              |
| `/projects` | Projects                                           |
| `/contact`  | Contact information                                |
| `/blogs`    | Keyboard-accessible blog panel inside the terminal |
| `/welcome`  | Welcome message and clickable commands             |
| `/clear`    | Clear the terminal                                 |

Recognized command names also work without `/`. Unregistered input displays an
unknown-command message. `/` opens the command menu;
`?` in an empty prompt opens shortcut help. `Enter` submits and `Shift+Enter`
inserts a newline.

## Documentation

| Document                             | Purpose                                                         |
| ------------------------------------ | --------------------------------------------------------------- |
| [AGENTS.md](AGENTS.md)               | Engineering principles, product constraints, and agent workflow |
| [CONTRIBUTING.md](CONTRIBUTING.md)   | Setup, configuration, checks, UI review, and deployment         |
| [Architecture](docs/ARCHITECTURE.md) | Entry points, state ownership, and content/data flow            |

The site deploys to [GitHub Pages](.github/workflows/deploy.yml) on pushes to
`main` or manual dispatch. Issue changes request a deployment, which regenerates
blog assets during the build.

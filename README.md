<div align="center">

![Terminal Portfolio](public/demo.jpg)

# Terminal Portfolio

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)

**A terminal-style portfolio website with interactive command-line interface**

[**Live Demo**](https://parallelarc.github.io) &nbsp;•&nbsp; [Features](#-features) &nbsp;•&nbsp; [Quick Start](#-quick-start)

</div>

---

## &nbsp; Overview

A modern portfolio website built as an interactive terminal experience. Features a command-line interface with plugin support, theme switching, and an extensible command system — perfect for developers who want to showcase their work in a unique way.

## &nbsp; Features

| Feature | Description |
|---------|-------------|
| **Command-line Interface** | Interactive terminal with command history, autocomplete, and keyboard shortcuts |
| **Plugin System** | Extensible architecture for adding custom commands and features |
| **Command Registry** | Centralized command management with aliases and categories |
| **Event System** | Pub-sub pattern for plugin communication |
| **State Management** | Zustand stores for terminal and theme state |
| **PWA Support** | Installable as a Progressive Web App |

## &nbsp; Commands

| Command | Description |
|---------|-------------|
| `about` | Display information about the site owner |
| `blog` | View blog posts (fetches from GitHub Issues) |
| `contact` | Show contact information and social links |
| `education` | Display educational background |
| `projects` | Showcase projects portfolio |
| `welcome` | Display welcome message |
| `clear` | Clear terminal screen |

## &nbsp; Tech Stack

- **React 18** — UI library
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Styled Components** — CSS-in-JS styling
- **Zustand** — State management
- **Vitest** — Testing framework
- **React Icons** — Icon library

## &nbsp; Quick Start

```bash
# Clone the repository
git clone https://github.com/parallelarc/parallelarc.github.io.git
cd parallelarc.github.io

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## &nbsp; Development

```bash
# Run tests
npm test

# Run tests with coverage
npm run coverage

# Lint code
npm run lint

# Format code
npm run format
```

## &nbsp; Architecture

### Command System

Commands are registered through the `CommandRegistry` singleton:

```ts
import { commandRegistry } from './core/CommandRegistry';

commandRegistry.register({
  id: 'mycmd',
  name: 'mycmd',
  description: 'My command',
  component: () => import('./mycmd'),
  aliases: ['mc'],
  category: 'info',
});
```

### Plugin System

Plugins receive a `PluginContext` with access to command registration, state, and events:

```ts
import type { Plugin } from './types/plugin';

const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  init: (context) => {
    context.registerCommand({ /* ... */ });
    context.on('my-event', (data) => { /* ... */ });
  },
  destroy: () => { /* cleanup */ },
};

pluginManager.load(myPlugin);
```

### Project Structure

```
src/
├── App.tsx                 # Theme provider, global layout
├── components/
│   ├── Terminal.tsx        # Core terminal component
│   ├── Output.tsx          # Command output renderer
│   ├── TermInfo.tsx        # Prompt/path display
│   └── styles/             # Styled components themes
├── commands/               # Command implementations
├── core/                   # CommandRegistry, PluginManager, EventBus
├── hooks/                  # Custom React hooks
├── stores/                 # Zustand stores
├── types/                  # TypeScript definitions
└── utils/                  # Helper functions
```

## &nbsp; Deployment

### Cloudflare (Recommended)

This setup keeps all LLM keys on the server side and never exposes keys in frontend assets.

1. Install Wrangler and log in:

```bash
npx wrangler login
```

2. Configure Worker secrets (one-time):

```bash
npx wrangler secret put ANTHROPIC_COMPAT_API_KEY
```

3. Configure Worker vars (`wrangler.toml` or dashboard):
- `DEFAULT_PROVIDER=anthropic-compatible`
- `ANTHROPIC_COMPAT_BASE_URL=https://open.bigmodel.cn/api/anthropic` (or your compatible gateway base URL)
- `ANTHROPIC_COMPAT_AUTH_MODE=x-api-key` (or `bearer`)
- `ANTHROPIC_COMPAT_MODEL=claude-3-5-sonnet-latest`

4. Deploy the proxy Worker:

```bash
npm run cf:worker:deploy
```

5. Set frontend env:
- `VITE_LLM_PROXY_URL` = your Worker URL (e.g. `https://xxx.workers.dev`)
- `VITE_LLM_PROVIDER=anthropic-compatible`
- Optional: `VITE_LLM_ANTHROPIC_COMPAT_MODEL`

6. Deploy site to Cloudflare Pages:
- Use GitHub workflow: `.github/workflows/deploy-cloudflare.yml`
- Required GitHub Secrets:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`
- Optional GitHub Variable:
  - `CLOUDFLARE_PAGES_PROJECT` (defaults to `parallelarc-portfolio`)

More proxy details: `cloudflare/README.md`

### GitHub Pages (Static-only)

GitHub Pages deployment still works for static content, but real-time AI chat should use a backend proxy (Cloudflare Worker) to avoid exposing provider keys.

### Blog Configuration

Blog posts are loaded from `public/blog.json`. To customize:

1. Create issues with the `blog` label in your repository
2. Run `npm run blog:generate` to update `blog.json`
3. Commit and push the changes

For local development, you can also manually edit `public/blog.json` or use the API mode by setting `VITE_BLOG_DATA_SOURCE=api` in `.env`.

---

## &nbsp; License

[MIT](LICENSE) © [parallelarc](https://github.com/parallelarc)

# Terminal Portfolio

A terminal-style portfolio website built with React, TypeScript, and Vite. Features a command-line interface with plugin support, theme switching, and extensible command system.

## Features

- **Command-line Interface** - Interactive terminal with command history, autocomplete, and keyboard shortcuts
- **Plugin System** - Extensible architecture for adding custom commands and features
- **Theme Support** - 6 built-in themes (dark, light, blue-matrix, espresso, green-goblin, ubuntu)
- **Command Registry** - Centralized command management with aliases and categories
- **Event System** - Pub-sub pattern for plugin communication
- **State Management** - Zustand stores for terminal and theme state
- **PWA Support** - Progressive Web App capabilities

## Commands

| Command | Description |
|---------|-------------|
| `about` | Display information about the site owner |
| `blog` | View blog posts (fetches from GitHub Issues) |
| `contact` | Show contact information and social links |
| `education` | Display educational background |
| `projects` | Showcase projects portfolio |
| `welcome` | Display welcome message |
| `clear` | Clear terminal screen |

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Styled Components** - CSS-in-JS styling
- **Zustand** - State management
- **Vitest** - Testing framework
- **React Icons** - Icon library

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:once

# Run tests with coverage
npm run coverage

# Lint code
npm run lint

# Format code
npm run format
```

## Architecture

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

### Adding a New Command

1. Create `src/commands/{name}/index.tsx` with a default export component
2. Create `src/commands/{name}/config.ts` with command configuration
3. Register in `src/commands/index.ts`

```ts
// src/commands/mycmd/config.ts
export const config = {
  id: 'mycmd',
  name: 'mycmd',
  description: 'My command description',
  component: () => import('./index'),
};
```

## Project Structure

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

## Configuration

Terminal behavior is configured in `src/config/terminal.ts`:

```ts
export const terminalConfig = {
  autocompleteTrigger: '/',
  crashCommand: 'crash',
  historySize: 50,
};
```

## License

MIT

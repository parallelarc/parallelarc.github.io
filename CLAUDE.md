# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run build           # Build for production (tsc && vite build)
npm run preview         # Preview production build

# Testing
npm test                # Run tests in watch mode
npm run test:once       # Run tests once
npm run coverage        # Run tests with coverage

# Linting / Formatting
npm run lint            # ESLint check
npm run format:check    # Prettier check
npm run format          # Prettier write
```

## Architecture

### Command System
- **CommandRegistry** (`src/core/CommandRegistry.ts`): Singleton managing all command registration, lookup, aliases, and autocomplete
- Commands are registered via `commandRegistry.register({ id, name, description, component, aliases?, category?, hidden? })`
- Each command lives in `src/commands/{name}/index.tsx` with a lazy-loaded component

### Plugin System
- **PluginManager** (`src/core/PluginManager.ts`): Manages plugin lifecycle (load/unload/reload)
- Plugins receive a `PluginContext` with:
  - `registerCommand` / `unregisterCommand`
  - `getTerminalState` / `getConfig`
  - Event system: `on` / `off` / `emit`
  - Inter-plugin messaging: `sendMessage` / `onMessage`
- Events use namespace prefix (`pluginName:event`) to avoid conflicts

### Event System
- **EventBus** (`src/core/EventBus.ts`): Simple publish-subscribe pattern for plugin communication
- Built-in events: `plugin:loaded`, `plugin:unloaded`
- Returns unsubscribe function from `on()`

### State Management
- **Zustand** stores in `src/stores/`:
  - `terminalStore.ts`: Input, history, cursor position, crash state, autocomplete
- Uses `subscribeWithSelector` middleware for granular subscriptions

### Theme System
- Theme definitions in `src/components/styles/themes.ts` (6 themes: dark, light, blue-matrix, espresso, green-goblin, ubuntu)
- Theme switching persists to localStorage (`tsn-theme` key)

### Custom Hooks
- `useAutocomplete.ts` - Command autocomplete logic
- `useClipboardHandler.ts` - Copy to clipboard with toast
- `useCommandSubmission.ts` - Command parsing and execution
- `useGlobalFocus.ts` - Global keyboard focus management
- `useKeyboardShortcuts.ts` - History navigation, tab completion

### Configuration
- Centralized in `src/config/`:
  - `terminal.ts`: Terminal behavior (autocomplete trigger, crash command, history size)
  - `index.ts`: Config exports

### Component Structure
```
src/
├── App.tsx                 # ThemeProvider, global layout
├── components/
│   ├── Terminal.tsx        # Core: input, history, autocomplete, dispatch
│   ├── Output.tsx          # Renders command outputs
│   ├── TermInfo.tsx        # Prompt/path display
│   ├── CommandHistoryItem.tsx
│   └── styles/             # styled-components themes
├── commands/               # One folder per command
├── core/                   # CommandRegistry, PluginManager, EventBus
├── hooks/                  # Custom React hooks
├── stores/                 # Zustand stores
├── types/                  # TypeScript definitions
└── utils/                  # Helpers
```

## Key Patterns

### Adding a New Command
1. Create `src/commands/{name}/index.tsx` with a default export component
2. Import and register in `src/commands/index.ts`:
   ```ts
   commandRegistry.register({
     id: 'mycmd',
     name: 'mycmd',
     description: 'My command',
     component: () => import('./mycmd'),
   })
   ```

### Command Dispatch Flow
`Terminal.tsx` → parse input → `commandRegistry.get()` → lazy load component → render in `Output.tsx`

### Autocomplete
- Triggered by `/` character (configurable in `terminal.ts`)
- `CommandRegistry.findMatches(partial)` returns matching command names

### Creating a Plugin
```ts
import type { Plugin, PluginContext } from './types/plugin'

const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  init: (context: PluginContext) => {
    // Use context.registerCommand(), context.on(), etc.
  },
  destroy: () => {
    // Cleanup
  },
}

pluginManager.load(myPlugin)
```

## Conventions

- **KISS/YAGNI**: Prefer simple solutions, avoid speculative abstractions
- **DRY**: Extract helpers for repeated terminal logic (parsing, dispatch, themes)
- Keep `Terminal` as single source of truth for command history
- Use functional components with hooks only
- Avoid noisy `console.log` in committed code

## Documentation

See `AGENTS.md` for detailed engineer AI guide.

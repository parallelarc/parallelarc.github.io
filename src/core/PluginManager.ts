import { Plugin, PluginContext, PluginLoadResult, PluginInfo, EventHandler, TerminalState } from '../types/plugin';
import { Command } from '../types/command';
import { commandRegistry } from './CommandRegistry';
import { eventBus } from './EventBus';
import { useTerminalStore } from '../stores/terminalStore';
import { terminalConfig } from '../config/terminal';

type MessageHandler = (from: string, message: unknown) => void;

/**
 * PluginManager
 * Manages plugin lifecycle: loading, unloading, and initialization
 * Enhanced with event system and plugin messaging
 */
class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private contexts: Map<string, PluginContext> = new Map();
  private messageHandlers: Map<string, MessageHandler> = new Map();

  /**
   * Load and initialize a plugin
   */
  load(plugin: Plugin): PluginLoadResult {
    try {
      // Validate plugin
      if (!plugin.name || !plugin.version) {
        return {
          success: false,
          error: 'Plugin must have name and version',
        };
      }

      // Check if plugin already loaded
      if (this.plugins.has(plugin.name)) {
        return {
          success: false,
          error: `Plugin "${plugin.name}" is already loaded`,
        };
      }

      // Create enhanced plugin context
      const context: PluginContext = {
        registerCommand: (command: Command) => {
          commandRegistry.register(command);
        },
        unregisterCommand: (name: string) => {
          commandRegistry.unregister(name);
        },
        getTerminalState: (): TerminalState => {
          const state = useTerminalStore.getState();
          return {
            history: state.history,
            input: state.input,
            cursorPosition: state.cursorPosition,
          };
        },
        getConfig: () => terminalConfig,
        on: (event: string, handler: EventHandler) => {
          // Namespace events by plugin name to avoid conflicts
          eventBus.on(`${plugin.name}:${event}`, handler);
        },
        off: (event: string, handler: EventHandler) => {
          eventBus.off(`${plugin.name}:${event}`, handler);
        },
        emit: (event: string, ...args: unknown[]) => {
          // Emit with plugin namespace
          eventBus.emit(`${plugin.name}:${event}`, ...args);
          // Also emit to global event bus for cross-plugin communication
          eventBus.emit(event, ...args);
        },
        sendMessage: (targetPlugin: string, message: unknown) => {
          const handler = this.messageHandlers.get(targetPlugin);
          if (handler) {
            handler(plugin.name, message);
          }
        },
        onMessage: (handler: MessageHandler) => {
          this.messageHandlers.set(plugin.name, handler);
        },
      };

      // Register plugin commands
      if (plugin.commands) {
        for (const command of plugin.commands) {
          commandRegistry.register(command);
        }
      }

      // Initialize plugin
      if (plugin.init) {
        plugin.init(context);
      }

      // Store plugin and context
      this.plugins.set(plugin.name, plugin);
      this.contexts.set(plugin.name, context);

      // Emit plugin loaded event
      eventBus.emit('plugin:loaded', plugin.name);

      return { success: true, plugin };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Unload a plugin
   */
  unload(name: string): boolean {
    const plugin = this.plugins.get(name);
    if (!plugin) return false;

    // Emit plugin unloading event
    eventBus.emit(`plugin:${name}:unload`);

    // Call cleanup function
    if (plugin.destroy) {
      try {
        plugin.destroy();
      } catch (error) {
        console.error(`Error destroying plugin "${name}":`, error);
      }
    }

    // Unregister plugin commands
    if (plugin.commands) {
      for (const command of plugin.commands) {
        commandRegistry.unregister(command.name);
      }
    }

    // Clean up event listeners for this plugin
    const eventNames = eventBus.getEventNames();
    for (const eventName of eventNames) {
      if (eventName.startsWith(`${name}:`)) {
        // Clear all listeners for this plugin's namespaced events
        eventBus.emit(eventName); // This will trigger remaining handlers
      }
    }

    // Remove message handler
    this.messageHandlers.delete(name);

    // Remove from storage
    this.plugins.delete(name);
    this.contexts.delete(name);

    // Emit plugin unloaded event
    eventBus.emit('plugin:unloaded', name);

    return true;
  }

  /**
   * Get a loaded plugin by name
   */
  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Get all loaded plugins
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin info for all loaded plugins
   */
  getPluginInfo(): PluginInfo[] {
    return Array.from(this.plugins.values()).map((plugin) => ({
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      author: plugin.author,
      loaded: true,
    }));
  }

  /**
   * Check if a plugin is loaded
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Reload a plugin
   */
  reload(name: string): PluginLoadResult {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      return {
        success: false,
        error: `Plugin "${name}" is not loaded`,
      };
    }

    this.unload(name);
    return this.load(plugin);
  }

  /**
   * Get the count of loaded plugins
   */
  get size(): number {
    return this.plugins.size;
  }

  /**
   * Clear all plugins
   */
  clear(): void {
    for (const name of this.plugins.keys()) {
      this.unload(name);
    }
  }
}

// Singleton instance
export const pluginManager = new PluginManager();

// Export class for testing
export { PluginManager };

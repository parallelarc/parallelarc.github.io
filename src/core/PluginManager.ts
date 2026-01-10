import { Plugin, PluginContext, PluginLoadResult, PluginInfo } from '../types/plugin';
import { Command } from '../types/command';
import { commandRegistry } from './CommandRegistry';
import { useTerminalStore } from '../stores/terminalStore';

/**
 * PluginManager
 * Manages plugin lifecycle: loading, unloading, and initialization
 */
class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private contexts: Map<string, PluginContext> = new Map();

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

      // Create plugin context
      const context: PluginContext = {
        registerCommand: (command: Command) => {
          commandRegistry.register(command);
        },
        unregisterCommand: (name: string) => {
          commandRegistry.unregister(name);
        },
        getTerminalState: () => {
          const state = useTerminalStore.getState();
          return {
            history: state.history,
            isCrashed: state.isCrashed,
          };
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

    // Remove from storage
    this.plugins.delete(name);
    this.contexts.delete(name);

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

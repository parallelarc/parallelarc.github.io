import { Command } from '../types/command';

export type InputMode = 'command' | 'ai';

export interface ResolvedInput {
  raw: string;
  mode: InputMode;
  isExplicitCommand: boolean;
  commandName: string;
  args: string[];
  commandExists: boolean;
}

/**
 * CommandRegistry - Central registry for all terminal commands
 *
 * Provides command registration, lookup, and autocomplete functionality.
 */
class CommandRegistry {
  private commands: Map<string, Command> = new Map();
  private aliases: Map<string, string> = new Map(); // alias -> command name

  /**
   * Register a new command
   */
  register(command: Command): void {
    // Validate command
    if (!command.id || !command.name) {
      throw new Error('Command must have id and name');
    }

    // Check for duplicate command name
    if (this.commands.has(command.name)) {
      console.warn(`Command "${command.name}" is already registered. Overwriting.`);
    }

    // Register main command
    this.commands.set(command.name, command);

    // Register aliases
    if (command.aliases) {
      for (const alias of command.aliases) {
        if (this.commands.has(alias)) {
          console.warn(`Alias "${alias}" conflicts with existing command.`);
        } else {
          this.aliases.set(alias, command.name);
        }
      }
    }
  }

  /**
   * Unregister a command by name
   */
  unregister(name: string): boolean {
    const command = this.commands.get(name);
    if (!command) return false;

    // Remove main command
    this.commands.delete(name);

    // Remove aliases
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.delete(alias);
      }
    }

    return true;
  }

  /**
   * Get a command by name or alias
   */
  get(name: string): Command | undefined {
    // Direct lookup
    if (this.commands.has(name)) {
      return this.commands.get(name);
    }

    // Alias lookup
    const commandName = this.aliases.get(name);
    if (commandName) {
      return this.commands.get(commandName);
    }

    return undefined;
  }

  /**
   * Get all registered commands
   */
  getAll(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get commands by category
   */
  getByCategory(category: string): Command[] {
    return this.getAll().filter((cmd) => cmd.category === category);
  }

  /**
   * Get visible (non-hidden) commands
   */
  getVisible(): Command[] {
    return this.getAll().filter((cmd) => !cmd.hidden);
  }

  /**
   * Find command names that match a partial input
   * Returns sorted array of matching command names
   */
  findMatches(partial: string): string[] {
    const search = partial.toLowerCase();
    return this.getAll()
      .filter((cmd) => !cmd.hidden && cmd.name.toLowerCase().startsWith(search))
      .map((cmd) => cmd.name)
      .sort();
  }

  /**
   * Check if a command exists
   */
  has(name: string): boolean {
    return this.commands.has(name) || this.aliases.has(name);
  }

  /**
   * Resolve user input into command mode or AI mode.
   * - Explicit slash inputs are always treated as commands.
   * - Non-slash inputs are treated as commands only when command exists.
   */
  resolveInput(rawInput: string): ResolvedInput {
    const raw = rawInput.trim();
    const tokens = raw.length > 0 ? raw.split(/\s+/) : [];
    const isExplicitCommand = raw.startsWith('/');
    const commandName = (tokens[0] ?? '').toLowerCase().replace(/^\//, '');
    const args = tokens.slice(1);
    const commandExists = commandName.length > 0 && this.has(commandName);
    const mode: InputMode = isExplicitCommand || commandExists ? 'command' : 'ai';

    return {
      raw,
      mode,
      isExplicitCommand,
      commandName,
      args,
      commandExists,
    };
  }

  /**
   * Clear all commands
   */
  clear(): void {
    this.commands.clear();
    this.aliases.clear();
  }

  /**
   * Get the count of registered commands
   */
  get size(): number {
    return this.commands.size;
  }

  /**
   * Get commands in legacy format for backward compatibility
   * Used by Terminal.tsx for autocomplete display
   */
  getLegacyCommands(): Array<{ cmd: string; desc: string; tab: number }> {
    return this.getVisible().map((cmd) => ({
      cmd: cmd.name,
      desc: cmd.description,
      tab: cmd.name.length + 2,
    }));
  }
}

// Singleton instance
export const commandRegistry = new CommandRegistry();

// Export class for testing
export { CommandRegistry };

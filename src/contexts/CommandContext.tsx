import { createContext, useContext, ReactNode } from 'react';
import { Command } from '../types/command';
import { commandRegistry } from '../core/CommandRegistry';
import { useTerminalStore, TerminalState } from '../stores/terminalStore';

/**
 * Command context value interface
 */
export interface CommandContextValue {
  /** Execute a command with arguments */
  execute: (command: string, args: string[]) => void;

  /** Register a new command dynamically */
  register: (command: Command) => void;

  /** Unregister a command by name */
  unregister: (name: string) => void;

  /** Get autocomplete suggestions for partial input */
  autocomplete: (partial: string) => string[];

  /** Get a command by name or alias */
  getCommand: (name: string) => Command | undefined;

  /** Get all visible commands */
  getCommands: () => Command[];

  /** Check if a command exists */
  hasCommand: (name: string) => boolean;
}

const CommandContext = createContext<CommandContextValue | null>(null);

/**
 * CommandProvider - Provides command context to child components
 */
export function CommandProvider({ children }: { children: ReactNode }) {
  const addToHistory = useTerminalStore((state: TerminalState) => state.addToHistory);

  const execute = (command: string, args: string[]) => {
    // Add to history
    addToHistory(command);

    // Command execution will be handled by Output component
    // This context just provides the utilities
  };

  const register = (command: Command) => {
    commandRegistry.register(command);
  };

  const unregister = (name: string) => {
    commandRegistry.unregister(name);
  };

  const autocomplete = (partial: string): string[] => {
    return commandRegistry.findMatches(partial);
  };

  const getCommand = (name: string): Command | undefined => {
    return commandRegistry.get(name);
  };

  const getCommands = (): Command[] => {
    return commandRegistry.getVisible();
  };

  const hasCommand = (name: string): boolean => {
    return commandRegistry.has(name);
  };

  const value: CommandContextValue = {
    execute,
    register,
    unregister,
    autocomplete,
    getCommand,
    getCommands,
    hasCommand,
  };

  return <CommandContext.Provider value={value}>{children}</CommandContext.Provider>;
}

/**
 * useCommandContext - Hook to access command context
 */
export function useCommandContext(): CommandContextValue {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error('useCommandContext must be used within CommandProvider');
  }
  return context;
}

// Re-export for backward compatibility
export { CommandContext };

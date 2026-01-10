import { ComponentType } from 'react';

/**
 * Command argument definition
 */
export interface ArgDefinition {
  name: string;
  description: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean';
  defaultValue?: string | number | boolean;
}

/**
 * Lazy loaded command component
 */
export type LazyComponent = () => Promise<{ default: ComponentType }>;

/**
 * Command interface - defines a terminal command
 */
export interface Command {
  /** Unique command identifier */
  id: string;

  /** Primary command name */
  name: string;

  /** Command description shown in help */
  description: string;

  /** Alternative names for this command */
  aliases?: string[];

  /** Command category for grouping */
  category?: string;

  /** Hide from command list (help output) */
  hidden?: boolean;

  /** Command argument definitions */
  args?: ArgDefinition[];

  /** Lazy loaded command component */
  component: LazyComponent;

  /** Optional: Execute function for non-UI commands */
  execute?: (args: string[], context: CommandContext) => CommandResult;
}

/**
 * Command execution context
 */
export interface CommandContext {
  /** Access to terminal state */
  history: string[];
  addToHistory: (command: string) => void;
  clearHistory: () => void;
}

/**
 * Command execution result
 */
export interface CommandResult {
  success: boolean;
  output?: string | JSX.Element;
  error?: string;
}

/**
 * Legacy command format (for backward compatibility)
 */
export interface LegacyCommand {
  cmd: string;
  desc: string;
  tab: number;
}

/**
 * Convert legacy command to new Command format
 */
export function legacyToCommand(
  legacy: LegacyCommand,
  component: LazyComponent
): Command {
  return {
    id: legacy.cmd,
    name: legacy.cmd,
    description: legacy.desc,
    component,
  };
}

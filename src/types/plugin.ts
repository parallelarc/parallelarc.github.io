import { Command } from './command';

/**
 * Plugin interface
 * Defines the structure of a terminal plugin
 */
export interface Plugin {
  /** Unique plugin identifier */
  name: string;

  /** Plugin version (semver) */
  version: string;

  /** Plugin description */
  description?: string;

  /** Plugin author */
  author?: string;

  /** Commands provided by this plugin */
  commands?: Command[];

  /** Plugin initialization function */
  init?: (context: PluginContext) => void;

  /** Plugin cleanup function */
  destroy?: () => void;
}

/**
 * Plugin context - provided to plugins during initialization
 */
export interface PluginContext {
  /** Register a new command */
  registerCommand: (command: Command) => void;

  /** Unregister a command by name */
  unregisterCommand: (name: string) => void;

  /** Get terminal state (readonly) */
  getTerminalState: () => {
    history: string[];
    isCrashed: boolean;
  };
}

/**
 * Plugin load result
 */
export interface PluginLoadResult {
  success: boolean;
  plugin?: Plugin;
  error?: string;
}

/**
 * Plugin info (metadata)
 */
export interface PluginInfo {
  name: string;
  version: string;
  description?: string;
  author?: string;
  loaded: boolean;
}

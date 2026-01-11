import { Command } from './command';
import { TerminalConfig } from '../config/terminal';

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
 * Terminal state accessible to plugins
 */
export interface TerminalState {
  /** Command history */
  history: string[];
  /** Current input value (readonly) */
  input?: string;
  /** Cursor position (readonly) */
  cursorPosition?: number;
}

/**
 * Event handler function type
 */
export type EventHandler = (...args: unknown[]) => void;

/**
 * Plugin context - provided to plugins during initialization
 * Enhanced with input state access, config access, and event system
 */
export interface PluginContext {
  /** Register a new command */
  registerCommand: (command: Command) => void;

  /** Unregister a command by name */
  unregisterCommand: (name: string) => void;

  /** Get terminal state (readonly) */
  getTerminalState: () => TerminalState;

  /** Get terminal configuration */
  getConfig: () => TerminalConfig;

  /** Subscribe to an event */
  on: (event: string, handler: EventHandler) => void;

  /** Unsubscribe from an event */
  off: (event: string, handler: EventHandler) => void;

  /** Emit an event */
  emit: (event: string, ...args: unknown[]) => void;

  /** Send a message to another plugin */
  sendMessage: (targetPlugin: string, message: unknown) => void;

  /** Register a handler for incoming messages from other plugins */
  onMessage: (handler: (from: string, message: unknown) => void) => void;
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

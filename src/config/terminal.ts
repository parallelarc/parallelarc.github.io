/**
 * Terminal Configuration
 */

export const terminalConfig = {
  /** Maximum number of history items to keep */
  maxHistorySize: 100,

  autocompleteTrigger: "/",

  /** Default history commands */
  defaultHistory: ["welcome"],

  /** Number of AI dialogue turns kept in context */
  aiHistoryTurns: 6,
} as const;

export type TerminalConfig = typeof terminalConfig;

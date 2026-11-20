/**
 * Terminal Configuration
 */

export const terminalConfig = {
  /** Maximum number of history items to keep */
  maxHistorySize: 100,

  autocompleteTrigger: "/",

  /** Default history commands */
  defaultHistory: ["welcome"],
} as const;

export type TerminalConfig = typeof terminalConfig;

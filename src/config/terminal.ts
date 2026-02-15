/**
 * Terminal Configuration
 */

export const terminalConfig = {
  /** Maximum number of history items to keep */
  maxHistorySize: 100,

  /** Enable autocomplete feature */
  enableAutocomplete: true,

  /** Character that triggers autocomplete mode */
  autocompleteTrigger: '/',

  /** Character(s) that trigger help display */
  helpTrigger: '?',

  /** Enable keyboard shortcuts */
  enableKeyboardShortcuts: true,

  /** Default history commands */
  defaultHistory: ['welcome'],

  /** Number of AI dialogue turns kept in context */
  aiHistoryTurns: 6,

  /** Input debounce time in milliseconds */
  inputDebounceMs: 0,
} as const;

export type TerminalConfig = typeof terminalConfig;

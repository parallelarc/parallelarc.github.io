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

  /** Command that crashes the terminal (easter egg) */
  crashCommand: 'sudo rm -rf /',

  /** Character(s) that trigger help display */
  helpTrigger: '?',

  /** Enable keyboard shortcuts */
  enableKeyboardShortcuts: true,

  /** Default history commands */
  defaultHistory: ['welcome'],

  /** Input debounce time in milliseconds */
  inputDebounceMs: 0,
} as const;

export type TerminalConfig = typeof terminalConfig;

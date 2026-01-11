import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { commandRegistry } from '../core/CommandRegistry';
import { terminalConfig } from '../config/terminal';

export interface CommandHistory {
  command: string;
  args: string[];
  timestamp?: number;
}

export interface TerminalState {
  // Input state
  input: string;
  cursorPosition: number;
  setInput: (value: string) => void;
  setCursorPosition: (pos: number) => void;

  // History state
  history: string[];
  historyIndex: number;
  addToHistory: (command: string) => void;
  clearHistory: () => void;
  navigateHistory: (direction: 'up' | 'down') => void;

  // Autocomplete state
  selectedCommandIndex: number;
  setSelectedCommandIndex: (index: number) => void;

  // Focus state
  isInputFocused: boolean;
  setInputFocused: (focused: boolean) => void;

  // Toast state
  showCopyToast: boolean;
  setShowCopyToast: (show: boolean) => void;

  // Filtered commands for autocomplete
  filteredCommands: Array<{ cmd: string; desc: string; tab: number }>;
  setFilteredCommands: (commands: TerminalState['filteredCommands']) => void;
  updateFilteredCommands: (input: string) => void;

  // Misc state
  rerender: boolean;
  setRerender: (value: boolean) => void;

  // Actions
  resetInputState: () => void;
  syncCursorPosition: (position: number) => void;
}

export const useTerminalStore = create<TerminalState>()(
  subscribeWithSelector((set, get) => ({
    // Input state
    input: '',
    cursorPosition: 0,
    setInput: (value: string) => set({ input: value }),
    setCursorPosition: (pos: number) => set({ cursorPosition: pos }),

    // History state
    history: [...terminalConfig.defaultHistory],
    historyIndex: -1,
    addToHistory: (command: string) => {
      const { history } = get();
      const newHistory = [command, ...history];
      // Enforce maxHistorySize from config
      const maxSize = terminalConfig.maxHistorySize;
      const trimmedHistory =
        newHistory.length > maxSize ? newHistory.slice(0, maxSize) : newHistory;
      set({ history: trimmedHistory, historyIndex: -1 });
    },
    clearHistory: () => set({ history: [...terminalConfig.defaultHistory], historyIndex: -1 }),
    navigateHistory: (direction: 'up' | 'down') => {
      const { history, historyIndex } = get();
      if (history.length <= 1) return;

      if (direction === 'up') {
        const newIndex = historyIndex + 1;
        if (newIndex < history.length) {
          set({ historyIndex: newIndex, input: history[newIndex] });
        }
      } else {
        const newIndex = historyIndex - 1;
        if (newIndex >= 0) {
          set({ historyIndex: newIndex, input: history[newIndex] });
        } else {
          set({ historyIndex: -1, input: '' });
        }
      }
    },

    // Autocomplete state
    selectedCommandIndex: 0,
    setSelectedCommandIndex: (index: number) => set({ selectedCommandIndex: index }),

    // Focus state
    isInputFocused: false,
    setInputFocused: (focused: boolean) => set({ isInputFocused: focused }),

    // Toast state
    showCopyToast: false,
    setShowCopyToast: (show: boolean) => set({ showCopyToast: show }),

    // Filtered commands (initialized as empty, updated by Terminal component after command registration)
    filteredCommands: [],
    setFilteredCommands: (commands) => set({ filteredCommands: commands }),
    updateFilteredCommands: (input: string) => {
      const allCommands = commandRegistry.getLegacyCommands();
      if (input.startsWith(terminalConfig.autocompleteTrigger)) {
        const filtered = allCommands.filter(({ cmd }) =>
          cmd.startsWith(input.slice(1))
        );
        set({ filteredCommands: filtered, selectedCommandIndex: 0 });
      } else {
        set({ filteredCommands: allCommands });
      }
    },

    // Misc state
    rerender: false,
    setRerender: (value: boolean) => set({ rerender: value }),

    // Actions
    resetInputState: () =>
      set({
        input: '',
        selectedCommandIndex: 0,
        cursorPosition: 0,
        historyIndex: -1,
      }),
    syncCursorPosition: (position: number) => {
      set({ cursorPosition: position });
      // Sync with textarea if needed
      const textarea = document.getElementById('terminal-input') as HTMLTextAreaElement;
      if (textarea) {
        textarea.setSelectionRange(position, position);
      }
    },
  }))
);

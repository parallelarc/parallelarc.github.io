import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

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

  // UI state
  isCrashed: boolean;
  setCrashed: (crashed: boolean) => void;

  // Autocomplete state
  selectedCommandIndex: number;
  setSelectedCommandIndex: (index: number) => void;

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
    history: ['welcome'],
    historyIndex: -1,
    addToHistory: (command: string) => {
      const { history } = get();
      set({ history: [command, ...history], historyIndex: -1 });
    },
    clearHistory: () => set({ history: ['welcome'], historyIndex: -1 }),
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

    // UI state
    isCrashed: false,
    setCrashed: (crashed: boolean) => set({ isCrashed: crashed }),

    // Autocomplete state
    selectedCommandIndex: 0,
    setSelectedCommandIndex: (index: number) => set({ selectedCommandIndex: index }),

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

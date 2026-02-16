import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { commandRegistry } from '../core/CommandRegistry';
import { terminalConfig } from '../config/terminal';
import type { BlogPost } from '../types/github';

export type HistoryEntryMode = 'command' | 'ai';

export interface CommandHistoryEntry {
  id: string;                 // 唯一标识符
  command: string;            // 命令文本
  displayCommand?: string;    // 展示给用户的输入（可与内部 command 不同）
  mode?: HistoryEntryMode;
  timestamp?: number;         // 时间戳
  dismissMessage?: string;    // 关闭时的替换消息
}

export interface InteractiveMode {
  active: boolean;
  command: string | null;
}

export type AiRole = 'user' | 'assistant';

export interface AiConversationMessage {
  role: AiRole;
  content: string;
  timestamp: number;
}

export type AiEntryStatus = 'idle' | 'streaming' | 'done' | 'error';

export interface AiEntryState {
  prompt: string;
  response: string;
  status: AiEntryStatus;
  error?: string;
  provider?: string;
  model?: string;
  updatedAt: number;
}

export interface AddToHistoryOptions {
  displayCommand?: string;
  mode?: HistoryEntryMode;
}

export interface TerminalState {
  // Input state
  input: string;
  cursorPosition: number;
  setInput: (value: string) => void;
  setCursorPosition: (pos: number) => void;

  // History state
  history: CommandHistoryEntry[];
  historyIndex: number;
  addToHistory: (command: string, options?: AddToHistoryOptions) => string;
  clearHistory: () => void;
  navigateHistory: (direction: 'up' | 'down') => void;
  removeFromHistory: (index: number) => void;
  setDismissMessage: (index: number, message: string) => void;

  // AI conversation state
  aiEntries: Record<string, AiEntryState>;
  aiConversation: AiConversationMessage[];
  blogPostsSnapshot: BlogPost[];
  ensureAiEntry: (entryId: string, prompt: string) => void;
  startAiEntry: (entryId: string) => void;
  appendAiResponseChunk: (entryId: string, chunk: string) => void;
  completeAiEntry: (entryId: string, metadata?: { provider?: string; model?: string }) => void;
  failAiEntry: (entryId: string, error: string) => void;
  addAiConversationTurn: (prompt: string, response: string) => void;
  clearAiConversation: () => void;
  setBlogPostsSnapshot: (posts: BlogPost[]) => void;

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

  // Interactive mode state
  interactiveMode: InteractiveMode;
  setInteractiveMode: (active: boolean, command?: string | null) => void;

  // Actions
  resetInputState: () => void;
  syncCursorPosition: (position: number) => void;
}

// Helper function to generate unique history IDs
const generateHistoryId = (prefix = ''): string =>
  `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

const getHistoryInputText = (entry: CommandHistoryEntry): string =>
  entry.displayCommand ?? entry.command;

export const useTerminalStore = create<TerminalState>()(
  subscribeWithSelector((set, get) => ({
    // Input state
    input: '',
    cursorPosition: 0,
    setInput: (value: string) => set({ input: value }),
    setCursorPosition: (pos: number) => {
      // 确保位置是有效的数字
      const validPos = Number.isNaN(pos) ? 0 : Math.max(0, Math.floor(pos));
      set({ cursorPosition: validPos });
    },

    // History state
    history: [...terminalConfig.defaultHistory].map(cmd => ({
      id: generateHistoryId('default-'),
      command: cmd,
      mode: 'command',
    })),
    historyIndex: -1,
    addToHistory: (command: string, options: AddToHistoryOptions = {}) => {
      const { history } = get();
      const entry: CommandHistoryEntry = {
        id: generateHistoryId(),
        command,
        displayCommand: options.displayCommand,
        mode: options.mode ?? 'command',
        timestamp: Date.now(),
      };
      const newHistory = [entry, ...history];
      // Enforce maxHistorySize from config
      const maxSize = terminalConfig.maxHistorySize;
      const trimmedHistory =
        newHistory.length > maxSize ? newHistory.slice(0, maxSize) : newHistory;
      set({ history: trimmedHistory, historyIndex: -1 });
      return entry.id;
    },
    clearHistory: () => set({
      history: [...terminalConfig.defaultHistory].map(cmd => ({
        id: generateHistoryId('default-'),
        command: cmd,
        mode: 'command',
      })),
      historyIndex: -1,
      aiEntries: {},
      aiConversation: [],
    }),
    removeFromHistory: (index: number) => {
      const { history, aiEntries } = get();
      const newHistory = history.filter((_, i) => i !== index);
      const removedEntry = history[index];

      if (removedEntry?.mode === 'ai') {
        const nextAiEntries = { ...aiEntries };
        delete nextAiEntries[removedEntry.id];
        set({ history: newHistory, aiEntries: nextAiEntries });
        return;
      }

      set({ history: newHistory });
    },
    setDismissMessage: (index: number, message: string) => {
      const { history } = get();
      const newHistory = [...history];
      if (newHistory[index]) {
        newHistory[index] = { ...newHistory[index], dismissMessage: message };
      }
      set({ history: newHistory });
    },
    navigateHistory: (direction: 'up' | 'down') => {
      const { history, historyIndex } = get();
      if (history.length <= 1) return;

      if (direction === 'up') {
        const newIndex = historyIndex + 1;
        if (newIndex < history.length) {
          set({
            historyIndex: newIndex,
            input: getHistoryInputText(history[newIndex]),
          });
        }
      } else {
        const newIndex = historyIndex - 1;
        if (newIndex >= 0) {
          set({
            historyIndex: newIndex,
            input: getHistoryInputText(history[newIndex]),
          });
        } else {
          set({ historyIndex: -1, input: '' });
        }
      }
    },

    // AI conversation state
    aiEntries: {},
    aiConversation: [],
    blogPostsSnapshot: [],
    ensureAiEntry: (entryId: string, prompt: string) => {
      const { aiEntries } = get();
      if (aiEntries[entryId]) return;

      set({
        aiEntries: {
          ...aiEntries,
          [entryId]: {
            prompt,
            response: '',
            status: 'idle',
            updatedAt: Date.now(),
          },
        },
      });
    },
    startAiEntry: (entryId: string) => {
      const { aiEntries } = get();
      const entry = aiEntries[entryId];
      if (!entry) return;

      set({
        aiEntries: {
          ...aiEntries,
          [entryId]: {
            ...entry,
            status: 'streaming',
            error: undefined,
            response: '',
            updatedAt: Date.now(),
          },
        },
      });
    },
    appendAiResponseChunk: (entryId: string, chunk: string) => {
      if (!chunk) return;

      const { aiEntries } = get();
      const entry = aiEntries[entryId];
      if (!entry) return;

      set({
        aiEntries: {
          ...aiEntries,
          [entryId]: {
            ...entry,
            response: `${entry.response}${chunk}`,
            status: 'streaming',
            updatedAt: Date.now(),
          },
        },
      });
    },
    completeAiEntry: (entryId: string, metadata) => {
      const { aiEntries } = get();
      const entry = aiEntries[entryId];
      if (!entry) return;

      set({
        aiEntries: {
          ...aiEntries,
          [entryId]: {
            ...entry,
            status: 'done',
            provider: metadata?.provider ?? entry.provider,
            model: metadata?.model ?? entry.model,
            updatedAt: Date.now(),
          },
        },
      });
    },
    failAiEntry: (entryId: string, error: string) => {
      const { aiEntries } = get();
      const entry = aiEntries[entryId];
      if (!entry) return;

      set({
        aiEntries: {
          ...aiEntries,
          [entryId]: {
            ...entry,
            status: 'error',
            error,
            updatedAt: Date.now(),
          },
        },
      });
    },
    addAiConversationTurn: (prompt: string, response: string) => {
      const { aiConversation } = get();
      const updated: AiConversationMessage[] = [
        ...aiConversation,
        { role: 'user', content: prompt, timestamp: Date.now() },
        { role: 'assistant', content: response, timestamp: Date.now() },
      ];

      const maxTurns = terminalConfig.aiHistoryTurns;
      const maxMessages = maxTurns * 2;
      const trimmed =
        updated.length > maxMessages ? updated.slice(updated.length - maxMessages) : updated;

      set({ aiConversation: trimmed });
    },
    clearAiConversation: () => set({ aiEntries: {}, aiConversation: [] }),
    setBlogPostsSnapshot: (posts: BlogPost[]) => set({ blogPostsSnapshot: posts }),

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

    // Interactive mode state
    interactiveMode: { active: false, command: null },
    setInteractiveMode: (active: boolean, command: string | null = null) =>
      set({ interactiveMode: { active, command } }),

    // Actions
    resetInputState: () =>
      set({
        input: '',
        selectedCommandIndex: 0,
        cursorPosition: 0,
        historyIndex: -1,
      }),
    syncCursorPosition: (position: number) => {
      // 确保位置是有效的数字
      const validPos = Number.isNaN(position) ? 0 : Math.max(0, Math.floor(position));
      set({ cursorPosition: validPos });
      // Sync with textarea if needed
      const textarea = document.getElementById('terminal-input') as HTMLTextAreaElement;
      if (textarea) {
        textarea.setSelectionRange(validPos, validPos);
      }
    },
  }))
);

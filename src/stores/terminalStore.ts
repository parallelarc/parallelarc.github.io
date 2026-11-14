import { create } from "zustand";
import { terminalConfig } from "../config/terminal";

export type HistoryEntryMode = "command" | "ai";

export interface CommandHistoryEntry {
  id: string; // 唯一标识符
  command: string; // 命令文本
  mode?: HistoryEntryMode;
  timestamp?: number; // 时间戳
  dismissMessage?: string; // 关闭时的替换消息
}

export interface InteractiveMode {
  active: boolean;
  command: string | null;
}

export type AiRole = "user" | "assistant";

export interface AiConversationMessage {
  role: AiRole;
  content: string;
  timestamp: number;
}

export type AiEntryStatus = "idle" | "streaming" | "done" | "error" | "stopped";

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
  historyDraft: string;
  addToHistory: (command: string, options?: AddToHistoryOptions) => string;
  clearHistory: () => void;
  navigateHistory: (direction: "up" | "down") => void;
  setDismissMessage: (index: number, message: string) => void;

  // AI conversation state
  aiEntries: Record<string, AiEntryState>;
  aiConversation: AiConversationMessage[];
  ensureAiEntry: (entryId: string, prompt: string) => void;
  startAiEntry: (entryId: string) => void;
  appendAiResponseChunk: (entryId: string, chunk: string) => void;
  completeAiEntry: (
    entryId: string,
    metadata?: { provider?: string; model?: string }
  ) => void;
  failAiEntry: (entryId: string, error: string) => void;
  stopAiEntry: (entryId: string) => void;
  addAiConversationTurn: (prompt: string, response: string) => void;
  clearAiConversation: () => void;

  // Autocomplete state
  selectedCommandIndex: number;
  setSelectedCommandIndex: (index: number) => void;

  // Interactive mode state
  interactiveMode: InteractiveMode;
  setInteractiveMode: (active: boolean, command?: string | null) => void;

  // Actions
  resetInputState: () => void;
}

// Helper function to generate unique history IDs
const generateHistoryId = (prefix = ""): string =>
  `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

export const useTerminalStore = create<TerminalState>()((set, get) => ({
  // Input state
  input: "",
  cursorPosition: 0,
  setInput: (value: string) => set({ input: value, historyIndex: -1 }),
  setCursorPosition: (pos: number) => {
    // 确保位置是有效的数字
    const validPos = Number.isNaN(pos) ? 0 : Math.max(0, Math.floor(pos));
    set({ cursorPosition: validPos });
  },

  // History state
  history: [...terminalConfig.defaultHistory].map(cmd => ({
    id: generateHistoryId("default-"),
    command: cmd,
    mode: "command",
  })),
  historyIndex: -1,
  historyDraft: "",
  addToHistory: (command: string, options: AddToHistoryOptions = {}) => {
    const { history } = get();
    const entry: CommandHistoryEntry = {
      id: generateHistoryId(),
      command,
      mode: options.mode ?? "command",
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
  clearHistory: () =>
    set({
      history: [...terminalConfig.defaultHistory].map(cmd => ({
        id: generateHistoryId("default-"),
        command: cmd,
        mode: "command",
      })),
      historyIndex: -1,
      aiEntries: {},
      aiConversation: [],
    }),
  setDismissMessage: (index: number, message: string) => {
    const { history } = get();
    const newHistory = [...history];
    if (newHistory[index]) {
      newHistory[index] = { ...newHistory[index], dismissMessage: message };
    }
    set({ history: newHistory });
  },
  navigateHistory: (direction: "up" | "down") => {
    const { history, historyIndex, input, historyDraft } = get();
    if (history.length === 0) return;

    if (direction === "up") {
      const newIndex = historyIndex + 1;
      if (newIndex < history.length) {
        const recalled = history[newIndex].command;
        set({
          historyIndex: newIndex,
          historyDraft: historyIndex === -1 ? input : historyDraft,
          input: recalled,
          cursorPosition: recalled.length,
        });
      }
    } else {
      const newIndex = historyIndex - 1;
      if (newIndex >= 0) {
        const recalled = history[newIndex].command;
        set({
          historyIndex: newIndex,
          input: recalled,
          cursorPosition: recalled.length,
        });
      } else if (historyIndex !== -1) {
        set({
          historyIndex: -1,
          input: historyDraft,
          cursorPosition: historyDraft.length,
        });
      }
    }
  },

  // AI conversation state
  aiEntries: {},
  aiConversation: [],
  ensureAiEntry: (entryId: string, prompt: string) => {
    const { aiEntries } = get();
    if (aiEntries[entryId]) return;

    set({
      aiEntries: {
        ...aiEntries,
        [entryId]: {
          prompt,
          response: "",
          status: "idle",
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
          status: "streaming",
          error: undefined,
          response: "",
          updatedAt: Date.now(),
        },
      },
    });
  },
  appendAiResponseChunk: (entryId: string, chunk: string) => {
    if (!chunk) return;

    const { aiEntries } = get();
    const entry = aiEntries[entryId];
    if (!entry || entry.status !== "streaming") return;

    set({
      aiEntries: {
        ...aiEntries,
        [entryId]: {
          ...entry,
          response: `${entry.response}${chunk}`,
          status: "streaming",
          updatedAt: Date.now(),
        },
      },
    });
  },
  completeAiEntry: (entryId: string, metadata) => {
    const { aiEntries } = get();
    const entry = aiEntries[entryId];
    if (!entry || entry.status === "stopped") return;

    set({
      aiEntries: {
        ...aiEntries,
        [entryId]: {
          ...entry,
          status: "done",
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
    if (!entry || entry.status === "stopped") return;

    set({
      aiEntries: {
        ...aiEntries,
        [entryId]: {
          ...entry,
          status: "error",
          error,
          updatedAt: Date.now(),
        },
      },
    });
  },
  stopAiEntry: (entryId: string) => {
    const { aiEntries } = get();
    const entry = aiEntries[entryId];
    if (!entry || (entry.status !== "idle" && entry.status !== "streaming"))
      return;
    set({
      aiEntries: {
        ...aiEntries,
        [entryId]: { ...entry, status: "stopped", updatedAt: Date.now() },
      },
    });
  },
  addAiConversationTurn: (prompt: string, response: string) => {
    const { aiConversation } = get();
    const updated: AiConversationMessage[] = [
      ...aiConversation,
      { role: "user", content: prompt, timestamp: Date.now() },
      { role: "assistant", content: response, timestamp: Date.now() },
    ];

    const maxTurns = terminalConfig.aiHistoryTurns;
    const maxMessages = maxTurns * 2;
    const trimmed =
      updated.length > maxMessages
        ? updated.slice(updated.length - maxMessages)
        : updated;

    set({ aiConversation: trimmed });
  },
  clearAiConversation: () => set({ aiEntries: {}, aiConversation: [] }),

  // Autocomplete state
  selectedCommandIndex: 0,
  setSelectedCommandIndex: (index: number) =>
    set({ selectedCommandIndex: index }),

  // Interactive mode state
  interactiveMode: { active: false, command: null },
  setInteractiveMode: (active: boolean, command: string | null = null) =>
    set({ interactiveMode: { active, command } }),

  // Actions
  resetInputState: () =>
    set({
      input: "",
      selectedCommandIndex: 0,
      cursorPosition: 0,
      historyIndex: -1,
      historyDraft: "",
    }),
}));

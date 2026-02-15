import { useCallback } from "react";
import { commandRegistry } from "../core/CommandRegistry";
import { buildAiHistoryCommand } from "../utils/aiInput";
import type { AddToHistoryOptions } from "../stores/terminalStore";

export interface UseCommandSubmissionProps {
  inputVal: string;
  onAddToHistory: (command: string, options?: AddToHistoryOptions) => string;
  onEnsureAiEntry: (entryId: string, prompt: string) => void;
  onResetInputState: () => void;
  onSetRerender: (value: boolean) => void;
}

/**
 * Hook for handling command submission in the terminal
 * - Validates input
 * - Adds command to history
 * - Resets input state
 * - Triggers re-render
 */
export function useCommandSubmission({
  inputVal,
  onAddToHistory,
  onEnsureAiEntry,
  onResetInputState,
  onSetRerender,
}: UseCommandSubmissionProps) {
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmedInput = inputVal.trim();
      if (!trimmedInput) {
        onResetInputState();
        return;
      }

      const resolved = commandRegistry.resolveInput(trimmedInput);

      if (resolved.mode === "ai") {
        const historyCommand = buildAiHistoryCommand(trimmedInput);
        const entryId = onAddToHistory(historyCommand, {
          displayCommand: trimmedInput,
          mode: "ai",
        });
        onEnsureAiEntry(entryId, trimmedInput);
      } else {
        onAddToHistory(trimmedInput);
      }
      onResetInputState();
      onSetRerender(true);
    },
    [inputVal, onResetInputState, onAddToHistory, onEnsureAiEntry, onSetRerender]
  );

  return { handleSubmit };
}

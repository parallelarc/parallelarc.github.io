import { useCallback } from "react";
import { commandRegistry } from "../core/CommandRegistry";
import type { AddToHistoryOptions } from "../stores/terminalStore";

export interface UseCommandSubmissionProps {
  inputVal: string;
  onAddToHistory: (command: string, options?: AddToHistoryOptions) => string;
  onEnsureAiEntry: (entryId: string, prompt: string) => void;
  onResetInputState: () => void;
}

/**
 * Hook for handling command submission in the terminal
 * - Validates input
 * - Adds command to history
 * - Resets input state
 */
export function useCommandSubmission({
  inputVal,
  onAddToHistory,
  onEnsureAiEntry,
  onResetInputState,
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
        const entryId = onAddToHistory(trimmedInput, {
          mode: "ai",
        });
        onEnsureAiEntry(entryId, trimmedInput);
      } else {
        onAddToHistory(trimmedInput);
      }
      onResetInputState();
    },
    [inputVal, onResetInputState, onAddToHistory, onEnsureAiEntry]
  );

  return { handleSubmit };
}

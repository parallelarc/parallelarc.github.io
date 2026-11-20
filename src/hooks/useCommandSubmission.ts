import { useCallback } from "react";

export interface UseCommandSubmissionProps {
  inputVal: string;
  onAddToHistory: (command: string) => string;
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

      onAddToHistory(trimmedInput);
      onResetInputState();
    },
    [inputVal, onResetInputState, onAddToHistory]
  );

  return { handleSubmit };
}

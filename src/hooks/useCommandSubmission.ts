import { useCallback } from "react";

export interface UseCommandSubmissionProps {
  inputVal: string;
  onAddToHistory: (command: string) => void;
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

      onAddToHistory(trimmedInput);
      onResetInputState();
      onSetRerender(true);
    },
    [inputVal, onResetInputState, onAddToHistory, onSetRerender]
  );

  return { handleSubmit };
}

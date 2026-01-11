import { useCallback, useMemo } from "react";
import { terminalConfig } from "../config/terminal";

export type Command = {
  cmd: string;
  desc: string;
  tab: number;
};

export interface UseAutocompleteProps {
  inputVal: string;
  allCommands: Command[];
}

export interface UseAutocompleteReturn {
  filteredCommands: Command[];
  selectedCommandIndex: number;
  setSelectedCommandIndex: (index: number) => void;
  handleTabCompletion: () => string | null;
  isAutocompleteMode: boolean;
}

/**
 * Hook for handling command autocomplete in the terminal
 * - Filters commands based on input
 * - Manages command selection
 * - Handles tab completion
 */
export function useAutocomplete({
  inputVal,
  allCommands,
}: UseAutocompleteProps): UseAutocompleteReturn {
  const isAutocompleteMode = inputVal.startsWith(terminalConfig.autocompleteTrigger);

  // Filter commands based on input
  const filteredCommands = useMemo(() => {
    if (isAutocompleteMode) {
      const searchTerm = inputVal.slice(1); // Remove the trigger character
      return allCommands.filter(({ cmd }) => cmd.startsWith(searchTerm));
    }
    return allCommands;
  }, [inputVal, allCommands, isAutocompleteMode]);

  // Default to first command when filtered commands change
  const selectedCommandIndex = 0;

  const setSelectedCommandIndex = useCallback((index: number) => {
    // This would be managed by store in the parent component
    return index;
  }, []);

  const handleTabCompletion = useCallback((): string | null => {
    if (filteredCommands.length > 0) {
      const selectedCmd = filteredCommands[selectedCommandIndex]?.cmd;
      if (selectedCmd) {
        return terminalConfig.autocompleteTrigger + selectedCmd;
      }
    }
    return null;
  }, [filteredCommands, selectedCommandIndex]);

  return {
    filteredCommands,
    selectedCommandIndex,
    setSelectedCommandIndex,
    handleTabCompletion,
    isAutocompleteMode,
  };
}

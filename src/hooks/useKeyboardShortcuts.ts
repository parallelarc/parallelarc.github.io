import { useCallback } from "react";
import { terminalConfig } from "../config/terminal";

export type Command = {
  cmd: string;
  desc: string;
  tab: number;
};

export interface UseKeyboardShortcutsProps {
  inputVal: string;
  cursorPosition: number;
  filteredCommands: Command[];
  selectedCommandIndex: number;
  onResetInput: () => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onAddToHistory: (command: string) => void;
  onSetSelectedIndex: (index: number) => void;
  onSetInput: (value: string) => void;
  onSyncCursorPosition: (pos: number) => void;
  onSetRerender: (value: boolean) => void;
}

/**
 * Hook for handling keyboard shortcuts in the terminal
 * - Ctrl+C: Clear input
 * - Escape: Exit command selection mode
 * - Tab/Ctrl+I: Autocomplete command
 * - Arrow keys: Navigate commands and cursor
 * - Enter: Submit form or execute selected command
 */
export function useKeyboardShortcuts({
  inputVal,
  cursorPosition,
  filteredCommands,
  selectedCommandIndex,
  onResetInput,
  handleSubmit,
  onAddToHistory,
  onSetSelectedIndex,
  onSetInput,
  onSyncCursorPosition,
  onSetRerender,
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      onSetRerender(false);

      const ctrlI = e.ctrlKey && e.key.toLowerCase() === "i";
      const ctrlC = e.ctrlKey && e.key.toLowerCase() === "c";
      const isSlashMode = inputVal.startsWith(terminalConfig.autocompleteTrigger);

      // Ctrl+C - Clear input
      if (ctrlC) {
        e.preventDefault();
        onResetInput();
        return;
      }

      // Escape - Exit command selection mode
      if (e.key === "Escape" && isSlashMode && selectedCommandIndex >= 0) {
        e.preventDefault();
        onSetSelectedIndex(-1);
        return;
      }

      // Shift + Enter - Allow default newline behavior
      if (e.key === "Enter" && e.shiftKey) {
        return;
      }

      // Enter in slash mode with selected command - Execute selected command
      if (isSlashMode && e.key === "Enter" && selectedCommandIndex >= 0) {
        e.preventDefault();
        const selectedCmd = filteredCommands[selectedCommandIndex]?.cmd;
        if (selectedCmd) {
          onAddToHistory(terminalConfig.autocompleteTrigger + selectedCmd);
          onResetInput();
          onSetRerender(true);
        }
        return;
      }

      // Enter - Submit form (including slash mode without selection)
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
        return;
      }

      // Slash mode navigation
      if (isSlashMode) {
        // ArrowUp - Navigate up (cyclic)
        if (e.key === "ArrowUp") {
          e.preventDefault();
          onSetSelectedIndex(
            selectedCommandIndex <= 0 ? filteredCommands.length - 1 : selectedCommandIndex - 1
          );
          return;
        }

        // ArrowDown - Navigate down (cyclic)
        if (e.key === "ArrowDown") {
          e.preventDefault();
          onSetSelectedIndex(
            selectedCommandIndex >= filteredCommands.length - 1 ? 0 : selectedCommandIndex + 1
          );
          return;
        }

        // Tab - Autocomplete selected command
        if (e.key === "Tab" || ctrlI) {
          e.preventDefault();
          if (selectedCommandIndex >= 0) {
            const selectedCmd = filteredCommands[selectedCommandIndex]?.cmd;
            if (selectedCmd) {
              onSetInput(terminalConfig.autocompleteTrigger + selectedCmd);
              onSyncCursorPosition(selectedCmd.length + 1);
              onSetSelectedIndex(-1);
            }
          }
          return;
        }

        // ArrowLeft/Right - Disable when command is selected
        if (
          (e.key === "ArrowLeft" || e.key === "ArrowRight") &&
          selectedCommandIndex >= 0
        ) {
          e.preventDefault();
          return;
        }
      }

      // Cursor movement keys (only when not using modifiers)
      if (!e.ctrlKey && !e.metaKey) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          onSyncCursorPosition(Math.max(0, cursorPosition - 1));
          return;
        }

        if (e.key === "ArrowRight") {
          e.preventDefault();
          onSyncCursorPosition(Math.min(inputVal.length, cursorPosition + 1));
          return;
        }

        if (e.key === "Home") {
          e.preventDefault();
          onSyncCursorPosition(0);
          return;
        }

        if (e.key === "End") {
          e.preventDefault();
          onSyncCursorPosition(inputVal.length);
          return;
        }
      }
    },
    [
      inputVal,
      cursorPosition,
      filteredCommands,
      selectedCommandIndex,
      onResetInput,
      handleSubmit,
      onAddToHistory,
      onSetSelectedIndex,
      onSetInput,
      onSyncCursorPosition,
      onSetRerender,
    ]
  );

  return { handleKeyDown };
}

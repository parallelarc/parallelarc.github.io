import { useCallback } from "react";

export interface UseKeyboardShortcutsProps {
  menuOpen: boolean;
  commandCount: number;
  selectedCommandIndex: number;
  isComposing: () => boolean;
  onSelectCommand: (index: number) => void;
  onCompleteCommand: (index: number) => void;
  onRunCommand: (index: number) => void;
  onDismiss: () => boolean;
  onResetInput: () => void;
  onNavigateHistory: (direction: "up" | "down") => void;
  onToggleHelp: () => void;
  onSubmit: () => void;
  onStop: () => boolean;
}

/** Browser-native editing, with terminal shortcuts layered on top. */
export function useKeyboardShortcuts({
  menuOpen,
  commandCount,
  selectedCommandIndex,
  isComposing,
  onSelectCommand,
  onCompleteCommand,
  onRunCommand,
  onDismiss,
  onResetInput,
  onNavigateHistory,
  onToggleHelp,
  onSubmit,
  onStop,
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter confirms an IME candidate before it can ever submit a prompt.
      if (isComposing() || e.nativeEvent.isComposing || e.keyCode === 229)
        return;
      const input = e.currentTarget;
      const hasSelection = input.selectionStart !== input.selectionEnd;

      if (e.ctrlKey && e.key.toLowerCase() === "c" && !hasSelection) {
        e.preventDefault();
        if (!onStop()) onResetInput();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (!onDismiss()) onStop();
        return;
      }
      if (e.key === "?" && !input.value) {
        e.preventDefault();
        onToggleHelp();
        return;
      }
      // Shift+Tab stays available for native keyboard focus navigation.
      if (menuOpen && !e.shiftKey && !e.metaKey && !e.altKey && !e.ctrlKey) {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          if (commandCount > 0) {
            const step = e.key === "ArrowDown" ? 1 : -1;
            onSelectCommand(
              (selectedCommandIndex + step + commandCount) % commandCount
            );
          }
          return;
        }
        if (e.key === "Tab" && commandCount > 0) {
          e.preventDefault();
          onCompleteCommand(Math.max(0, selectedCommandIndex));
          return;
        }
        if (
          e.key === "Enter" &&
          selectedCommandIndex >= 0 &&
          commandCount > 0
        ) {
          e.preventDefault();
          onRunCommand(selectedCommandIndex);
          return;
        }
      }
      if (
        e.key === "Enter" &&
        !e.shiftKey &&
        !e.altKey &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        e.preventDefault();
        onSubmit();
        return;
      }
      // A single visual row can recall immediately; in multiline prompts leave
      // arrow movement native until the caret reaches a prompt boundary.
      if (
        !menuOpen &&
        !hasSelection &&
        !e.shiftKey &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        const lineHeight = parseFloat(getComputedStyle(input).lineHeight);
        const singleRow =
          input.scrollHeight > 0 && input.scrollHeight <= lineHeight * 1.5;
        if (e.key === "ArrowUp" && (singleRow || input.selectionStart === 0)) {
          e.preventDefault();
          onNavigateHistory("up");
        } else if (
          e.key === "ArrowDown" &&
          (singleRow || input.selectionEnd === input.value.length)
        ) {
          e.preventDefault();
          onNavigateHistory("down");
        }
      }
    },
    [
      menuOpen,
      commandCount,
      selectedCommandIndex,
      isComposing,
      onSelectCommand,
      onCompleteCommand,
      onRunCommand,
      onDismiss,
      onResetInput,
      onNavigateHistory,
      onToggleHelp,
      onSubmit,
      onStop,
    ]
  );

  return { handleKeyDown };
}

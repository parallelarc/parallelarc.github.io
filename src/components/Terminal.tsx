import {
  createContext,
  useCallback,
  useRef,
} from "react";
import { terminalConfig } from "../config/terminal";
import { commandRegistry } from "../core/CommandRegistry";
import { useTerminalStore } from "../stores/terminalStore";
import { useClipboardHandler } from "../hooks/useClipboardHandler";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useCommandSubmission } from "../hooks/useCommandSubmission";
import { useGlobalFocus } from "../hooks/useGlobalFocus";
import CommandHistoryItem from "./CommandHistoryItem";
import TermInfo from "./TermInfo";
// Import commands FIRST to ensure registration before using registry
import "../commands";
import {
  CopyToast,
  Form,
  InputHint,
  ShortcutsGrid,
  ShortcutItem,
  CommandsList,
  Wrapper,
  HiddenTextarea,
  InputDisplay,
  DisplayText,
  CursorChar,
  CommandItem,
  CommandName,
} from "./styles/Terminal.styled";
import {
  ClaudeInputContainer,
  ClaudeTopLine,
  ClaudeInputArea,
  ClaudeBottomLine,
} from "./styles/TerminalInfo.styled";

type Command = {
  cmd: string;
  desc: string;
  tab: number;
};

// Get commands from registry (safe to call at runtime after command registration)
export const getCommands = (): Command[] => commandRegistry.getLegacyCommands();



export type Term = {
  arg: string[];
  history: string[];
  rerender: boolean;
  index: number;
  isLatest: boolean;
  clearHistory?: () => void;
  removeFromHistory?: (index: number) => void;
  entryId?: string;
  setDismissMessage?: (index: number, message: string) => void;
};

export const termContext = createContext<Term>({
  arg: [],
  history: [],
  rerender: false,
  index: 0,
  isLatest: false,
});

function Terminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // State from store (using selectors for precise subscriptions)
  const inputVal = useTerminalStore((s) => s.input);
  const cursorPosition = useTerminalStore((s) => s.cursorPosition);
  const cmdHistory = useTerminalStore((s) => s.history);
  const rerender = useTerminalStore((s) => s.rerender);
  const selectedCommandIndex = useTerminalStore((s) => s.selectedCommandIndex);
  const filteredCommands = useTerminalStore((s) => s.filteredCommands);
  const showCopyToast = useTerminalStore((s) => s.showCopyToast);
  const isInputFocused = useTerminalStore((s) => s.isInputFocused);
  const interactiveMode = useTerminalStore((s) => s.interactiveMode);

  // Actions (stable references, won't cause re-renders)
  const setInput = useTerminalStore((s) => s.setInput);
  const setCursorPosition = useTerminalStore((s) => s.setCursorPosition);
  const resetInputState = useTerminalStore((s) => s.resetInputState);
  const syncCursorPosition = useTerminalStore((s) => s.syncCursorPosition);
  const clearHistory = useTerminalStore((s) => s.clearHistory);
  const addToHistory = useTerminalStore((s) => s.addToHistory);
  const ensureAiEntry = useTerminalStore((s) => s.ensureAiEntry);
  const removeFromHistory = useTerminalStore((s) => s.removeFromHistory);
  const setDismissMessage = useTerminalStore((s) => s.setDismissMessage);
  const setSelectedCommandIndex = useTerminalStore((s) => s.setSelectedCommandIndex);
  const setFilteredCommands = useTerminalStore((s) => s.setFilteredCommands);
  const setRerender = useTerminalStore((s) => s.setRerender);
  const setShowCopyToast = useTerminalStore((s) => s.setShowCopyToast);
  const setInputFocused = useTerminalStore((s) => s.setInputFocused);

  // Custom hooks
  useClipboardHandler({
    containerRef,
    setShowCopyToast,
  });

  useGlobalFocus({
    containerRef,
    inputRef,
  });

  // Command submission hook
  const { handleSubmit } = useCommandSubmission({
    inputVal,
    onAddToHistory: addToHistory,
    onEnsureAiEntry: ensureAiEntry,
    onResetInputState: resetInputState,
    onSetRerender: setRerender,
  });

  // Keyboard shortcuts hook
  const { handleKeyDown } = useKeyboardShortcuts({
    inputVal,
    cursorPosition,
    filteredCommands,
    selectedCommandIndex,
    onResetInput: resetInputState,
    handleSubmit,
    onAddToHistory: addToHistory,
    onSetSelectedIndex: setSelectedCommandIndex,
    onSetInput: setInput,
    onSyncCursorPosition: syncCursorPosition,
    onSetRerender: setRerender,
  });

  // Input change handler
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setInput(newValue);

      // 确保 selectionStart 是有效的数字
      const rawPosition = e.target.selectionStart;
      const validPosition = Number.isNaN(rawPosition) || rawPosition === null || rawPosition === undefined
        ? newValue.length
        : Math.max(0, Math.min(rawPosition, newValue.length));
      setCursorPosition(validPosition);

      // Update filtered commands based on input
      const allCommands = getCommands();
      if (newValue.startsWith(terminalConfig.autocompleteTrigger)) {
        const filtered = allCommands.filter(({ cmd }) =>
          cmd.startsWith(newValue.slice(1))
        );
        setFilteredCommands(filtered);
        setSelectedCommandIndex(0);
      } else {
        setFilteredCommands(allCommands);
      }
    },
    [
      setInput,
      setCursorPosition,
      setFilteredCommands,
      setSelectedCommandIndex,
    ]
  );

  return (
    <Wrapper data-testid="terminal-wrapper" ref={containerRef}>
      {showCopyToast && (
        <CopyToast role="status" aria-live="polite">
          <span aria-hidden="true">✨</span> Copied to clipboard
        </CopyToast>
      )}
      {!interactiveMode.active && (
      <Form onSubmit={handleSubmit}>
        <ClaudeInputContainer>
          <ClaudeTopLine />
          <ClaudeInputArea>
            <label htmlFor="terminal-input">
              <TermInfo />
            </label>
            <InputDisplay
              onClick={() => inputRef.current?.focus()}
              data-testid="input-display"
            >
              <DisplayText $hasText={inputVal.length > 0}>
                {inputVal.length === 0 ? (
                  isInputFocused ? (
                    <>
                      <CursorChar>s</CursorChar>
                      hare an idea with me
                    </>
                  ) : (
                    "share an idea with me"
                  )
                ) : (
                  <>
                    {inputVal.slice(0, cursorPosition)}
                    <CursorChar>{inputVal[cursorPosition] || " "}</CursorChar>
                    {inputVal.slice(cursorPosition + 1)}
                  </>
                )}
              </DisplayText>
            </InputDisplay>
            <HiddenTextarea
              title="terminal-input"
              id="terminal-input"
              autoComplete="off"
              spellCheck="false"
              autoFocus
              ref={inputRef}
              value={inputVal}
              onKeyDown={handleKeyDown}
              onChange={handleChange}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
          </ClaudeInputArea>
          <ClaudeBottomLine />
          {inputVal.startsWith(terminalConfig.autocompleteTrigger) ? (
            <CommandsList aria-hidden="true">
              {filteredCommands.map(({ cmd, desc }, index) => (
                <CommandItem
                  key={cmd}
                  $selected={index === selectedCommandIndex}
                >
                  <CommandName>
                    {terminalConfig.autocompleteTrigger}
                    {cmd}
                  </CommandName>
                  <span>{desc}</span>
                </CommandItem>
              ))}
            </CommandsList>
          ) : inputVal === terminalConfig.helpTrigger ? (
            <ShortcutsGrid aria-hidden="true">
              <ShortcutItem>
                {terminalConfig.autocompleteTrigger} for commands
              </ShortcutItem>
              <ShortcutItem>
                {terminalConfig.helpTrigger} for help
              </ShortcutItem>
              <ShortcutItem>tab to complete command</ShortcutItem>
              <ShortcutItem>shift + ⏎ for newline</ShortcutItem>
              <ShortcutItem>ctrl + c to clear prompt</ShortcutItem>
            </ShortcutsGrid>
          ) : (
            <InputHint aria-hidden="true">
              {terminalConfig.helpTrigger} for shortcuts
            </InputHint>
          )}
        </ClaudeInputContainer>
      </Form>
      )}

      {cmdHistory.map((entry, index) => (
        <CommandHistoryItem
          key={entry.id}
          cmdH={entry.command}
          displayCommand={entry.displayCommand}
          entryId={entry.id}
          index={index}
          cmdHistory={cmdHistory}
          rerender={rerender}
          clearHistory={clearHistory}
          removeFromHistory={removeFromHistory}
          setDismissMessage={setDismissMessage}
          dismissMessage={entry.dismissMessage}
        />
      ))}
    </Wrapper>
  );
}

export default Terminal;

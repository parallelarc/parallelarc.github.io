import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import { commandRegistry } from "../core/CommandRegistry";
import { useCommandSubmission } from "../hooks/useCommandSubmission";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useBlockCaret } from "../hooks/useBlockCaret";
import { useTerminalStore } from "../stores/terminalStore";
import TermInfo from "./TermInfo";
import {
  Form,
  PromptTextarea,
  PromptField,
  BlockCaret,
  InputHint,
  ShortcutsGrid,
  ShortcutItem,
  CommandsList,
  CommandItem,
  CommandName,
  CommandDescription,
  ComposerFooter,
  ComposerActions,
  ComposerButton,
} from "./styles/Terminal.styled";
import {
  ClaudeInputContainer,
  ClaudeTopLine,
  ClaudeInputArea,
  ClaudeBottomLine,
} from "./styles/TerminalInfo.styled";

type Props = {
  inputRef: RefObject<HTMLTextAreaElement>;
  touchMode?: boolean;
};

function TerminalComposer({ inputRef, touchMode = false }: Props) {
  const inputVal = useTerminalStore(s => s.input);
  const selectedIndex = useTerminalStore(s => s.selectedCommandIndex);
  const activeAiId = useTerminalStore(
    s =>
      s.history.find(entry => {
        const status = s.aiEntries[entry.id]?.status;
        return status === "idle" || status === "streaming";
      })?.id
  );
  const setInput = useTerminalStore(s => s.setInput);
  const setSelectedIndex = useTerminalStore(s => s.setSelectedCommandIndex);
  const resetInput = useTerminalStore(s => s.resetInputState);
  const addToHistory = useTerminalStore(s => s.addToHistory);
  const ensureAiEntry = useTerminalStore(s => s.ensureAiEntry);
  const stopAiEntry = useTerminalStore(s => s.stopAiEntry);
  const [browsing, setBrowsing] = useState(false);
  const [menuDismissed, setMenuDismissed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const composing = useRef(false);
  const pendingCaret = useRef<{ value: string; position: number } | null>(null);
  const { caret, refreshCaret } = useBlockCaret(inputRef);

  const query = browsing
    ? ""
    : /^\/[^\s]*$/.test(inputVal)
    ? inputVal.slice(1).toLowerCase()
    : null;
  const commands = commandRegistry
    .getVisible()
    .filter(({ name }) => query !== null && name.startsWith(query));
  const menuOpen = query !== null && !menuDismissed;
  const activeIndex = selectedIndex < commands.length ? selectedIndex : -1;
  const isAiInput = commandRegistry.resolveInput(inputVal).mode === "ai";
  const canSend =
    menuOpen && activeIndex >= 0
      ? true
      : inputVal.trim().length > 0 && !(activeAiId && isAiInput);

  const { handleSubmit } = useCommandSubmission({
    inputVal,
    onAddToHistory: addToHistory,
    onEnsureAiEntry: ensureAiEntry,
    onResetInputState: resetInput,
  });

  useEffect(() => {
    if (!touchMode && window.matchMedia?.("(pointer: fine)").matches) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [inputRef, touchMode]);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "0px";
    input.style.height = `${Math.min(input.scrollHeight, 168)}px`;
    const caret = pendingCaret.current;
    if (caret?.value === inputVal) {
      input.setSelectionRange(caret.position, caret.position);
    }
    pendingCaret.current = null;
    refreshCaret();
  }, [inputVal, inputRef, refreshCaret]);

  useEffect(() => {
    if (menuOpen && activeIndex >= 0) {
      document
        .getElementById(`terminal-command-${activeIndex}`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [menuOpen, activeIndex, query]);

  const focusInput = (position?: number) => {
    const input = inputRef.current;
    if (!input) return;
    input.focus({ preventScroll: true });
    if (position === undefined) return;
    const value = useTerminalStore.getState().input;
    if (input.value === value) input.setSelectionRange(position, position);
    else pendingCaret.current = { value, position };
  };
  const completeCommand = (index: number) => {
    const command = commands[index];
    if (!command) return;
    const completed = `/${command.name} `;
    setInput(completed);
    setMenuDismissed(true);
    setBrowsing(false);
    focusInput(completed.length);
  };
  const runCommand = (index: number) => {
    const command = commands[index];
    if (!command) return;
    addToHistory(`/${command.name}`);
    resetInput();
    setMenuDismissed(true);
    setBrowsing(false);
  };
  const stopResponse = () => {
    if (!activeAiId) return false;
    stopAiEntry(activeAiId);
    return true;
  };
  const dismissPanel = () => {
    if (showHelp) {
      setShowHelp(false);
      return true;
    }
    if (menuOpen) {
      setMenuDismissed(true);
      setBrowsing(false);
      return true;
    }
    return false;
  };
  const navigateHistory = (direction: "up" | "down") => {
    useTerminalStore.getState().navigateHistory(direction);
    setMenuDismissed(true);
    focusInput(useTerminalStore.getState().input.length);
  };
  const { handleKeyDown } = useKeyboardShortcuts({
    menuOpen,
    commandCount: commands.length,
    selectedCommandIndex: activeIndex,
    isComposing: () => composing.current,
    onSelectCommand: setSelectedIndex,
    onCompleteCommand: completeCommand,
    onRunCommand: runCommand,
    onDismiss: dismissPanel,
    onResetInput: () => {
      resetInput();
      setBrowsing(false);
      setMenuDismissed(true);
    },
    onNavigateHistory: navigateHistory,
    onToggleHelp: () => setShowHelp(value => !value),
    onSubmit: () => inputRef.current?.form?.requestSubmit(),
    onStop: stopResponse,
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    if (!canSend || composing.current) {
      event.preventDefault();
      return;
    }
    if (menuOpen && activeIndex >= 0) {
      event.preventDefault();
      runCommand(activeIndex);
      return;
    }
    setShowHelp(false);
    setBrowsing(false);
    setMenuDismissed(true);
    handleSubmit(event);
    focusInput();
  };

  return (
    <Form onSubmit={submit} aria-label="Terminal prompt">
      <ClaudeInputContainer>
        {menuOpen && (
          <CommandsList
            id="terminal-commands"
            role="listbox"
            aria-label="Commands"
          >
            {commands.length === 0 ? (
              <InputHint role="status">
                No matching commands. Try /about or /blogs.
              </InputHint>
            ) : (
              commands.map(({ name: cmd, description: desc }, index) => (
                <CommandItem
                  key={cmd}
                  id={`terminal-command-${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  $selected={index === activeIndex}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() =>
                    touchMode ? runCommand(index) : completeCommand(index)
                  }
                >
                  <CommandName>/{cmd}</CommandName>
                  <CommandDescription>{desc}</CommandDescription>
                </CommandItem>
              ))
            )}
          </CommandsList>
        )}
        <ClaudeTopLine />
        <ClaudeInputArea>
          <label htmlFor="terminal-input" aria-label="Terminal prompt">
            <TermInfo />
          </label>
          <PromptField>
            <PromptTextarea
              $overlayCaret={caret !== null}
              id="terminal-input"
              title="terminal-input"
              aria-label="Message or command"
              ref={inputRef}
              rows={1}
              value={inputVal}
              autoComplete="off"
              spellCheck={false}
              placeholder="Ask about me, or / for commands"
              aria-describedby="terminal-hint"
              aria-controls={menuOpen ? "terminal-commands" : undefined}
              aria-autocomplete="list"
              aria-activedescendant={
                menuOpen && activeIndex >= 0
                  ? `terminal-command-${activeIndex}`
                  : undefined
              }
              onKeyDown={handleKeyDown}
              onChange={event => {
                setBrowsing(false);
                setInput(event.target.value);
                setSelectedIndex(0);
                setMenuDismissed(false);
              }}
              onCompositionStart={() => {
                composing.current = true;
              }}
              onCompositionEnd={() => {
                composing.current = false;
              }}
            />
            {caret && (
              <BlockCaret
                key={`${caret.revision}:${caret.left}:${caret.top}:${caret.text}`}
                aria-hidden="true"
                data-testid="block-caret"
                style={{
                  left: caret.left,
                  top: caret.top,
                  width: caret.width,
                  height: caret.height,
                  lineHeight: `${caret.height}px`,
                }}
              >
                {caret.text}
              </BlockCaret>
            )}
          </PromptField>
        </ClaudeInputArea>
        <ClaudeBottomLine />
        <ComposerFooter>
          <ComposerActions>
            <ComposerButton
              type="button"
              aria-label="Browse commands"
              aria-expanded={menuOpen}
              onClick={() => {
                if (menuOpen) {
                  setBrowsing(false);
                  setMenuDismissed(true);
                } else {
                  setBrowsing(true);
                  setSelectedIndex(0);
                  setMenuDismissed(false);
                }
                if (!touchMode) focusInput();
              }}
            >
              / commands
            </ComposerButton>
            <ComposerButton
              type="button"
              aria-label="Keyboard shortcuts"
              aria-expanded={showHelp}
              onClick={() => setShowHelp(value => !value)}
            >
              ? help
            </ComposerButton>
          </ComposerActions>
          <InputHint id="terminal-hint" role="status">
            {activeAiId
              ? "responding · esc to stop"
              : "enter to send · shift+enter for newline"}
          </InputHint>
          <ComposerActions>
            {activeAiId && (
              <ComposerButton
                type="button"
                onClick={stopResponse}
                aria-label="Stop response"
              >
                ■ stop
              </ComposerButton>
            )}
            <ComposerButton
              type="submit"
              disabled={!canSend}
              aria-label="Send message"
            >
              ↵ send
            </ComposerButton>
          </ComposerActions>
        </ComposerFooter>
        {showHelp && (
          <ShortcutsGrid aria-label="Keyboard shortcuts">
            <ShortcutItem>/ for commands</ShortcutItem>
            <ShortcutItem>↑↓ to select or recall</ShortcutItem>
            <ShortcutItem>tab to complete</ShortcutItem>
            <ShortcutItem>shift + enter for newline</ShortcutItem>
            <ShortcutItem>esc to close or stop</ShortcutItem>
            <ShortcutItem>ctrl + c to clear or stop</ShortcutItem>
          </ShortcutsGrid>
        )}
      </ClaudeInputContainer>
    </Form>
  );
}

export default TerminalComposer;

import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import CommandHistoryItem from "./CommandHistoryItem";
import TermInfo from "./TermInfo";
import {
  CopyToast,
  CrashBadge,
  CrashButton,
  CrashHint,
  CrashMessage,
  CrashTitle,
  CrashWrapper,
  Form,
  Hints,
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

export const commands: Command[] = [
  { cmd: "about", desc: "about me", tab: 8 },
  { cmd: "blog", desc: "open blog interface", tab: 8 },
  { cmd: "clear", desc: "clear the terminal", tab: 8 },
  { cmd: "contact", desc: "feel free to reach out", tab: 6 },
  { cmd: "education", desc: "my education background", tab: 4 },
  { cmd: "projects", desc: "some work, in no particular order", tab: 5 },
  { cmd: "themes", desc: "check available themes", tab: 7 },
  { cmd: "welcome", desc: "display hero section", tab: 6 },
];

export type Term = {
  arg: string[];
  history: string[];
  rerender: boolean;
  index: number;
  clearHistory?: () => void;
};

export const termContext = createContext<Term>({
  arg: [],
  history: [],
  rerender: false,
  index: 0,
});

function Terminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [inputVal, setInputVal] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [cmdHistory, setCmdHistory] = useState<string[]>(["welcome"]);
  const [rerender, setRerender] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState(commands);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);

  const resetInputState = useCallback(() => {
    setInputVal("");
    setSelectedCommandIndex(0);
    setCursorPosition(0);
  }, []);

  const syncCursorPosition = useCallback((position: number) => {
    setCursorPosition(position);
    if (inputRef.current) {
      inputRef.current.setSelectionRange(position, position);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setCmdHistory(["welcome"]);
    resetInputState();
  }, [resetInputState]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setRerender(false);
      const newValue = e.target.value;
      setInputVal(newValue);
      setCursorPosition(e.target.selectionStart ?? newValue.length);
    },
    []
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCrashed) return;

    const trimmedInput = inputVal.trim();
    if (!trimmedInput) {
      resetInputState();
      return;
    }

    if (trimmedInput.toLowerCase() === "sudo rm -rf /") {
      setIsCrashed(true);
      resetInputState();
      return;
    }

    setCmdHistory([trimmedInput, ...cmdHistory]);
    setInputVal("");
    setRerender(true);
    setSelectedCommandIndex(0);
    setCursorPosition(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setRerender(false);
    if (isCrashed) {
      e.preventDefault();
      return;
    }

    const ctrlI = e.ctrlKey && e.key.toLowerCase() === "i";
    const ctrlC = e.ctrlKey && e.key.toLowerCase() === "c";
    const isSlashMode = inputVal.startsWith("/");

    // Ctrl+C - Clear input
    if (ctrlC) {
      e.preventDefault();
      resetInputState();
      return;
    }

    // Escape - Exit command selection mode
    if (e.key === "Escape" && isSlashMode && selectedCommandIndex >= 0) {
      e.preventDefault();
      setSelectedCommandIndex(-1);
      return;
    }

    // Shift + Enter - Allow default newline behavior
    if (e.key === "Enter" && e.shiftKey) {
      return;
    }

    // Enter in slash mode - Execute selected command
    if (isSlashMode && e.key === "Enter") {
      e.preventDefault();
      const selectedCmd = filteredCommands[selectedCommandIndex]?.cmd;
      if (selectedCmd) {
        setCmdHistory(["/" + selectedCmd, ...cmdHistory]);
        setInputVal("");
        setRerender(true);
        setSelectedCommandIndex(0);
      }
      return;
    }

    // Enter - Submit form
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
        setSelectedCommandIndex((prev) =>
          prev <= 0 ? filteredCommands.length - 1 : prev - 1
        );
        return;
      }

      // ArrowDown - Navigate down (cyclic)
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedCommandIndex((prev) =>
          prev >= filteredCommands.length - 1 ? 0 : prev + 1
        );
        return;
      }

      // Tab - Autocomplete selected command
      if (e.key === "Tab" || ctrlI) {
        e.preventDefault();
        if (selectedCommandIndex >= 0) {
          const selectedCmd = filteredCommands[selectedCommandIndex]?.cmd;
          if (selectedCmd) {
            setInputVal("/" + selectedCmd);
            syncCursorPosition(selectedCmd.length + 1);
            setSelectedCommandIndex(-1);
          }
        }
        return;
      }

      // ArrowLeft/Right - Disable when command is selected
      if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && selectedCommandIndex >= 0) {
        e.preventDefault();
        return;
      }
    }

    // Cursor movement keys (only when not using modifiers)
    if (!e.ctrlKey && !e.metaKey) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        syncCursorPosition(Math.max(0, cursorPosition - 1));
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        syncCursorPosition(Math.min(inputVal.length, cursorPosition + 1));
        return;
      }

      if (e.key === "Home") {
        e.preventDefault();
        syncCursorPosition(0);
        return;
      }

      if (e.key === "End") {
        e.preventDefault();
        syncCursorPosition(inputVal.length);
        return;
      }
    }
  };

  // Filter commands when input changes
  useEffect(() => {
    if (inputVal.startsWith("/")) {
      const filtered = commands.filter(({ cmd }) => cmd.startsWith(inputVal.slice(1)));
      setFilteredCommands(filtered);
      setSelectedCommandIndex(0);
    } else {
      setFilteredCommands(commands);
    }
  }, [inputVal]);

  // Copy to clipboard handler
  useEffect(() => {
    const handleMouseUp = () => {
      if (isCrashed) return;
      const containerEl = containerRef.current;
      const selection = window.getSelection();

      if (
        !containerEl ||
        !selection ||
        selection.isCollapsed ||
        !selection.anchorNode ||
        !selection.focusNode ||
        !containerEl.contains(selection.anchorNode) ||
        !containerEl.contains(selection.focusNode)
      ) {
        return;
      }

      const selectedText = selection.toString();
      if (!selectedText.trim()) return;

      const triggerToast = () => {
        setShowCopyToast(true);
        if (toastTimerRef.current) {
          clearTimeout(toastTimerRef.current);
        }
        toastTimerRef.current = setTimeout(() => {
          setShowCopyToast(false);
        }, 2200);
      };

      if (navigator?.clipboard?.writeText) {
        navigator.clipboard
          .writeText(selectedText)
          .then(triggerToast)
          .catch(() => {
            // Silently fail if clipboard API doesn't work
          });
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, [isCrashed]);

  // Global keyboard listener: focus input on any key press except ESC
  useEffect(() => {
    if (isCrashed) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") return;

      const activeElement = document.activeElement;
      const isTypingInOtherInput =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.getAttribute("contenteditable") === "true");

      if (activeElement === inputRef.current || isTypingInOtherInput) return;

      if (inputRef.current && containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
        inputRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const input = inputRef.current;
            if (input) {
              input.focus();
              const currentPos = input.selectionStart || 0;
              input.setSelectionRange(currentPos, currentPos);
            }
          });
        });
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isCrashed]);

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  if (isCrashed) {
    return (
      <CrashWrapper role="alert" aria-live="assertive">
        <CrashBadge>kernel panic</CrashBadge>
        <CrashTitle data-glitch="SYSTEM HALTED">SYSTEM HALTED</CrashTitle>
        <CrashMessage>
          You tried to execute <strong>sudo rm -rf /</strong>. The filesystem
          fought back, and the terminal went dark. A full reboot (refresh) is
          now required.
        </CrashMessage>
        <CrashHint>Press ⌘ + R / Ctrl + R to recover</CrashHint>
        <CrashButton type="button" onClick={() => window.location.reload()}>
          force reboot
        </CrashButton>
      </CrashWrapper>
    );
  }

  return (
    <Wrapper data-testid="terminal-wrapper" ref={containerRef}>
      {showCopyToast && (
        <CopyToast role="status" aria-live="polite">
          <span aria-hidden="true">✨</span> Copied to clipboard
        </CopyToast>
      )}
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
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
            />
          </ClaudeInputArea>
          <ClaudeBottomLine />
          {inputVal.startsWith("/") ? (
            <CommandsList aria-hidden="true">
              {filteredCommands.map(({ cmd, desc }, index) => (
                <CommandItem
                  key={cmd}
                  $selected={index === selectedCommandIndex}
                >
                  <CommandName>/{cmd}</CommandName>
                  <span>{desc}</span>
                </CommandItem>
              ))}
            </CommandsList>
          ) : inputVal === "?" ? (
            <ShortcutsGrid aria-hidden="true">
              <ShortcutItem>/ for commands</ShortcutItem>
              <ShortcutItem>? for help</ShortcutItem>
              <ShortcutItem>tab to complete command</ShortcutItem>
              <ShortcutItem>shift + ⏎ for newline</ShortcutItem>
              <ShortcutItem>ctrl + c to clear prompt</ShortcutItem>
            </ShortcutsGrid>
          ) : (
            <InputHint aria-hidden="true">? for shortcuts</InputHint>
          )}
        </ClaudeInputContainer>
      </Form>

      {cmdHistory.map((cmdH, index) => (
        <CommandHistoryItem
          key={`${cmdH}_${index}`}
          cmdH={cmdH}
          index={index}
          cmdHistory={cmdHistory}
          rerender={rerender}
          clearHistory={clearHistory}
        />
      ))}
    </Wrapper>
  );
}

export default Terminal;

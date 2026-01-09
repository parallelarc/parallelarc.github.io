import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import _ from "lodash";
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
  HiddenInput,
  HiddenTextarea,
  InputDisplay,
  DisplayText,
  BlockCursor,
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
import { argTab } from "../utils/funcs";

type Command = {
  cmd: string;
  desc: string;
  tab: number;
}[];

export const commands: Command = [
  { cmd: "/about", desc: "about me", tab: 8 },
  { cmd: "/blog", desc: "open blog interface", tab: 8 },
  { cmd: "/clear", desc: "clear the terminal", tab: 8 },
  { cmd: "/education", desc: "my education background", tab: 4 },
  {
    cmd: "/contact",
    desc: "feel free to reach out",
    tab: 6
  },
  { cmd: "/projects", desc: "some work, in no particular order", tab: 5 },
  { cmd: "/themes", desc: "check available themes", tab: 7 },
  { cmd: "/welcome", desc: "display hero section", tab: 6 },
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

const Terminal = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [inputVal, setInputVal] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [cmdHistory, setCmdHistory] = useState<string[]>(["/welcome"]);
  const [rerender, setRerender] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [pointer, setPointer] = useState(-1);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState(commands);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHistory = () => {
    setCmdHistory(["/welcome"]);
    setHints([]);
    setCursorPosition(0);
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setRerender(false);
      const newValue = e.target.value;
      setInputVal(newValue);
      // 获取原生输入框的实际光标位置
      const selectionStart = (e.target as HTMLTextAreaElement).selectionStart;
      setCursorPosition(selectionStart ?? newValue.length);
    },
    []
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCrashed) return;
    const trimmedInput = _.trim(inputVal);
    if (!trimmedInput) {
      setInputVal("");
      setHints([]);
      setPointer(-1);
      setCursorPosition(0);
      return;
    }
    if (trimmedInput.toLowerCase() === "sudo rm -rf /") {
      triggerCrash();
      return;
    }

    setCmdHistory([trimmedInput, ...cmdHistory]);
    setInputVal("");
    setRerender(true);
    setHints([]);
    setPointer(-1);
    setSelectedCommandIndex(-1);
    setCursorPosition(0);
  };

  const triggerCrash = () => {
    setIsCrashed(true);
    setInputVal("");
    setHints([]);
    setPointer(-1);
    setSelectedCommandIndex(-1);
    setCursorPosition(0);
    crashTimerRef.current = setTimeout(() => {
      setShowCopyToast(false);
    }, 0);
  };


  // Keyboard Press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setRerender(false);
    if (isCrashed) {
      e.preventDefault();
      return;
    }
    const ctrlI = e.ctrlKey && e.key.toLowerCase() === "i";
    const ctrlC = e.ctrlKey && e.key.toLowerCase() === "c";
    const isSlashMode = inputVal.startsWith("/");

    if (ctrlC) {
      e.preventDefault();
      setInputVal("");
      setHints([]);
      setPointer(-1);
      setSelectedCommandIndex(-1);
      setCursorPosition(0);
      return;
    }

    // Escape - 退出命令选择模式
    if (e.key === "Escape") {
      if (isSlashMode && selectedCommandIndex >= 0) {
        e.preventDefault();
        setSelectedCommandIndex(-1);
        return;
      }
    }

    // Shift + Enter - 让 textarea 默认处理换行
    if (e.key === "Enter" && e.shiftKey) {
      // 不阻止默认行为，让 textarea 自然换行
      return;
    }

    // 斜杠模式下按 Enter，执行选中的命令
    if (isSlashMode && e.key === "Enter") {
      e.preventDefault();
      const selectedCmd = filteredCommands[selectedCommandIndex]?.cmd;
      if (selectedCmd) {
        // 直接添加到历史记录，绕过 inputVal 的异步问题
        setCmdHistory([selectedCmd, ...cmdHistory]);
        setInputVal("");
        setRerender(true);
        setSelectedCommandIndex(0);
      }
      return;
    }

    // Enter - 提交表单（阻止默认换行行为）
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      return;
    }

    // 命令列表导航模式
    if (isSlashMode) {
      // ArrowUp - 在命令列表中向上选择（循环）
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedCommandIndex(prev => prev <= 0 ? filteredCommands.length - 1 : prev - 1);
        return;
      }

      // ArrowDown - 在命令列表中向下选择（循环）
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedCommandIndex(prev => prev >= filteredCommands.length - 1 ? 0 : prev + 1);
        return;
      }

      // Tab - 补全选中的命令
      if (e.key === "Tab" || ctrlI) {
        e.preventDefault();
        if (selectedCommandIndex >= 0) {
          const selectedCmd = filteredCommands[selectedCommandIndex]?.cmd;
          if (selectedCmd) {
            setInputVal(selectedCmd);
            setCursorPosition(selectedCmd.length);
            setSelectedCommandIndex(-1);
            if (inputRef.current) {
              inputRef.current.setSelectionRange(selectedCmd.length, selectedCmd.length);
            }
          }
        }
        return;
      }

      // ArrowLeft/Right - 在有选中命令时禁用
      if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && selectedCommandIndex >= 0) {
        e.preventDefault();
        return;
      }
    }

    // Move cursor left
    if (e.key === "ArrowLeft" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const newPos = Math.max(0, cursorPosition - 1);
      setCursorPosition(newPos);
      // 同步原生输入框的光标位置
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    }

    // Move cursor right
    if (e.key === "ArrowRight" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const newPos = Math.min(inputVal.length, cursorPosition + 1);
      setCursorPosition(newPos);
      // 同步原生输入框的光标位置
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    }

    // Handle Home key
    if (e.key === "Home") {
      e.preventDefault();
      setCursorPosition(0);
      // 同步原生输入框的光标位置
      if (inputRef.current) {
        inputRef.current.setSelectionRange(0, 0);
      }
    }

    // Handle End key
    if (e.key === "End") {
      e.preventDefault();
      setCursorPosition(inputVal.length);
      // 同步原生输入框的光标位置
      if (inputRef.current) {
        inputRef.current.setSelectionRange(inputVal.length, inputVal.length);
      }
    }
  };

  // For caret position at the end - 只在 inputRef 或 pointer 改变时 focus
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef?.current?.focus();
    }, 1);
    return () => clearTimeout(timer);
  }, [inputRef, pointer]);

  // 监听 inputVal 变化，输入 "/" 时选中第一条命令
  useEffect(() => {
    if (inputVal === "/") {
      setSelectedCommandIndex(0);
    }
  }, [inputVal]);

  // 当 inputVal 以 / 开头时，过滤命令列表
  useEffect(() => {
    if (inputVal.startsWith("/")) {
      if (inputVal === "/") {
        setFilteredCommands(commands);
        setSelectedCommandIndex(0);
      } else {
        const filtered = commands.filter(({ cmd }) =>
          cmd.startsWith(inputVal)
        );
        setFilteredCommands(filtered);
        setSelectedCommandIndex(0);
      }
    } else {
      setFilteredCommands(commands);
    }
  }, [inputVal]);

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

      const tryLegacyCopy = () => {
        try {
          return document.execCommand("copy");
        } catch {
          return false;
        }
      };

      if (navigator?.clipboard?.writeText) {
        navigator.clipboard
          .writeText(selectedText)
          .then(triggerToast)
          .catch(() => {
            if (tryLegacyCopy()) triggerToast();
          });
        return;
      }

      if (tryLegacyCopy()) triggerToast();
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
      // Don't focus if ESC is pressed
      if (e.key === "Escape") return;

      // Don't interfere if user is typing in another input/textarea/contenteditable
      const activeElement = document.activeElement;
      const isTypingInOtherInput =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.getAttribute("contenteditable") === "true");

      // If user is already typing in our input, no need to refocus
      if (activeElement === inputRef.current) return;

      // If user is typing in another input field, don't interfere
      if (isTypingInOtherInput) return;

      // Scroll to input first, then focus
      // This ensures the input is visible before focusing
      if (inputRef.current) {
        // First, ensure the container is scrolled to show the input
        // Since input is at bottom (column-reverse), scroll container to bottom
        if (containerRef.current) {
          const container = containerRef.current;
          // Scroll container to bottom to reveal input
          container.scrollTop = container.scrollHeight;
        }
        
        // Then scroll input into view (handles page-level scrolling)
        // block: "center" ensures input is visible in viewport
        inputRef.current.scrollIntoView({ 
          behavior: "smooth", 
          block: "center",
          inline: "nearest"
        });
        
        // Focus after a short delay to ensure scroll starts
        // Using requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const input = inputRef.current;
            if (input) {
              input.focus();
              // 恢复光标位置 - 直接从输入框读取当前光标位置
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

  useEffect(() => {
    return () => {
      if (crashTimerRef.current) {
        clearTimeout(crashTimerRef.current);
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
      {hints.length > 1 && (
        <div>
          {hints.map(hCmd => (
            <Hints key={hCmd}>{hCmd}</Hints>
          ))}
        </div>
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
                  // 空输入时显示 placeholder，光标覆盖第一个字符
                  isInputFocused ? (
                    <>
                      <CursorChar>s</CursorChar>
                      hare an idea with me
                    </>
                  ) : (
                    "share an idea with me"
                  )
                ) : (
                  // 有输入时，按光标位置分割文本
                  <>
                    {inputVal.slice(0, cursorPosition)}
                    <CursorChar>
                      {inputVal[cursorPosition] || " "}
                    </CursorChar>
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
                  <CommandName>{cmd}</CommandName>
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
};

export default Terminal;

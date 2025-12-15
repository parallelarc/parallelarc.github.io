import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import _ from "lodash";
import Output from "./Output";
import TermInfo from "./TermInfo";
import {
  CmdNotFound,
  CopyToast,
  CrashBadge,
  CrashButton,
  CrashHint,
  CrashMessage,
  CrashTitle,
  CrashWrapper,
  Empty,
  Form,
  Hints,
  Input,
  InputHint,
  MobileBr,
  MobileSpan,
  PromptBlock,
  Wrapper,
} from "./styles/Terminal.styled";
import { argTab } from "../utils/funcs";

const normalizeBaseUrl = (url: string) =>
  url.endsWith("/") ? url.slice(0, -1) : url;

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type Command = {
  cmd: string;
  desc: string;
  tab: number;
}[];

export const commands: Command = [
  { cmd: "about", desc: "about me", tab: 8 },
  { cmd: "hi", desc: "chat with my AI copilot", tab: 11 },
  { cmd: "hello", desc: "chat with my AI copilot", tab: 11 },
  { cmd: "clear", desc: "clear the terminal", tab: 8 },
  { cmd: "echo", desc: "print out anything", tab: 9 },
  { cmd: "education", desc: "my education background", tab: 4 },
  {
    cmd: "contact",
    desc: "feel free to reach out",
    tab: 6
  },
  { cmd: "help", desc: "check available commands", tab: 9 },
  { cmd: "history", desc: "view command history", tab: 6 },
  { cmd: "export", desc: "set environment variables", tab: 7 },
  { cmd: "env", desc: "view environment variables", tab: 10 },
  { cmd: "projects", desc: "some work, in no particular order", tab: 5 },
  { cmd: "themes", desc: "check available themes", tab: 7 },
  { cmd: "welcome", desc: "display hero section", tab: 6 },
];

type Term = {
  arg: string[];
  history: string[];
  rerender: boolean;
  index: number;
  clearHistory?: () => void;
  chat: {
    messages: ChatMessage[];
    loading: boolean;
    error: string | null;
    configured: boolean;
  };
  setEnv?: (name: string, value: string) => void;
};

export const termContext = createContext<Term>({
  arg: [],
  history: [],
  rerender: false,
  index: 0,
  chat: {
    messages: [],
    loading: false,
    error: null,
    configured: false,
  },
  setEnv: undefined,
});

const Terminal = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hiAbortRef = useRef<AbortController | null>(null);

  const [inputVal, setInputVal] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>(["welcome"]);
  const [rerender, setRerender] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [pointer, setPointer] = useState(-1);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const defaultChatGreeting =
    "╭────────────────────────────────────────────╮\n" +
    "│ >_ OpenAI Compatible (0.42.0)              │\n" +
    "│                                            │\n" +
    "│ model:     Qwen3-Next-80B-A3B-Instruct     │\n" +
    "│ directory: ~                               │\n" +
    "╰────────────────────────────────────────────╯\n" +
    "\nPress Ctrl+C to exit chat mode.";
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: defaultChatGreeting },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [openAiApiKey, setOpenAiApiKey] = useState(
    import.meta.env.OPENAI_API_KEY || ""
  );
  const [openAiBaseUrl, setOpenAiBaseUrl] = useState(
    normalizeBaseUrl(
      import.meta.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
    )
  );
  const [openAiModel, setOpenAiModel] = useState(
    import.meta.env.OPENAI_MODEL || "gpt-4o-mini"
  );
  const [systemPrompt, setSystemPrompt] = useState(
    import.meta.env.OPENAI_SYSTEM_PROMPT ||
      "You are an enthusiastic yet concise AI concierge for Ren Jianwei's interactive terminal portfolio. Keep answers grounded in Ren's work and experience."
  );
  const chatConfigured = Boolean(openAiApiKey);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRerender(false);
      setInputVal(e.target.value);
    },
    [inputVal]
  );

  const sendHiPrompt = useCallback(
    async (prompt: string) => {
      if (!chatConfigured) {
        setChatError(
          "Missing API key. Please set OPENAI_API_KEY in your environment and try again."
        );
        return;
      }

      const userMessage = prompt.trim() ? prompt : "hi";
      const nextConversation = [
        ...chatMessages,
        { role: "user", content: userMessage } as ChatMessage,
      ];

      setChatMessages(nextConversation);
      setChatLoading(true);
      setChatError(null);

      if (hiAbortRef.current) {
        hiAbortRef.current.abort();
      }
      const controller = new AbortController();
      hiAbortRef.current = controller;

      try {
        const response = await fetch(`${openAiBaseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiApiKey}`,
          },
          body: JSON.stringify({
            model: openAiModel,
            messages: [
              { role: "system", content: systemPrompt },
              ...nextConversation.map(message => ({
                role: message.role,
                content: message.content,
              })),
            ],
            temperature: 0.7,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "LLM request failed");
        }

        const payload = await response.json();
        const assistantReply =
          payload?.choices?.[0]?.message?.content?.trim() ??
          "No response was returned by the model.";

        setChatMessages(prev => [
          ...prev,
          { role: "assistant", content: assistantReply },
        ]);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setChatError(
          error instanceof Error
            ? error.message
            : "Failed to send request. Please try again later."
        );
      } finally {
        setChatLoading(false);
      }
    },
    [
      chatConfigured,
      chatMessages,
      openAiApiKey,
      openAiBaseUrl,
      openAiModel,
      systemPrompt,
    ]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCrashed) return;
    const trimmedInput = _.trim(inputVal);
    if (!trimmedInput) {
      setInputVal("");
      setHints([]);
      setPointer(-1);
      return;
    }
    if (trimmedInput.toLowerCase() === "sudo rm -rf /") {
      triggerCrash();
      return;
    }

    if (isChatMode) {
      void sendHiPrompt(trimmedInput);
      setInputVal("");
      setHints([]);
      setPointer(-1);
      return;
    }

    const commandArray = _.split(trimmedInput, " ");
    const normalizedCommand = _.toLower(commandArray[0]);
    const args = _.drop(commandArray);

    if (
      (normalizedCommand === "hi" || normalizedCommand === "hello") &&
      args.length === 0
    ) {
      setIsChatMode(true);
    }

    setCmdHistory([trimmedInput, ...cmdHistory]);
    setInputVal("");
    setRerender(true);
    setHints([]);
    setPointer(-1);
  };

  const clearHistory = () => {
    setCmdHistory([]);
    setHints([]);
    setChatMessages([{ role: "assistant", content: defaultChatGreeting }]);
    setChatError(null);
    setChatLoading(false);
    setIsChatMode(false);
    if (hiAbortRef.current) {
      hiAbortRef.current.abort();
    }
  };

  const setEnvVar = (name: string, value: string) => {
    const key = name.toUpperCase();
    if (key === "OPENAI_API_KEY") {
      setOpenAiApiKey(value);
    } else if (key === "OPENAI_BASE_URL") {
      setOpenAiBaseUrl(normalizeBaseUrl(value));
    } else if (key === "OPENAI_MODEL") {
      setOpenAiModel(value);
    } else if (key === "OPENAI_SYSTEM_PROMPT") {
      setSystemPrompt(value);
    }
  };

  const triggerCrash = () => {
    setIsCrashed(true);
    setInputVal("");
    setHints([]);
    setPointer(-1);
    setIsChatMode(false);
    if (hiAbortRef.current) {
      hiAbortRef.current.abort();
    }
    crashTimerRef.current = setTimeout(() => {
      setShowCopyToast(false);
    }, 0);
  };

  // focus on input when terminal is clicked
  const handleDivClick = () => {
    if (isCrashed) return;
    inputRef.current && inputRef.current.focus();
  };
  useEffect(() => {
    document.addEventListener("click", handleDivClick);
    return () => {
      document.removeEventListener("click", handleDivClick);
    };
  }, [containerRef, isCrashed]);

  // Keyboard Press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setRerender(false);
    if (isCrashed) {
      e.preventDefault();
      return;
    }
    const ctrlI = e.ctrlKey && e.key.toLowerCase() === "i";
    const ctrlL = e.ctrlKey && e.key.toLowerCase() === "l";
    const ctrlC = e.ctrlKey && e.key.toLowerCase() === "c";

    if (ctrlC) {
      e.preventDefault();
      setInputVal("");
      setHints([]);
      setPointer(-1);
      if (isChatMode) {
        setIsChatMode(false);
      }
      return;
    }

    // if Tab or Ctrl + I
    if (e.key === "Tab" || ctrlI) {
      e.preventDefault();
      if (!inputVal) return;

      let hintsCmds: string[] = [];
      commands.forEach(({ cmd }) => {
        if (cmd === "hi" || cmd === "hello") return;
        if (_.startsWith(cmd, inputVal)) {
          hintsCmds = [...hintsCmds, cmd];
        }
      });

      const returnedHints = argTab(inputVal, setInputVal, setHints, hintsCmds);
      hintsCmds = returnedHints ? [...hintsCmds, ...returnedHints] : hintsCmds;

      // if there are many command to autocomplete
      if (hintsCmds.length > 1) {
        setHints(hintsCmds);
      }
      // if only one command to autocomplete
      else if (hintsCmds.length === 1) {
        const currentCmd = _.split(inputVal, " ");
        setInputVal(
          currentCmd.length !== 1
            ? `${currentCmd[0]} ${currentCmd[1]} ${hintsCmds[0]}`
            : hintsCmds[0]
        );

        setHints([]);
      }
    }

    // if Ctrl + L
    if (ctrlL) {
      clearHistory();
    }

    // Go previous cmd
    if (e.key === "ArrowUp") {
      if (pointer >= cmdHistory.length) return;

      if (pointer + 1 === cmdHistory.length) return;

      setInputVal(cmdHistory[pointer + 1]);
      setPointer(prevState => prevState + 1);
      inputRef?.current?.blur();
    }

    // Go next cmd
    if (e.key === "ArrowDown") {
      if (pointer < 0) return;

      if (pointer === 0) {
        setInputVal("");
        setPointer(-1);
        return;
      }

      setInputVal(cmdHistory[pointer - 1]);
      setPointer(prevState => prevState - 1);
      inputRef?.current?.blur();
    }
  };

  // For caret position at the end
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef?.current?.focus();
    }, 1);
    return () => clearTimeout(timer);
  }, [inputRef, inputVal, pointer]);

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
            try {
              const copied = document.execCommand("copy");
              if (copied) triggerToast();
            } catch {
              /* ignore copy failure */
            }
          });
        return;
      }

      try {
        const copied = document.execCommand("copy");
        if (copied) triggerToast();
      } catch {
        /* ignore copy failure */
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

  useEffect(() => {
    return () => {
      if (crashTimerRef.current) {
        clearTimeout(crashTimerRef.current);
      }
      if (hiAbortRef.current) {
        hiAbortRef.current.abort();
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
        <label htmlFor="terminal-input">
          {isChatMode ? (
            // LLM chat mode: show minimal Codex-style block cursor
            <PromptBlock aria-hidden="true">▌</PromptBlock>
          ) : (
            <>
              <TermInfo />
              <MobileBr />
              <MobileSpan>&#62;</MobileSpan>
            </>
          )}
        </label>
        <Input
          title="terminal-input"
          type="text"
          id="terminal-input"
          placeholder={isChatMode ? "share an idea with me" : ""}
          autoComplete="off"
          spellCheck="false"
          autoFocus
          autoCapitalize="off"
          ref={inputRef}
          value={inputVal}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
        />
      </Form>
      {isChatMode && (
        <InputHint aria-hidden="true">⏎ send · Ctrl+C quit</InputHint>
      )}

      {cmdHistory.map((cmdH, index) => {
        const commandArray = _.split(_.trim(cmdH), " ");
        const normalizedCommand = _.toLower(commandArray[0]);
        const validCommand = _.find(commands, { cmd: normalizedCommand });
        const contextValue = {
          arg: _.drop(commandArray),
          history: cmdHistory,
          rerender,
          index,
          clearHistory,
          chat: {
            messages: chatMessages,
            loading: chatLoading,
            error: chatError,
            configured: chatConfigured,
          },
          setEnv: setEnvVar,
        };
        return (
          <div key={_.uniqueId(`${cmdH}_`)}>
            <div>
              <TermInfo />
              <MobileBr />
              <MobileSpan>&#62;</MobileSpan>
              <span data-testid="input-command">{cmdH}</span>
            </div>
            {validCommand ? (
              <termContext.Provider value={contextValue}>
                <Output index={index} cmd={normalizedCommand} />
              </termContext.Provider>
            ) : cmdH === "" ? (
              <Empty />
            ) : (
              <CmdNotFound data-testid={`not-found-${index}`}>
                command not found: {cmdH}
              </CmdNotFound>
            )}
          </div>
        );
      })}
    </Wrapper>
  );
};

export default Terminal;

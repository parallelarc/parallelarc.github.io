import { useContext, useEffect, useMemo, useRef } from "react";
import { terminalConfig } from "../../config/terminal";
import { AI_PERSONA_PROMPT } from "../../config/aiPersona";
import { WEBSITE_MEMORY_PROMPT } from "../../config/websiteMemory";
import { termContext } from "../../components/Terminal";
import { useTerminalStore } from "../../stores/terminalStore";
import { decodeAiPrompt } from "../../utils/aiInput";
import { LlmMessage, streamLlmResponse } from "../../utils/llm";
import { LoadingDots, StatusText } from "../../components/styles/Commands.styled";
import { AiMeta, AiResponseText } from "../../components/styles/Output.styled";

function AICommand() {
  const { arg, entryId } = useContext(termContext);
  const activeStreamRef = useRef<AbortController | null>(null);

  const decodedPromptFromArgs = useMemo(() => decodeAiPrompt(arg.join(" ")), [arg]);

  const aiEntry = useTerminalStore((state) =>
    entryId ? state.aiEntries[entryId] : undefined
  );
  const aiConversation = useTerminalStore((state) => state.aiConversation);

  const ensureAiEntry = useTerminalStore((state) => state.ensureAiEntry);
  const startAiEntry = useTerminalStore((state) => state.startAiEntry);
  const appendAiResponseChunk = useTerminalStore((state) => state.appendAiResponseChunk);
  const completeAiEntry = useTerminalStore((state) => state.completeAiEntry);
  const failAiEntry = useTerminalStore((state) => state.failAiEntry);
  const addAiConversationTurn = useTerminalStore((state) => state.addAiConversationTurn);

  useEffect(() => {
    if (!entryId) return;
    ensureAiEntry(entryId, decodedPromptFromArgs);
  }, [decodedPromptFromArgs, ensureAiEntry, entryId]);

  useEffect(() => {
    if (!entryId || !aiEntry || aiEntry.status !== "idle") return;
    if (activeStreamRef.current) return;

    const currentPrompt = aiEntry.prompt || decodedPromptFromArgs;
    const recentConversation = aiConversation.slice(-terminalConfig.aiHistoryTurns * 2);
    const contextualMessages: LlmMessage[] = recentConversation.map((item) => ({
      role: item.role,
      content: item.content,
    }));

    startAiEntry(entryId);

    const controller = new AbortController();
    activeStreamRef.current = controller;
    let streamedText = "";
    let timedOut = false;
    const timeoutMs = 45_000;
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    streamLlmResponse({
      messages: [
        { role: "system", content: AI_PERSONA_PROMPT },
        { role: "system", content: WEBSITE_MEMORY_PROMPT },
        ...contextualMessages,
        { role: "user", content: currentPrompt },
      ],
      signal: controller.signal,
      onToken: (token) => {
        streamedText += token;
        appendAiResponseChunk(entryId, token);
      },
    })
      .then(({ provider, model, text }) => {
        const finalText = (text || streamedText).trim();
        completeAiEntry(entryId, { provider, model });

        if (finalText.length > 0) {
          addAiConversationTurn(currentPrompt, finalText);
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError" && !timedOut) {
          return;
        }

        const message = timedOut
          ? `AI response timed out after ${Math.floor(timeoutMs / 1000)}s.`
          : error instanceof Error
            ? error.message
            : "Failed to get AI response.";
        failAiEntry(entryId, message);
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (activeStreamRef.current === controller) {
          activeStreamRef.current = null;
        }
      });
  }, [
    entryId,
    aiEntry,
    aiConversation,
    decodedPromptFromArgs,
    startAiEntry,
    appendAiResponseChunk,
    completeAiEntry,
    failAiEntry,
    addAiConversationTurn,
  ]);

  if (!entryId) {
    return (
      <StatusText data-testid="ai-response" $variant="error">
        Missing AI session id.
      </StatusText>
    );
  }

  const response = aiEntry?.response || "";
  const status = aiEntry?.status || "idle";
  const hasResponse = response.trim().length > 0;

  return (
    <div data-testid="ai-response">
      {hasResponse ? <AiResponseText>{response}</AiResponseText> : null}

      {status === "streaming" && (
        <StatusText $variant="muted">
          <LoadingDots>{hasResponse ? "..." : "Thinking..."}</LoadingDots>
        </StatusText>
      )}

      {status === "error" && aiEntry?.error && (
        <StatusText $variant="error">{aiEntry.error}</StatusText>
      )}

      {status === "done" && aiEntry?.provider && aiEntry?.model && (
        <AiMeta>
          {aiEntry.provider} · {aiEntry.model}
        </AiMeta>
      )}
    </div>
  );
}

export default AICommand;

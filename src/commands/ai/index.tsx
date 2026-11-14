import { useContext, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { terminalConfig } from "../../config/terminal";
import { AI_PERSONA_PROMPT } from "../../config/aiPersona";
import { termContext } from "../../contexts/TerminalContext";
import { useBlogStore } from "../../stores/blogStore";
import { BLOG_CONFIG } from "../../config/blog";
import { siteContent } from "../../content/siteData";
import { useTerminalStore } from "../../stores/terminalStore";
import { buildWebsiteContextPrompt } from "../../utils/content/contextBuilder";
import { LlmMessage, streamLlmResponse } from "../../utils/llm";
import {
  LoadingDots,
  StatusText,
} from "../../components/styles/Commands.styled";
import { AiMeta, AiResponseText } from "../../components/styles/Output.styled";

function AICommand() {
  const { arg, entryId } = useContext(termContext);
  const activeStreamRef = useRef<AbortController | null>(null);

  const promptFromArgs = arg.join(" ");

  const aiEntry = useTerminalStore(state =>
    entryId ? state.aiEntries[entryId] : undefined
  );
  useEffect(() => {
    if (!entryId) return;
    const controller = new AbortController();
    let disposed = false;
    let started = false;
    let timeoutId: number | undefined;
    let timedOut = false;
    const timeoutMs = 45_000;

    // Defer until mount settles, so React Strict Mode cannot start two requests.
    queueMicrotask(async () => {
      if (disposed) return;
      const terminal = useTerminalStore.getState();
      terminal.ensureAiEntry(entryId, promptFromArgs);
      const entry = useTerminalStore.getState().aiEntries[entryId];
      if (!entry || entry.status !== "idle") return;
      started = true;
      activeStreamRef.current = controller;
      terminal.startAiEntry(entryId);
      const currentPrompt = entry.prompt || promptFromArgs;
      const contextualMessages: LlmMessage[] = terminal.aiConversation
        .slice(-terminalConfig.aiHistoryTurns * 2)
        .map(({ role, content }) => ({ role, content }));
      timeoutId = window.setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs);

      try {
        const blogPosts = await useBlogStore
          .getState()
          .load(BLOG_CONFIG)
          .catch(() => []);
        controller.signal.throwIfAborted();
        const websiteContextPrompt = buildWebsiteContextPrompt({
          content: siteContent,
          blogPosts,
        });
        const { provider, model, text } = await streamLlmResponse({
          messages: [
            { role: "system", content: AI_PERSONA_PROMPT },
            { role: "system", content: websiteContextPrompt },
            ...contextualMessages,
            { role: "user", content: currentPrompt },
          ],
          signal: controller.signal,
          onToken: token => terminal.appendAiResponseChunk(entryId, token),
        });
        if (disposed) return;
        controller.signal.throwIfAborted();
        const finalText = (
          text ||
          useTerminalStore.getState().aiEntries[entryId]?.response ||
          ""
        ).trim();
        terminal.completeAiEntry(entryId, { provider, model });
        if (finalText) terminal.addAiConversationTurn(currentPrompt, finalText);
      } catch (error: unknown) {
        if (controller.signal.aborted && !timedOut) return;
        const message = timedOut
          ? `AI response timed out after ${Math.floor(timeoutMs / 1000)}s.`
          : error instanceof Error
          ? error.message
          : "Failed to get AI response.";
        terminal.failAiEntry(entryId, message);
      } finally {
        window.clearTimeout(timeoutId);
        if (activeStreamRef.current === controller)
          activeStreamRef.current = null;
      }
    });

    return () => {
      disposed = true;
      controller.abort();
      window.clearTimeout(timeoutId);
      if (started) useTerminalStore.getState().stopAiEntry(entryId);
    };
  }, [entryId, promptFromArgs]);

  useEffect(() => {
    if (aiEntry?.status === "stopped") activeStreamRef.current?.abort();
  }, [aiEntry?.status]);

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
      {hasResponse ? (
        <AiResponseText>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
        </AiResponseText>
      ) : null}

      {status === "streaming" && (
        <StatusText $variant="muted">
          <LoadingDots>{hasResponse ? "..." : "Thinking..."}</LoadingDots>
        </StatusText>
      )}

      {status === "stopped" && (
        <StatusText $variant="muted">Response stopped.</StatusText>
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

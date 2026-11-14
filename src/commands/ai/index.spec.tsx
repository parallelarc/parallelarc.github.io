import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "../../utils/test-utils";
import { termContext, type Term } from "../../contexts/TerminalContext";
import { useTerminalStore } from "../../stores/terminalStore";
import type { BlogPost } from "../../types/github";
import AICommand from "./index";
import { streamLlmResponse } from "../../utils/llm";
import { useBlogStore } from "../../stores/blogStore";

vi.mock("../../utils/llm", async () => {
  const actual = await vi.importActual<typeof import("../../utils/llm")>(
    "../../utils/llm"
  );

  return {
    ...actual,
    streamLlmResponse: vi.fn(),
  };
});

const mockedStreamLlmResponse = vi.mocked(streamLlmResponse);

function createTermContext(overrides: Partial<Term> = {}): Term {
  return {
    arg: ["who are you"],
    index: 0,
    isLatest: true,
    entryId: "ai-entry-test",
    ...overrides,
  };
}

function createBlogPost(title: string): BlogPost {
  return {
    id: 1,
    number: 1,
    title,
    content: "blog content",
    createdAt: "2026-02-10T00:00:00Z",
    updatedAt: "2026-02-10T00:00:00Z",
    author: "parallelarc",
    authorAvatar: "",
    authorUrl: "",
    labels: ["blog", "ai"],
    url: "https://example.com/1",
    commentsCount: 0,
    excerpt: "blog content",
  };
}

function resetAiState() {
  useBlogStore.setState(useBlogStore.getInitialState(), true);
  useTerminalStore.setState({
    aiEntries: {},
    aiConversation: [],
  });
}

describe("AICommand dynamic website context", () => {
  beforeEach(resetAiState);

  afterEach(() => {
    mockedStreamLlmResponse.mockReset();
    vi.restoreAllMocks();
  });

  it("builds website context from the shared blog loader", async () => {
    const runtimePost = createBlogPost("Runtime snapshot post");
    useBlogStore.setState({ posts: [runtimePost] });

    const staticSpy = vi
      .spyOn(useBlogStore.getState(), "load")
      .mockResolvedValue([runtimePost]);

    let capturedMessages: { role: string; content: string }[] = [];
    mockedStreamLlmResponse.mockImplementation(async ({ messages }) => {
      capturedMessages = messages;
      return {
        provider: "openai",
        model: "gpt-4o-mini",
        text: "ok",
      };
    });

    render(
      <termContext.Provider value={createTermContext()}>
        <AICommand />
      </termContext.Provider>
    );

    await waitFor(() => {
      expect(mockedStreamLlmResponse).toHaveBeenCalledTimes(1);
    });

    expect(staticSpy).toHaveBeenCalledTimes(1);
    expect(capturedMessages[1].role).toBe("system");
    expect(capturedMessages[1].content).toContain("[about]");
    expect(capturedMessages[1].content).toContain("Name: Foxiv");
    expect(capturedMessages[1].content).toContain("Runtime snapshot post");
  });

  it("includes posts returned by the shared loader", async () => {
    const staticPost = createBlogPost("Static fallback post");
    const staticSpy = vi
      .spyOn(useBlogStore.getState(), "load")
      .mockResolvedValue([staticPost]);

    let capturedMessages: { role: string; content: string }[] = [];
    mockedStreamLlmResponse.mockImplementation(async ({ messages }) => {
      capturedMessages = messages;
      return {
        provider: "openai",
        model: "gpt-4o-mini",
        text: "ok",
      };
    });

    render(
      <termContext.Provider
        value={createTermContext({ entryId: "ai-entry-static-fallback" })}
      >
        <AICommand />
      </termContext.Provider>
    );

    await waitFor(() => {
      expect(mockedStreamLlmResponse).toHaveBeenCalledTimes(1);
    });

    expect(staticSpy).toHaveBeenCalledTimes(1);
    expect(capturedMessages[1].role).toBe("system");
    expect(capturedMessages[1].content).toContain("Static fallback post");
  });

  it("starts only one stream under React Strict Mode", async () => {
    vi.spyOn(useBlogStore.getState(), "load").mockResolvedValue([]);
    mockedStreamLlmResponse.mockResolvedValue({
      provider: "openai",
      model: "test",
      text: "ok",
    });
    render(
      <StrictMode>
        <termContext.Provider
          value={createTermContext({ entryId: "strict-entry" })}
        >
          <AICommand />
        </termContext.Provider>
      </StrictMode>
    );
    await waitFor(() =>
      expect(
        useTerminalStore.getState().aiEntries["strict-entry"]?.status
      ).toBe("done")
    );
    expect(mockedStreamLlmResponse).toHaveBeenCalledTimes(1);
  });

  it("aborts a stopped stream while preserving the partial response", async () => {
    vi.spyOn(useBlogStore.getState(), "load").mockResolvedValue([]);
    let signal: AbortSignal | undefined;
    mockedStreamLlmResponse.mockImplementation(
      ({ signal: abortSignal, onToken }) => {
        signal = abortSignal;
        onToken("Partial reply");
        return new Promise((_resolve, reject) => {
          abortSignal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError"))
          );
        });
      }
    );
    render(
      <termContext.Provider
        value={createTermContext({ entryId: "stopped-entry" })}
      >
        <AICommand />
      </termContext.Provider>
    );
    await screen.findByText("Partial reply");
    act(() => useTerminalStore.getState().stopAiEntry("stopped-entry"));
    expect(signal?.aborted).toBe(true);
    expect(screen.getByText("Response stopped.")).toBeInTheDocument();
    expect(
      useTerminalStore.getState().aiEntries["stopped-entry"].response
    ).toBe("Partial reply");
    expect(useTerminalStore.getState().aiConversation).toHaveLength(0);
  });
});

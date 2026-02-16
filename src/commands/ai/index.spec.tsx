import { afterEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "../../utils/test-utils";
import { termContext, type Term } from "../../components/Terminal";
import { useTerminalStore } from "../../stores/terminalStore";
import type { BlogPost } from "../../types/github";
import AICommand from "./index";
import { streamLlmResponse } from "../../utils/llm";
import * as contextBuilder from "../../utils/content/contextBuilder";

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
    history: [],
    rerender: false,
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
  useTerminalStore.setState({
    aiEntries: {},
    aiConversation: [],
    blogPostsSnapshot: [],
  });
}

describe("AICommand dynamic website context", () => {
  afterEach(() => {
    resetAiState();
    vi.restoreAllMocks();
  });

  it("builds website context from runtime blog snapshot and injects it into messages", async () => {
    const runtimePost = createBlogPost("Runtime snapshot post");
    useTerminalStore.setState({ blogPostsSnapshot: [runtimePost] });

    const staticSpy = vi
      .spyOn(contextBuilder, "loadStaticBlogPostsSnapshot")
      .mockResolvedValue([]);

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

    expect(staticSpy).not.toHaveBeenCalled();
    expect(capturedMessages[1].role).toBe("system");
    expect(capturedMessages[1].content).toContain("[about]");
    expect(capturedMessages[1].content).toContain("Name: Foxiv");
    expect(capturedMessages[1].content).toContain("Runtime snapshot post");
  });

  it("falls back to static blog snapshot when runtime snapshot is empty", async () => {
    const staticPost = createBlogPost("Static fallback post");
    const staticSpy = vi
      .spyOn(contextBuilder, "loadStaticBlogPostsSnapshot")
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
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  render,
  screen,
  userEvent,
  waitFor,
  within,
} from "../utils/test-utils";
import Terminal from "../components/Terminal";
import { useTerminalStore } from "../stores/terminalStore";
import * as github from "../utils/github";
import { useBlogStore } from "../stores/blogStore";
import { streamLlmResponse } from "../utils/llm";
import type { BlogPost } from "../types/github";

vi.mock("../utils/llm", () => ({ streamLlmResponse: vi.fn() }));

const initialState = useTerminalStore.getInitialState();
const stream = vi.mocked(streamLlmResponse);

function post(number: number, title: string, category: string): BlogPost {
  return {
    id: number,
    number,
    title,
    content: "Article body",
    createdAt: "2026-11-01T00:00:00Z",
    updatedAt: "2026-11-01T00:00:00Z",
    author: "author",
    authorAvatar: "",
    authorUrl: "https://github.com/author",
    labels: ["blog", category],
    url: `https://github.com/owner/repo/issues/${number}`,
    commentsCount: 0,
    excerpt: "Article excerpt",
  };
}

async function setup(touchMode = false) {
  const user = userEvent.setup();
  render(<Terminal touchMode={touchMode} />);
  await screen.findByTestId("welcome");
  const input = screen.getByRole("textbox", {
    name: "Message or command",
  }) as HTMLTextAreaElement;
  return { user, input };
}

describe("Terminal integration", () => {
  beforeEach(() => {
    useTerminalStore.setState(initialState, true);
    useBlogStore.setState(useBlogStore.getInitialState(), true);
    window.history.replaceState(null, "", "#/terminal");
    Element.prototype.scrollIntoView = vi.fn();
    vi.spyOn(github, "fetchBlogPosts").mockResolvedValue([]);
    stream.mockReset();
    stream.mockImplementation(async ({ onToken }) => {
      onToken("A mocked answer.");
      return {
        provider: "openai",
        model: "test-model",
        text: "A mocked answer.",
      };
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it("shows the welcome output and a native, accessible prompt", async () => {
    const { input } = await setup();
    expect(input.tagName).toBe("TEXTAREA");
    expect(input.value).toBe("");
    expect(screen.getByTestId("input-command")).toHaveTextContent("welcome");
    expect(stream).not.toHaveBeenCalled();
  });

  it.each(["about", "contact", "projects"])(
    "renders /%s through the registered command and clears the prompt",
    async command => {
      const { user, input } = await setup();
      await user.type(input, `/${command}{Enter}`);
      expect(await screen.findByTestId(command)).toBeInTheDocument();
      expect(input.value).toBe("");
      expect(screen.getByTestId("welcome")).toBeInTheDocument();
      expect(window.location.hash).toBe("#/terminal");
      expect(stream).not.toHaveBeenCalled();
    }
  );

  it("accepts registered command names without a slash", async () => {
    const { user, input } = await setup();
    await user.type(input, "about{Enter}");
    expect(await screen.findByTestId("about")).toBeInTheDocument();
    expect(stream).not.toHaveBeenCalled();
  });

  it.each(["/missing-command", "/education"])(
    "reports %s as unknown without sending it to AI",
    async command => {
      const { user, input } = await setup();
      await user.type(input, `${command}{Enter}`);
      expect(
        await screen.findByText(`command not found: ${command}`)
      ).toBeInTheDocument();
      expect(screen.queryByTestId("ai-response")).not.toBeInTheDocument();
      expect(stream).not.toHaveBeenCalled();
    }
  );

  it("ignores whitespace without creating output or starting AI", async () => {
    const { user, input } = await setup();
    await user.type(input, "   {Enter}");
    expect(screen.getAllByTestId("input-command")).toHaveLength(1);
    expect(stream).not.toHaveBeenCalled();
  });

  it("streams natural language as AI and displays the original prompt", async () => {
    const { user, input } = await setup();
    await user.type(input, "Who are you?{Enter}");
    expect(await screen.findByText("A mocked answer.")).toBeInTheDocument();
    expect(screen.getAllByTestId("input-command")[0]).toHaveTextContent(
      "Who are you?"
    );
    expect(input.value).toBe("");
    expect(stream).toHaveBeenCalledTimes(1);
    expect(stream).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          { role: "user", content: "Who are you?" },
        ]),
      })
    );
  });

  it("shows AI errors and leaves the prompt usable for a command", async () => {
    stream.mockRejectedValueOnce(new Error("Mock provider unavailable"));
    const { user, input } = await setup();
    await user.type(input, "Tell me more{Enter}");
    expect(
      await screen.findByText("Mock provider unavailable")
    ).toBeInTheDocument();
    await user.type(input, "/about{Enter}");
    expect(await screen.findByTestId("about")).toBeInTheDocument();
    expect(stream).toHaveBeenCalledTimes(1);
  });

  it.each(["about", "contact", "welcome", "clear"])(
    "shows usage for /%s with unexpected arguments",
    async command => {
      const { user, input } = await setup();
      await user.type(input, `/${command} unexpected{Enter}`);
      expect(await screen.findByTestId("usage-output")).toHaveTextContent(
        `Usage: ${command}`
      );
      expect(screen.getByTestId("welcome")).toBeInTheDocument();
      expect(stream).not.toHaveBeenCalled();
    }
  );

  it("allows project arguments without opening a destination automatically", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const { user, input } = await setup();
    await user.type(input, "/projects go 1{Enter}");
    expect(await screen.findByTestId("projects")).toBeInTheDocument();
    expect(screen.queryByTestId("usage-output")).not.toBeInTheDocument();
    expect(open).not.toHaveBeenCalled();
  });

  it("clears command and AI output while retaining the welcome and prompt", async () => {
    const { user, input } = await setup();
    await user.type(input, "/about{Enter}");
    await screen.findByTestId("about");
    await user.type(input, "Who are you?{Enter}");
    await screen.findByText("A mocked answer.");
    await user.type(input, "/clear{Enter}");
    await waitFor(() => {
      expect(screen.getAllByTestId("input-command")).toHaveLength(1);
      expect(screen.queryByTestId("about")).not.toBeInTheDocument();
      expect(screen.queryByTestId("ai-response")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("welcome")).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("");
  });

  it("executes welcome shortcuts inside the terminal", async () => {
    const { user, input } = await setup();
    await user.click(screen.getByRole("button", { name: "/about" }));
    expect(await screen.findByTestId("about")).toBeInTheDocument();
    expect(window.location.hash).toBe("#/terminal");
    expect(input).toBeInTheDocument();
  });

  it("completes a slash command with Tab before rendering it on Enter", async () => {
    const { user, input } = await setup();
    await user.type(input, "/pr");
    await user.tab();
    expect(input.value).toBe("/projects ");
    expect(screen.queryByTestId("projects")).not.toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(await screen.findByTestId("projects")).toBeInTheDocument();
  });

  it("recalls executed commands and restores an editable draft", async () => {
    const { user, input } = await setup();
    await user.type(input, "/about{Enter}");
    await screen.findByTestId("about");
    await user.type(input, "/contact{Enter}");
    await screen.findByTestId("contact");
    await user.type(input, "draft");
    for (const expected of ["/contact", "/about"]) {
      input.setSelectionRange(0, 0);
      await user.keyboard("{ArrowUp}");
      expect(input.value).toBe(expected);
    }
    for (const expected of ["/contact", "draft"]) {
      input.setSelectionRange(input.value.length, input.value.length);
      await user.keyboard("{ArrowDown}");
      expect(input.value).toBe(expected);
    }
    await user.keyboard("!");
    expect(input.value).toBe("draft!");
    expect(screen.getAllByTestId("input-command")).toHaveLength(3);
  });

  it("runs a touch menu command without opening the keyboard or leaving terminal", async () => {
    const { user, input } = await setup(true);
    await user.click(screen.getByRole("button", { name: "Browse commands" }));
    await user.click(screen.getByRole("option", { name: /\/about/ }));
    expect(await screen.findByTestId("about")).toBeInTheDocument();
    expect(document.activeElement).not.toBe(input);
    expect(window.location.hash).toBe("#/terminal");
  });

  it("filters blog arguments in its terminal panel and exits with Escape", async () => {
    vi.mocked(github.fetchBlogPosts).mockResolvedValue([
      post(1, "Podcast notes", "podcast"),
      post(2, "Engineering notes", "tech"),
    ]);
    const { user, input } = await setup();
    await user.type(input, "/blogs tag:podcast{Enter}");
    const blog = await screen.findByRole("region", { name: "Blog" });
    expect(
      await within(blog).findByRole("link", { name: /Podcast notes/ })
    ).toHaveAttribute("href", "https://github.com/owner/repo/issues/1");
    expect(
      within(blog).queryByRole("link", { name: /Engineering notes/ })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(window.location.hash).toBe("#/terminal");
    await user.keyboard("{Escape}");
    expect(screen.getByText("Blog dialog dismissed")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Message or command" })
    ).toBeInTheDocument();
    expect(window.location.hash).toBe("#/terminal");
  });

  it("retries a failed blog request and returns to the prompt by button", async () => {
    vi.mocked(github.fetchBlogPosts)
      .mockRejectedValueOnce(new Error("Mock GitHub unavailable"))
      .mockResolvedValue([post(1, "Recovered article", "tech")]);
    const { user, input } = await setup();
    await user.type(input, "/blogs{Enter}");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Mock GitHub unavailable"
    );
    await user.click(screen.getByRole("button", { name: "[retry]" }));
    expect(
      await screen.findByRole("link", { name: /Recovered article/ })
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back to terminal" }));
    expect(
      screen.getByRole("textbox", { name: "Message or command" })
    ).toBeInTheDocument();
    expect(window.location.hash).toBe("#/terminal");
  });
});

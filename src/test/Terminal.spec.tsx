import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
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
import type { BlogPost } from "../types/github";

const initialState = useTerminalStore.getInitialState();

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
    name: "Command",
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
  });

  afterEach(() => vi.restoreAllMocks());

  it("shows the welcome output and a native, accessible prompt", async () => {
    const { input } = await setup();
    expect(input.tagName).toBe("TEXTAREA");
    expect(input.value).toBe("");
    expect(screen.getByTestId("input-command")).toHaveTextContent("welcome");
  });

  it.each([false, true])(
    "focuses the prompt when clicking terminal content (touch: %s)",
    async touchMode => {
      const { user, input } = await setup(touchMode);
      input.blur();
      await user.click(screen.getByTestId("terminal-wrapper"));
      expect(input).toHaveFocus();

      input.blur();
      await user.click(screen.getByTestId("input-command"));
      expect(input).toHaveFocus();
      await user.keyboard("draft");
      expect(input.value).toBe("draft");
    }
  );

  it("keeps terminal buttons and links focused when clicked", async () => {
    const { user, input } = await setup();
    const shortcut = screen.getByRole("button", { name: "/contact" });
    await user.click(shortcut);
    expect(shortcut).toHaveFocus();
    const contact = await screen.findByTestId("contact");
    const link = within(contact).getAllByRole("link")[0];
    link.addEventListener("click", event => event.preventDefault(), {
      once: true,
    });
    await user.click(link);
    expect(link).toHaveFocus();
    expect(input).not.toHaveFocus();
  });

  it("preserves selected terminal text without focusing the prompt", async () => {
    const { input } = await setup();
    input.blur();
    const output = screen.getByTestId("input-command");
    const selection = window.getSelection();
    if (!selection) throw new Error("Text selection is unavailable");
    const range = document.createRange();
    range.selectNodeContents(output);
    selection.removeAllRanges();
    selection.addRange(range);
    const selectedText = selection.toString();
    try {
      // A drag ends with a click while the selected range is still present.
      fireEvent.click(output);
      expect(input).not.toHaveFocus();
      expect(selection.toString()).toBe(selectedText);
    } finally {
      selection.removeAllRanges();
    }
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
    }
  );

  it("accepts registered command names without a slash", async () => {
    const { user, input } = await setup();
    await user.type(input, "about{Enter}");
    expect(await screen.findByTestId("about")).toBeInTheDocument();
  });

  it.each(["/missing-command", "/education", "/ai"])(
    "reports %s as unknown as an unregistered command",
    async command => {
      const { user, input } = await setup();
      await user.type(input, `${command}{Enter}`);
      expect(
        await screen.findByText(`command not found: ${command}`)
      ).toBeInTheDocument();
    }
  );

  it("ignores whitespace without creating output", async () => {
    const { user, input } = await setup();
    await user.type(input, "   {Enter}");
    expect(screen.getAllByTestId("input-command")).toHaveLength(1);
  });

  it("reports ordinary text as an unknown command and keeps the prompt usable", async () => {
    const { user, input } = await setup();
    await user.type(input, "Who are you?{Enter}");
    expect(
      await screen.findByText("command not found: Who are you?")
    ).toBeInTheDocument();
    expect(input.value).toBe("");
    await user.type(input, "/about{Enter}");
    expect(await screen.findByTestId("about")).toBeInTheDocument();
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

  it("clears command output while retaining the welcome and prompt", async () => {
    const { user, input } = await setup();
    await user.type(input, "/about{Enter}");
    await screen.findByTestId("about");
    await user.type(input, "Who are you?{Enter}");
    await screen.findByText("command not found: Who are you?");
    await user.type(input, "/clear{Enter}");
    await waitFor(() => {
      expect(screen.getAllByTestId("input-command")).toHaveLength(1);
      expect(screen.queryByTestId("about")).not.toBeInTheDocument();
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
      screen.getByRole("textbox", { name: "Command" })
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
      screen.getByRole("textbox", { name: "Command" })
    ).toBeInTheDocument();
    expect(window.location.hash).toBe("#/terminal");
  });
});

import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  userEvent,
  waitFor,
} from "../utils/test-utils";
import { useTerminalStore } from "../stores/terminalStore";
import "../commands";
import TerminalComposer from "./TerminalComposer";

const initialState = useTerminalStore.getInitialState();

function setup() {
  const inputRef = createRef<HTMLTextAreaElement>();
  const user = userEvent.setup();
  render(<TerminalComposer inputRef={inputRef} />);
  return {
    user,
    input: screen.getByRole("textbox", {
      name: "Message or command",
    }) as HTMLTextAreaElement,
  };
}

describe("Terminal composer", () => {
  beforeEach(() => {
    useTerminalStore.setState(initialState, true);
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("browses commands without losing a draft, and dismisses with Escape", async () => {
    const { user, input } = setup();
    await user.type(input, "unfinished draft");
    await user.click(screen.getByRole("button", { name: "Browse commands" }));
    expect(
      screen.getByRole("listbox", { name: "Commands" })
    ).toBeInTheDocument();
    expect(input.value).toBe("unfinished draft");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(input.value).toBe("unfinished draft");
  });

  it("accepts a command by clicking, then submits it with Enter", async () => {
    const { user, input } = setup();
    await user.type(input, "/ab");
    await user.click(screen.getByRole("option", { name: /\/about/ }));
    expect(input.value).toBe("/about ");
    expect(useTerminalStore.getState().history).toHaveLength(1);
    await user.keyboard("{Enter}");
    expect(useTerminalStore.getState().history[0].command).toBe("/about");
  });

  it("runs a touch menu command in terminal history without navigating or focusing the keyboard input", async () => {
    const inputRef = createRef<HTMLTextAreaElement>();
    const originalUrl = window.location.href;
    const user = userEvent.setup();
    render(<TerminalComposer inputRef={inputRef} touchMode />);
    await user.click(screen.getByRole("button", { name: "Browse commands" }));
    expect(document.activeElement).not.toBe(inputRef.current);
    await user.click(screen.getByRole("option", { name: /\/blogs/ }));
    expect(useTerminalStore.getState().history[0].command).toBe("/blogs");
    expect(window.location.href).toBe(originalUrl);
    expect(document.activeElement).not.toBe(inputRef.current);
    expect(useTerminalStore.getState().history).toHaveLength(2);
  });

  it("preserves command arguments when submitting", async () => {
    const { user, input } = setup();
    await user.type(input, "/blogs tag:podcast{Enter}");
    expect(useTerminalStore.getState().history[0].command).toBe(
      "/blogs tag:podcast"
    );
  });

  it("uses the selected command for the touch send button, just like Enter", async () => {
    const { user, input } = setup();
    await user.type(input, "/ab");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(useTerminalStore.getState().history[0].command).toBe("/about");
    expect(input.value).toBe("");
  });

  it("does not submit when Enter confirms a Chinese IME candidate", () => {
    const { input } = setup();
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "你好" } });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(useTerminalStore.getState().history).toHaveLength(1);
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(useTerminalStore.getState().history[0].command).toBe("你好");
  });

  it("supports multiline editing and native text selection", async () => {
    const { user, input } = setup();
    await user.type(input, "first{Shift>}{Enter}{/Shift}second");
    expect(input.value).toBe("first\nsecond");
    input.setSelectionRange(2, 2);
    await user.keyboard("{ArrowUp}");
    expect(useTerminalStore.getState().historyIndex).toBe(-1);
    input.setSelectionRange(0, 5);
    await user.keyboard("{Control>}c{/Control}");
    expect(input.value).toBe("first\nsecond");
  });

  it("recalls history and restores an unsent draft", async () => {
    useTerminalStore.getState().addToHistory("/about");
    const { user, input } = setup();
    await user.type(input, "draft");
    input.setSelectionRange(0, 0);
    await user.keyboard("{ArrowUp}");
    await waitFor(() => expect(input.value).toBe("/about"));
    input.setSelectionRange(input.value.length, input.value.length);
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(input.value).toBe("draft"));
  });

  it("toggles shortcut help without inserting or sending a question mark", async () => {
    const { user, input } = setup();
    await user.type(input, "?");
    expect(input.value).toBe("");
    expect(
      screen.getByLabelText("Keyboard shortcuts", { selector: "div" })
    ).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await user.type(input, "who?");
    expect(input.value).toBe("who?");
  });

  it("keeps the new caret position when editing immediately after recalling history", async () => {
    useTerminalStore.getState().addToHistory("/about");
    const { user, input } = setup();
    const frames: FrameRequestCallback[] = [];
    const raf = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation(callback => {
        frames.push(callback);
        return frames.length;
      });
    try {
      fireEvent.change(input, { target: { value: "draft" } });
      input.setSelectionRange(0, 0);
      fireEvent.keyDown(input, { key: "ArrowUp" });
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.change(input, { target: { value: "line one" } });
      input.setSelectionRange(input.value.length, input.value.length);
      frames.forEach(callback => callback(0));
    } finally {
      raf.mockRestore();
    }
    await user.keyboard("{Shift>}{Enter}{/Shift}line two");
    expect(input.value).toBe("line one\nline two");
  });

  it("stops a response with Escape and keeps its partial output", async () => {
    const store = useTerminalStore.getState();
    const id = store.addToHistory("ai test", { mode: "ai" });
    store.ensureAiEntry(id, "test");
    store.startAiEntry(id);
    store.appendAiResponseChunk(id, "partial response");
    const { user, input } = setup();
    await user.click(input);
    expect(
      screen.getByRole("button", { name: "Stop response" })
    ).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(useTerminalStore.getState().aiEntries[id].status).toBe("stopped");
    store.appendAiResponseChunk(id, "late token");
    store.completeAiEntry(id);
    expect(useTerminalStore.getState().aiEntries[id].response).toBe(
      "partial response"
    );
    expect(useTerminalStore.getState().aiEntries[id].status).toBe("stopped");
  });
});

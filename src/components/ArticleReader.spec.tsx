import { afterEach, expect, it, vi } from "vitest";
import { render, screen, userEvent } from "../utils/test-utils";
import type { BlogPost } from "../types/github";
import ArticleReader from "./ArticleReader";

const post: BlogPost = {
  id: 100,
  number: 12,
  title: "Article title",
  content: "Original body.",
  createdAt: "2026-04-12T00:00:00Z",
  updatedAt: "2026-04-15T00:00:00Z",
  author: "parallelarc",
  authorAvatar: "",
  authorUrl: "https://github.com/parallelarc",
  labels: ["blog"],
  url: "https://github.com/parallelarc/parallelarc.github.io/issues/12",
  commentsCount: 0,
  excerpt: "Original body.",
};

afterEach(() => vi.restoreAllMocks());

it("copies the current shareable hash URL only on an explicit request", async () => {
  const user = userEvent.setup();
  const write = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
  window.history.replaceState(null, "", "#/blogs/12");
  render(<ArticleReader post={post} onBack={vi.fn()} onReady={vi.fn()} />);
  expect(write).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Copy link" }));
  expect(write).toHaveBeenCalledWith(window.location.href);
  expect(screen.getByRole("status")).toHaveTextContent("Link copied");
  expect(window.location.hash).toBe("#/blogs/12");
});

it("keeps the article readable and gives a fallback when copying is unavailable", async () => {
  const user = userEvent.setup();
  vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
    new Error("Clipboard unavailable")
  );
  render(<ArticleReader post={post} onBack={vi.fn()} onReady={vi.fn()} />);
  await user.click(screen.getByRole("button", { name: "Copy link" }));
  expect(screen.getByRole("status")).toHaveTextContent(
    "Copy the link from your browser"
  );
  expect(screen.getByText("Original body.")).toBeInTheDocument();
});

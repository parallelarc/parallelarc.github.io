import { afterEach, describe, expect, it, vi } from "vitest";
import type { BlogPost } from "../../types/github";
import {
  buildWebsiteContextPrompt,
  loadStaticBlogPostsSnapshot,
} from "./contextBuilder";

const MOCK_POSTS: BlogPost[] = [
  {
    id: 101,
    number: 11,
    title: "Agent eval checklist",
    content: "How to evaluate coding agents.",
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-02-10T10:00:00Z",
    author: "foxiv",
    authorAvatar: "",
    authorUrl: "",
    labels: ["blog", "ai"],
    url: "https://example.com/11",
    commentsCount: 0,
    excerpt: "How to evaluate coding agents.",
  },
];

describe("buildWebsiteContextPrompt", () => {
  it("includes all sections and dynamic blog metadata", () => {
    const prompt = buildWebsiteContextPrompt({
      blogPosts: MOCK_POSTS,
      maxBlogPosts: 1,
    });

    expect(prompt).toContain("[welcome]");
    expect(prompt).toContain("[about]");
    expect(prompt).toContain("[projects]");
    expect(prompt).toContain("[contact]");
    expect(prompt).toContain("[education]");
    expect(prompt).toContain("[blog]");
    expect(prompt).toContain("Agent eval checklist");
    expect(prompt).toContain("tags: ai");
  });

  it("truncates sections when budget is too small", () => {
    const prompt = buildWebsiteContextPrompt({
      blogPosts: MOCK_POSTS,
      budget: {
        projects: 25,
      },
    });

    const projectsStart = prompt.indexOf("[projects]");
    const contactStart = prompt.indexOf("[contact]");
    const projectsSection = prompt.slice(projectsStart, contactStart);

    expect(projectsSection).toContain("...");
    expect(projectsSection).not.toContain("2. Vbot");
  });

  it("uses placeholder when blog snapshot is missing", () => {
    const prompt = buildWebsiteContextPrompt({
      blogPosts: [],
    });

    expect(prompt).toContain("[blog]");
    expect(prompt).toContain("No blog snapshot available right now.");
  });
});

describe("loadStaticBlogPostsSnapshot", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses static blog snapshot payload", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 9,
            number: 9,
            title: "Static title",
            createdAt: "2026-02-12T00:00:00Z",
            labels: ["blog", "notes"],
          },
        ]),
        { status: 200 }
      )
    );

    const posts = await loadStaticBlogPostsSnapshot("/blog.json");
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe("Static title");
    expect(posts[0].labels).toEqual(["blog", "notes"]);
  });

  it("returns empty list when fetch fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));

    const posts = await loadStaticBlogPostsSnapshot("/blog.json");
    expect(posts).toEqual([]);
  });
});

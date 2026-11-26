import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchIssues,
  fetchBlogPosts,
  fetchBlogContent,
  fetchBlogSearch,
  formatRelativeTime,
} from "./github";
/* eslint camelcase: "off" */

afterEach(() => vi.unstubAllGlobals());

describe("blog publication dates", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 26, 0, 5));
  });
  afterEach(() => vi.useRealTimers());

  it.each([
    [26, "today"],
    [25, "1 day ago"],
    [20, "6 days ago"],
    [19, "Nov 19, 2026"],
    [1, "Nov 1, 2026"],
    [27, "Nov 27, 2026"],
  ])("formats November %s as %s", (day, expected) => {
    expect(formatRelativeTime(new Date(2026, 10, day).toISOString())).toBe(
      expected
    );
  });

  it("counts calendar days across midnight rather than elapsed hours", () => {
    expect(
      formatRelativeTime(new Date(2026, 10, 25, 23, 55).toISOString())
    ).toBe("1 day ago");
    expect(
      formatRelativeTime(new Date(2026, 10, 19, 23, 55).toISOString())
    ).toBe("Nov 19, 2026");
  });
});

it("loads all raw issue pages and filters PRs after pagination", async () => {
  const issues = Array.from({ length: 100 }, (_, index) => ({
    number: index + 1,
  }));
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response(JSON.stringify(issues)))
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify([{ number: 101 }, { number: 102, pull_request: {} }])
      )
    );
  vi.stubGlobal("fetch", fetch);
  const posts = await fetchIssues({
    owner: "test",
    repo: "blog",
    labels: ["blog"],
  });
  expect(posts).toHaveLength(101);
  expect(posts.at(-1)?.number).toBe(101);
  expect(fetch.mock.calls[1][0]).toContain("page=2");
});

it("rejects a failed later page rather than returning an incomplete archive", async () => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify(
            Array.from({ length: 100 }, (_, index) => ({ number: index + 1 }))
          )
        )
      )
      .mockResolvedValueOnce(new Response("rate limited", { status: 403 }))
  );
  await expect(fetchIssues({ owner: "test", repo: "blog" })).rejects.toThrow(
    "rate limit"
  );
  vi.restoreAllMocks();
});

it("loads metadata separately and fetches a versioned body once", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          posts: [
            {
              id: 100,
              number: 13,
              title: "Title",
              createdAt: "2026-11-20",
              contentUrl: "posts/13-version.json",
            },
          ],
          searchUrl: "search-version.json",
        })
      )
    )
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ content: "Full article" }))
    );
  vi.stubGlobal("fetch", fetch);
  const posts = await fetchBlogPosts({
    owner: "test",
    repo: "blog",
    dataSource: "static",
    staticUrl: "/test-blog/index.json",
  });
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(posts[0].content).toBe("");
  expect(posts[0].searchUrl).toContain("/test-blog/search-version.json");
  const results = await Promise.all([
    fetchBlogContent(posts[0]),
    fetchBlogContent(posts[0]),
  ]);
  expect(results).toEqual(["Full article", "Full article"]);
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch.mock.calls[1][0]).toContain("/test-blog/posts/13-version.json");
});

it("retries failed body and search requests and preserves Chinese search text", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response("missing", { status: 404 }))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ content: "恢复正文" }))
    )
    .mockResolvedValueOnce(new Response("offline", { status: 503 }))
    .mockResolvedValueOnce(
      new Response(JSON.stringify([{ number: 13, text: "电力交易与ai" }]))
    );
  vi.stubGlobal("fetch", fetch);
  const post = {
    contentUrl: "/retry-body",
    content: "",
  } as import("../types/github").BlogPost;
  await expect(fetchBlogContent(post)).rejects.toThrow();
  await expect(fetchBlogContent(post)).resolves.toBe("恢复正文");
  await expect(fetchBlogSearch("/retry-search")).rejects.toThrow();
  const index = await fetchBlogSearch("/retry-search");
  expect(index.get(13)).toContain("电力交易");
});

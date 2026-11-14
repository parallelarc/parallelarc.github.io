import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { useBlogStore } from "./blogStore";
import * as github from "../utils/github";
import type { BlogPost } from "../types/github";
const config = { owner: "owner", repo: "blog", dataSource: "static" as const };
const posts: BlogPost[] = [
  {
    id: 1,
    number: 1,
    title: "Post",
    content: "Body",
    createdAt: "2026-11-13",
    updatedAt: "2026-11-13",
    author: "author",
    authorAvatar: "",
    authorUrl: "",
    labels: ["blog"],
    url: "",
    commentsCount: 0,
    excerpt: "Body",
  },
];
beforeEach(() => useBlogStore.setState(useBlogStore.getInitialState(), true));
afterEach(() => vi.restoreAllMocks());
describe("Shared blog data", () => {
  it("deduplicates simultaneous consumers and caches an empty successful archive", async () => {
    const fetch = vi.spyOn(github, "fetchBlogPosts").mockResolvedValue([]);
    await Promise.all([
      useBlogStore.getState().load(config),
      useBlogStore.getState().load(config),
    ]);
    await useBlogStore.getState().load(config);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(useBlogStore.getState().loaded).toBe(true);
  });
  it("keeps posts after a failed refresh and allows retry", async () => {
    const fetch = vi
      .spyOn(github, "fetchBlogPosts")
      .mockResolvedValueOnce(posts)
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce([]);
    await useBlogStore.getState().load(config);
    await expect(useBlogStore.getState().load(config, true)).rejects.toThrow(
      "Offline"
    );
    expect(useBlogStore.getState().posts).toEqual(posts);
    expect(useBlogStore.getState().error).toBe("Offline");
    await useBlogStore.getState().load(config, true);
    expect(useBlogStore.getState().error).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(3);
  });
  it("does not use another source's cached posts while a new request is pending", async () => {
    const fetch = vi
      .spyOn(github, "fetchBlogPosts")
      .mockResolvedValueOnce(posts)
      .mockResolvedValueOnce([]);
    await useBlogStore.getState().load(config);
    const other = { ...config, repo: "another" };
    const first = useBlogStore.getState().load(other);
    const second = useBlogStore.getState().load(other);
    expect(first).toBe(second);
    expect(await second).toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

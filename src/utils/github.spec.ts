import { afterEach, expect, it, vi } from "vitest";
import { fetchIssues } from "./github";
/* eslint camelcase: "off" */

afterEach(() => vi.unstubAllGlobals());

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

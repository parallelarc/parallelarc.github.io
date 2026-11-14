/* eslint-env node */
/* eslint camelcase: "off" */
import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchBlogSnapshot } from "./generate-blog-json.mjs";

const issue = number => ({
  id: number + 1000,
  number,
  title: `Post ${number}`,
  body: "Source Markdown.",
  created_at: "2026-04-12T06:56:49Z",
  updated_at: "2026-04-15T09:24:19Z",
  html_url: `https://github.com/test/blog/issues/${number}`,
  user: { login: "test", html_url: "https://github.com/test" },
  labels: [{ name: "blog" }],
  comments: 0,
});
const options = {
  owner: "test",
  repoName: "blog",
  label: "blog",
  token: "fake-local-test-token",
};

test("fetches beyond 100 raw issues, excludes PRs, and deduplicates page overlaps", async () => {
  const calls = [];
  const first = Array.from({ length: 100 }, (_, index) => issue(index + 1));
  first[20].pull_request = { url: "https://github.com/test/blog/pull/21" };
  const posts = await fetchBlogSnapshot({
    ...options,
    fetchImpl: async (input, init) => {
      const url = new URL(input);
      calls.push(url);
      assert.equal(url.searchParams.get("state"), "open");
      assert.equal(url.searchParams.get("labels"), "blog");
      assert.equal(url.searchParams.get("per_page"), "100");
      assert.equal(init.headers.Authorization, "Bearer fake-local-test-token");
      return new Response(
        JSON.stringify(
          url.searchParams.get("page") === "1"
            ? first
            : [issue(100), issue(101)]
        )
      );
    },
  });
  assert.deepEqual(
    calls.map(url => url.searchParams.get("page")),
    ["1", "2"]
  );
  assert.equal(posts.length, 100);
  assert.ok(posts.some(post => post.number === 101));
  assert.ok(posts.every(post => post.number !== 21));
  assert.equal(posts[0].content, "Source Markdown.");
});

test("aborts on an invalid later page rather than returning a truncated snapshot", async () => {
  for (const secondPage of [
    new Response("rate limited", { status: 403 }),
    new Response(JSON.stringify({ message: "bad response" })),
  ]) {
    let calls = 0;
    await assert.rejects(
      fetchBlogSnapshot({
        ...options,
        fetchImpl: async () => {
          calls += 1;
          return calls === 1
            ? new Response(
                JSON.stringify(
                  Array.from({ length: 100 }, (_, index) => issue(index + 1))
                )
              )
            : secondPage;
        },
      })
    );
    assert.equal(calls, 2);
  }
});

test("supports an empty published set", async () => {
  assert.deepEqual(
    await fetchBlogSnapshot({
      ...options,
      fetchImpl: async () => new Response("[]"),
    }),
    []
  );
});

#!/usr/bin/env node
/* eslint-env node */

import { mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

// Parse owner/repo from environment variables
const ownerEnv =
  process.env.VITE_GITHUB_OWNER ||
  process.env.BLOG_GITHUB_OWNER ||
  "parallelarc";
const repoEnv =
  process.env.VITE_GITHUB_BLOG_REPO ||
  process.env.BLOG_GITHUB_REPO ||
  "parallelarc.github.io";

// Handle both "owner" and "owner/repo" formats
const [owner, repoName] = repoEnv.includes("/")
  ? repoEnv.split("/")
  : [ownerEnv, repoEnv];

const label =
  process.env.VITE_GITHUB_BLOG_LABEL || process.env.BLOG_GITHUB_LABEL || "blog";
const token =
  process.env.BLOG_GITHUB_TOKEN ||
  process.env.GITHUB_TOKEN ||
  process.env.VITE_GITHUB_TOKEN;

export async function fetchBlogSnapshot({
  owner,
  repoName,
  label,
  token,
  fetchImpl = fetch,
}) {
  const url = new URL(
    `https://api.github.com/repos/${owner}/${repoName}/issues`
  );
  url.searchParams.set("state", "open");
  url.searchParams.set("per_page", "100");
  url.searchParams.set("sort", "created");
  url.searchParams.set("direction", "desc");
  if (label) {
    url.searchParams.set("labels", label);
  }

  const issues = [];
  for (let page = 1; ; page += 1) {
    url.searchParams.set("page", String(page));
    const response = await fetchImpl(url.href, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "terminal-portfolio",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    const batch = await response.json();
    if (!Array.isArray(batch)) {
      throw new Error(
        "Unexpected GitHub API response. Expected an array of issues."
      );
    }
    issues.push(...batch);
    if (batch.length < 100) break;
  }

  const posts = [
    ...new Map(issues.map(issue => [issue.number, issue])).values(),
  ]
    .filter(issue => !issue.pull_request)
    .map(issue => {
      const body = issue.body || "";
      const excerpt =
        body
          .replace(/[#*`[\]]/g, "")
          .replace(/\n+/g, " ")
          .trim()
          .slice(0, 150) + "...";

      const labels = Array.isArray(issue.labels)
        ? issue.labels.map(item =>
            typeof item === "string" ? item : item.name
          )
        : [];

      return {
        id: issue.id,
        number: issue.number,
        title: issue.title,
        content: body,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        author: issue.user?.login || "unknown",
        authorAvatar: issue.user?.avatar_url || "",
        authorUrl: issue.user?.html_url || "",
        labels,
        url: issue.html_url,
        commentsCount: issue.comments,
        excerpt,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  return posts;
}

export async function writeBlogArtifacts(posts, publicDir = "public") {
  const outputDir = path.join(publicDir, "blog");
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(path.join(outputDir, "posts"), { recursive: true });
  const hash = value =>
    createHash("sha256").update(value).digest("hex").slice(0, 16);
  const search = JSON.stringify(
    posts.map(post => ({
      number: post.number,
      text: post.content.toLowerCase(),
    }))
  );
  const searchUrl = `search-${hash(search)}.json`;
  await writeFile(path.join(outputDir, searchUrl), search, "utf8");
  const entries = [];
  for (const { content, ...metadata } of posts) {
    const body = JSON.stringify({ content });
    const contentUrl = `posts/${metadata.number}-${hash(body)}.json`;
    await writeFile(path.join(outputDir, contentUrl), body, "utf8");
    entries.push({ ...metadata, contentUrl });
  }
  await writeFile(
    path.join(outputDir, "index.json"),
    JSON.stringify({ posts: entries, searchUrl }),
    "utf8"
  );
}

async function main() {
  if (!token) {
    throw new Error(
      "Missing GitHub token. Set BLOG_GITHUB_TOKEN or GITHUB_TOKEN for the build step."
    );
  }
  const posts = await fetchBlogSnapshot({ owner, repoName, label, token });
  await writeBlogArtifacts(posts);
  console.log(`Wrote ${posts.length} posts to public/blog/`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

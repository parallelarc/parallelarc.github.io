#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const owner =
  process.env.VITE_GITHUB_OWNER ||
  process.env.BLOG_GITHUB_OWNER ||
  "parallelarc";
const repo =
  process.env.VITE_GITHUB_BLOG_REPO ||
  process.env.BLOG_GITHUB_REPO ||
  "blog";
const label =
  process.env.VITE_GITHUB_BLOG_LABEL ||
  process.env.BLOG_GITHUB_LABEL;
const token =
  process.env.BLOG_GITHUB_TOKEN ||
  process.env.GITHUB_TOKEN ||
  process.env.VITE_GITHUB_TOKEN;

if (!token) {
  console.error(
    "Missing GitHub token. Set BLOG_GITHUB_TOKEN or GITHUB_TOKEN for the build step."
  );
  process.exit(1);
}

const url = new URL(`https://api.github.com/repos/${owner}/${repo}/issues`);
url.searchParams.set("state", "open");
url.searchParams.set("per_page", "100");
if (label) {
  url.searchParams.set("labels", label);
}

const response = await fetch(url, {
  headers: {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "terminal-portfolio",
    Authorization: `Bearer ${token}`,
  },
});

if (!response.ok) {
  const body = await response.text();
  console.error(
    `GitHub API error: ${response.status} ${response.statusText}\n${body}`
  );
  process.exit(1);
}

const issues = await response.json();
if (!Array.isArray(issues)) {
  console.error("Unexpected GitHub API response. Expected an array of issues.");
  process.exit(1);
}

const posts = issues
  .filter((issue) => !issue.pull_request)
  .map((issue) => {
    const body = issue.body || "";
    const excerpt =
      body
        .replace(/[#*`\[\]]/g, "")
        .replace(/\n+/g, " ")
        .trim()
        .slice(0, 150) + "...";

    const labels = Array.isArray(issue.labels)
      ? issue.labels.map((item) => (typeof item === "string" ? item : item.name))
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
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

const outputPath = path.join(process.cwd(), "public", "blog.json");
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(posts, null, 2), "utf8");

console.log(`Wrote ${posts.length} posts to ${outputPath}`);

import type { GitHubConfig } from "../types/github";

export const BLOG_CONFIG: GitHubConfig = {
  owner: import.meta.env.VITE_GITHUB_OWNER || "parallelarc",
  repo: import.meta.env.VITE_GITHUB_BLOG_REPO || "parallelarc.github.io",
  token: import.meta.env.VITE_GITHUB_TOKEN,
  labels: [import.meta.env.VITE_GITHUB_BLOG_LABEL || "blog"],
  dataSource:
    import.meta.env.VITE_BLOG_DATA_SOURCE === "static" ? "static" : "api",
  staticUrl: import.meta.env.VITE_BLOG_STATIC_URL || "/blog.json",
};

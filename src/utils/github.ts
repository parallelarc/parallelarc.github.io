/**
 * GitHub API utility functions
 * Fetches blog data from GitHub Issues
 */

import type {
  GitHubIssue,
  BlogPost,
  GitHubConfig,
  CategoryStats,
} from "../types/github";

/**
 * Create GitHub API request headers
 */
export function createGitHubHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  return headers;
}

/**
 * Fetch repository issues
 */
export async function fetchIssues(
  config: GitHubConfig
): Promise<GitHubIssue[]> {
  const { owner, repo, token } = config;
  const headers = createGitHubHeaders(token);

  let url = `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`;

  if (config.labels && config.labels.length > 0) {
    const labelsParam = config.labels.join(",");
    url += `&labels=${encodeURIComponent(labelsParam)}`;
  }

  try {
    const issues: GitHubIssue[] = [];
    for (let page = 1; ; page += 1) {
      const response = await fetch(`${url}&page=${page}`, { headers });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            "GitHub API rate limit exceeded. Try again later or configure a Personal Access Token."
          );
        }
        if (response.status === 404) {
          throw new Error(
            `Repository ${owner}/${repo} not found or inaccessible. Check configuration.`
          );
        }
        throw new Error(
          `GitHub API error: ${response.status} ${response.statusText}`
        );
      }

      const batch: GitHubIssue[] = await response.json();
      if (!Array.isArray(batch)) {
        throw new Error(
          "Unexpected GitHub API response. Expected an array of issues."
        );
      }
      issues.push(...batch);
      if (batch.length < 100) break;
    }

    // Filter out Pull Requests
    return [
      ...new Map(
        issues
          .filter(issue => !issue.pull_request)
          .map(issue => [issue.number, issue])
      ).values(),
    ];
  } catch (error) {
    console.error("Failed to fetch GitHub Issues:", error);
    throw error;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function toBlogPost(candidate: unknown): BlogPost | null {
  if (!isRecord(candidate)) return null;

  const id = asNumber(candidate.id);
  if (id === 0) return null;

  const createdAt = asString(candidate.createdAt);
  if (!createdAt) return null;

  const content = asString(candidate.content);

  return {
    id,
    number: asNumber(candidate.number, id),
    title: asString(candidate.title, "Untitled"),
    content,
    createdAt,
    updatedAt: asString(candidate.updatedAt, createdAt),
    author: asString(candidate.author, "unknown"),
    authorAvatar: asString(candidate.authorAvatar),
    authorUrl: asString(candidate.authorUrl),
    labels: asStringArray(candidate.labels),
    url: asString(candidate.url),
    commentsCount: asNumber(candidate.commentsCount),
    excerpt: asString(candidate.excerpt, content.slice(0, 150)),
  };
}

async function readStaticBlogPosts(
  staticUrl = "/blog.json",
  signal?: AbortSignal
): Promise<BlogPost[]> {
  const response = await fetch(staticUrl, { signal });
  if (!response.ok)
    throw new Error(`Failed to fetch static blog data: ${response.status}`);

  const raw = await response.json();
  if (!Array.isArray(raw))
    throw new Error("Static blog data must be an array.");

  return raw
    .map(item => toBlogPost(item))
    .filter((item): item is BlogPost => Boolean(item));
}

/**
 * Transform GitHub Issue to blog post format
 */
function transformIssueToBlogPost(issue: GitHubIssue): BlogPost {
  const excerpt =
    issue.body
      .replace(/[#*\]`[]/g, "")
      .replace(/\n+/g, " ")
      .trim()
      .slice(0, 150) + "...";

  return {
    id: issue.id,
    number: issue.number,
    title: issue.title,
    content: issue.body,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    author: issue.user.login,
    authorAvatar: issue.user.avatar_url,
    authorUrl: issue.user.html_url,
    labels: issue.labels.map(label => label.name),
    url: issue.html_url,
    commentsCount: issue.comments,
    excerpt,
  };
}

/**
 * Fetch all blog posts
 */
export async function fetchBlogPosts(
  config: GitHubConfig
): Promise<BlogPost[]> {
  if (config.dataSource === "static") {
    const staticUrl = config.staticUrl || "/blog.json";
    const posts = await readStaticBlogPosts(staticUrl);
    posts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return posts;
  }

  const issues = await fetchIssues(config);
  const posts = issues.map(issue => transformIssueToBlogPost(issue));

  // Sort by creation date (newest first)
  posts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return posts;
}

/**
 * Calculate category statistics
 */
export function calculateCategoryStats(
  posts: BlogPost[],
  allLabel = "All"
): CategoryStats[] {
  const labelCount: Record<string, number> = {};

  posts.forEach(post => {
    post.labels.forEach(label => {
      if (label.toLowerCase() !== "blog") {
        labelCount[label] = (labelCount[label] || 0) + 1;
      }
    });
  });

  const stats: CategoryStats[] = [
    {
      name: allLabel,
      count: posts.length,
      isActive: true,
    },
  ];

  Object.entries(labelCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, count]) => {
      stats.push({
        name,
        count,
        isActive: false,
      });
    });

  return stats;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Format relative time (e.g., "3 days ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "today";
  }
  if (diffDays === 1) {
    return "yesterday";
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }

  return formatDate(dateString);
}

export async function loadStaticBlogPostsSnapshot(
  url = "/blog.json",
  signal?: AbortSignal
): Promise<BlogPost[]> {
  return readStaticBlogPosts(url, signal).catch(() => []);
}

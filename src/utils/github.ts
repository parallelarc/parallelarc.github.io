/**
 * GitHub API utility functions
 * Fetches blog data from GitHub Issues
 */

import type { GitHubIssue, BlogPost, GitHubConfig, CategoryStats } from "../types/github";

const DEFAULT_CONFIG: Partial<GitHubConfig> = {
  labels: ["blog"],
};

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
    const response = await fetch(url, { headers });

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
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const issues: GitHubIssue[] = await response.json();

    // Filter out Pull Requests
    return issues.filter((issue) => !issue.pull_request);
  } catch (error) {
    console.error("Failed to fetch GitHub Issues:", error);
    throw error;
  }
}

/**
 * Transform GitHub Issue to blog post format
 */
function transformIssueToBlogPost(issue: GitHubIssue): BlogPost {
  const excerpt = issue.body
    .replace(/[#*`\[\]]/g, "")
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
    labels: issue.labels.map((label) => label.name),
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
  const issues = await fetchIssues(config);
  const posts = issues.map((issue) => transformIssueToBlogPost(issue));

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

  posts.forEach((post) => {
    post.labels.forEach((label) => {
      labelCount[label] = (labelCount[label] || 0) + 1;
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

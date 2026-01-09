/**
 * GitHub API 工具函数
 * 用于从 GitHub Issues 获取博客数据
 */

import type { GitHubIssue, BlogPost, GitHubConfig, CategoryStats } from "../types/github";

const DEFAULT_CONFIG: Partial<GitHubConfig> = {
  labels: ["blog"],
};

/**
 * 创建 GitHub API 请求头
 */
export const createGitHubHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  return headers;
};

/**
 * 获取仓库的所有 Issues
 */
export const fetchIssues = async (
  config: GitHubConfig
): Promise<GitHubIssue[]> => {
  const { owner, repo, token } = config;
  const headers = createGitHubHeaders(token);

  // 构建 API URL
  let url = `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`;

  // 如果指定了标签，添加到查询参数中
  if (config.labels && config.labels.length > 0) {
    const labelsParam = config.labels.join(",");
    url += `&labels=${encodeURIComponent(labelsParam)}`;
  }

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(
          "GitHub API 速率限制已超过。请稍后再试，或配置 Personal Access Token。"
        );
      }
      if (response.status === 404) {
        throw new Error(
          `仓库 ${owner}/${repo} 不存在或无法访问。请检查配置是否正确。`
        );
      }
      throw new Error(`GitHub API 错误: ${response.status} ${response.statusText}`);
    }

    const issues: GitHubIssue[] = await response.json();

    // 过滤掉 Pull Requests
    return issues.filter((issue) => !issue.pull_request);
  } catch (error) {
    console.error("获取 GitHub Issues 失败:", error);
    throw error;
  }
};

/**
 * 获取特定 Issue 的评论数量
 */
export const fetchIssueComments = async (
  issueNumber: number,
  config: GitHubConfig
): Promise<number> => {
  const { owner, repo, token } = config;
  const headers = createGitHubHeaders(token);

  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=1`;

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      return 0;
    }

    // 解析 Link header 获取总评论数
    const linkHeader = response.headers.get("Link");
    if (linkHeader) {
      const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
      if (lastPageMatch) {
        return parseInt(lastPageMatch[1], 10);
      }
    }

    const comments = await response.json();
    return comments.length;
  } catch (error) {
    console.error("获取评论数量失败:", error);
    return 0;
  }
};

/**
 * 将 GitHub Issue 转换为博客文章格式
 */
export const transformIssueToBlogPost = (
  issue: GitHubIssue,
  excerpt?: string
): BlogPost => {
  // 生成文章摘要
  const autoExcerpt =
    excerpt ||
    issue.body
      .replace(/[#*`\[\]]/g, "") // 移除 Markdown 符号
      .replace(/\n+/g, " ") // 将换行替换为空格
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
    excerpt: autoExcerpt,
  };
};

/**
 * 获取所有文章并转换为 BlogPost 格式
 */
export const fetchBlogPosts = async (
  config: GitHubConfig
): Promise<BlogPost[]> => {
  const issues = await fetchIssues(config);

  const posts = issues.map((issue) => transformIssueToBlogPost(issue));

  // 按创建时间倒序排列
  posts.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return posts;
};

/**
 * 计算分类统计信息
 */
export const calculateCategoryStats = (
  posts: BlogPost[],
  allLabel: string = "All"
): CategoryStats[] => {
  const labelCount: Record<string, number> = {};

  // 统计每个标签的文章数量
  posts.forEach((post) => {
    post.labels.forEach((label) => {
      labelCount[label] = (labelCount[label] || 0) + 1;
    });
  });

  // 构建统计数组
  const stats: CategoryStats[] = [
    {
      name: allLabel,
      count: posts.length,
      isActive: true,
    },
  ];

  // 按数量排序添加其他分类
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
};

/**
 * 格式化日期显示
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * 格式化相对时间（如 "3天前"）
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "今天";
  } else if (diffDays === 1) {
    return "昨天";
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}周前`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months}个月前`;
  } else {
    return formatDate(dateString);
  }
};

/**
 * GitHub API 和博客相关的 TypeScript 类型定义
 */

// GitHub 用户信息
export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
}

// GitHub 标签
export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
}

// GitHub Issue 原始数据结构
export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
  html_url: string;
  user: GitHubUser;
  labels: GitHubLabel[];
  comments: number;
  pull_request?: {
    url: string;
  };
}

// 博客文章数据结构（应用内部使用）
export interface BlogPost {
  id: number;
  number: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  authorAvatar: string;
  authorUrl: string;
  labels: string[];
  url: string;
  commentsCount: number;
  excerpt: string;
  isSelected?: boolean;
}

// 分类统计信息
export interface CategoryStats {
  name: string;
  count: number;
  isActive: boolean;
}

// GitHub API 配置
export interface GitHubConfig {
  owner: string;
  repo: string;
  token?: string;
  labels?: string[];
  dataSource?: "api" | "static";
  staticUrl?: string;
}

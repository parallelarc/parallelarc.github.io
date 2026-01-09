/**
 * 自定义 Hook：获取和管理 GitHub Issues 博客数据
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  GitHubConfig,
  BlogPost,
  CategoryStats,
  PostListState,
} from "../types/github";
import {
  fetchBlogPosts,
  calculateCategoryStats,
} from "../utils/github";

const POSTS_PER_PAGE = 10;

interface UseGitHubIssuesResult {
  // 数据状态
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // 列表状态
  listState: PostListState;
  categoryStats: CategoryStats[];

  // 操作函数
  refresh: () => Promise<void>;
  setActiveCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedIndex: (index: number) => void;
  nextPost: () => void;
  prevPost: () => void;
  nextPage: () => void;
  prevPage: () => void;
  selectPost: (post: BlogPost) => void;
  clearSelection: () => void;
}

export const useGitHubIssues = (
  config: GitHubConfig,
  initialCategory: string = "All"
): UseGitHubIssuesResult => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 列表状态
  const [activeCategory, setActiveCategoryState] = useState(initialCategory);
  const [searchQuery, setSearchQueryState] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // 获取数据
  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const blogPosts = await fetchBlogPosts(config);
      setPosts(blogPosts);
      setLastUpdated(new Date());
      setSelectedIndex(0);
      setCurrentPage(1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "获取博客文章失败"
      );
    } finally {
      setLoading(false);
    }
  }, [config.owner, config.repo, config.labels?.join(",")]);

  // 初始加载
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // 计算分类统计
  const categoryStats = useMemo(
    () => calculateCategoryStats(posts),
    [posts]
  );

  // 过滤后的文章列表
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // 分类过滤
      if (activeCategory !== "All") {
        const hasCategory = post.labels.some(
          (label) =>
            label.toLowerCase() === activeCategory.toLowerCase()
        );
        if (!hasCategory) return false;
      }

      // 搜索过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const titleMatch = post.title.toLowerCase().includes(query);
        const contentMatch = post.content.toLowerCase().includes(query);
        const labelMatch = post.labels.some((label) =>
          label.toLowerCase().includes(query)
        );
        return titleMatch || contentMatch || labelMatch;
      }

      return true;
    });
  }, [posts, activeCategory, searchQuery]);

  // 分页计算
  const totalPages = useMemo(
    () => Math.ceil(filteredPosts.length / POSTS_PER_PAGE),
    [filteredPosts.length]
  );

  // 获取当前页的文章
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  // 操作函数
  const setActiveCategory = useCallback((category: string) => {
    setActiveCategoryState(category);
    setSelectedIndex(0);
    setCurrentPage(1);
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    setSelectedIndex(0);
    setCurrentPage(1);
  }, []);

  const nextPost = useCallback(() => {
    if (selectedIndex < paginatedPosts.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  }, [selectedIndex, paginatedPosts.length]);

  const prevPost = useCallback(() => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  }, [selectedIndex]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setSelectedIndex(0);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setSelectedIndex(0);
    }
  }, [currentPage]);

  const selectPost = useCallback((post: BlogPost) => {
    // 在完整列表中找到对应的索引
    const index = filteredPosts.findIndex((p) => p.id === post.id);
    if (index !== -1) {
      const page = Math.floor(index / POSTS_PER_PAGE) + 1;
      setCurrentPage(page);
      setSelectedIndex(index % POSTS_PER_PAGE);
    }
  }, [filteredPosts]);

  const clearSelection = useCallback(() => {
    setSelectedIndex(0);
  }, []);

  // 列表状态汇总
  const listState: PostListState = {
    posts,
    filteredPosts,
    selectedIndex,
    currentPage,
    totalPages,
    searchQuery,
    activeCategory,
  };

  return {
    posts,
    loading,
    error,
    lastUpdated,
    listState,
    categoryStats,
    refresh: loadPosts,
    setActiveCategory,
    setSearchQuery,
    setSelectedIndex: setSelectedIndex as (index: number) => void,
    nextPost,
    prevPost,
    nextPage,
    prevPage,
    selectPost,
    clearSelection,
  };
};

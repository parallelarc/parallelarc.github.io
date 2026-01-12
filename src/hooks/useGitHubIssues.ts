/**
 * Custom Hook: Fetch and manage GitHub Issues blog data
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

export const POSTS_PER_PAGE = 10;

interface UseGitHubIssuesResult {
  // Data state
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // List state
  listState: PostListState;
  categoryStats: CategoryStats[];

  // Operations
  refresh: () => Promise<void>;
  setActiveCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedIndex: (index: number) => void;
  setCurrentPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

export function useGitHubIssues(
  config: GitHubConfig,
  initialCategory = "All"
): UseGitHubIssuesResult {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // List state
  const [activeCategory, setActiveCategoryState] = useState(initialCategory);
  const [searchQuery, setSearchQueryState] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data
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
      setError(err instanceof Error ? err.message : "Failed to fetch blog posts");
    } finally {
      setLoading(false);
    }
  }, [
    config.owner,
    config.repo,
    config.token,
    config.labels?.join(","),
    config.dataSource,
    config.staticUrl,
  ]);

  // Initial load
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Calculate category stats
  const categoryStats = useMemo(
    () => calculateCategoryStats(posts),
    [posts]
  );

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Category filter
      if (activeCategory !== "All") {
        const hasCategory = post.labels.some(
          (label) => label.toLowerCase() === activeCategory.toLowerCase()
        );
        if (!hasCategory) return false;
      }

      // Search filter
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

  // Pagination
  const totalPages = useMemo(
    () => Math.ceil(filteredPosts.length / POSTS_PER_PAGE),
    [filteredPosts.length]
  );

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  // Operations
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

  const setCurrentPageSafe = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedIndex(0);
    }
  }, [totalPages]);

  // List state summary
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
    setSelectedIndex,
    setCurrentPage: setCurrentPageSafe,
    nextPage,
    prevPage,
  };
}

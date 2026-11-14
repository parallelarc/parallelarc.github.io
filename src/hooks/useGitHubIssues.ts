/**
 * Custom Hook: Fetch and manage GitHub Issues blog data
 */

import { useState, useCallback, useMemo } from "react";
import type { GitHubConfig } from "../types/github";
import { useBlogData } from "./useBlogData";
import { calculateCategoryStats } from "../utils/github";

export const POSTS_PER_PAGE = 10;

export function useGitHubIssues(config: GitHubConfig, initialCategory = "All") {
  const { posts, loading, error, refresh } = useBlogData(config);

  // List state
  const [activeCategory, setActiveCategoryState] = useState(initialCategory);
  const [searchQuery, setSearchQueryState] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate category stats
  const categoryStats = useMemo(() => calculateCategoryStats(posts), [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Category filter
      if (activeCategory !== "All") {
        const hasCategory = post.labels.some(
          label => label.toLowerCase() === activeCategory.toLowerCase()
        );
        if (!hasCategory) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const titleMatch = post.title.toLowerCase().includes(query);
        const contentMatch = post.content.toLowerCase().includes(query);
        const labelMatch = post.labels.some(label =>
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

  // Operations
  const setActiveCategory = useCallback((category: string) => {
    setActiveCategoryState(category);
    setCurrentPage(1);
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    setCurrentPage(1);
  }, []);

  const setCurrentPageSafe = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  // List state summary
  const listState = {
    posts,
    filteredPosts,
    currentPage,
    totalPages,
    searchQuery,
    activeCategory,
  };

  return {
    posts,
    loading,
    error,
    listState,
    categoryStats,
    refresh,
    setActiveCategory,
    setSearchQuery,
    setCurrentPage: setCurrentPageSafe,
  };
}

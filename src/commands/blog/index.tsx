/**
 * Blog Command - Interactive TUI Mode
 * Displays blog posts from GitHub Issues with unified list navigation
 */

import { useContext, useEffect, useCallback, useState } from "react";
import { termContext } from "../../components/Terminal";
import { useGitHubIssues, POSTS_PER_PAGE } from "../../hooks/useGitHubIssues";
import { useKeyboardNavigation, type FocusState } from "../../hooks/useKeyboardNavigation";
import { useTerminalStore } from "../../stores/terminalStore";
import type { GitHubConfig } from "../../types/github";
import {
  BlogContainer,
  EmptyState,
  LoadingDots,
  StatusText,
  // New TUI Components
  TuiUnifiedList,
  TuiUnifiedItem,
  TuiFocusIndicator,
  TuiTagsRow,
  TuiTag,
  TuiPostContent,
  TuiPostTitle,
  TuiPostMeta,
  TuiPaginationRow,
  TuiSeparator,
  TuiInstructions,
} from "../../components/styles/Commands.styled";
import { formatRelativeTime } from "../../utils/github";

const BLOG_CONFIG: GitHubConfig = {
  owner: import.meta.env.VITE_GITHUB_OWNER || "parallelarc",
  repo: import.meta.env.VITE_GITHUB_BLOG_REPO || "parallelarc.github.io",
  token: import.meta.env.VITE_GITHUB_TOKEN,
  labels: import.meta.env.VITE_GITHUB_BLOG_LABEL
    ? [import.meta.env.VITE_GITHUB_BLOG_LABEL]
    : ["blog"],
  // 默认使用 API 模式，只有显式设置为 "static" 才用静态文件
  dataSource: import.meta.env.VITE_BLOG_DATA_SOURCE === "static" ? "static" : "api",
  staticUrl: import.meta.env.VITE_BLOG_STATIC_URL || "/blog.json",
};



function Blog() {
  const { arg, isLatest, index, setDismissMessage } = useContext(termContext);
  const setInteractiveMode = useTerminalStore((s) => s.setInteractiveMode);

  // Focus state for keyboard navigation
  const [focusState, setFocusState] = useState<FocusState>({
    section: "tags",
    tagsIndex: 0,
    postIndex: 0,
  });

  const {
    posts,
    loading,
    error,
    listState,
    categoryStats,
    setActiveCategory,
    setSearchQuery,
    setCurrentPage,
  } = useGitHubIssues(BLOG_CONFIG);

  const currentPosts = listState.filteredPosts;
  const { currentPage, totalPages, searchQuery, activeCategory } = listState;

  // Update tagsIndex when activeCategory changes externally
  useEffect(() => {
    const activeIndex = categoryStats.findIndex(
      (cat) => cat.name === activeCategory
    );
    if (activeIndex !== -1 && activeIndex !== focusState.tagsIndex) {
      setFocusState((prev) => ({ ...prev, tagsIndex: activeIndex }));
    }
  }, [activeCategory, categoryStats]);

  // Reset postIndex when posts list changes
  useEffect(() => {
    setFocusState((prev) => ({ ...prev, postIndex: 0 }));
  }, [searchQuery, activeCategory, currentPage]);

  // Support command-line arguments: `blog search term` or `blog tag:xxx`
  useEffect(() => {
    if (arg.length > 0) {
      const searchTerm = arg.join(" ");
      if (searchTerm.startsWith("tag:")) {
        setActiveCategory(searchTerm.slice(4));
      } else {
        setSearchQuery(searchTerm);
      }
    }
  }, [arg, setActiveCategory, setSearchQuery]);

  // Category change handler
  const handleCategoryChange = useCallback(
    (index: number) => {
      const category = categoryStats[index]?.name;
      if (category) {
        setActiveCategory(category);
      }
    },
    [categoryStats, setActiveCategory]
  );

  // Page change handler
  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages, setCurrentPage]
  );

  // Post select handler - open in new tab
  const handlePostSelect = useCallback(
    (index: number) => {
      const post = currentPosts[index];
      if (post) {
        window.open(post.url, "_blank", "noopener,noreferrer");
      }
    },
    [currentPosts]
  );

  // Escape handler - exit interactive mode and set dismiss message
  const handleEscape = useCallback(() => {
    setInteractiveMode(false, null);
    setDismissMessage?.(index, "Blog dialog dismissed");
  }, [setInteractiveMode, setDismissMessage, index]);

  // Calculate current active category index
  const activeCategoryIndex = categoryStats.findIndex(
    (cat) => cat.name === activeCategory
  );

  // Keyboard navigation
  const { handleKeyDown } = useKeyboardNavigation({
    focusState,
    setFocusState,
    categoryCount: categoryStats.length,
    currentPagePosts: currentPosts.length,
    totalPages,
    currentPage,
    activeCategoryIndex: activeCategoryIndex >= 0 ? activeCategoryIndex : 0,
    onCategoryChange: handleCategoryChange,
    onPostSelect: handlePostSelect,
    onPageChange: handlePageChange,
    onEscape: handleEscape,
  });

  // Set up keyboard event listener
  useEffect(() => {
    if (!isLatest) return;

    setInteractiveMode(true, "blog");

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      handleKeyDown(e);
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      setInteractiveMode(false, null);
    };
  }, [isLatest, handleKeyDown, setInteractiveMode]);

  // Loading state
  if (loading && posts.length === 0) {
    return (
      <BlogContainer data-testid="blog">
        <StatusText>
          <LoadingDots>Loading posts</LoadingDots>
        </StatusText>
      </BlogContainer>
    );
  }

  // Error state
  if (error && posts.length === 0) {
    return (
      <BlogContainer data-testid="blog">
        <StatusText $variant="error">Error: {error}</StatusText>
      </BlogContainer>
    );
  }

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;

  // Format labels for display
  const formatLabels = (labels: string[]) =>
    labels.filter((l) => l.toLowerCase() !== "blog").join(", ");

  return (
    <BlogContainer data-testid="blog">
      <TuiUnifiedList>
        {/* 1. 标签行 */}
        {categoryStats.length > 1 && (
          <TuiTagsRow>
            <TuiFocusIndicator $visible={focusState.section === "tags"} />
            {categoryStats.map((cat, index) => {
              const isTagFocused = focusState.section === "tags" && focusState.tagsIndex === index;
              return (
                <TuiTag
                  key={cat.name}
                  $active={cat.name === activeCategory}
                  $focused={isTagFocused}
                >
                  [{cat.name} {cat.count}]
                </TuiTag>
              );
            })}
          </TuiTagsRow>
        )}

        {/* 2. 文章行 */}
        {currentPosts.length === 0 ? (
          <EmptyState>
            {posts.length === 0
              ? "No blog posts found. Check your GitHub repository configuration."
              : "No posts match your search criteria."}
          </EmptyState>
        ) : (
          currentPosts.map((post, index) => {
            const isFocused = focusState.section === "posts" && focusState.postIndex === index;
            return (
              <TuiUnifiedItem key={post.id} $focused={isFocused}>
                <TuiFocusIndicator $visible={isFocused}>{">"}</TuiFocusIndicator>
                <TuiPostContent>
                  <TuiPostTitle>
                    {startIndex + index + 1}. {post.title}
                  </TuiPostTitle>
                  <TuiPostMeta>
                    {formatRelativeTime(post.createdAt)}
                    {post.labels.length > 0 && ` · ${formatLabels(post.labels)}`}
                  </TuiPostMeta>
                </TuiPostContent>
              </TuiUnifiedItem>
            );
          })
        )}

        {/* 3. 分页行（仅展示） */}
        {currentPosts.length > 0 && (
          <TuiPaginationRow>
            <span>{"<prev"}</span>
            <span>Page {currentPage}/{totalPages}</span>
            <span>{"next>"}</span>
          </TuiPaginationRow>
        )}
      </TuiUnifiedList>

      <TuiSeparator />

      <TuiInstructions>
        <span>Enter/Space</span> to open ·
        <span>↑↓</span> to navigate ·
        <span>←→</span> for tags/pages ·
        <span>esc</span> to cancel
      </TuiInstructions>

      {/* Non-blocking error message */}
      {error && (
        <StatusText $variant="error" style={{ marginTop: "0.5rem" }}>
          {error}
        </StatusText>
      )}
    </BlogContainer>
  );
}

export default Blog;

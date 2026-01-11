/**
 * Blog Command - Interactive TUI Mode
 * Displays blog posts from GitHub Issues with keyboard navigation
 */

import { useContext, useEffect, useCallback, useState } from "react";
import { termContext } from "../../components/Terminal";
import { useGitHubIssues, POSTS_PER_PAGE } from "../../hooks/useGitHubIssues";
import { useKeyboardNavigation, type FocusState } from "../../hooks/useKeyboardNavigation";
import { useTerminalStore } from "../../stores/terminalStore";
import type { GitHubConfig } from "../../types/github";
import {
  BlogContainer,
  SearchBar,
  SearchInput,
  RefreshButton,
  CategoryTabs,
  CategoryTab,
  EmptyState,
  Link,
  Cmd,
  LoadingDots,
  StatusText,
  PostLabel,
  // TUI Components
  TuiHeader,
  TuiFooter,
  TuiKeyHint,
  TuiList,
  TuiListItem,
  TuiListTitle,
  TuiListMeta,
  TuiPageIndicator,
} from "../../components/styles/Commands.styled";
import { formatRelativeTime } from "../../utils/github";

const BLOG_CONFIG: GitHubConfig = {
  owner: import.meta.env.VITE_GITHUB_OWNER || "parallelarc",
  repo: import.meta.env.VITE_GITHUB_BLOG_REPO || "blog",
  token: import.meta.env.VITE_GITHUB_TOKEN,
  labels: import.meta.env.VITE_GITHUB_BLOG_LABEL
    ? [import.meta.env.VITE_GITHUB_BLOG_LABEL]
    : undefined,
};

const REPO_URL = `https://github.com/${BLOG_CONFIG.owner}/${BLOG_CONFIG.repo}`;

function Blog() {
  const { arg, isLatest, index, setDismissMessage } = useContext(termContext);
  const setInteractiveMode = useTerminalStore((s) => s.setInteractiveMode);

  // Focus state for keyboard navigation
  const [focusState, setFocusState] = useState<FocusState>({
    level: "category",
    categoryIndex: 0,
    postIndex: 0,
    pageIndex: 0,
  });

  const {
    posts,
    loading,
    error,
    listState,
    categoryStats,
    refresh,
    setActiveCategory,
    setSearchQuery,
    setCurrentPage,
  } = useGitHubIssues(BLOG_CONFIG);

  const currentPosts = listState.filteredPosts;
  const { currentPage, totalPages, searchQuery, activeCategory } = listState;

  // Update categoryIndex when activeCategory changes externally
  useEffect(() => {
    const activeIndex = categoryStats.findIndex(
      (cat) => cat.name === activeCategory
    );
    if (activeIndex !== -1 && activeIndex !== focusState.categoryIndex) {
      setFocusState((prev) => ({ ...prev, categoryIndex: activeIndex }));
    }
  }, [activeCategory, categoryStats]);

  // Update pageIndex when currentPage changes externally
  useEffect(() => {
    if (currentPage - 1 !== focusState.pageIndex) {
      setFocusState((prev) => ({ ...prev, pageIndex: currentPage - 1 }));
    }
  }, [currentPage]);

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
    // Set dismiss message to replace blog content
    setDismissMessage?.(index, "Blog dialog dismissed");
  }, [setInteractiveMode, setDismissMessage, index]);

  // Keyboard navigation
  const { handleKeyDown } = useKeyboardNavigation({
    focusState,
    setFocusState,
    categoryCount: categoryStats.length,
    postsPerPage: POSTS_PER_PAGE,
    currentPagePosts: currentPosts.length,
    totalPages,
    onCategoryChange: handleCategoryChange,
    onPostSelect: handlePostSelect,
    onPageChange: handlePageChange,
    onEscape: handleEscape,
  });

  // Set up keyboard event listener
  useEffect(() => {
    // Only activate interactive mode for the latest command (not in history)
    if (!isLatest) return;

    setInteractiveMode(true, "blog");

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in search input
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        // Allow Escape to exit search focus and return focus to terminal input
        if (e.key === "Escape") {
          (document.activeElement as HTMLElement).blur();
          // Refocus the terminal input
          const terminalInput = document.getElementById("terminal-input") as HTMLTextAreaElement;
          if (terminalInput) {
            terminalInput.focus();
          }
        }
        return;
      }
      handleKeyDown(e);
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      // Always deactivate interactive mode on cleanup
      setInteractiveMode(false, null);
    };
  }, [isLatest, handleKeyDown, setInteractiveMode]);

  // Search handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

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
  const totalPosts = posts.length;

  // Focus state for rendering
  const isCategoryFocused = focusState.level === "category";
  const isPostsFocused = focusState.level === "posts";
  const isPaginationFocused = focusState.level === "pagination";

  return (
    <BlogContainer data-testid="blog">
      {/* Header */}
      <TuiHeader>
        Manage Blog Posts · {totalPosts} {totalPosts === 1 ? "post" : "posts"}
      </TuiHeader>

      {/* Search Bar */}
      <SearchBar>
        <Cmd>/</Cmd>
        <SearchInput
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <RefreshButton onClick={handleRefresh} disabled={loading}>
          {loading ? "..." : "Refresh"}
        </RefreshButton>
      </SearchBar>

      {/* Category Tabs */}
      {categoryStats.length > 1 && (
        <CategoryTabs>
          {categoryStats.map((cat, index) => (
            <CategoryTab
              key={cat.name}
              $active={cat.name === activeCategory}
              $focused={isCategoryFocused && focusState.categoryIndex === index}
            >
              [{cat.name} {cat.count}]
            </CategoryTab>
          ))}
        </CategoryTabs>
      )}

      {/* Error message (non-blocking) */}
      {error && (
        <StatusText $variant="error" style={{ marginBottom: "1rem" }}>
          {error}
        </StatusText>
      )}

      {/* Blog Posts */}
      <TuiList>
        {currentPosts.length === 0 ? (
          <EmptyState>
            {posts.length === 0
              ? "No blog posts found. Check your GitHub repository configuration."
              : "No posts match your search criteria."}
          </EmptyState>
        ) : (
          currentPosts.map((post, index) => {
            const isFocused = isPostsFocused && focusState.postIndex === index;
            return (
              <TuiListItem
                key={post.id}
                $focused={isFocused}
                onClick={() => handlePostSelect(index)}
              >
                <TuiListTitle $focused={isFocused}>
                  {isFocused && "❯ "}
                  {startIndex + index + 1}. {post.title}
                </TuiListTitle>
                <TuiListMeta>
                  <span>{formatRelativeTime(post.createdAt)}</span>
                  {post.commentsCount > 0 && (
                    <span>· 💬 {post.commentsCount} comments</span>
                  )}
                </TuiListMeta>
                {post.excerpt && (
                  <div style={{ marginTop: "0.5rem", color: "var(--text-200)", lineHeight: "1.5" }}>
                    {post.excerpt}
                  </div>
                )}
                {post.labels.length > 0 && (
                  <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                    {post.labels.map((label) => (
                      <PostLabel key={label}>{label}</PostLabel>
                    ))}
                  </div>
                )}
              </TuiListItem>
            );
          })
        )}
      </TuiList>

      {/* Pagination */}
      {totalPages > 1 && currentPosts.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem" }}>
          <TuiPageIndicator $focused={isPaginationFocused}>
            Page {currentPage} of {totalPages} · {currentPosts.length} posts
          </TuiPageIndicator>
        </div>
      )}

      {/* Footer with keyboard hints */}
      <TuiFooter>
        <TuiKeyHint>Tab</TuiKeyHint>
        <span>切换焦点</span>
        <span style={{ margin: "0 0.25rem" }}>·</span>
        <TuiKeyHint>←</TuiKeyHint>
        <TuiKeyHint>→</TuiKeyHint>
        <span>分类/分页</span>
        <span style={{ margin: "0 0.25rem" }}>·</span>
        <TuiKeyHint>↑</TuiKeyHint>
        <TuiKeyHint>↓</TuiKeyHint>
        <span>选择文章</span>
        <span style={{ margin: "0 0.25rem" }}>·</span>
        <TuiKeyHint>Enter</TuiKeyHint>
        <span>打开</span>
        <span style={{ margin: "0 0.25rem" }}>·</span>
        <TuiKeyHint>esc</TuiKeyHint>
        <span>退出</span>
      </TuiFooter>
    </BlogContainer>
  );
}

export default Blog;

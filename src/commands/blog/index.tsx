/**
 * Blog Command - Interactive TUI Mode
 * Displays blog posts from GitHub Issues with unified list navigation
 */

import { useContext, useEffect, useCallback, useRef, useState } from "react";
import { termContext } from "../../contexts/TerminalContext";
import { useGitHubIssues, POSTS_PER_PAGE } from "../../hooks/useGitHubIssues";
import {
  useKeyboardNavigation,
  type FocusState,
} from "../../hooks/useKeyboardNavigation";
import { useTerminalStore } from "../../stores/terminalStore";
import { BLOG_CONFIG } from "../../config/blog";
import {
  BlogContainer,
  EmptyState,
  LoadingDots,
  StatusText,
  BlogToolbar,
  TerminalAction,
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

function Blog() {
  const { arg, isLatest, index } = useContext(termContext);
  const setDismissMessage = useTerminalStore(s => s.setDismissMessage);
  const setInteractiveMode = useTerminalStore(s => s.setInteractiveMode);
  const blogRef = useRef<HTMLDivElement>(null);

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
    refresh,
  } = useGitHubIssues(BLOG_CONFIG);

  const { currentPage, totalPages, searchQuery, activeCategory } = listState;
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = listState.filteredPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE
  );
  const commandQuery = arg.join(" ");

  // Update tagsIndex when activeCategory changes externally
  useEffect(() => {
    const activeIndex = categoryStats.findIndex(
      cat => cat.name === activeCategory
    );
    if (activeIndex !== -1) {
      setFocusState(prev =>
        prev.tagsIndex === activeIndex
          ? prev
          : { ...prev, tagsIndex: activeIndex }
      );
    }
  }, [activeCategory, categoryStats]);

  // Reset postIndex when posts list changes
  useEffect(() => {
    setFocusState(prev => ({ ...prev, postIndex: 0 }));
  }, [searchQuery, activeCategory, currentPage]);

  // Support command-line arguments: `blog search term` or `blog tag:xxx`
  useEffect(() => {
    if (commandQuery) {
      const searchTerm = commandQuery;
      if (searchTerm.startsWith("tag:")) {
        setActiveCategory(searchTerm.slice(4));
      } else {
        setSearchQuery(searchTerm);
      }
    }
  }, [commandQuery, setActiveCategory, setSearchQuery]);

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
    cat => cat.name === activeCategory
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

  // Keep the interactive session stable while selection and pagination change.
  useEffect(() => {
    if (!isLatest) return;
    setInteractiveMode(true, "blog");
    blogRef.current?.focus({ preventScroll: true });
    return () => setInteractiveMode(false, null);
  }, [isLatest, setInteractiveMode]);

  useEffect(() => {
    if (!isLatest) return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (!blogRef.current?.contains(target)) return;
      // Native links and buttons handle Enter/Space themselves.
      if (target?.closest("a, button") && (e.key === "Enter" || e.key === " "))
        return;
      if (e.key.startsWith("Arrow")) {
        blogRef.current?.focus({ preventScroll: true });
      }
      handleKeyDown(e);
      if (e.defaultPrevented && e.key.startsWith("Arrow")) {
        requestAnimationFrame(() => {
          blogRef.current
            ?.querySelector('[data-keyboard-focused="true"]')
            ?.scrollIntoView({ block: "nearest", inline: "nearest" });
        });
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isLatest, handleKeyDown]);

  useEffect(() => {
    if (isLatest && !loading) {
      blogRef.current?.scrollIntoView({ block: "start" });
    }
  }, [currentPage, activeCategory, loading, isLatest]);

  const formatLabels = (labels: string[]) =>
    labels.filter(label => label.toLowerCase() !== "blog").join(", ");

  return (
    <BlogContainer
      data-testid="blog"
      ref={blogRef}
      tabIndex={-1}
      role="region"
      aria-label="Blog"
      aria-busy={loading}
    >
      <BlogToolbar>
        <span>/blogs</span>
        <TerminalAction
          type="button"
          onClick={handleEscape}
          aria-label="Back to terminal"
        >
          [← terminal]
        </TerminalAction>
      </BlogToolbar>

      {loading && posts.length === 0 ? (
        <StatusText role="status">
          <LoadingDots>Loading posts</LoadingDots>
        </StatusText>
      ) : error && posts.length === 0 ? (
        <>
          <StatusText $variant="error" role="alert">
            Error: {error}
          </StatusText>
          <TerminalAction type="button" onClick={() => void refresh()}>
            [retry]
          </TerminalAction>
        </>
      ) : (
        <>
          <TuiUnifiedList>
            {categoryStats.length > 1 && (
              <TuiTagsRow aria-label="Blog categories">
                {categoryStats.map((cat, index) => {
                  const isTagFocused =
                    focusState.section === "tags" &&
                    focusState.tagsIndex === index;
                  return (
                    <TuiTag
                      key={cat.name}
                      type="button"
                      $active={cat.name === activeCategory}
                      $focused={isTagFocused}
                      aria-pressed={cat.name === activeCategory}
                      data-keyboard-focused={isTagFocused}
                      onFocus={() =>
                        setFocusState(prev => ({
                          ...prev,
                          section: "tags",
                          tagsIndex: index,
                        }))
                      }
                      onClick={() => {
                        setFocusState({
                          section: "tags",
                          tagsIndex: index,
                          postIndex: 0,
                        });
                        handleCategoryChange(index);
                      }}
                    >
                      [{cat.name} {cat.count}]
                    </TuiTag>
                  );
                })}
              </TuiTagsRow>
            )}

            {currentPosts.length === 0 ? (
              <EmptyState>
                {posts.length === 0
                  ? "No blog posts yet."
                  : "No posts match your search criteria."}
              </EmptyState>
            ) : (
              currentPosts.map((post, index) => {
                const isFocused =
                  focusState.section === "posts" &&
                  focusState.postIndex === index;
                const labels = formatLabels(post.labels);
                return (
                  <TuiUnifiedItem
                    key={post.id}
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    $focused={isFocused}
                    data-keyboard-focused={isFocused}
                    onFocus={() =>
                      setFocusState(prev => ({
                        ...prev,
                        section: "posts",
                        postIndex: index,
                      }))
                    }
                  >
                    <TuiFocusIndicator $visible={isFocused} aria-hidden="true">
                      {">"}
                    </TuiFocusIndicator>
                    <TuiPostContent>
                      <TuiPostTitle>
                        {startIndex + index + 1}. {post.title}
                      </TuiPostTitle>
                      <TuiPostMeta>
                        {formatRelativeTime(post.createdAt)}
                        {labels && ` · ${labels}`}
                      </TuiPostMeta>
                    </TuiPostContent>
                  </TuiUnifiedItem>
                );
              })
            )}

            {totalPages > 0 && (
              <TuiPaginationRow aria-label="Blog pagination">
                <TerminalAction
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  aria-label="Previous page"
                >
                  {"<prev"}
                </TerminalAction>
                <span role="status" aria-live="polite">
                  Page {currentPage}/{totalPages}
                </span>
                <TerminalAction
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  aria-label="Next page"
                >
                  {"next>"}
                </TerminalAction>
              </TuiPaginationRow>
            )}
          </TuiUnifiedList>

          <TuiSeparator />
          <TuiInstructions>
            <span>Tap/click</span> to open · <span>↑↓</span> to navigate ·
            <span>←→</span> for tags/pages · <span>esc</span> to return
          </TuiInstructions>
          {error && (
            <StatusText $variant="error" role="alert">
              {error}
            </StatusText>
          )}
        </>
      )}
    </BlogContainer>
  );
}

export default Blog;

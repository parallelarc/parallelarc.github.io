/**
 * Custom Hook: Keyboard navigation for TUI (Terminal User Interface)
 * Supports multi-level focus system with category, posts, and pagination layers
 */

import { useCallback } from "react";

export type FocusLevel = "category" | "posts" | "pagination";

export interface FocusState {
  level: FocusLevel;
  categoryIndex: number;
  postIndex: number;
  pageIndex: number;
}

export interface UseKeyboardNavigationOptions {
  focusState: FocusState;
  setFocusState: (state: FocusState) => void;
  categoryCount: number;
  postsPerPage: number;
  currentPagePosts: number;
  totalPages: number;

  // Callbacks for each level
  onCategoryChange?: (index: number) => void;
  onPostSelect?: (index: number) => void;
  onPageChange?: (page: number) => void;
  onEscape?: () => void;
}

export function useKeyboardNavigation({
  focusState,
  setFocusState,
  categoryCount,
  postsPerPage,
  currentPagePosts,
  totalPages,
  onCategoryChange,
  onPostSelect,
  onPageChange,
  onEscape,
}: UseKeyboardNavigationOptions) {
  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if modifier keys are pressed
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      // ESC - exit interactive mode
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape?.();
        return;
      }

      const { level, categoryIndex, postIndex, pageIndex } = focusState;

      switch (level) {
        case "category":
          // Left/Right - switch category
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            const newIndex =
              categoryIndex > 0 ? categoryIndex - 1 : categoryCount - 1;
            setFocusState({ ...focusState, categoryIndex: newIndex });
            onCategoryChange?.(newIndex);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            const newIndex =
              categoryIndex < categoryCount - 1 ? categoryIndex + 1 : 0;
            setFocusState({ ...focusState, categoryIndex: newIndex });
            onCategoryChange?.(newIndex);
          }
          // Tab - move to posts focus
          else if (e.key === "Tab") {
            e.preventDefault();
            setFocusState({ ...focusState, level: "posts" });
          }
          break;

        case "posts":
          // Up/Down - select post
          if (e.key === "ArrowUp") {
            e.preventDefault();
            const newIndex =
              postIndex > 0 ? postIndex - 1 : currentPagePosts - 1;
            setFocusState({ ...focusState, postIndex: newIndex });
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            const newIndex =
              postIndex < currentPagePosts - 1 ? postIndex + 1 : 0;
            setFocusState({ ...focusState, postIndex: newIndex });
          }
          // Enter - open post
          else if (e.key === "Enter") {
            e.preventDefault();
            onPostSelect?.(postIndex);
          }
          // Tab - move to pagination focus
          else if (e.key === "Tab") {
            e.preventDefault();
            setFocusState({ ...focusState, level: "pagination" });
          }
          break;

        case "pagination":
          // Left/Right - change page
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            const newPage = pageIndex > 0 ? pageIndex - 1 : totalPages - 1;
            setFocusState({ ...focusState, pageIndex: newPage });
            onPageChange?.(newPage + 1); // Pages are 1-indexed
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            const newPage = pageIndex < totalPages - 1 ? pageIndex + 1 : 0;
            setFocusState({ ...focusState, pageIndex: newPage });
            onPageChange?.(newPage + 1);
          }
          // PageUp/Down - change page
          else if (e.key === "PageUp" || e.key === "PageDown") {
            e.preventDefault();
            const direction = e.key === "PageUp" ? -1 : 1;
            let newPage = pageIndex + direction;
            // Clamp to valid range
            newPage = Math.max(0, Math.min(totalPages - 1, newPage));
            setFocusState({ ...focusState, pageIndex: newPage });
            onPageChange?.(newPage + 1);
          }
          // Tab - cycle back to category focus
          else if (e.key === "Tab") {
            e.preventDefault();
            setFocusState({ ...focusState, level: "category" });
          }
          break;
      }
    },
    [
      focusState,
      categoryCount,
      currentPagePosts,
      totalPages,
      onCategoryChange,
      onPostSelect,
      onPageChange,
      onEscape,
      setFocusState,
    ]
  );

  return { handleKeyDown };
}

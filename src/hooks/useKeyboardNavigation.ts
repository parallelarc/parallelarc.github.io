/**
 * Custom Hook: Keyboard navigation for Unified TUI List
 * Supports single-list navigation with ↑↓ keys cycling through all sections
 */

import { useCallback } from "react";

export type ListSection = "tags" | "posts";

export interface FocusState {
  section: ListSection;
  tagsIndex: number;
  postIndex: number;
}

export interface UseKeyboardNavigationOptions {
  focusState: FocusState;
  setFocusState: (state: FocusState) => void;
  categoryCount: number;
  currentPagePosts: number;
  totalPages: number;
  currentPage: number;
  activeCategoryIndex?: number;

  // Callbacks
  onCategoryChange?: (index: number) => void;
  onPostSelect?: (index: number) => void;
  onPageChange?: (page: number) => void;
  onEscape?: () => void;
}

export function useKeyboardNavigation({
  focusState,
  setFocusState,
  categoryCount,
  currentPagePosts,
  totalPages,
  currentPage,
  activeCategoryIndex,
  onCategoryChange,
  onPostSelect,
  onPageChange,
  onEscape,
}: UseKeyboardNavigationOptions) {
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

      const { section, tagsIndex, postIndex } = focusState;

      switch (section) {
        case "tags":
          // ↑ - wrap to the last visible post when there is no search input
          if (e.key === "ArrowUp") {
            e.preventDefault();
            if (currentPagePosts > 0) {
              setFocusState({
                ...focusState,
                section: "posts",
                postIndex: currentPagePosts - 1,
              });
            }
          }
          // ↓ - move to first post
          else if (e.key === "ArrowDown" && currentPagePosts > 0) {
            e.preventDefault();
            setFocusState({
              section: "posts",
              tagsIndex,
              postIndex: 0,
            });
          }
          // ← - previous tag (cycle)
          else if (e.key === "ArrowLeft") {
            e.preventDefault();
            const newIndex = tagsIndex > 0 ? tagsIndex - 1 : categoryCount - 1;
            setFocusState({ ...focusState, tagsIndex: newIndex });
            onCategoryChange?.(newIndex);
          }
          // → - next tag (cycle)
          else if (e.key === "ArrowRight") {
            e.preventDefault();
            const newIndex = tagsIndex < categoryCount - 1 ? tagsIndex + 1 : 0;
            setFocusState({ ...focusState, tagsIndex: newIndex });
            onCategoryChange?.(newIndex);
          }
          break;

        case "posts":
          // ↑ - move up in posts or to tags if at first
          if (e.key === "ArrowUp") {
            e.preventDefault();
            if (postIndex > 0) {
              setFocusState({ ...focusState, postIndex: postIndex - 1 });
            } else {
              setFocusState({
                section: "tags",
                tagsIndex: activeCategoryIndex ?? 0,
                postIndex: 0,
              });
            }
          }
          // ↓ - move down in posts or to tags if at last
          else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (postIndex < currentPagePosts - 1) {
              setFocusState({ ...focusState, postIndex: postIndex + 1 });
            } else {
              setFocusState({
                section: "tags",
                tagsIndex: activeCategoryIndex ?? 0,
                postIndex: 0,
              });
            }
          }
          // ← - previous page (cycle)
          else if (e.key === "ArrowLeft" && totalPages > 1) {
            e.preventDefault();
            const newPage = currentPage > 1 ? currentPage - 1 : totalPages;
            onPageChange?.(newPage);
          }
          // → - next page (cycle)
          else if (e.key === "ArrowRight" && totalPages > 1) {
            e.preventDefault();
            const newPage = currentPage < totalPages ? currentPage + 1 : 1;
            onPageChange?.(newPage);
          }
          // Enter/Space - open post
          else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPostSelect?.(postIndex);
          }
          break;
      }
    },
    [
      focusState,
      categoryCount,
      currentPagePosts,
      totalPages,
      currentPage,
      activeCategoryIndex,
      onCategoryChange,
      onPostSelect,
      onPageChange,
      onEscape,
      setFocusState,
    ]
  );

  return { handleKeyDown };
}

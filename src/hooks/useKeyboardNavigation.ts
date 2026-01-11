/**
 * Custom Hook: Keyboard navigation for Unified TUI List
 * Supports single-list navigation with ↑↓ keys cycling through all sections
 */

import { useCallback } from "react";

export type ListSection = "search" | "tags" | "posts";

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
  onSearchInput?: (char: string) => void;
  onSearchBackspace?: () => void;
  // Cursor movement callbacks for search mode
  onSearchMoveLeft?: () => void;
  onSearchMoveRight?: () => void;
  onSearchMoveToStart?: () => void;
  onSearchMoveToEnd?: () => void;
  onSearchDelete?: () => void;
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
  onSearchInput,
  onSearchBackspace,
  onSearchMoveLeft,
  onSearchMoveRight,
  onSearchMoveToStart,
  onSearchMoveToEnd,
  onSearchDelete,
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

      // Handle character input when in search mode
      if (section === "search") {
        // Backspace - delete last character
        if (e.key === "Backspace") {
          e.preventDefault();
          onSearchBackspace?.();
          return;
        }
        // Regular character input - single character, not a control key
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          onSearchInput?.(e.key);
          return;
        }
      }

      switch (section) {
        case "search":
          // ← - move cursor left
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            onSearchMoveLeft?.();
          }
          // → - move cursor right
          else if (e.key === "ArrowRight") {
            e.preventDefault();
            onSearchMoveRight?.();
          }
          // Home - move to start
          else if (e.key === "Home") {
            e.preventDefault();
            onSearchMoveToStart?.();
          }
          // End - move to end
          else if (e.key === "End") {
            e.preventDefault();
            onSearchMoveToEnd?.();
          }
          // Delete - delete character at cursor
          else if (e.key === "Delete") {
            e.preventDefault();
            onSearchDelete?.();
          }
          // ↑ - cycle to last post
          else if (e.key === "ArrowUp" && currentPagePosts > 0) {
            e.preventDefault();
            setFocusState({
              section: "posts",
              tagsIndex: activeCategoryIndex ?? 0,
              postIndex: currentPagePosts - 1,
            });
          }
          // ↓ - move to tags (if categories exist) or first post
          else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (categoryCount > 1) {
              // Has categories, move to tags
              setFocusState({
                section: "tags",
                tagsIndex: activeCategoryIndex ?? 0,
                postIndex: 0
              });
            } else if (currentPagePosts > 0) {
              // No categories, move directly to posts
              setFocusState({ section: "posts", tagsIndex: 0, postIndex: 0 });
            }
          }
          break;

        case "tags":
          // ↑ - move to search
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setFocusState({ ...focusState, section: "search" });
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
                postIndex: 0
              });
            }
          }
          // ↓ - move down in posts or cycle to search if at last
          else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (postIndex < currentPagePosts - 1) {
              setFocusState({ ...focusState, postIndex: postIndex + 1 });
            } else {
              setFocusState({ section: "search", tagsIndex: 0, postIndex: 0 });
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
      onSearchInput,
      onSearchBackspace,
      onSearchMoveLeft,
      onSearchMoveRight,
      onSearchMoveToStart,
      onSearchMoveToEnd,
      onSearchDelete,
      setFocusState,
    ]
  );

  return { handleKeyDown };
}

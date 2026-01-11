import { useEffect, RefObject } from "react";

export interface UseGlobalFocusProps {
  containerRef: RefObject<HTMLDivElement>;
  inputRef: RefObject<HTMLTextAreaElement>;
}

/**
 * Hook for managing global keyboard focus in the terminal
 * - Auto-focuses input on any key press (except ESC)
 * - Scrolls to input when focused
 * - Prevents focus when typing in other inputs
 */
export function useGlobalFocus({
  containerRef,
  inputRef,
}: UseGlobalFocusProps): void {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't focus on ESC key (allows user to escape focus)
      if (e.key === "Escape") return;

      const activeElement = document.activeElement;
      const isTypingInOtherInput =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.getAttribute("contenteditable") === "true");

      // Already focused on input or typing elsewhere
      if (activeElement === inputRef.current || isTypingInOtherInput) return;

      if (inputRef.current && containerRef.current) {
        // Scroll to bottom of container
        containerRef.current.scrollTop = containerRef.current.scrollHeight;

        // Scroll input into view
        inputRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });

        // Focus input (double requestAnimationFrame ensures DOM is ready)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const input = inputRef.current;
            if (input) {
              input.focus();
              const currentPos = input.selectionStart || 0;
              input.setSelectionRange(currentPos, currentPos);
            }
          });
        });
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [containerRef, inputRef]);
}

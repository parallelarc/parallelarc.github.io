import { useEffect, RefObject } from "react";

export interface UseGlobalFocusProps {
  containerRef: RefObject<HTMLDivElement>;
  inputRef: RefObject<HTMLTextAreaElement>;
}

/**
 * Hook for managing global keyboard focus in the terminal
 * - Auto-focuses input when typing outside interactive controls
 * - Scrolls to input when focused
 * - Prevents focus when typing in other inputs
 */
export function useGlobalFocus({
  containerRef,
  inputRef,
}: UseGlobalFocusProps): void {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Let links, buttons and browser navigation keep their native keyboard behavior.
      if (e.defaultPrevented || e.key.length !== 1 || e.metaKey || e.ctrlKey || e.altKey) return;

      const activeElement = document.activeElement;
      if (activeElement?.closest("a, button, [role='button']")) return;
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

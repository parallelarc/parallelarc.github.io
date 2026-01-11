import { useEffect, useRef } from "react";

interface ClipboardHandlerProps {
  containerRef: React.RefObject<HTMLDivElement>;
  setShowCopyToast: (show: boolean) => void;
}

export function useClipboardHandler({
  containerRef,
  setShowCopyToast,
}: ClipboardHandlerProps) {
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      const containerEl = containerRef.current;
      const selection = window.getSelection();

      if (
        !containerEl ||
        !selection ||
        selection.isCollapsed ||
        !selection.anchorNode ||
        !selection.focusNode ||
        !containerEl.contains(selection.anchorNode) ||
        !containerEl.contains(selection.focusNode)
      ) {
        return;
      }

      const selectedText = selection.toString();
      if (!selectedText.trim()) return;

      const triggerToast = () => {
        setShowCopyToast(true);
        if (toastTimerRef.current) {
          clearTimeout(toastTimerRef.current);
        }
        toastTimerRef.current = setTimeout(() => {
          setShowCopyToast(false);
        }, 2200);
      };

      if (navigator?.clipboard?.writeText) {
        navigator.clipboard
          .writeText(selectedText)
          .then(triggerToast)
          .catch(() => {
            // Silently fail if clipboard API doesn't work
          });
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, [containerRef, setShowCopyToast]);

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);
}

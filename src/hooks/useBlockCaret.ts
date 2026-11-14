import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

type BlockCaret = {
  left: number;
  top: number;
  width: number;
  height: number;
  text: string;
  revision: number;
};
const textStyles = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "fontStretch",
  "fontVariant",
  "fontFeatureSettings",
  "letterSpacing",
  "wordSpacing",
  "lineHeight",
  "textIndent",
  "textTransform",
  "tabSize",
  "direction",
  "unicodeBidi",
  "wordBreak",
  "overflowWrap",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "boxSizing",
] as const;

/** Keep native editing, and paint a blinking caret with reversed text colors. */
export function useBlockCaret(inputRef: RefObject<HTMLTextAreaElement>) {
  const [caret, setCaret] = useState<BlockCaret | null>(null);
  const updateRef = useRef<() => void>(() => undefined);
  const refreshCaret = useCallback(() => updateRef.current(), []);

  useLayoutEffect(() => {
    const input = inputRef.current;
    const host = input?.parentElement;
    if (!input || !host) return;

    const mirror = document.createElement("div");
    mirror.setAttribute("aria-hidden", "true");
    Object.assign(mirror.style, {
      position: "absolute",
      left: "0",
      top: "0",
      visibility: "hidden",
      pointerEvents: "none",
      whiteSpace: "pre-wrap",
      height: "0",
      overflow: "hidden",
      margin: "0",
      border: "0",
    });
    const textNode = document.createTextNode("");
    const cell = document.createElement("span");
    cell.textContent = " ";
    Object.assign(cell.style, { position: "absolute", whiteSpace: "pre" });
    mirror.append(textNode, cell);
    host.append(mirror);
    let composing = false;
    let disposed = false;
    let frame: number | null = null;
    let revision = 0;
    let resetBlink = false;
    const segmenter =
      typeof Intl.Segmenter === "function"
        ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
        : null;

    const update = () => {
      if (disposed) return;
      if (
        document.activeElement !== input ||
        input.selectionStart !== input.selectionEnd ||
        composing
      ) {
        setCaret(null);
        return;
      }
      const style = getComputedStyle(input);
      for (const key of textStyles) mirror.style[key] = style[key];
      mirror.style.width = `${input.clientWidth}px`;
      const text = input.value || input.placeholder;
      const position = Math.min(input.selectionStart, text.length);
      // A zero-width character gives empty lines a measurable caret rectangle.
      textNode.data = text + "\u200b";
      const range = document.createRange();
      range.setStart(textNode, position);
      range.collapse(true);
      if (typeof range.getBoundingClientRect !== "function") return;
      let rect = range.getBoundingClientRect();
      const mirrorRect = mirror.getBoundingClientRect();
      const remaining = text.slice(position);
      const character = segmenter
        ? segmenter.segment(remaining)[Symbol.iterator]().next().value?.segment
        : Array.from(remaining)[0];
      let width = cell.getBoundingClientRect().width;
      if (character && character !== "\n" && character !== "\r") {
        range.setEnd(textNode, position + character.length);
        rect = range.getBoundingClientRect();
        width = Math.max(width, rect.width);
      }
      const top = input.offsetTop + rect.top - mirrorRect.top - input.scrollTop;
      const left =
        input.offsetLeft + rect.left - mirrorRect.left - input.scrollLeft;
      if (
        rect.height <= 0 ||
        width <= 0 ||
        top < input.offsetTop ||
        top + rect.height > input.offsetTop + input.clientHeight + 1 ||
        left < input.offsetLeft - 1
      ) {
        setCaret(null);
        return;
      }
      const next = {
        left,
        top,
        width,
        height: rect.height,
        text:
          character && character !== "\n" && character !== "\r"
            ? character
            : " ",
        revision: resetBlink ? ++revision : revision,
      };
      resetBlink = false;
      setCaret(previous =>
        previous &&
        Object.keys(next).every(
          key =>
            previous[key as keyof BlockCaret] === next[key as keyof BlockCaret]
        )
          ? previous
          : next
      );
    };
    // Native events run before React commits the controlled textarea value.
    const scheduleUpdate = (event?: Event) => {
      if (
        event &&
        ["focus", "input", "keydown", "click"].includes(event.type)
      ) {
        resetBlink = true;
      }
      if (disposed || frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        update();
      });
    };
    const startComposition = () => {
      composing = true;
      scheduleUpdate();
    };
    const endComposition = () => {
      composing = false;
      scheduleUpdate();
    };
    const events = [
      "focus",
      "blur",
      "input",
      "keydown",
      "keyup",
      "click",
      "select",
      "scroll",
    ];
    for (const name of events) input.addEventListener(name, scheduleUpdate);
    input.addEventListener("compositionstart", startComposition);
    input.addEventListener("compositionend", endComposition);
    document.addEventListener("selectionchange", scheduleUpdate);
    window.addEventListener("resize", scheduleUpdate);
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => scheduleUpdate())
        : null;
    observer?.observe(input);
    document.fonts?.ready.then(() => scheduleUpdate());
    updateRef.current = update;
    update();
    return () => {
      disposed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      updateRef.current = () => undefined;
      observer?.disconnect();
      for (const name of events)
        input.removeEventListener(name, scheduleUpdate);
      input.removeEventListener("compositionstart", startComposition);
      input.removeEventListener("compositionend", endComposition);
      document.removeEventListener("selectionchange", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      mirror.remove();
    };
  }, [inputRef]);

  return { caret, refreshCaret };
}

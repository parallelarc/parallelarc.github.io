import { useState, useCallback } from "react";

export interface TextInputState {
  value: string;
  cursorPosition: number;
}

export interface TextInputActions {
  setValue: (value: string) => void;
  setCursorPosition: (position: number) => void;
  insertChar: (char: string) => void;
  backspace: () => void;
  deleteChar: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  moveToStart: () => void;
  moveToEnd: () => void;
  clear: () => void;
}

export interface UseTextInputOptions {
  initialValue?: string;
  // Optional callback when value changes
  onChange?: (value: string) => void;
}

/**
 * Reusable hook for managing text input with cursor position
 * Provides a consistent interface for any terminal-style input box
 *
 * @example
 * const { value, cursorPosition, insertChar, backspace, moveLeft, moveRight } = useTextInput();
 *
 * // Render with cursor
 * <>
 *   {value.slice(0, cursorPosition)}
 *   <CursorChar>{value[cursorPosition] || " "}</CursorChar>
 *   {value.slice(cursorPosition + 1)}
 * </>
 */
export function useTextInput(options: UseTextInputOptions = {}): TextInputState & TextInputActions {
  const { initialValue = "", onChange } = options;

  const [value, setValue] = useState(initialValue);
  const [cursorPosition, setCursorPosition] = useState(0);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  const insertChar = useCallback((char: string) => {
    const newValue =
      value.slice(0, cursorPosition) + char + value.slice(cursorPosition);
    handleChange(newValue);
    setCursorPosition(cursorPosition + 1);
  }, [value, cursorPosition, handleChange]);

  const backspace = useCallback(() => {
    if (cursorPosition > 0) {
      const newValue = value.slice(0, cursorPosition - 1) + value.slice(cursorPosition);
      handleChange(newValue);
      setCursorPosition(cursorPosition - 1);
    }
  }, [value, cursorPosition, handleChange]);

  const deleteChar = useCallback(() => {
    if (cursorPosition < value.length) {
      const newValue = value.slice(0, cursorPosition) + value.slice(cursorPosition + 1);
      handleChange(newValue);
    }
  }, [value, cursorPosition, handleChange]);

  const moveLeft = useCallback(() => {
    setCursorPosition(Math.max(0, cursorPosition - 1));
  }, [cursorPosition]);

  const moveRight = useCallback(() => {
    setCursorPosition(Math.min(value.length, cursorPosition + 1));
  }, [value.length, cursorPosition]);

  const moveToStart = useCallback(() => {
    setCursorPosition(0);
  }, []);

  const moveToEnd = useCallback(() => {
    setCursorPosition(value.length);
  }, [value.length]);

  const clear = useCallback(() => {
    handleChange("");
    setCursorPosition(0);
  }, [handleChange]);

  return {
    value,
    cursorPosition,
    setValue: handleChange,
    setCursorPosition,
    insertChar,
    backspace,
    deleteChar,
    moveLeft,
    moveRight,
    moveToStart,
    moveToEnd,
    clear,
  };
}

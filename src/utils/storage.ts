/**
 * Local storage utilities for theme persistence
 */

export function setToLS(key: string, value: string): void {
  window.localStorage.setItem(key, value);
}

export function getFromLS(key: string): string | undefined {
  const value = window.localStorage.getItem(key);
  return value ?? undefined;
}

/**
 * Local storage utilities for theme persistence
 */

export function getFromLS(key: string): string | undefined {
  const value = window.localStorage.getItem(key);
  return value ?? undefined;
}

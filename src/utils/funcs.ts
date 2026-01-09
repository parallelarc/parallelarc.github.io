import theme from "../components/styles/themes";

/**
 * Check if command arguments are valid
 */
export function isArgInvalid(
  arg: string[],
  action: string,
  options: string[]
): boolean {
  return arg[0] !== action || !options.includes(arg[1]) || arg.length > 2;
}

/**
 * Parse the most recent command into an array
 */
export function getCurrentCmdArry(history: string[]): string[] {
  return history[0].trim().split(" ");
}

/**
 * Check if theme should be switched based on command
 */
export function checkThemeSwitch(
  rerender: boolean,
  currentCommand: string[],
  themes: string[]
): boolean {
  return (
    rerender &&
    currentCommand[0] === "themes" &&
    currentCommand[1] === "set" &&
    currentCommand.length > 1 &&
    currentCommand.length < 4 &&
    themes.includes(currentCommand[2])
  );
}

/**
 * Get all theme names
 */
export function getThemeNames(): string[] {
  return Object.keys(theme);
}

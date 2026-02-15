export const AI_COMMAND_NAME = 'ai';

export function encodeAiPrompt(prompt: string): string {
  return encodeURIComponent(prompt);
}

export function decodeAiPrompt(encoded: string): string {
  try {
    return decodeURIComponent(encoded);
  } catch (_error) {
    return encoded;
  }
}

export function buildAiHistoryCommand(prompt: string): string {
  return `${AI_COMMAND_NAME} ${encodeAiPrompt(prompt)}`;
}

export const PLACEHOLDER_PATTERN = /\{\{\s*(\w+)\s*\}\}/g;

const TOKEN_COLOR_COUNT = 4;

// Deterministic so the same {{key}} always gets the same color everywhere it's shown.
export const getTokenColorIndex = (key: string): number => {
  const hash = Array.from(key).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return hash % TOKEN_COLOR_COUNT;
};

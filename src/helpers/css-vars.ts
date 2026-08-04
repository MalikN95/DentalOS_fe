// Canvas (unlike SVG/DOM) can't resolve `var(--token)` itself, so chart
// components that draw on a <canvas> need the literal resolved color.
export const readCssVar = (name: string, fallback = '#000000'): string => {
  if (typeof window === 'undefined') return fallback;

  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

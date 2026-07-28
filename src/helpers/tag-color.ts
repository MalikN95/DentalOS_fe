// Deterministic pastel background/foreground for a patient tag. A tag with
// no stored hue derives one from its id, so it renders consistently without
// ever needing to persist an "auto" value; rerolling or picking a color just
// persists an explicit hue that overrides this derivation from then on.
const HASH_PRIME = 31;

export const deriveTagHue = (seed: string): number => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * HASH_PRIME + seed.charCodeAt(index)) >>> 0;
  }
  return hash % 360;
};

export const randomTagHue = (): number => Math.floor(Math.random() * 360);

export const tagHue = (tag: { id: string; color: number | null }): number =>
  tag.color ?? deriveTagHue(tag.id);

export const tagBackground = (hue: number): string => `hsl(${hue} 65% 90%)`;

export const tagForeground = (hue: number): string => `hsl(${hue} 45% 32%)`;

// A small fixed palette for manual color pickers — evenly spaced hues so
// picks stay visually distinct from one another.
export const TAG_HUE_PRESETS = [0, 30, 60, 120, 165, 200, 230, 265, 300, 330];

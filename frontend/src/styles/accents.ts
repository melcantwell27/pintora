/**
 * Playful "confetti" accent palette.
 *
 * This is the one design set that lives outside the MUI theme on purpose:
 * MUI's palette isn't built for an arbitrary rotating categorical scale, so
 * we keep it here. `accentForKey` deterministically maps any string (tag
 * label, username) to one accent, so the same key is always the same color.
 */
export type Accent = { bg: string; fg: string };

export const ACCENTS: Accent[] = [
  { bg: "#FFE3D0", fg: "#B4501F" }, // peach
  { bg: "#FFDCE7", fg: "#C0396B" }, // pink
  { bg: "#DDF3E4", fg: "#1F7A4D" }, // mint
  { bg: "#E4E6FF", fg: "#4A47B8" }, // lavender
  { bg: "#DBF0FA", fg: "#1E6E96" }, // sky
  { bg: "#FFF1C9", fg: "#9A6B00" }, // lemon
  { bg: "#F3E1FF", fg: "#8036B0" }, // grape
  { bg: "#D6F5F1", fg: "#0E7C74" }, // teal
];

export function accentForKey(key: string): Accent {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return ACCENTS[hash % ACCENTS.length];
}

// Ice-cream programs get intentional colors; anything else falls back to hash.
const PROGRAM_ACCENTS: Record<string, Accent> = {
  "Lite Ice Cream": { bg: "#DDF3E4", fg: "#1F7A4D" },
  "Ice Cream": { bg: "#FFE3D0", fg: "#B4501F" },
  Sorbet: { bg: "#FFDCE7", fg: "#C0396B" },
  Gelato: { bg: "#F3E1FF", fg: "#8036B0" },
  "Smoothie Bowl": { bg: "#D6F5F1", fg: "#0E7C74" },
  Milkshake: { bg: "#DBF0FA", fg: "#1E6E96" },
};

export function accentForProgram(label: string): Accent {
  return PROGRAM_ACCENTS[label] ?? accentForKey(label);
}

import type { components } from "@/lib/api/schema";

export type ProgramEnum = components["schemas"]["ProgramEnum"];

export const PROGRAM_OPTIONS = [
  { value: "ice_cream", label: "Ice Cream" },
  { value: "lite_ice_cream", label: "Lite Ice Cream" },
  { value: "sorbet", label: "Sorbet" },
  { value: "gelato", label: "Gelato" },
  { value: "smoothie_bowl", label: "Smoothie Bowl" },
  { value: "milkshake", label: "Milkshake" },
  { value: "mix_in", label: "Mix-in" },
  { value: "frozen_yogurt", label: "Frozen Yogurt" },
  { value: "italian_ice", label: "Italian Ice" },
] as const satisfies readonly { value: ProgramEnum; label: string }[];

export const PROGRAM_VALUES = PROGRAM_OPTIONS.map((option) => option.value) as [
  ProgramEnum,
  ...ProgramEnum[],
];

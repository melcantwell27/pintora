import { describe, expect, it } from "vitest";

import type { RecipeIngredient } from "@/types";

import { formatDate, formatIngredient } from "./index";

function ingredient(overrides: Partial<RecipeIngredient>): RecipeIngredient {
  return { id: 1, name: "almond milk", ...overrides };
}

describe("formatIngredient", () => {
  it("joins quantity, unit, and name", () => {
    expect(
      formatIngredient(ingredient({ quantity: "1.50", unit: "cup" })),
    ).toBe("1.5 cup almond milk");
  });

  it("appends the prep note in parentheses", () => {
    expect(
      formatIngredient(
        ingredient({ quantity: "2.00", unit: "tbsp", prep_note: "melted" }),
      ),
    ).toBe("2 tbsp almond milk (melted)");
  });

  it("omits empty quantity and unit", () => {
    expect(formatIngredient(ingredient({}))).toBe("almond milk");
  });
});

describe("formatDate", () => {
  it("formats an ISO date as a short date", () => {
    expect(formatDate("2026-07-08T12:00:00Z")).toMatch(/Jul 8, 2026/);
  });
});

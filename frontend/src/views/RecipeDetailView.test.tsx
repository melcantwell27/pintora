import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { defaultRecipeDetail } from "@/test/msw/handlers";
import { renderWithProviders } from "@/test/test-utils";

import { RecipeDetailView } from "./RecipeDetailView";

describe("RecipeDetailView", () => {
  it("renders the recipe fetched by slug", async () => {
    renderWithProviders(<RecipeDetailView slug={defaultRecipeDetail.slug} />);

    expect(
      await screen.findByRole("heading", { name: "Vanilla Bean Dream" }),
    ).toBeInTheDocument();
    expect(screen.getByText("by @mel")).toBeInTheDocument();
    expect(screen.getByText("Ice Cream")).toBeInTheDocument();
    expect(screen.getByText(/1\.5 cup almond milk/)).toBeInTheDocument();
    expect(screen.getByText(/blend the base/i)).toBeInTheDocument();
  });

  it("shows an error for an unknown slug", async () => {
    renderWithProviders(<RecipeDetailView slug="does-not-exist" />);

    expect(await screen.findByText(/recipe not found/i)).toBeInTheDocument();
  });
});

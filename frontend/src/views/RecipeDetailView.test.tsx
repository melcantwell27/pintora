import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { buildRecipeDetail } from "@/test/fixtures";
import { api, defaultRecipeDetail } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
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
    expect(
      screen.getByText(/spin twice for extra creaminess/i),
    ).toBeInTheDocument();
  });

  it("omits the special prep section when it's blank", async () => {
    server.use(
      http.get(api("/api/recipes/:slug/"), () =>
        HttpResponse.json(buildRecipeDetail({ special_prep: "" })),
      ),
    );

    renderWithProviders(<RecipeDetailView slug={defaultRecipeDetail.slug} />);

    await screen.findByRole("heading", { name: "Vanilla Bean Dream" });
    expect(screen.queryByText("Special prep")).not.toBeInTheDocument();
  });

  it("shows an error for an unknown slug", async () => {
    renderWithProviders(<RecipeDetailView slug="does-not-exist" />);

    expect(await screen.findByText(/recipe not found/i)).toBeInTheDocument();
  });
});

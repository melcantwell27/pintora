import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { paginated } from "@/test/fixtures";
import { api } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/test-utils";

import { HomeView } from "./HomeView";

describe("HomeView", () => {
  it("renders the recipe feed from the API", async () => {
    renderWithProviders(<HomeView />);

    expect(await screen.findByText("Vanilla Bean Dream")).toBeInTheDocument();
    expect(screen.getByText("Mango Sorbet Sunrise")).toBeInTheDocument();
  });

  it("shows an error alert when the API fails", async () => {
    server.use(
      http.get(api("/api/recipes/"), () =>
        HttpResponse.json({ detail: "Server error." }, { status: 500 }),
      ),
    );

    renderWithProviders(<HomeView />);

    expect(
      await screen.findByText(/couldn't load recipes/i),
    ).toBeInTheDocument();
  });

  it("shows the empty state when there are no recipes", async () => {
    server.use(
      http.get(api("/api/recipes/"), () => HttpResponse.json(paginated([]))),
    );

    renderWithProviders(<HomeView />);

    expect(await screen.findByText(/no recipes yet/i)).toBeInTheDocument();
  });
});

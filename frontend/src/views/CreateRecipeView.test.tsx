import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildRecipeWrite } from "@/test/fixtures";
import { api } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/test-utils";

import { CreateRecipeView } from "./CreateRecipeView";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), refresh: vi.fn() }),
}));

describe("CreateRecipeView", () => {
  beforeEach(() => pushMock.mockClear());

  it("shows validation errors instead of submitting an empty form", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateRecipeView />);

    await user.click(screen.getByRole("button", { name: /publish/i }));

    expect(
      await screen.findByText("Give your recipe a title."),
    ).toBeInTheDocument();
    expect(screen.getByText("Add the instructions.")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("rejects an added ingredient row with an empty name", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateRecipeView />);

    await user.type(screen.getByLabelText(/title/i), "Peach Sorbet");
    await user.type(screen.getByLabelText(/instructions/i), "Spin it.");
    await user.click(screen.getByRole("button", { name: /add ingredient/i }));
    await user.click(screen.getByRole("button", { name: /publish/i }));

    expect(
      await screen.findByText("Ingredient name can't be empty."),
    ).toBeInTheDocument();
  });

  it("publishes the recipe and redirects to its page", async () => {
    let requestBody: unknown;
    server.use(
      http.post(api("/api/recipes/"), async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(buildRecipeWrite({ slug: "peach-sorbet" }), {
          status: 201,
        });
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<CreateRecipeView />);

    await user.type(screen.getByLabelText(/title/i), "Peach Sorbet");
    await user.type(screen.getByLabelText(/instructions/i), "Spin it.");
    await user.click(screen.getByRole("button", { name: /add ingredient/i }));
    await user.type(screen.getByLabelText("Ingredient 1"), "frozen peaches");
    await user.click(screen.getByRole("button", { name: /publish/i }));

    await vi.waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/recipes/peach-sorbet"),
    );
    expect(requestBody).toEqual({
      title: "Peach Sorbet",
      instructions: "Spin it.",
      ingredients: [{ section: "base", name: "frozen peaches", sort_order: 0 }],
      is_published: true,
    });
  });
});

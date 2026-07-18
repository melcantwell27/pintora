import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildParseResponse, buildRecipeWrite } from "@/test/fixtures";
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
    expect(
      screen.getByText("Add at least one ingredient."),
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("rejects an added ingredient row with an empty name", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateRecipeView />);

    await user.type(screen.getByLabelText(/title/i), "Peach Sorbet");
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
    await user.click(screen.getByRole("button", { name: /add ingredient/i }));
    await user.type(screen.getByLabelText("Ingredient 1"), "frozen peaches");
    await user.click(screen.getByRole("button", { name: /publish/i }));

    await vi.waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/recipes/peach-sorbet"),
    );
    expect(requestBody).toEqual({
      title: "Peach Sorbet",
      special_prep: "",
      ingredients_text: "",
      ingredients: [{ section: "base", name: "frozen peaches", sort_order: 0 }],
      is_published: true,
    });
  });

  it("includes selected tags in the publish payload", async () => {
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
    await user.click(await screen.findByRole("button", { name: /#vegan/i }));
    await user.click(screen.getByRole("button", { name: /#fruity/i }));
    await user.click(screen.getByRole("button", { name: /add ingredient/i }));
    await user.type(screen.getByLabelText("Ingredient 1"), "frozen peaches");
    await user.click(screen.getByRole("button", { name: /publish/i }));

    await vi.waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/recipes/peach-sorbet"),
    );
    expect(requestBody).toMatchObject({
      title: "Peach Sorbet",
      tag_slugs: ["vegan", "fruity"],
    });
  });

  it("disables the parse button until free-form text is entered", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateRecipeView />);

    const parseButton = screen.getByRole("button", {
      name: /parse & replace rows/i,
    });
    expect(parseButton).toBeDisabled();

    await user.type(screen.getByLabelText(/what's in the pint/i), "1 cup milk");
    expect(parseButton).toBeEnabled();
  });

  it("parses free-form text into editable structured rows", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateRecipeView />);

    await user.type(
      screen.getByLabelText(/what's in the pint/i),
      "1 cup almond milk, 2 tbsp cocoa powder",
    );
    await user.click(
      screen.getByRole("button", { name: /parse & replace rows/i }),
    );

    expect(await screen.findByDisplayValue("almond milk")).toBeInTheDocument();
    expect(screen.getByDisplayValue("cocoa powder")).toBeInTheDocument();
  });

  it("renders parser warnings when the response includes them", async () => {
    server.use(
      http.post(api("/api/recipes/parse-ingredients/"), () =>
        HttpResponse.json(
          buildParseResponse({
            warnings: ['Approximate amount: "handful of oats"'],
          }),
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<CreateRecipeView />);

    await user.type(
      screen.getByLabelText(/what's in the pint/i),
      "handful of oats",
    );
    await user.click(
      screen.getByRole("button", { name: /parse & replace rows/i }),
    );

    expect(
      await screen.findByText('Approximate amount: "handful of oats"'),
    ).toBeInTheDocument();
  });
});

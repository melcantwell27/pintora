import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { api } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/test-utils";

import { LoginView } from "./LoginView";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), refresh: vi.fn() }),
}));

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/email/i), email);
  await user.type(screen.getByLabelText(/password/i), password);
  await user.click(screen.getByRole("button", { name: /log in/i }));
}

describe("LoginView", () => {
  it("logs in and redirects home", async () => {
    let requestBody: unknown;
    server.use(
      http.post(api("/_allauth/browser/v1/auth/login"), async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ status: 200 });
      }),
    );

    renderWithProviders(<LoginView />);
    await fillAndSubmit("mel@example.com", "hunter2secure");

    await vi.waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));
    expect(requestBody).toEqual({
      email: "mel@example.com",
      password: "hunter2secure",
    });
  });

  it("surfaces the API error message on bad credentials", async () => {
    server.use(
      http.post(api("/_allauth/browser/v1/auth/login"), () =>
        HttpResponse.json(
          { errors: [{ message: "Incorrect email or password." }] },
          { status: 400 },
        ),
      ),
    );

    renderWithProviders(<LoginView />);
    await fillAndSubmit("mel@example.com", "wrong-password");

    expect(
      await screen.findByText("Incorrect email or password."),
    ).toBeInTheDocument();
  });
});

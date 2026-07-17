import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { buildUserMe } from "@/test/fixtures";
import { api } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/test-utils";

import { BottomNav } from "./BottomNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("BottomNav", () => {
  it("shows a Sign in tab while anonymous", async () => {
    renderWithProviders(<BottomNav />);

    expect(await screen.findByText("Sign in")).toBeInTheDocument();
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
  });

  it("shows the Profile tab once the session resolves", async () => {
    server.use(
      http.get(api("/api/me/"), () => HttpResponse.json(buildUserMe())),
    );

    renderWithProviders(<BottomNav />);

    expect(await screen.findByText("Profile")).toBeInTheDocument();
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
  });
});

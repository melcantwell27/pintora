export const APP_NAME = "Pintora";

export const ROUTES = {
  home: "/",
  search: "/search",
  create: "/create",
  profile: "/profile",
  login: "/login",
  signup: "/signup",
  recipe: (slug: string) => `/recipes/${slug}`,
} as const;

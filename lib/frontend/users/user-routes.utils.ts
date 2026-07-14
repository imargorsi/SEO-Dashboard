export const USER_ROUTES = {
  list: "/users",
  create: "/users/new",
  view: (userId: string) => `/users/${userId}`,
  edit: (userId: string) => `/users/edit/${userId}`,
} as const;

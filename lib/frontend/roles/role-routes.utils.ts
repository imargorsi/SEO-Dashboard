export const ROLE_ROUTES = {
  list: "/roles",
  create: "/roles/new",
  edit: (roleId: string) => `/roles/${roleId}/edit`,
} as const;

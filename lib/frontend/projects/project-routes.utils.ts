export const PROJECT_ROUTES = {
  list: "/projects",
  create: "/projects/create",
  view: (projectId: string) => `/projects/view/${projectId}`,
  edit: (projectId: string) => `/projects/edit/${projectId}`,
} as const;

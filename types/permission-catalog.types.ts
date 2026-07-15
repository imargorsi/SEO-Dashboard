export type TPermissionModule = {
  slug: string;
  label: string;
  actions: readonly string[];
};

export type TPermissionCatalog = {
  project_modules: TPermissionModule[];
  admin_modules: TPermissionModule[];
};

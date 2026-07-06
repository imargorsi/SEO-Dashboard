export type WorkspaceProject = {
  id: string;
  name: string;
  url: string;
  /** Short label shown inside the project logo (e.g. initials). */
  logoLabel: string;
  logoGradientFrom: string;
  logoGradientTo: string;
};

export const DUMMY_WORKSPACE_PROJECTS: WorkspaceProject[] = [
  {
    id: "proj-seo-1",
    name: "SEO Project 1",
    url: "https://seoproject1.com",
    logoLabel: "S1",
    logoGradientFrom: "#6366f1",
    logoGradientTo: "#8b5cf6",
  },
  {
    id: "proj-seo-2",
    name: "SEO Project 2",
    url: "https://seoproject2.com",
    logoLabel: "S2",
    logoGradientFrom: "#0ea5e9",
    logoGradientTo: "#06b6d4",
  },
];

export function formatProjectHostname(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function getWorkspaceProjectById(id: string): WorkspaceProject | undefined {
  return DUMMY_WORKSPACE_PROJECTS.find((p) => p.id === id);
}

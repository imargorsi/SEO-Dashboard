import { createBrowserRouter } from "react-router-dom"
import { AuthLayout } from "../layouts/AuthLayout.tsx"
import { DashboardLayout } from "../layouts/DashboardLayout.tsx"
import { SignInPage } from "../pages/auth/SignInPage.tsx"
import { CompaniesCreatePage } from "../pages/companies/CompaniesCreatePage.tsx"
import { CompanyProjectsListPage } from "../pages/companies/CompanyProjectsListPage.tsx"
import { CompaniesListPage } from "../pages/companies/CompaniesListPage.tsx"
import { DashboardPage } from "../pages/dashboard/DashboardPage.tsx"
import { PermissionsCreatePage } from "../pages/permissions/PermissionsCreatePage.tsx"
import { PermissionsListPage } from "../pages/permissions/PermissionsListPage.tsx"
import { ProjectsCreatePage } from "../pages/projects/ProjectsCreatePage.tsx"
import { ProjectsListPage } from "../pages/projects/ProjectsListPage.tsx"
import { ChangePasswordPage } from "../pages/profile/ChangePasswordPage.tsx"
import { EditProfilePage } from "../pages/profile/EditProfilePage.tsx"
import { RolesCreatePage } from "../pages/roles/RolesCreatePage.tsx"
import { RolesListPage } from "../pages/roles/RolesListPage.tsx"
import { SettingsPage } from "../pages/settings/SettingsPage.tsx"
import { UsersCreatePage } from "../pages/users/UsersCreatePage.tsx"
import { UsersListPage } from "../pages/users/UsersListPage.tsx"
import { GuestOnly, RequireAuth } from "./AuthGuards.tsx"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: (
          <GuestOnly>
            <SignInPage />
          </GuestOnly>
        ),
      },
    ],
  },
  {
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/companies", element: <CompaniesListPage /> },
      { path: "/companies/new", element: <CompaniesCreatePage /> },
      { path: "/companies/:id/edit", element: <CompaniesCreatePage /> },
      { path: "/companies/:companyId/projects", element: <CompanyProjectsListPage /> },
      {
        path: "/companies/:companyId/projects/new",
        element: <ProjectsCreatePage />,
      },
      {
        path: "/companies/:companyId/projects/:id/edit",
        element: <ProjectsCreatePage />,
      },
      { path: "/users", element: <UsersListPage /> },
      { path: "/users/new", element: <UsersCreatePage /> },
      { path: "/projects", element: <ProjectsListPage /> },
      { path: "/projects/new", element: <ProjectsCreatePage /> },
      { path: "/projects/:id/edit", element: <ProjectsCreatePage /> },
      { path: "/roles", element: <RolesListPage /> },
      { path: "/roles/new", element: <RolesCreatePage /> },
      { path: "/roles/:id/edit", element: <RolesCreatePage /> },
      { path: "/permissions", element: <PermissionsListPage /> },
      { path: "/permissions/new", element: <PermissionsCreatePage /> },
      { path: "/permissions/:id/edit", element: <PermissionsCreatePage /> },
      { path: "/edit-profile", element: <EditProfilePage /> },
      { path: "/change-password", element: <ChangePasswordPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
])

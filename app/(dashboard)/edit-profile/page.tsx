"use client";

import { DashboardModuleBreadcrumbSection } from "@/components/layout/dashboard-module-breadcrumb-section";
import { SidebarUserAvatar } from "@/components/layout/sidebar-user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/input";

export default function EditProfilePage() {
  return (
    <div className="flex h-full w-full min-w-0 flex-col">
      <DashboardModuleBreadcrumbSection
        items={[
          { id: "dashboard", label: "Dashboard", href: "/dashboard" },
          { id: "edit-profile", label: "Edit profile" },
        ]}
      />

      <div className="flex flex-1 items-center px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 sm:p-6">
            <div className="mb-5">
              <h1 className="text-xl font-semibold text-[var(--text-h)]">User information</h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Update Your Basic Account Details.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <SidebarUserAvatar
                    name="Ar Gorsi"
                    uploadMode="upload"
                    uploadInputId="profile-image"
                    size="md"
                    className="size-16 rounded-xl text-sm"
                  />
                  <Input id="profile-name" name="name" label="Name" placeholder="Your name" className="w-full" />
                </div>
              </div>
              <Input
                id="profile-email"
                name="email"
                type="email"
                label="Email"
                value="user@example.com"
                disabled
                className="sm:col-span-2"
              />
            </div>

            <div className="mt-5 flex justify-end">
              <Button variant="outline" type="button">Save Profile</Button>
            </div>
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-[var(--text-h)]">Change password</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Set a New Account Password.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="new-password"
                name="new_password"
                type="password"
                label="New Password"
                autoComplete="new-password"
              />
              <Input
                id="confirm-new-password"
                name="confirm_new_password"
                type="password"
                label="Confirm New Password"
                autoComplete="new-password"
              />
            </div>

            <div className="mt-5 flex justify-end">
              <Button variant="outline" type="button">Save Password</Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

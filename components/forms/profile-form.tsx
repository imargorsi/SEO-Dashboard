"use client";

import { SidebarUserAvatar } from "@/components/layout/sidebar-user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/input";
import { useProfileForm } from "@/components/forms/hooks/use-profile-form";
import type { AuthUser } from "@/lib/frontend/auth/types";
import { PROFILE_IMAGE_ACCEPT } from "@/lib/frontend/forms/profile-image-validation";

type ProfileFormProps = {
  user: AuthUser;
};

export function ProfileForm({ user }: ProfileFormProps) {
  const { register, handleSubmit, watch, errors, onSubmit, handleProfileImageChange, avatarImageUrl } =
    useProfileForm(user);
  const name = watch("name");

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 sm:p-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-[var(--text-h)]">User information</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Update Your Basic Account Details.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-1.5">
                <SidebarUserAvatar
                  name={name || user.name}
                  imageUrl={avatarImageUrl}
                  uploadMode="upload"
                  uploadInputId="profile-image"
                  uploadAccept={PROFILE_IMAGE_ACCEPT}
                  onUploadChange={handleProfileImageChange}
                  size="md"
                  className="size-16 rounded-xl text-sm"
                />
                {errors.profile_image?.message ? (
                  <p className="max-w-40 text-sm text-[var(--destructive)]" role="alert">
                    {errors.profile_image.message}
                  </p>
                ) : null}
              </div>
              <Input
                id="profile-name"
                label="Name"
                placeholder="Your name"
                error={errors.name?.message}
                {...register("name", { required: "Name is required" })}
              />
            </div>
          </div>
          <Input
            id="profile-email"
            label="Email"
            type="email"
            disabled
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div className="mt-5 flex justify-end">
          <Button variant="outline" type="submit">
            Save Profile
          </Button>
        </div>
      </form>
    </section>
  );
}

"use client";

import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { ProfileForm } from "@/components/forms/profile-form";
import { Spinner } from "@/components/ui/spinner";
import { useAuthUserQuery } from "@/features/auth/auth.api";

export default function EditProfilePage() {
  const { data: authUser, isLoading } = useAuthUserQuery();

  return (
    <div className="flex h-full w-full min-w-0 flex-col">
      <div className="flex flex-1 items-center px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
          {isLoading || !authUser ? (
            <div className="flex justify-center py-16">
              <Spinner className="size-8" />
            </div>
          ) : (
            <>
              <ProfileForm user={authUser} />
              <ChangePasswordForm />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

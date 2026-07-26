"use client";

import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { ProfileForm } from "@/components/forms/profile-form";
import { Skeleton } from "@/components/ui/skeleton";
import { elevatedCardSurfaceClass } from "@/lib/frontend/layout/dashboard-chrome";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { cn } from "@/lib/utils";

function ProfilePageSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading</span>
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className={cn(elevatedCardSurfaceClass, "space-y-5 rounded-3xl p-5 sm:p-6")}>
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, fieldIndex) => (
              <div key={fieldIndex} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EditProfilePage() {
  const { data: authUser, isLoading } = useAuthUserQuery();

  return (
    <div className="flex h-full w-full min-w-0 flex-col">
      <div className="flex flex-1 items-center px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
          {isLoading || !authUser ? (
            <ProfilePageSkeleton />
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

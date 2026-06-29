import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import useSWR from "swr"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { FormTextField } from "@/components/form/FormTextField"
import { ProfileImagePicker } from "@/components/profile/ProfileImagePicker"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button as AnimatedSubmitButton } from "@/components/ui/moving-border"
import { Spinner } from "@/components/ui/spinner"
import type { AuthUser } from "@/lib/auth/authApi.types"
import {
  fetchMeProfile,
  ME_PROFILE_ENDPOINT,
  patchMeProfile,
  resolveProfileAssetUrl,
  type MeProfile,
} from "@/lib/auth/profileApi"
import { getStoredAuthUser, setStoredAuthUser } from "@/lib/auth/sessionUser.ts"
import { cn } from "@/lib/utils"

type EditProfileFormValues = {
  name: string
}

function ReadonlyBlock({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </p>
      <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[color-mix(in_srgb,var(--social-bg)_88%,transparent)] px-3 py-2.5 text-sm text-[var(--text)] dark:bg-white/[0.04]">
        {children}
      </div>
    </div>
  )
}

function mergeAuthUserFromProfile(
  prev: AuthUser | null,
  profile: MeProfile,
): AuthUser | null {
  if (!prev) return null
  return {
    ...prev,
    name: profile.name,
    email: profile.email,
    email_verified_at: profile.email_verified_at,
    company_id: profile.company_id,
    roles: profile.roles,
    permissions: profile.permissions,
    home_api_path: profile.home_api_path,
    profile_image: profile.profile_image ?? prev.profile_image ?? null,
  }
}

export function EditProfileForm() {
  const { t } = useTranslation("translation", {
    keyPrefix: "profile.edit",
  })
  const [formAlert, setFormAlert] = useState<
    | { variant: "default"; title: string; description?: string }
    | { variant: "destructive"; title: string; description?: string }
    | null
  >(null)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [objectPreviewUrl, setObjectPreviewUrl] = useState<string | null>(null)

  const { data: profile, error, isLoading, mutate } = useSWR(
    ME_PROFILE_ENDPOINT,
    fetchMeProfile,
    { revalidateOnFocus: false },
  )

  const form = useForm<EditProfileFormValues>({
    defaultValues: { name: "" },
    mode: "onSubmit",
  })

  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { isSubmitting },
  } = form

  useEffect(() => {
    if (!profile) return
    reset({ name: profile.name })
  }, [profile, reset])

  useEffect(() => {
    if (!pendingImageFile) {
      setObjectPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      return
    }
    const url = URL.createObjectURL(pendingImageFile)
    setObjectPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [pendingImageFile])

  const remoteImageResolved = useMemo(() => {
    if (!profile?.profile_image) return null
    return resolveProfileAssetUrl(profile.profile_image)
  }, [profile?.profile_image])

  const displayPreviewSrc = objectPreviewUrl ?? remoteImageResolved

  async function onSubmit(values: EditProfileFormValues) {
    if (!profile) return
    setFormAlert(null)
    try {
      const json = await patchMeProfile({
        name: values.name,
        email: profile.email,
        profileImageFile: pendingImageFile,
      })
      const apiMsg =
        typeof json.message === "string" && json.message.trim()
          ? json.message.trim()
          : null

      if (!json.success) {
        const errs = json.errors ?? {}
        for (const key of ["name", "email", "profile_image"] as const) {
          const fieldErrs = errs[key]
          if (fieldErrs && fieldErrs.length > 0) {
            if (key === "name") {
              setError("name", { type: "server", message: fieldErrs[0] })
            }
          }
        }
        const imgErr = errs.profile_image?.[0]
        const emailErr = errs.email?.[0]
        const extra = imgErr ?? emailErr
        setFormAlert({
          variant: "destructive",
          title: t("errorTitle"),
          description: apiMsg ?? extra ?? t("errorFallback"),
        })
        return
      }

      const nextProfile = await fetchMeProfile()
      await mutate(nextProfile, false)

      setValue("name", nextProfile.name)
      setPendingImageFile(null)

      const stored = getStoredAuthUser()
      const merged = mergeAuthUserFromProfile(stored, nextProfile)
      if (merged) setStoredAuthUser(merged)

      setFormAlert({
        variant: "default",
        title: t("successTitle"),
        description: apiMsg ?? t("successFallback"),
      })
    } catch (e) {
      setFormAlert({
        variant: "destructive",
        title: t("errorTitle"),
        description: e instanceof Error ? e.message : t("errorFallback"),
      })
    }
  }

  if (isLoading && !profile) {
    return (
      <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-8">
        <Spinner className="size-8 text-[var(--brand)]" />
        <p className="text-sm text-[var(--text-muted)]">{t("loading")}</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4 shrink-0" aria-hidden />
        <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : t("loadErrorBody")}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      {formAlert ? (
        <Alert variant={formAlert.variant}>
          {formAlert.variant === "destructive" ? (
            <AlertCircle className="size-4 shrink-0" aria-hidden />
          ) : (
            <CheckCircle2
              className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-hidden
            />
          )}
          <AlertTitle>{formAlert.title}</AlertTitle>
          {formAlert.description ? (
            <AlertDescription>{formAlert.description}</AlertDescription>
          ) : null}
        </Alert>
      ) : null}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow)] sm:p-8">
        <div className="mb-8 space-y-1">
          <h2 className="text-lg font-semibold text-[var(--text-h)]">{t("title")}</h2>
          <p className="text-sm text-[var(--text-muted)]">{t("lead")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="flex shrink-0 flex-col items-center lg:w-44">
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {t("photoLabel")}
              </p>
              <ProfileImagePicker
                previewSrc={displayPreviewSrc}
                onFileSelect={setPendingImageFile}
                showClearPending={pendingImageFile != null}
                disabled={isSubmitting}
                pickLabel={t("photoPick")}
                changeLabel={t("photoChange")}
                clearLabel={t("photoClear")}
              />
              <p className="mt-2 max-w-[11rem] text-center text-[11px] leading-snug text-[var(--text-muted)]">
                {t("photoHint")}
              </p>
            </div>

            <div className="min-w-0 flex-1 space-y-6">
              <FormTextField
                control={control}
                name="name"
                label={t("nameLabel")}
                placeholder={t("namePh")}
                autoComplete="name"
                rules={{
                  required: t("valRequired"),
                  minLength: { value: 2, message: t("valMin") },
                }}
              />
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-8">
            <h3 className="mb-4 text-sm font-semibold text-[var(--text-h)]">
              {t("sectionReadonly")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <ReadonlyBlock label={t("emailLabel")} className="sm:col-span-2">
                <span className="font-medium text-[var(--text-h)]">{profile.email}</span>
              </ReadonlyBlock>
              <ReadonlyBlock label={t("rolesHeading")} className="sm:col-span-2">
                {profile.roles.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.roles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--social-bg)_90%,var(--bg-elevated))] px-2.5 py-0.5 text-xs font-medium capitalize text-[var(--text-h)]"
                      >
                        {role.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[var(--text-muted)]">{t("noRoles")}</span>
                )}
              </ReadonlyBlock>
              <ReadonlyBlock label={t("permissionsHeading")} className="sm:col-span-2">
                {profile.permissions.length ? (
                  <div className="max-h-48 overflow-y-auto pr-1">
                    <div className="flex flex-wrap gap-1.5">
                      {profile.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="inline-flex rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-h)]"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-[var(--text-muted)]">{t("noPermissions")}</span>
                )}
              </ReadonlyBlock>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <AnimatedSubmitButton
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              borderRadius="0.5rem"
              containerClassName="w-full max-w-full sm:w-auto sm:min-w-[11rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] disabled:pointer-events-none disabled:opacity-60"
            >
              <span className="inline-flex items-center justify-center gap-2 px-1">
                {isSubmitting ? (
                  <Spinner className="size-4 shrink-0 text-[var(--motion-btn-fg)]" />
                ) : null}
                {isSubmitting ? t("saving") : t("save")}
              </span>
            </AnimatedSubmitButton>
            <Link
              to="/change-password"
              className="text-center text-sm font-medium text-[var(--brand)] hover:underline sm:text-end"
            >
              {t("linkChangePassword")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

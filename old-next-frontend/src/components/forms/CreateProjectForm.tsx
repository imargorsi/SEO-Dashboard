import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import useSWR from "swr"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { FormCheckboxField } from "@/components/form/FormCheckboxField"
import { FormCheckboxWithActionField } from "@/components/form/FormCheckboxWithActionField"
import {
  FormCheckboxGroupField,
  type CheckboxGroupOption,
} from "@/components/form/FormCheckboxGroupField"
import {
  FormSelectField,
  type FormSelectOption,
} from "@/components/form/FormSelectField"
import { FormTagsField } from "@/components/form/FormTagsField"
import { FormTextField } from "@/components/form/FormTextField"
import { FormTextareaField } from "@/components/form/FormTextareaField"
import {
  emptyCreateProjectValues,
  toCreateProjectPayload,
  type CreateProjectFormValues,
} from "@/components/forms/createProjectForm.types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button as AnimatedSubmitButton } from "@/components/ui/moving-border"
import { Spinner } from "@/components/ui/spinner"
import { useAuthUser } from "@/hooks/useAuthUser"
import { postProject, putProject } from "@/lib/admin/createProjectApi"
import { PROJECT_GOOGLE_INTEGRATION_ENDPOINTS } from "@/lib/admin/projectGoogleIntegrations"
import {
  INDUSTRY_NICHES_ENDPOINT,
  SEO_GOALS_ENDPOINT,
  type IndustryNichesResponse,
  type SeoGoalsResponse,
} from "@/lib/admin/lookups.types"

type FormAlert =
  | { variant: "default"; title: string; description?: string }
  | { variant: "destructive"; title: string; description?: string }

type CreateProjectFormProps = {
  projectId?: number
  initialValues?: CreateProjectFormValues
  /** When managing projects from a company row, use this company id in the payload. */
  companyId?: number
  companyName?: string
  backToPath?: string
}

const URL_PATTERN = /^https?:\/\/[^\s]+$/i

export function CreateProjectForm({
  projectId,
  initialValues,
  companyId: companyIdProp,
  companyName,
  backToPath = "/projects",
}: CreateProjectFormProps) {
  const isEdit = projectId != null && Number.isFinite(projectId)
  const navigate = useNavigate()
  const authUser = useAuthUser()
  const { t } = useTranslation("translation", {
    keyPrefix: "modules.projects.createForm",
  })
  const [formAlert, setFormAlert] = useState<FormAlert | null>(null)

  const form = useForm<CreateProjectFormValues>({
    defaultValues: initialValues ?? emptyCreateProjectValues(),
    mode: "onSubmit",
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const { data: nichesData, error: nichesError, isLoading: nichesLoading } =
    useSWR<IndustryNichesResponse>(INDUSTRY_NICHES_ENDPOINT)
  const { data: goalsData, error: goalsError, isLoading: goalsLoading } =
    useSWR<SeoGoalsResponse>(SEO_GOALS_ENDPOINT)

  const nicheOptions: FormSelectOption[] = useMemo(() => {
    if (!nichesData?.success) return []
    return nichesData.data.map((n) => ({
      value: String(n.id),
      label: n.name,
    }))
  }, [nichesData])

  const goalOptions: CheckboxGroupOption[] = useMemo(() => {
    if (!goalsData?.success) return []
    return goalsData.data.map((g) => ({
      value: g.id,
      label: g.name,
    }))
  }, [goalsData])

  async function onSubmit(values: CreateProjectFormValues) {
    setFormAlert(null)
    const companyId =
      companyIdProp != null && companyIdProp > 0
        ? companyIdProp
        : authUser?.company_id ?? 2
    try {
      const payload = toCreateProjectPayload(values, companyId)
      const json = isEdit
        ? await putProject(projectId!, payload)
        : await postProject(payload)
      const apiMsg =
        typeof json.message === "string" && json.message.trim()
          ? json.message.trim()
          : null
      if (!json.success) {
        setFormAlert({
          variant: "destructive",
          title: isEdit ? t("editErrorTitle") : t("errorTitle"),
          description:
            apiMsg ??
            (isEdit ? t("editErrorFallback") : t("errorFallback")),
        })
        return
      }
      navigate(backToPath, {
        replace: true,
        state: {
          feedback: {
            variant: "default" as const,
            title: isEdit ? t("editSuccessTitle") : t("successTitle"),
            description:
              apiMsg ??
              (isEdit ? t("editSuccessFallback") : t("successFallback")),
          },
          ...(companyName ? { companyName } : {}),
        },
      })
    } catch (e) {
      setFormAlert({
        variant: "destructive",
        title: isEdit ? t("editErrorTitle") : t("errorTitle"),
        description:
          e instanceof Error
            ? e.message
            : isEdit
              ? t("editErrorFallback")
              : t("errorFallback"),
      })
    }
  }

  return (
    <div className="mx-auto w-[100%] max-w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow)] sm:p-8">
      <div className="mb-8 space-y-1">
        <h2 className="text-lg font-semibold text-[var(--text-h)]">
          {isEdit ? t("editTitle") : t("title")}
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          {isEdit ? t("editLead") : t("lead")}
        </p>
      </div>

      {formAlert ? (
        <Alert variant={formAlert.variant} className="mb-6">
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

      <form
        className="space-y-8"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {/* Section: Business basics */}
        <section className="space-y-5">
          <SectionHeader
            title={t("sectionBusinessTitle")}
            lead={t("sectionBusinessLead")}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormTextField
              control={control}
              name="business_name"
              label={t("businessName")}
              placeholder={t("businessNamePh")}
              rules={{
                required: t("valRequired"),
                minLength: { value: 2, message: t("valMin") },
              }}
            />
            <FormTextField
              control={control}
              name="website_url"
              label={t("websiteUrl")}
              placeholder={t("websiteUrlPh")}
              type="url"
              autoComplete="url"
              rules={{
                required: t("valRequired"),
                pattern: { value: URL_PATTERN, message: t("valUrl") },
              }}
            />
            <div className="sm:col-span-2">
              <FormSelectField
                control={control}
                name="industry_niche_id"
                label={t("industryNiche")}
                placeholder={
                  nichesLoading
                    ? t("industryNicheLoading")
                    : t("industryNichePh")
                }
                options={nicheOptions}
                disabled={nichesLoading || !!nichesError}
                description={
                  nichesError ? t("industryNicheLoadError") : undefined
                }
                rules={{
                  validate: (v) =>
                    (v != null && String(v).length > 0 && Number(v) > 0) ||
                    t("valRequired"),
                }}
              />
            </div>
            <div className="sm:col-span-2">
              <FormTagsField
                control={control}
                name="target_locations"
                label={t("targetLocations")}
                placeholder={t("targetLocationsPh")}
                description={t("targetLocationsHelp")}
                removeLabel={t("remove")}
                rules={{
                  validate: (v) =>
                    (Array.isArray(v) && v.length > 0) ||
                    t("valTargetLocations"),
                }}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormCheckboxField
              control={control}
              name="is_b2b"
              label={t("isB2b")}
              description={t("isB2bDesc")}
            />
            <FormCheckboxField
              control={control}
              name="is_b2c"
              label={t("isB2c")}
              description={t("isB2cDesc")}
            />
          </div>

          <FormTextareaField
            control={control}
            name="brief_description"
            label={t("briefDescription")}
            placeholder={t("briefDescriptionPh")}
            description={t("briefDescriptionHelp")}
            rows={4}
          />
        </section>

        {/* Section: SEO goals */}
        <section className="space-y-5 border-t border-[var(--border)] pt-7">
          <SectionHeader
            title={t("sectionSeoTitle")}
            lead={t("sectionSeoLead")}
          />
          <FormCheckboxGroupField
            control={control}
            name="seo_goal_ids"
            label={t("seoGoals")}
            description={t("seoGoalsHelp")}
            options={goalOptions}
            columns={2}
            loading={goalsLoading && !goalsData}
            loadingText={t("seoGoalsLoading")}
            emptyText={
              goalsError ? t("seoGoalsLoadError") : t("seoGoalsEmpty")
            }
            rules={{
              validate: (v) =>
                (Array.isArray(v) && v.length > 0) || t("valSeoGoals"),
            }}
          />
        </section>

        {/* Section: Google tools */}
        <section className="space-y-5 border-t border-[var(--border)] pt-7">
          <SectionHeader
            title={t("sectionGoogleTitle")}
            lead={t("sectionGoogleLead")}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <FormCheckboxWithActionField
              control={control}
              name="has_google_analytics"
              label={t("hasGoogleAnalytics")}
              description={t("hasGoogleAnalyticsDesc")}
              actionLabel={t("googleConnect")}
              actionEndpoint={PROJECT_GOOGLE_INTEGRATION_ENDPOINTS.analytics}
              actionErrorFallback={t("googleConnectError")}
            />
            <FormCheckboxWithActionField
              control={control}
              name="has_google_search_console"
              label={t("hasGoogleSearchConsole")}
              description={t("hasGoogleSearchConsoleDesc")}
              actionLabel={t("googleConnect")}
              actionEndpoint={PROJECT_GOOGLE_INTEGRATION_ENDPOINTS.searchConsole}
              actionErrorFallback={t("googleConnectError")}
            />
            <FormCheckboxWithActionField
              control={control}
              name="has_google_tag_manager"
              label={t("hasGoogleTagManager")}
              description={t("hasGoogleTagManagerDesc")}
              actionLabel={t("googleConnect")}
              actionEndpoint={PROJECT_GOOGLE_INTEGRATION_ENDPOINTS.tagManager}
              actionErrorFallback={t("googleConnectError")}
            />
            <FormCheckboxWithActionField
              control={control}
              name="has_google_ads"
              label={t("hasGoogleAds")}
              description={t("hasGoogleAdsDesc")}
              actionLabel={t("googleConnect")}
              actionEndpoint={PROJECT_GOOGLE_INTEGRATION_ENDPOINTS.googleAds}
              actionErrorFallback={t("googleConnectError")}
            />
          </div>
        </section>

        {/* Section: CMS access */}
        <section className="space-y-5 border-t border-[var(--border)] pt-7">
          <SectionHeader
            title={t("sectionCmsTitle")}
            lead={t("sectionCmsLead")}
          />
          <FormCheckboxField
            control={control}
            name="has_website_login_details"
            label={t("hasWebsiteLoginDetails")}
            description={t("hasWebsiteLoginDetailsDesc")}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormTextField
                control={control}
                name="cms_login_page_url"
                label={t("cmsLoginPageUrl")}
                placeholder={t("cmsLoginPageUrlPh")}
                type="url"
                autoComplete="url"
                rules={{
                  pattern: { value: URL_PATTERN, message: t("valUrl") },
                }}
              />
            </div>
            <FormTextField
              control={control}
              name="cms_username"
              label={t("cmsUsername")}
              placeholder={t("cmsUsernamePh")}
              autoComplete="username"
            />
            <FormTextField
              control={control}
              name="cms_password"
              label={t("cmsPassword")}
              placeholder={t("cmsPasswordPh")}
              type="password"
              autoComplete="new-password"
            />
          </div>
        </section>

        <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <AnimatedSubmitButton
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            borderRadius="0.5rem"
            containerClassName="w-full max-w-full sm:w-auto sm:min-w-[12rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] disabled:pointer-events-none disabled:opacity-60"
          >
            <span className="inline-flex items-center justify-center gap-2 px-1">
              {isSubmitting ? (
                <Spinner className="size-4 shrink-0 text-[var(--motion-btn-fg)]" />
              ) : null}
              {isSubmitting
                ? isEdit
                  ? t("editSubmitting")
                  : t("submitting")
                : isEdit
                  ? t("editSubmit")
                  : t("submit")}
            </span>
          </AnimatedSubmitButton>
          <Link
            to={backToPath}
            className="text-center text-sm font-medium text-[var(--brand)] hover:underline sm:text-end"
          >
            {t("backToList")}
          </Link>
        </div>
      </form>
    </div>
  )
}

function SectionHeader({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="space-y-1">
      <h3 className="text-[15px] font-semibold text-[var(--text-h)]">
        {title}
      </h3>
      <p className="text-xs text-[var(--text-muted)]">{lead}</p>
    </div>
  )
}

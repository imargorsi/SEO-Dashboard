"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoAddOutline, IoPencilOutline, IoTrashOutline } from "react-icons/io5";

import { Input } from "@/components/input";
import { ProjectIdentity } from "@/components/projects/project-identity";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useProjectsQuery } from "@/features/projects/projects.api";
import { useRolesQuery } from "@/features/roles/roles.api";
import {
  useRemoveUserMembershipMutation,
  useUpsertUserMembershipMutation,
} from "@/features/users/users.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import {
  analyticsHeadingStackClass,
  elevatedCardSurfaceClass,
  tableRowIconActionClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import type { TAdminUserProjectAssignment } from "@/types/admin-user.types";
import { cn } from "@/lib/utils";

export type TStagedMembership = {
  projectId: string;
  roleId: string;
};

type TPendingAction =
  | {
      type: "update";
      projectId: string;
      projectName: string;
      roleId: string;
      roleName: string;
    }
  | {
      type: "remove";
      projectId: string;
      projectName: string;
    }
  | null;

type TUserProjectMembershipsEditorProps = {
  /** When set, changes save immediately via admin membership APIs. */
  userId?: string;
  assignments: TAdminUserProjectAssignment[];
  /** Create-flow staged rows (no userId yet). */
  staged?: TStagedMembership[];
  onStagedChange?: (next: TStagedMembership[]) => void;
  onAssignmentsChange?: (next: TAdminUserProjectAssignment[]) => void;
  disabled?: boolean;
};

export function UserProjectMembershipsEditor({
  userId,
  assignments,
  staged = [],
  onStagedChange,
  onAssignmentsChange,
  disabled = false,
}: TUserProjectMembershipsEditorProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.users.memberships" });
  const { data: projects = [], isLoading: isProjectsLoading } = useProjectsQuery();
  const { data: rolesData, isLoading: isRolesLoading } = useRolesQuery({
    page: 1,
    per_page: 100,
    status: "active",
  });
  const upsertMutation = useUpsertUserMembershipMutation();
  const removeMutation = useRemoveUserMembershipMutation();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [draftProjectId, setDraftProjectId] = useState("");
  const [draftRoleId, setDraftRoleId] = useState("");
  const [pending, setPending] = useState<TPendingAction>(null);
  const [openSelectKey, setOpenSelectKey] = useState<string | null>(null);

  const roles = useMemo(
    () => (rolesData?.items ?? []).filter((role) => role.scope === "project"),
    [rolesData?.items],
  );

  const roleOptions = useMemo(
    () => roles.map((role) => ({ label: role.name, value: role.id })),
    [roles],
  );

  const roleNameById = useMemo(() => new Map(roles.map((role) => [role.id, role.name])), [roles]);

  const assignedProjectIds = useMemo(() => {
    if (userId) return new Set(assignments.map((row) => row.id));
    return new Set(staged.map((row) => row.projectId));
  }, [assignments, staged, userId]);

  const projectById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );

  const projectOptions = useMemo(
    () =>
      projects
        .filter((project) => project.status !== "rejected" && !assignedProjectIds.has(project.id))
        .map((project) => ({ label: project.businessName, value: project.id })),
    [assignedProjectIds, projects],
  );

  const isBusy = upsertMutation.isPending || removeMutation.isPending;
  const canSaveAdd = Boolean(draftProjectId && draftRoleId) && !disabled && !isBusy;

  function resetAddDraft() {
    setDraftProjectId("");
    setDraftRoleId("");
    setOpenSelectKey(null);
  }

  function openAddModal() {
    resetAddDraft();
    setIsAddOpen(true);
  }

  function closeAddModal() {
    setIsAddOpen(false);
    resetAddDraft();
  }

  async function handleAdd() {
    if (!canSaveAdd) return;

    if (!userId) {
      onStagedChange?.([...staged, { projectId: draftProjectId, roleId: draftRoleId }]);
      closeAddModal();
      return;
    }

    try {
      const result = await upsertMutation.mutateAsync({
        userId,
        payload: { projectId: draftProjectId, roleId: draftRoleId },
      });
      onAssignmentsChange?.(result.projects);
      notify.success(t("assignSuccess"));
      closeAddModal();
    } catch (error) {
      notify.error(ApiError.messageFrom(error, t("assignError")));
    }
  }

  function requestRoleChange(projectId: string, projectName: string, roleId: string) {
    if (disabled) return;
    const roleName = roleNameById.get(roleId) ?? roleId;
    setPending({ type: "update", projectId, projectName, roleId, roleName });
  }

  function requestRemove(projectId: string, projectName: string) {
    if (disabled) return;
    setPending({ type: "remove", projectId, projectName });
  }

  async function runPending() {
    if (!pending) return;

    if (pending.type === "update") {
      if (!userId) {
        onStagedChange?.(
          staged.map((row) =>
            row.projectId === pending.projectId ? { ...row, roleId: pending.roleId } : row,
          ),
        );
        setPending(null);
        return;
      }

      try {
        const result = await upsertMutation.mutateAsync({
          userId,
          payload: { projectId: pending.projectId, roleId: pending.roleId },
        });
        onAssignmentsChange?.(result.projects);
        notify.success(t("updateSuccess"));
        setPending(null);
      } catch (error) {
        notify.error(ApiError.messageFrom(error, t("updateError")));
      }
      return;
    }

    if (!userId) {
      onStagedChange?.(staged.filter((row) => row.projectId !== pending.projectId));
      setPending(null);
      return;
    }

    try {
      const result = await removeMutation.mutateAsync({
        userId,
        projectId: pending.projectId,
      });
      onAssignmentsChange?.(result.projects);
      notify.success(t("removeSuccess"));
      setPending(null);
    } catch (error) {
      notify.error(ApiError.messageFrom(error, t("removeError")));
    }
  }

  const rows: Array<{
    key: string;
    projectId: string;
    projectName: string;
    websiteUrl: string | null;
    imageUrl: string | null;
    roleId: string;
    statusLabel?: string;
  }> = userId
    ? assignments.map((row) => ({
        key: row.id,
        projectId: row.id,
        projectName: row.name,
        websiteUrl: row.website_url,
        imageUrl: row.image_url,
        roleId: row.role_id,
        statusLabel: row.membership_status === "invited" ? t("statusInvited") : undefined,
      }))
    : staged.map((row) => {
        const project = projectById.get(row.projectId);
        return {
          key: row.projectId,
          projectId: row.projectId,
          projectName: project?.businessName ?? row.projectId,
          websiteUrl: project?.websiteUrl ?? null,
          imageUrl: project?.imageUrl ?? null,
          roleId: row.roleId,
        };
      });

  const isAddSelectOpen =
    openSelectKey === "draft-project" || openSelectKey === "draft-role";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className={cn(analyticsHeadingStackClass, "max-w-2xl")}>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="type-title text-text-primary">{t("title")}</h2>
            {rows.length > 0 ? (
              <span className="inline-flex items-center rounded-full border border-border/50 bg-bg-card/40 px-3 py-1 type-caption tabular-nums text-text-secondary shadow-sm backdrop-blur-md">
                {t("count", { count: rows.length })}
              </span>
            ) : null}
          </div>
          <p className="type-caption text-text-muted">{t("lead")}</p>
        </div>
        {!disabled ? (
          <Button
            type="button"
            variant="outlined"
            size="md"
            disabled={isBusy}
            onClick={openAddModal}
          >
            <IoAddOutline className="size-4" aria-hidden />
            {t("add")}
          </Button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/50 bg-bg-card/30 px-4 py-8 text-center">
          <p className="type-body text-text-muted">{t("empty")}</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => {
            const selectKey = `role-${row.projectId}`;
            const isSelectOpen = openSelectKey === selectKey;

            return (
              <li
                key={row.key}
                className={cn(
                  elevatedCardSurfaceClass,
                  "relative flex flex-col gap-3 rounded-2xl p-4",
                  isSelectOpen && "z-30",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <ProjectIdentity
                    name={row.projectName}
                    websiteUrl={row.websiteUrl}
                    imageUrl={row.imageUrl}
                    meta={row.statusLabel}
                    size="md"
                    className="min-w-0 flex-1"
                  />
                  <button
                    type="button"
                    className={cn(tableRowIconActionClass, "shrink-0")}
                    disabled={disabled || isBusy}
                    aria-label={t("removeAria", { name: row.projectName })}
                    title={t("removeAria", { name: row.projectName })}
                    onClick={() => requestRemove(row.projectId, row.projectName)}
                  >
                    <IoTrashOutline className="size-4" aria-hidden />
                  </button>
                </div>

                <Input
                  id={`membership-role-${row.projectId}`}
                  type="select"
                  aria-label={t("roleLabel")}
                  options={roleOptions}
                  value={row.roleId}
                  disabled={disabled || isBusy || isRolesLoading}
                  onSelectOpenChange={(open) => setOpenSelectKey(open ? selectKey : null)}
                  onChange={(event) => {
                    const next = event.target.value;
                    if (next && next !== row.roleId) {
                      requestRoleChange(row.projectId, row.projectName, next);
                    }
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}

      <AlertDialog
        open={isAddOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (isBusy) return;
            closeAddModal();
            return;
          }
          setIsAddOpen(true);
        }}
      >
        <AlertDialogContent
          className={cn(
            "w-[min(100%-1.5rem,28rem)] gap-5 rounded-lg border-2 border-text-muted/55 sm:p-7",
            isAddSelectOpen && "z-60",
          )}
          onEscapeKeyDown={(event) => {
            if (isBusy) event.preventDefault();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{t("addTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("addLead")}</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-4">
            <Input
              id="membership-draft-project"
              type="select"
              label={t("projectLabel")}
              placeholder={t("projectPh")}
              options={projectOptions}
              value={draftProjectId}
              disabled={disabled || isBusy || isProjectsLoading}
              onSelectOpenChange={(open) => setOpenSelectKey(open ? "draft-project" : null)}
              onChange={(event) => setDraftProjectId(event.target.value)}
            />
            <Input
              id="membership-draft-role"
              type="select"
              label={t("roleLabel")}
              placeholder={t("rolePh")}
              options={roleOptions}
              value={draftRoleId}
              disabled={disabled || isBusy || isRolesLoading}
              onSelectOpenChange={(open) => setOpenSelectKey(open ? "draft-role" : null)}
              onChange={(event) => setDraftRoleId(event.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBusy}>{t("confirmCancel")}</AlertDialogCancel>
            <button
              type="button"
              className={cn(buttonVariants({ variant: "outlined", size: "md" }))}
              disabled={!canSaveAdd}
              onClick={() => void handleAdd()}
            >
              <span className="inline-flex items-center justify-center gap-2">
                {upsertMutation.isPending ? <Spinner className="size-4 shrink-0" /> : null}
                {upsertMutation.isPending ? t("saving") : t("save")}
              </span>
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        icon={pending?.type === "remove" ? IoTrashOutline : IoPencilOutline}
        tone={pending?.type === "remove" ? "destructive" : "default"}
        title={
          pending?.type === "remove" ? t("confirmRemoveTitle") : t("confirmUpdateTitle")
        }
        description={
          pending?.type === "remove"
            ? t("confirmRemoveBody", { name: pending.projectName })
            : pending
              ? t("confirmUpdateBody", {
                  name: pending.projectName,
                  role: pending.roleName,
                })
              : ""
        }
        action={
          <>
            <AlertDialogCancel disabled={isBusy}>{t("confirmCancel")}</AlertDialogCancel>
            <button
              type="button"
              className={cn(
                buttonVariants({
                  variant: pending?.type === "remove" ? "destructive" : "outlined",
                  size: "md",
                }),
              )}
              disabled={isBusy}
              onClick={() => void runPending()}
            >
              {pending?.type === "remove" ? t("confirmRemove") : t("confirmUpdate")}
            </button>
          </>
        }
      />
    </div>
  );
}

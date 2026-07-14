"use client";

import { useTranslation } from "react-i18next";

import { ProjectDetailInfoCard } from "@/components/projects/detail/project-detail-info-card";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { TProjectDetail } from "@/features/projects/projects.api";
import {
  elevatedCardMutedClass,
  elevatedCardTitleClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { getBadgeToneClassName } from "@/lib/frontend/theme/status-colors";
import { getUserRoleBadgeTone } from "@/lib/frontend/users/user-role-display.utils";
import { PROJECT_OWNER_ROLE, PROJECT_USER_ROLE } from "@/lib/rbac/roles";
import { cn } from "@/lib/utils";

type ProjectDetailMembersCardProps = {
  project: TProjectDetail;
};

function MemberRoleBadge({ role, label }: { role: string; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-lg border px-2.5 py-1 type-caption-xs font-semibold",
        getBadgeToneClassName(getUserRoleBadgeTone(role)),
      )}
    >
      {label}
    </span>
  );
}

function MemberRow({
  name,
  email,
  profileImage,
  role,
  roleLabel,
}: {
  name: string;
  email?: string | null;
  profileImage: string | null;
  role: string;
  roleLabel: string;
}) {
  return (
    <li className="flex items-center gap-3">
      <UserAvatar
        name={name}
        imageUrl={profileImage}
        size="sm"
        roundedClassName="rounded-full"
      />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate type-body-strong", elevatedCardTitleClass)}>{name}</p>
        {email ? <p className={cn("truncate type-caption", elevatedCardMutedClass)}>{email}</p> : null}
      </div>
      <MemberRoleBadge role={role} label={roleLabel} />
    </li>
  );
}

export function ProjectDetailMembersCard({ project }: ProjectDetailMembersCardProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.detail" });
  const members = project.invitedUsers;
  const owner = project.owner;
  const ownerName = owner?.name.trim() || t("memberOwnerFallback");

  return (
    <ProjectDetailInfoCard title={t("sidebarMembersTitle")}>
      <div className="space-y-4">
        {owner || members.length > 0 ? (
          <ul className="space-y-4">
            {owner ? (
              <MemberRow
                name={ownerName}
                profileImage={owner.profileImage}
                role={PROJECT_OWNER_ROLE}
                roleLabel={t("memberOwnerBadge")}
              />
            ) : null}

            {members.map((member) => (
              <MemberRow
                key={member.id}
                name={member.name}
                email={member.email}
                profileImage={member.profileImage}
                role={PROJECT_USER_ROLE}
                roleLabel={t("memberUserBadge")}
              />
            ))}
          </ul>
        ) : null}

        {members.length === 0 ? (
          <p className={cn("type-body", elevatedCardMutedClass)}>{t("noMembers")}</p>
        ) : null}
      </div>
    </ProjectDetailInfoCard>
  );
}

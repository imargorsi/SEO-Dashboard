import type { AuthUser } from "@/lib/frontend/auth/types";
import type { TProjectCreateFormValues } from "@/components/forms/project-create-form.types";
import type { TProjectInvitee } from "@/types/project.types";

export type TProjectFormProps = {
  authUser: AuthUser;
  isEdit?: boolean;
  projectId?: string;
  initialValues?: TProjectCreateFormValues;
  initialLogoUrl?: string | null;
  readOnlyContactEmail?: string | null;
  initialInvitees?: TProjectInvitee[];
};

export type TUseProjectFormOptions = {
  isEdit?: boolean;
  projectId?: string;
  initialValues?: TProjectCreateFormValues;
  initialLogoUrl?: string | null;
  readOnlyContactEmail?: string | null;
  initialInvitees?: TProjectInvitee[];
};

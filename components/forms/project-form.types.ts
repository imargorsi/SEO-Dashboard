import type { AuthUser } from "@/lib/frontend/auth/types";
import type { TProjectCreateFormValues } from "@/components/forms/project-create-form.types";

export type TProjectFormProps = {
  authUser: AuthUser;
  isEdit?: boolean;
  projectId?: string;
  initialValues?: TProjectCreateFormValues;
  initialLogoUrl?: string | null;
  readOnlyContactEmail?: string | null;
};

export type TUseProjectFormOptions = {
  isEdit?: boolean;
  projectId?: string;
  initialValues?: TProjectCreateFormValues;
  initialLogoUrl?: string | null;
  readOnlyContactEmail?: string | null;
};

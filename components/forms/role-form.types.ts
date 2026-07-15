export type TRoleFormValues = {
  name: string;
  description: string;
};

export type TRoleFormProps = {
  isEdit?: boolean;
  roleId?: string;
  isSystem?: boolean;
  initialValues?: TRoleFormValues;
  initialPermissions?: string[];
};

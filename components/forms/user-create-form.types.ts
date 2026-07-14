export type TUserCreateFormValues = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type TUserFormProps = {
  isEdit?: boolean;
  userId?: string;
  initialValues?: TUserCreateFormValues;
  initialProfileImageUrl?: string | null;
};

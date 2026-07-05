"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { baseQuery } from "@/lib/frontend/api/base";
import { ApiError } from "@/lib/frontend/api/errors";
import { clearAuthSession, getAccessToken, getStoredAuthUser, persistAuthSession, setStoredAuthUser } from "@/lib/frontend/auth/session";
import {
  normalizeAuthUser,
  type AuthMessageResult,
  type AuthUser,
  type ForgotPasswordRequest,
  type LoginRequest,
  type LoginResponseData,
  type LoginResult,
  type RegisterRequest,
  type ResetPasswordRequest,
  type ChangePasswordRequest,
  type UpdateProfileRequest,
  type UpdateProfileResult,
} from "@/lib/frontend/auth/types";

const authApi = {
  reducerPath: "auth-api" as const,
  tagTypes: ["User"] as const,
};

const authKeys = {
  all: [authApi.reducerPath] as const,
  user: () => [...authKeys.all, "user"] as const,
};

async function loginWithCredentials(input: LoginRequest): Promise<LoginResult> {
  const envelope = await baseQuery.post<LoginResponseData>("auth/login", input, { skipAuth: true });
  const user = normalizeAuthUser(envelope.data.user);
  const token = envelope.data.token;

  if (!user || !token) {
    throw new ApiError(envelope.message || "Login failed", 400, {}, envelope);
  }

  return {
    token,
    tokenType: envelope.data.token_type ?? "Bearer",
    message: envelope.message,
    user,
  };
}

async function fetchAuthUser(): Promise<AuthUser> {
  if (!getAccessToken()) {
    throw new ApiError("Unauthenticated", 401);
  }

  const envelope = await baseQuery.get<AuthUser>("auth/user");
  const user = normalizeAuthUser(envelope.data);

  if (!user) {
    throw new ApiError("Invalid user payload", 500, {}, envelope);
  }

  return user;
}

async function loadAuthUser(): Promise<AuthUser> {
  try {
    return await fetchAuthUser();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearAuthSession();
    }
    throw error;
  }
}

async function registerUser(input: RegisterRequest): Promise<AuthMessageResult> {
  const envelope = await baseQuery.post<unknown>("auth/register", input, { skipAuth: true });
  return { message: envelope.message };
}

async function requestPasswordReset(input: ForgotPasswordRequest): Promise<AuthMessageResult> {
  const envelope = await baseQuery.post<null>("auth/forgot-password", input, { skipAuth: true });
  return { message: envelope.message };
}

async function submitPasswordReset(input: ResetPasswordRequest): Promise<AuthMessageResult> {
  const envelope = await baseQuery.post<null>("auth/reset-password", input, { skipAuth: true });
  return { message: envelope.message };
}

async function resendEmailVerification(): Promise<AuthMessageResult> {
  const envelope = await baseQuery.post<null>("auth/email/verification-notification");
  return { message: envelope.message };
}

async function changePassword(input: ChangePasswordRequest): Promise<AuthMessageResult> {
  const envelope = await baseQuery.put<null>("me/password", input);
  return { message: envelope.message };
}

async function updateProfile(input: UpdateProfileRequest): Promise<UpdateProfileResult> {
  const formData = new FormData();
  if (input.name !== undefined) formData.append("name", input.name);
  if (input.profile_image_file) formData.append("profile_image", input.profile_image_file);

  const envelope = await baseQuery.post<AuthUser>("me/profile", formData);
  const user = normalizeAuthUser(envelope.data);
  if (!user) {
    throw new ApiError("Invalid user payload", 500, {}, envelope);
  }

  return { user, message: envelope.message };
}

export function useAuthUserQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: loadAuthUser,
    enabled: options?.enabled ?? Boolean(getAccessToken()),
    placeholderData: () => getStoredAuthUser() ?? undefined,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginWithCredentials,
    onSuccess: (result) => {
      persistAuthSession(result.token, result.user);
      queryClient.setQueryData(authKeys.user(), result.user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => baseQuery.post<null>("auth/logout"),
    onSettled: () => {
      clearAuthSession();
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
}

export function useRegisterMutation() {
  return useMutation({ mutationFn: registerUser });
}

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: requestPasswordReset });
}

export function useResetPasswordMutation() {
  return useMutation({ mutationFn: submitPasswordReset });
}

export function useChangePasswordMutation() {
  return useMutation({ mutationFn: changePassword });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (result) => {
      setStoredAuthUser(result.user);
      queryClient.setQueryData(authKeys.user(), result.user);
    },
  });
}

export function useResendEmailVerificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resendEmailVerification,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}

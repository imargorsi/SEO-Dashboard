import { apiClient } from "@/lib/frontend/api/client";
import { ApiError } from "@/lib/frontend/api/errors";
import { getAccessToken } from "@/lib/frontend/auth/session";
import {
  normalizeAuthUser,
  type AuthUser,
  type LoginRequest,
  type LoginResponseData,
  type LoginResult,
} from "@/lib/frontend/auth/types";

export async function loginWithCredentials(input: LoginRequest): Promise<LoginResult> {
  const envelope = await apiClient.post<LoginResponseData>("auth/login", input, {
    skipAuth: true,
  });

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

export async function fetchAuthUser(): Promise<AuthUser> {
  if (!getAccessToken()) {
    throw new ApiError("Unauthenticated", 401);
  }

  const envelope = await apiClient.get<AuthUser>("auth/user");
  const user = normalizeAuthUser(envelope.data);

  if (!user) {
    throw new ApiError("Invalid user payload", 500, {}, envelope);
  }

  return user;
}

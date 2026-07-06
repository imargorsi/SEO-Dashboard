import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import {
  ADMIN_PERMISSION_MODULES,
  PROJECT_PERMISSION_MODULES,
} from "@/lib/rbac/permission-catalog";
import { runApiGuards } from "@/lib/auth/run-api-guards";

export const GET = withApiHandler(async (request) => {
  const auth = await runApiGuards(request, { superAdmin: true });
  if (auth instanceof Response) return auth;

  return ApiResponse.success({
    project_modules: PROJECT_PERMISSION_MODULES,
    admin_modules: ADMIN_PERMISSION_MODULES,
  });
});

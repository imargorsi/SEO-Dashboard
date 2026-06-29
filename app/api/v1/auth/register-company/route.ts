import { ApiResponse } from "@/lib/api/response";
import { withApiHandler } from "@/lib/api/handler";
import { authMessages } from "@/lib/auth/messages";
import { clientIp, ensureRouteNotRateLimited, recordRouteAttempt } from "@/lib/auth/rate-limit";
import { serializeCompany } from "@/lib/serializers/user";
import { connectDb } from "@/lib/db/mongoose";
import { COMPANY_STATUS, User } from "@/models";
import { companyProvisioner } from "@/lib/services/company-provisioner";
import { registerCompanySchema } from "@/schemas/auth";

export const POST = withApiHandler(async (request) => {
  await connectDb();

  const ip = clientIp(request);
  const throttled = ensureRouteNotRateLimited("register-company", ip);
  if (throttled !== null) {
    return ApiResponse.error(`Too many attempts. Please try again in ${throttled} seconds.`, {}, 429);
  }
  recordRouteAttempt("register-company", ip);

  const body = registerCompanySchema.parse(await request.json());

  const existingUser = await User.findOne({ email: body.poc_email });
  if (existingUser) {
    return ApiResponse.validation("Validation failed.", {
      poc_email: ["The poc email has already been taken."],
    });
  }

  const company = await companyProvisioner.provision({
    company_name: body.company_name,
    poc_name: body.poc_name,
    poc_email: body.poc_email,
    password: body.password,
    status: COMPANY_STATUS.PENDING,
    is_active: false,
  });

  const usersCount = await User.countDocuments({ companyId: company._id });

  return ApiResponse.success(
    serializeCompany(company, usersCount),
    authMessages.registrationReceived,
    201,
  );
});

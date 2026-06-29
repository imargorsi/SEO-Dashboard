import mongoose from "mongoose";
import { env } from "../lib/config/env";
import { connectDb } from "../lib/db/mongoose";
import { hashPassword } from "../lib/auth/password";
import { assignRoleToUser, seedRolesAndPermissions, syncSuperAdminWithAllPermissions } from "../lib/rbac/permissions";
import { User } from "../models";

async function seed(): Promise<void> {
  await connectDb();
  await seedRolesAndPermissions();

  const email = env.superAdminEmail();
  const password = env.superAdminPassword();

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      companyId: null,
      name: "Super Admin",
      email,
      password: await hashPassword(password),
      emailVerifiedAt: new Date(),
    });
  } else {
    user.companyId = null;
    user.emailVerifiedAt = user.emailVerifiedAt ?? new Date();
    await user.save();
  }

  await assignRoleToUser(user._id, "super_admin");
  await syncSuperAdminWithAllPermissions();

  console.log(`Seeded super admin: ${email}`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

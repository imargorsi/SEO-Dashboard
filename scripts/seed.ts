import mongoose from "mongoose";
import { env } from "../lib/config/env";
import { connectDb } from "../lib/db/mongoose";
import { hashPassword } from "../lib/auth/password";
import { SUPER_ADMIN_ROLE } from "../lib/auth/rbac";
import { seedSystemRoles } from "../lib/rbac/seed-roles";
import { User } from "../models";

async function seed(): Promise<void> {
  await connectDb();

  await seedSystemRoles();
  console.log("Seeded system roles: project_owner, project_user");

  const backfill = await User.collection.updateMany(
    { $or: [{ status: { $exists: false } }, { status: null }] },
    { $set: { status: "active" } },
  );
  if (backfill.modifiedCount > 0) {
    console.log(`Backfilled status=active on ${backfill.modifiedCount} user(s).`);
  }

  const email = env.superAdminEmail();
  const password = env.superAdminPassword();

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: "Super Admin",
      email,
      password: await hashPassword(password),
      emailVerifiedAt: new Date(),
      roles: [SUPER_ADMIN_ROLE],
      status: "active",
    });
  } else {
    user.emailVerifiedAt = user.emailVerifiedAt ?? new Date();
    user.status = user.status ?? "active";
    if (!user.roles.includes(SUPER_ADMIN_ROLE)) {
      user.roles = [...user.roles, SUPER_ADMIN_ROLE];
    }
    await user.save();
  }

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

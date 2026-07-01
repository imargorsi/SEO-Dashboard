import mongoose from "mongoose";
import { env } from "../lib/config/env";
import { connectDb } from "../lib/db/mongoose";
import { hashPassword } from "../lib/auth/password";
import { SUPER_ADMIN_ROLE } from "../lib/auth/rbac";
import { User } from "../models";

async function seed(): Promise<void> {
  await connectDb();

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
    });
  } else {
    user.emailVerifiedAt = user.emailVerifiedAt ?? new Date();
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

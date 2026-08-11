/**
 * Seeds system project roles + the platform super admin from env.
 *
 * Always syncs `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` onto that user
 * (create or update). Any other user still holding `super_admin` is demoted,
 * deactivated, and given a random password so leftover dummy credentials from
 * an earlier seed cannot keep working.
 *
 * Run: npm run seed
 */
import crypto from "crypto";
import mongoose from "mongoose";

import { env } from "../lib/config/env";
import { connectDb } from "../lib/db/mongoose";
import { hashPassword } from "../lib/auth/password";
import { revokeAllUserTokens } from "../lib/auth/tokens";
import { SUPER_ADMIN_ROLE } from "../lib/auth/rbac";
import { seedSystemRoles } from "../lib/rbac/seed-roles";
import { backfillUserAccountSources } from "../lib/users/backfill-account-source";
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

  const accountSourceBackfill = await backfillUserAccountSources();
  if (accountSourceBackfill.modified > 0) {
    console.log(
      `Backfilled accountSource on ${accountSourceBackfill.modified}/${accountSourceBackfill.matched} user(s).`,
    );
  } else {
    console.log("Account source backfill: no updates needed.");
  }

  const email = env.superAdminEmail().trim().toLowerCase();
  const password = env.superAdminPassword();

  if (!email || !password) {
    throw new Error("SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required to seed.");
  }

  if (email === "superadmin@example.com" || password === "password") {
    console.warn(
      "Warning: SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD still look like the example defaults. Use strong unique credentials before production.",
    );
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: "Super Admin",
      email,
      password: await hashPassword(password),
      emailVerifiedAt: new Date(),
      roles: [SUPER_ADMIN_ROLE],
      status: "active",
      accountSource: "admin",
    });
    console.log(`Created super admin: ${email}`);
  } else {
    user.password = await hashPassword(password);
    user.emailVerifiedAt = user.emailVerifiedAt ?? new Date();
    user.status = "active";
    user.accountSource = "admin";
    if (!user.roles.includes(SUPER_ADMIN_ROLE)) {
      user.roles = [...user.roles, SUPER_ADMIN_ROLE];
    }
    await user.save();
    await revokeAllUserTokens(user._id);
    console.log(`Updated super admin credentials: ${email}`);
  }

  const staleAdmins = await User.find({
    roles: SUPER_ADMIN_ROLE,
    email: { $ne: email },
  });

  for (const stale of staleAdmins) {
    stale.roles = stale.roles.filter((role) => role !== SUPER_ADMIN_ROLE);
    stale.status = "inactive";
    stale.password = await hashPassword(crypto.randomBytes(32).toString("hex"));
    await stale.save();
    await revokeAllUserTokens(stale._id);
    console.log(`Demoted and locked leftover super_admin account: ${stale.email}`);
  }

  if (staleAdmins.length === 0) {
    console.log("No leftover super_admin accounts found.");
  }

  console.log(`Active platform super admin: ${email}`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

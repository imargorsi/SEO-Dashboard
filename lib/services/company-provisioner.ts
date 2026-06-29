import crypto from "crypto";
import { COMPANY_STATUS, Company, User, type CompanyDocument, type CompanyStatus } from "@/models";
import { hashPassword } from "@/lib/auth/password";
import { assignRoleToUser } from "@/lib/rbac/permissions";
import {
  companyApprovedMailContent,
  companyRegistrationPendingMailContent,
  pocWelcomeMailContent,
  sendMail,
} from "@/lib/mail/client";
import { authMessages } from "@/lib/auth/messages";

type ProvisionInput = {
  company_name: string;
  poc_name: string;
  poc_email: string;
  password?: string;
  status?: CompanyStatus;
  is_active?: boolean;
};

function generatePassword(length = 16): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i]! % chars.length];
  }
  return result;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  const normalized = base || crypto.randomBytes(4).toString("hex");
  let candidate = normalized;
  let i = 1;

  while (await Company.exists({ slug: candidate })) {
    candidate = `${normalized}-${i}`;
    i += 1;
  }

  return candidate;
}

export class CompanyProvisioner {
  async provision(data: ProvisionInput): Promise<CompanyDocument> {
    const status = data.status ?? COMPANY_STATUS.APPROVED;
    const isActive = data.is_active ?? status === COMPANY_STATUS.APPROVED;
    const plainPassword = data.password ?? generatePassword();
    const verifyEmail = status === COMPANY_STATUS.APPROVED;
    const pocEmail = data.poc_email.toLowerCase();

    const slug = await uniqueSlug(slugify(data.company_name));
    const company = await Company.create({
      name: data.company_name,
      slug,
      pocName: data.poc_name,
      pocEmail,
      status,
      isActive,
    });

    const user = await User.create({
      companyId: company._id,
      name: data.poc_name,
      email: pocEmail,
      password: await hashPassword(plainPassword),
      emailVerifiedAt: verifyEmail ? new Date() : null,
    });

    await assignRoleToUser(user._id, "company_admin");
    await this.sendProvisionMails(company, user, plainPassword, status);
    return company;
  }

  async approve(company: CompanyDocument): Promise<CompanyDocument> {
    if (!company.isPending()) {
      throw new Error(authMessages.onlyPendingCanApprove);
    }

    const poc = await this.resolvePocUser(company);
    company.status = COMPANY_STATUS.APPROVED;
    company.isActive = true;
    await company.save();

    if (poc && !poc.hasVerifiedEmail()) {
      poc.emailVerifiedAt = new Date();
      await poc.save();
    }

    if (poc) {
      try {
        const mail = companyApprovedMailContent(company.name, poc.name);
        await sendMail({ to: poc.email, subject: mail.subject, text: mail.text });
      } catch (error) {
        console.error(error);
      }
    }

    return company;
  }

  private async sendProvisionMails(
    company: CompanyDocument,
    user: InstanceType<typeof User>,
    plainPassword: string,
    status: CompanyStatus,
  ): Promise<void> {
    try {
      if (status === COMPANY_STATUS.PENDING) {
        const mail = companyRegistrationPendingMailContent(company.name, user.name);
        await sendMail({ to: user.email, subject: mail.subject, text: mail.text });
        return;
      }

      const mail = pocWelcomeMailContent(company.name, user.name, plainPassword);
      await sendMail({ to: user.email, subject: mail.subject, text: mail.text });
    } catch (error) {
      console.error(error);
    }
  }

  private async resolvePocUser(company: CompanyDocument) {
    const byEmail = await User.findOne({ companyId: company._id, email: company.pocEmail });
    if (byEmail) return byEmail;

    const admins = await User.find({ companyId: company._id });
    for (const user of admins) {
      const { getUserRoleNames } = await import("@/lib/rbac/permissions");
      const roles = await getUserRoleNames(user._id);
      if (roles.includes("company_admin")) return user;
    }

    return null;
  }
}

export const companyProvisioner = new CompanyProvisioner();

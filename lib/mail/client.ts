import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type { Transporter } from "nodemailer";
import { env } from "@/lib/config/env";

let transporter: Transporter | null = null;

function smtpTransportOptions(): SMTPTransport.Options {
  const port = env.smtpPort();
  const secure = port === 465;

  return {
    host: env.smtpHost(),
    port,
    secure,
    requireTLS: !secure,
    auth: {
      user: env.smtpUser(),
      pass: env.smtpPass(),
    },
  };
}

function getTransporter(): Transporter | null {
  if (!env.smtpConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport(smtpTransportOptions());
  }

  return transporter;
}

export type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendMail(payload: MailPayload): Promise<void> {
  const from = `"${env.mailFromName()}" <${env.mailFrom()}>`;
  const transport = getTransporter();

  if (!transport) {
    console.info("[mail]", { from, ...payload });
    return;
  }

  try {
    await transport.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html ?? payload.text.replace(/\n/g, "<br>"),
    });
  } catch (error) {
    console.error("[mail] SMTP send failed:", error);
    throw error;
  }
}

export function passwordResetMailContent(resetUrl: string, expireMinutes: number) {
  const app = env.appName();
  return {
    subject: `Reset your ${app} password`,
    text: [
      "Hello!",
      "",
      "You are receiving this email because we received a password reset request for your account.",
      "",
      `Reset password: ${resetUrl}`,
      "",
      `This link will expire in ${expireMinutes} minutes.`,
      "",
      "If you did not request a password reset, no further action is required.",
    ].join("\n"),
  };
}

export function companyRegistrationPendingMailContent(companyName: string, pocName: string) {
  const app = env.appName();
  return {
    subject: `Your ${app} company registration was received`,
    text: [
      `Hello ${pocName},`,
      "",
      `We received your registration for ${companyName}.`,
      "Your account is pending admin approval. You will receive another email once approved.",
    ].join("\n"),
  };
}

export function companyApprovedMailContent(companyName: string, pocName: string) {
  const app = env.appName();
  return {
    subject: `Your ${app} company has been approved`,
    text: [`Hello ${pocName},`, "", `Your company ${companyName} has been approved. You can now sign in.`].join("\n"),
  };
}

export function pocWelcomeMailContent(companyName: string, pocName: string, plainPassword: string) {
  const app = env.appName();
  return {
    subject: `Welcome to ${app}`,
    text: [
      `Hello ${pocName},`,
      "",
      `Your company ${companyName} has been created.`,
      `Your temporary password is: ${plainPassword}`,
      "Please sign in and change your password.",
    ].join("\n"),
  };
}

export function emailVerificationMailContent(verificationUrl: string) {
  const app = env.appName();
  return {
    subject: `Verify your ${app} email address`,
    text: [
      "Hello!",
      "",
      "Please verify your email address by clicking the link below:",
      verificationUrl,
      "",
      "If you did not create an account, no further action is required.",
    ].join("\n"),
  };
}

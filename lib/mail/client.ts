import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type { Transporter } from "nodemailer";
import { env } from "@/lib/config/env";

export {
  emailVerificationMailContent,
  passwordResetMailContent,
  projectInviteMailContent,
} from "@/lib/mail/templates";
export type { TMailContent } from "@/lib/mail/templates";

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

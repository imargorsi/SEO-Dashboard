export type TMailContent = {
  subject: string;
  text: string;
  html: string;
};

export type TMailCta = {
  label: string;
  url: string;
};

export type TMailLayoutInput = {
  /** Short heading shown in the card (title case). */
  title: string;
  /** Hidden inbox preview line (sentence case). */
  previewText?: string;
  /** Safe HTML body fragments (already escaped where needed). */
  bodyHtml: string;
  cta?: TMailCta;
  /** Optional muted line under the CTA (sentence case). */
  footerNote?: string;
};

import type { ReactNode } from "react";

import { Icons } from "@/lib/frontend/icons/app-icons";

const iconClassName = "size-4";

/** Subset of reusable Input types that can receive an automatic leading icon. */
type TAutoIconInputType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "textarea"
  | "select"
  | "time"
  | "date"
  | "url";

/**
 * Shared leading icons for form fields.
 * Getters return a fresh element each access so the same icon can appear on multiple fields.
 */
export const fieldStartIcons = {
  get person() {
    return <Icons.user className={iconClassName} />;
  },
  get mail() {
    return <Icons.mail className={iconClassName} />;
  },
  get lock() {
    return <Icons.lock className={iconClassName} />;
  },
  get link() {
    return <Icons.link className={iconClassName} />;
  },
  get phone() {
    return <Icons.call className={iconClassName} />;
  },
  get search() {
    return <Icons.search className={iconClassName} />;
  },
  get business() {
    return <Icons.building className={iconClassName} />;
  },
  get location() {
    return <Icons.location className={iconClassName} />;
  },
  get globe() {
    return <Icons.globe className={iconClassName} />;
  },
  get document() {
    return <Icons.file className={iconClassName} />;
  },
  get text() {
    return <Icons.text className={iconClassName} />;
  },
  get tag() {
    return <Icons.tag className={iconClassName} />;
  },
  get calendar() {
    return <Icons.calendar className={iconClassName} />;
  },
  get time() {
    return <Icons.clock className={iconClassName} />;
  },
  get shield() {
    return <Icons.security className={iconClassName} />;
  },
} as const;

/**
 * Default leading icon from native input `type`.
 * Returns `null` for types that should not get an automatic icon (text, select, textarea, …).
 */
export function resolveInputStartIcon(type: TAutoIconInputType | undefined): ReactNode | null {
  switch (type) {
    case "email":
      return fieldStartIcons.mail;
    case "password":
      return fieldStartIcons.lock;
    case "url":
      return fieldStartIcons.link;
    case "date":
      return fieldStartIcons.calendar;
    case "time":
      return fieldStartIcons.time;
    default:
      return null;
  }
}

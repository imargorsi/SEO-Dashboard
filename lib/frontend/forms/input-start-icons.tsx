import type { ReactNode } from "react";
import {
  IoBusinessOutline,
  IoCalendarOutline,
  IoCallOutline,
  IoDocumentTextOutline,
  IoEarthOutline,
  IoLinkOutline,
  IoLocationOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoPersonOutline,
  IoPricetagOutline,
  IoSearchOutline,
  IoShieldCheckmarkOutline,
  IoTextOutline,
  IoTimeOutline,
} from "react-icons/io5";

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
    return <IoPersonOutline className={iconClassName} />;
  },
  get mail() {
    return <IoMailOutline className={iconClassName} />;
  },
  get lock() {
    return <IoLockClosedOutline className={iconClassName} />;
  },
  get link() {
    return <IoLinkOutline className={iconClassName} />;
  },
  get phone() {
    return <IoCallOutline className={iconClassName} />;
  },
  get search() {
    return <IoSearchOutline className={iconClassName} />;
  },
  get business() {
    return <IoBusinessOutline className={iconClassName} />;
  },
  get location() {
    return <IoLocationOutline className={iconClassName} />;
  },
  get globe() {
    return <IoEarthOutline className={iconClassName} />;
  },
  get document() {
    return <IoDocumentTextOutline className={iconClassName} />;
  },
  get text() {
    return <IoTextOutline className={iconClassName} />;
  },
  get tag() {
    return <IoPricetagOutline className={iconClassName} />;
  },
  get calendar() {
    return <IoCalendarOutline className={iconClassName} />;
  },
  get time() {
    return <IoTimeOutline className={iconClassName} />;
  },
  get shield() {
    return <IoShieldCheckmarkOutline className={iconClassName} />;
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

export const LEAD_ORIGINS = ["csv_import", "manual"] as const;

export const LEAD_DEFAULT_PER_PAGE = 10;

export const LEAD_MAX_PER_PAGE = 100;

export const LEAD_IMPORT_MAX_FILE_BYTES = 2 * 1024 * 1024;

export const LEAD_IMPORT_MAX_ROWS = 2_000;

/** Max length for each of firstName / lastName. */
export const LEAD_NAME_MAX_LENGTH = 80;

export const LEAD_EMAIL_MAX_LENGTH = 255;

export const LEAD_PHONE_MAX_LENGTH = 40;

export const LEAD_SERVICES_MAX_LENGTH = 500;

export const LEAD_MESSAGE_MAX_LENGTH = 5_000;

/** Unmapped CSV columns kept on the lead as string extras. */
export const LEAD_EXTRAS_MAX_KEYS = 40;

export const LEAD_EXTRAS_KEY_MAX_LENGTH = 80;

export const LEAD_EXTRAS_VALUE_MAX_LENGTH = 2_000;

/** Required mapped CSV / form fields. */
export const LEAD_REQUIRED_FIELDS = ["firstName", "email", "phone", "message"] as const;

/** Optional mapped fields (lastName / services may be empty; date may default to today). */
export const LEAD_OPTIONAL_FIELDS = ["lastName", "servicesInterestedIn", "leadDate"] as const;

export const LEAD_FIELDS = [...LEAD_REQUIRED_FIELDS, ...LEAD_OPTIONAL_FIELDS] as const;

/** Sentinel in import mapping UI / API: do not map a CSV column; use today's date. */
export const LEAD_DATE_USE_TODAY = "__today__";

/** Sentinel in import mapping UI: skip optional column. */
export const LEAD_FIELD_SKIP = "__ignore__";

/** Sentinel in import extras UI: keep unmapped CSV column on the lead. */
export const LEAD_EXTRAS_KEEP = "__keep__";

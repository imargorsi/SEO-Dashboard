import {
  ACCOUNT_SOURCE_ADMIN_VERIFY_WINDOW_MS,
  USER_ACCOUNT_SOURCE_KNOWN,
  type TUserAccountSource,
  type TUserAccountSourceKnown,
} from "@/lib/users/account-source";

export type TUserAccountSourceFilter = TUserAccountSourceKnown | "all";

export type TUserAccountSourceCounts = Record<TUserAccountSourceFilter, number> & {
  /** Residual after soft-resolve — not exposed as a UI filter. */
  unknown: number;
};

export const EMPTY_USER_ACCOUNT_SOURCE_COUNTS: TUserAccountSourceCounts = {
  all: 0,
  admin: 0,
  self_register: 0,
  google: 0,
  unknown: 0,
};

/** Legacy / unset stored source — soft-inferred at read time. */
const LEGACY_OR_UNKNOWN_SOURCE = {
  $or: [
    { accountSource: { $exists: false } },
    { accountSource: null },
    { accountSource: "unknown" },
  ],
};

const NO_GOOGLE_ID = {
  $or: [{ googleId: { $exists: false } }, { googleId: null }, { googleId: "" }],
};

export function parseUserAccountSourceFilter(
  value: string | string[] | undefined,
): TUserAccountSourceKnown | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  if ((USER_ACCOUNT_SOURCE_KNOWN as readonly string[]).includes(raw)) {
    return raw as TUserAccountSourceKnown;
  }
  return undefined;
}

export function buildUserAccountSourceCounts(
  counts: Partial<Record<TUserAccountSource, number>>,
): TUserAccountSourceCounts {
  const admin = counts.admin ?? 0;
  const self_register = counts.self_register ?? 0;
  const google = counts.google ?? 0;
  const unknown = counts.unknown ?? 0;
  return {
    all: admin + self_register + google + unknown,
    admin,
    self_register,
    google,
    unknown,
  };
}

/**
 * Mongo filter aligned with `resolveAccountSource` for **known** sources only.
 * `unknown` is not a public list filter (storage residual after soft-resolve).
 */
export function buildAccountSourceMongoFilter(source?: TUserAccountSourceKnown): object | null {
  if (!source) return null;

  if (source === "google") {
    return {
      $or: [
        { accountSource: "google" },
        {
          $and: [LEGACY_OR_UNKNOWN_SOURCE, { googleId: { $type: "string", $ne: "" } }],
        },
      ],
    };
  }

  if (source === "self_register") {
    return {
      $or: [
        { accountSource: "self_register" },
        {
          $and: [
            LEGACY_OR_UNKNOWN_SOURCE,
            NO_GOOGLE_ID,
            { $or: [{ emailVerifiedAt: null }, { emailVerifiedAt: { $exists: false } }] },
          ],
        },
        {
          $and: [
            LEGACY_OR_UNKNOWN_SOURCE,
            NO_GOOGLE_ID,
            { emailVerifiedAt: { $type: "date" } },
            {
              $expr: {
                $gt: [
                  { $subtract: ["$emailVerifiedAt", "$createdAt"] },
                  ACCOUNT_SOURCE_ADMIN_VERIFY_WINDOW_MS,
                ],
              },
            },
          ],
        },
      ],
    };
  }

  // admin
  return {
    $or: [
      { accountSource: "admin" },
      {
        $and: [
          LEGACY_OR_UNKNOWN_SOURCE,
          NO_GOOGLE_ID,
          { emailVerifiedAt: { $type: "date" } },
          {
            $expr: {
              $lte: [
                { $abs: { $subtract: ["$emailVerifiedAt", "$createdAt"] } },
                ACCOUNT_SOURCE_ADMIN_VERIFY_WINDOW_MS,
              ],
            },
          },
        ],
      },
    ],
  };
}

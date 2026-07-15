/** Escape MongoDB regex metacharacters before interpolating user input into a `$regex` filter. */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type MongoDuplicateKeyError = Error & { code?: number };

/** True for a MongoDB unique-index violation (e.g. a racing concurrent create/rename). */
export function isDuplicateKeyError(error: unknown): error is MongoDuplicateKeyError {
  return error instanceof Error && (error as MongoDuplicateKeyError).code === 11000;
}

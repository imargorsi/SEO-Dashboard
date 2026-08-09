/** Lowercase + trim email for duplicate checks. */
export function normalizeLeadEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Digits-only phone for duplicate checks.
 * Display value stays as provided; comparison ignores spaces, dashes, and punctuation.
 */
export function normalizeLeadPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function isValidLeadEmail(email: string): boolean {
  const value = email.trim();
  if (!value || value.length > 255) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function todayLeadDate(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isValidLeadDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year!, month! - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month! - 1 &&
    date.getDate() === day
  );
}

/** Parse a CSV date cell into YYYY-MM-DD, or null when unusable. */
export function parseLeadDateCell(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (isValidLeadDate(trimmed)) return trimmed;

  const slash = trimmed.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (slash) {
    const month = Number(slash[1]);
    const day = Number(slash[2]);
    const year = Number(slash[3]);
    const candidate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (isValidLeadDate(candidate)) return candidate;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return todayLeadDate(parsed);
}

import { SEO_ACTIVITY_CSV_MAX_BYTES } from "@/lib/seo-activities/constants";
import { parseCsv } from "@/lib/seo-activities/parse-csv";

const FETCH_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 3;

function buildCsvExportUrl(spreadsheetId: string, tabName: string): string {
  const sheet = encodeURIComponent(tabName);
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${sheet}`;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function readResponseTextCapped(response: Response): Promise<string> {
  const contentLength = response.headers.get("content-length");
  if (contentLength) {
    const size = Number(contentLength);
    if (Number.isFinite(size) && size > SEO_ACTIVITY_CSV_MAX_BYTES) {
      throw new Error("Sheet CSV Is Too Large To Sync.");
    }
  }

  if (!response.body) {
    const text = await response.text();
    if (text.length > SEO_ACTIVITY_CSV_MAX_BYTES) {
      throw new Error("Sheet CSV Is Too Large To Sync.");
    }
    return text;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > SEO_ACTIVITY_CSV_MAX_BYTES) {
      await reader.cancel();
      throw new Error("Sheet CSV Is Too Large To Sync.");
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder("utf-8").decode(merged);
}

/**
 * Downloads a public Google Sheet tab as CSV ("Anyone with the link can view").
 */
export async function fetchSpreadsheetCsv(
  spreadsheetId: string,
  tabName: string,
): Promise<string[][]> {
  const url = buildCsvExportUrl(spreadsheetId, tabName);
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: {
          Accept: "text/csv,text/plain,*/*",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Sheet Fetch Failed With HTTP ${response.status}.`);
      }

      const text = await readResponseTextCapped(response);
      if (!text.trim()) {
        throw new Error("Sheet CSV Response Was Empty.");
      }

      // Google sometimes returns HTML error pages for private/missing tabs.
      if (text.trimStart().startsWith("<!DOCTYPE") || text.trimStart().startsWith("<html")) {
        throw new Error("Sheet CSV Fetch Returned HTML. Check Spreadsheet Sharing And Tab Name.");
      }

      return parseCsv(text);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_ATTEMPTS) {
        await sleep(400 * attempt);
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new Error("Sheet Fetch Failed.");
}

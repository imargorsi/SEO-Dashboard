import { vi } from "vitest";

vi.mock("@/lib/storage/r2-client", () => ({
  assertR2Configured: vi.fn(),
  putR2Object: vi.fn(async () => undefined),
  getR2Object: vi.fn(async () => ({
    stream: new ReadableStream(),
    contentType: "image/jpeg",
  })),
  deleteR2Object: vi.fn(async () => undefined),
}));

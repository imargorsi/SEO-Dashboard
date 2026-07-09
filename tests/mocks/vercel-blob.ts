import { vi } from "vitest";

vi.mock("@vercel/blob", () => ({
  put: vi.fn(async (pathname: string) => ({
    pathname,
    url: `https://blob.example/${pathname}`,
  })),
  del: vi.fn(async () => undefined),
  get: vi.fn(async () => ({
    statusCode: 200,
    stream: new ReadableStream(),
    blob: { contentType: "image/jpeg" },
  })),
}));

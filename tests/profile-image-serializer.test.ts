import { describe, expect, it } from "vitest";

import { serializeProfileImageUrl } from "@/lib/serializers/profile-image";
import { serializeStoredImageUrl } from "@/lib/serializers/stored-image";

describe("serializeStoredImageUrl", () => {
  it("returns null for empty values", () => {
    expect(serializeStoredImageUrl(null)).toBeNull();
    expect(serializeStoredImageUrl(undefined)).toBeNull();
    expect(serializeStoredImageUrl("")).toBeNull();
  });

  it("returns null for legacy local storage paths", () => {
    expect(serializeStoredImageUrl("profile-images/user-1/avatar.jpg")).toBeNull();
  });

  it("returns external URLs unchanged", () => {
    const url = "https://cdn.example.com/avatar.jpg";
    expect(serializeStoredImageUrl(url)).toBe(url);
  });

  it("returns a signed storage route for blob references", () => {
    const result = serializeStoredImageUrl("blob:profile-images/user-1/avatar.jpg");
    expect(result).toContain("/api/v1/storage/image?pathname=profile-images%2Fuser-1%2Favatar.jpg");
    expect(result).toContain("signature=");
  });
});

describe("serializeProfileImageUrl", () => {
  it("delegates to serializeStoredImageUrl", () => {
    const result = serializeProfileImageUrl("blob:project-logos/user-1/logo.jpg");
    expect(result).toContain("/api/v1/storage/image?pathname=");
  });
});
